import { ACTIVITIES, type Activity, type Category } from "./activities";

export interface GenerateInput {
  topic: string;
  imageDataUrl?: string | null;
  drawRandom?: boolean;
  preferredCategory?: Category | null;
  apiKey?: string | null;
  apiProvider?: "openai" | "gemini" | null;
}

export interface GenerateResult {
  card: Activity;
  topic: string;
  student_steps: { title: string; duration: string }[];
  wrap_up_protocol: string;
  source: "local" | "llm";
}

const KEYWORD_MAP: { test: RegExp; cat: Category }[] = [
  { test: /(read|word|sentence|story|language|english|vocab|phrase|grammar|spelling)/i, cat: "Echo & Flow" },
  { test: /(math|number|algebra|geometry|logic|equation|count|graph|probabil|set|fraction)/i, cat: "Matrix & Grid" },
  { test: /(move|run|energy|sport|active|warm|sprint|jump|body)/i, cat: "Circuit & Spark" },
  { test: /(recap|summary|close|review|reflect|exit|wrap|anchor|lock)/i, cat: "Anchor & Lock" },
];

export function pickCard(topic: string, preferred?: Category | null, drawRandom = false): Activity {
  if (drawRandom) return ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
  if (preferred) {
    const pool = ACTIVITIES.filter((a) => a.category === preferred);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const matched = KEYWORD_MAP.find((k) => k.test.test(topic));
  const cat: Category = matched?.cat ?? "Anchor & Lock";
  const pool = ACTIVITIES.filter((a) => a.category === cat);
  return pool[Math.floor(Math.random() * pool.length)];
}

function adaptStepsLocally(card: Activity, topic: string) {
  const t = topic.trim() || "today's concept";
  return card.student_steps.map((s, i) => ({
    title: i === 0 ? `${s.title} — framed around "${t}"` : s.title,
    duration: s.duration,
  }));
}

function adaptWrapLocally(card: Activity, topic: string) {
  const t = topic.trim() || "the concept";
  return `${card.wrap_up_protocol}\n\nClosing anchor (5 min): Teacher restates "${t}" in one sentence. Each student offers one word capturing what they will carry forward. Class repeats those words as a single rolling chant. End on a shared exhale.`;
}

async function callLLM(input: GenerateInput, card: Activity): Promise<{ steps: { title: string; duration: string }[]; wrap: string } | null> {
  if (!input.apiKey) return null;
  const provider = input.apiProvider ?? "openai";
  const prompt = `You are adapting a zero-material classroom activity to a teacher's topic.
TOPIC: ${input.topic}
ACTIVITY TITLE: ${card.title}
CATEGORY: ${card.category}
ORIGINAL MECHANIC: ${card.original_mechanic}
ORIGINAL STEPS: ${JSON.stringify(card.student_steps)}
ORIGINAL WRAP-UP: ${card.wrap_up_protocol}

Return STRICT JSON with this shape and nothing else:
{"student_steps":[{"title":"...","duration":"X min"}],"wrap_up_protocol":"..."}
Keep 4–6 steps. Make titles concrete to the topic. Wrap-up must be a 5-minute closing ritual narrated step-by-step.`;

  try {
    let text = "";
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      text = data.choices?.[0]?.message?.content ?? "";
    } else {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(input.apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
          }),
        },
      );
      if (!res.ok) return null;
      const data = await res.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
    const parsed = JSON.parse(text);
    if (!parsed?.student_steps || !parsed?.wrap_up_protocol) return null;
    return { steps: parsed.student_steps, wrap: parsed.wrap_up_protocol };
  } catch {
    return null;
  }
}

export async function generateActivity(input: GenerateInput): Promise<GenerateResult> {
  const card = pickCard(input.topic, input.preferredCategory, input.drawRandom);
  const llm = await callLLM(input, card);
  if (llm) {
    return {
      card,
      topic: input.topic,
      student_steps: llm.steps,
      wrap_up_protocol: llm.wrap,
      source: "llm",
    };
  }
  return {
    card,
    topic: input.topic,
    student_steps: adaptStepsLocally(card, input.topic),
    wrap_up_protocol: adaptWrapLocally(card, input.topic),
    source: "local",
  };
}

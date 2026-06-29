import { ACTIVITIES, type Activity, type Category } from "./activities";
import { GAMES, type Game } from "./games";
import { WRAPUPS, pickWrapUp, type WrapUp } from "./wrapups";

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
  game: Game;
  wrapUp: WrapUp;
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

function pickCategory(topic: string, preferred?: Category | null): Category {
  if (preferred) return preferred;
  const matched = KEYWORD_MAP.find((k) => k.test.test(topic));
  return matched?.cat ?? "Anchor & Lock";
}

export function pickCard(topic: string, preferred?: Category | null, drawRandom = false): Activity {
  if (drawRandom) return ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
  const cat = pickCategory(topic, preferred);
  const pool = ACTIVITIES.filter((a) => a.category === cat);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickGame(topic: string, preferred?: Category | null, drawRandom = false): Game {
  if (drawRandom) return GAMES[Math.floor(Math.random() * GAMES.length)];
  const cat = pickCategory(topic, preferred);
  const pool = GAMES.filter((g) => g.category === cat);
  return (pool.length ? pool : GAMES)[Math.floor(Math.random() * (pool.length ? pool.length : GAMES.length))];
}

function adaptStepsLocally(card: Activity, topic: string) {
  const t = topic.trim() || "today's concept";
  return card.student_steps.map((s, i) => ({
    title: i === 0 ? `${s.title} — framed around "${t}"` : s.title,
    duration: s.duration,
  }));
}

async function callLLM(input: GenerateInput, card: Activity): Promise<{ steps: { title: string; duration: string }[] } | null> {
  if (!input.apiKey) return null;
  const provider = input.apiProvider ?? "openai";
  const prompt = `You are adapting a zero-material classroom activity to a teacher's topic.
TOPIC: ${input.topic}
ACTIVITY TITLE: ${card.title}
CATEGORY: ${card.category}
ORIGINAL MECHANIC: ${card.original_mechanic}
ORIGINAL STEPS: ${JSON.stringify(card.student_steps)}

Return STRICT JSON: {"student_steps":[{"title":"...","duration":"X min"}]}
Keep 4–6 steps. Make titles concrete to the topic.`;

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
    if (!parsed?.student_steps) return null;
    return { steps: parsed.student_steps };
  } catch {
    return null;
  }
}

export async function generateActivity(input: GenerateInput): Promise<GenerateResult> {
  const card = pickCard(input.topic, input.preferredCategory, input.drawRandom);
  const game = pickGame(input.topic, input.preferredCategory, input.drawRandom);
  const wrapUp = pickWrapUp(card.category);
  const llm = await callLLM(input, card);
  return {
    card,
    game,
    wrapUp,
    topic: input.topic,
    student_steps: llm ? llm.steps : adaptStepsLocally(card, input.topic),
    wrap_up_protocol: card.wrap_up_protocol,
    source: llm ? "llm" : "local",
  };
}

export { GAMES, WRAPUPS };

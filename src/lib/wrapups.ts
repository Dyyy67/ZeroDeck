import type { Category } from "./activities";

export interface WrapUp {
  id: string;
  title: string;
  category: Category | "Universal";
  duration: string;
  description: string;
  steps: string[];
}

// Separated wrap-up rituals — managed independently from activities and games.
export const WRAPUPS: WrapUp[] = [
  {
    id: "w-01", title: "One-Word Whip", category: "Universal", duration: "3 min",
    description: "Lightning round-robin where each student names a single word that captures the lesson.",
    steps: [
      "Stand in a tight circle.",
      "Teacher restates the lesson focus in one sentence.",
      "Each student speaks ONE word in clockwise order.",
      "Class repeats all words back as a rolling chant.",
      "End on a unison exhale.",
    ],
  },
  {
    id: "w-02", title: "3-2-1 Exit", category: "Universal", duration: "5 min",
    description: "Three takeaways, two questions, one next step — spoken aloud, no paper.",
    steps: [
      "Teacher posts the 3-2-1 stems.",
      "60s of silent thinking.",
      "Pairs share their 3-2-1.",
      "4 volunteers share their '1 next step' to the class.",
    ],
  },
  {
    id: "w-03", title: "Headline Closure", category: "Echo & Flow", duration: "5 min",
    description: "Compose a 7-word headline that captures the lesson's core.",
    steps: [
      "Pairs draft a 7-word headline in 2 minutes.",
      "Each pair reads aloud.",
      "Class snap-votes top three.",
      "Class chants the winning headline twice.",
    ],
  },
  {
    id: "w-04", title: "Connection Web (Verbal)", category: "Universal", duration: "5 min",
    description: "Each student links the lesson to a prior idea by pointing and naming.",
    steps: [
      "Stand in a circle.",
      "Teacher seeds one core concept aloud.",
      "Each student points at someone and names a connection.",
      "Last speaker summarises the threads in one sentence.",
    ],
  },
  {
    id: "w-05", title: "Two Stars & a Wish", category: "Universal", duration: "5 min",
    description: "Peer feedback ritual — two praises, one improvement wish.",
    steps: [
      "Pairs face each other.",
      "Each partner gives two specific stars on the other's contribution today.",
      "Each gives one actionable wish.",
      "Pairs thank each other and sit.",
    ],
  },
  {
    id: "w-06", title: "Body-Scan Anchor", category: "Anchor & Lock", duration: "5 min",
    description: "Calm body-scan with one lesson cue per body region for embodied recall.",
    steps: [
      "Sit comfortably; soft gaze or closed eyes.",
      "Three slow breaths together.",
      "Teacher names 5 body regions, attaching one lesson cue to each, with a 15s pause.",
      "Open eyes; one word each.",
    ],
  },
  {
    id: "w-07", title: "Echo Sentence", category: "Echo & Flow", duration: "4 min",
    description: "A single summary sentence is whispered down the chain to test fidelity of recall.",
    steps: [
      "Form a line.",
      "Teacher whispers the summary sentence to student 1.",
      "Whisper-relay to the last student.",
      "Last student announces; class reconstructs the correct version.",
    ],
  },
  {
    id: "w-08", title: "Pose & Tell", category: "Circuit & Spark", duration: "4 min",
    description: "Strike a pose that embodies the lesson; explain in one sentence.",
    steps: [
      "On 'three', everyone freezes in a pose representing today's idea.",
      "Teacher taps 5 students; each names their pose in one sentence.",
      "Class chooses the pose that most captures the lesson.",
    ],
  },
  {
    id: "w-09", title: "Question Bucket", category: "Universal", duration: "5 min",
    description: "Each student leaves the class with one question they still hold.",
    steps: [
      "Round-robin: each student speaks one unresolved question aloud.",
      "Class listens silently — no answers given.",
      "Teacher names the 3 questions that will open the next lesson.",
    ],
  },
  {
    id: "w-10", title: "Number Line Confidence", category: "Matrix & Grid", duration: "4 min",
    description: "Stand on an imaginary 1–5 confidence line for each lesson goal.",
    steps: [
      "Teacher names goal 1; students step to a position 1 (low) to 5 (high).",
      "Teacher samples explanations from each cluster.",
      "Repeat for 2 more goals.",
      "Class identifies the lowest-confidence goal to revisit.",
    ],
  },
  {
    id: "w-11", title: "I Used To Think… Now I Think…", category: "Universal", duration: "5 min",
    description: "Make conceptual change visible with the Project Zero stems.",
    steps: [
      "Silent 60s thinking.",
      "Triads share each stem in turn.",
      "Class harvests 3 shifts aloud.",
    ],
  },
  {
    id: "w-12", title: "Silent Gratitude Pass", category: "Anchor & Lock", duration: "3 min",
    description: "Wordless ritual of mutual acknowledgement to close the room.",
    steps: [
      "Stand in a circle.",
      "Make eye contact with everyone once, slowly.",
      "Place a hand on your chest.",
      "Bow once to the centre.",
    ],
  },
];

export function pickWrapUp(category?: string): WrapUp {
  const pool = category ? WRAPUPS.filter((w) => w.category === category || w.category === "Universal") : WRAPUPS;
  const safe = pool.length ? pool : WRAPUPS;
  return safe[Math.floor(Math.random() * safe.length)];
}

// Lightweight obfuscation only — NOT secure encryption.
// Stores user's external LLM API key locally so it never hits our backend.
const KEY = "zerodeck.llm.key";
const PROV = "zerodeck.llm.provider";

function scramble(s: string) {
  return btoa(unescape(encodeURIComponent(s.split("").reverse().join(""))));
}
function unscramble(s: string) {
  try { return decodeURIComponent(escape(atob(s))).split("").reverse().join(""); } catch { return ""; }
}

export function saveApiKey(key: string, provider: "openai" | "gemini") {
  if (typeof window === "undefined") return;
  if (!key) { localStorage.removeItem(KEY); localStorage.removeItem(PROV); return; }
  localStorage.setItem(KEY, scramble(key));
  localStorage.setItem(PROV, provider);
}

export function loadApiKey(): { key: string | null; provider: "openai" | "gemini" | null } {
  if (typeof window === "undefined") return { key: null, provider: null };
  const raw = localStorage.getItem(KEY);
  const prov = localStorage.getItem(PROV) as "openai" | "gemini" | null;
  return { key: raw ? unscramble(raw) : null, provider: prov };
}

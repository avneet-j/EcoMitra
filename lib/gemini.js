// Thin wrapper around the Gemini REST API — no SDK dependency needed.
// Docs: https://ai.google.dev/api

const API_KEY = process.env.GEMINI_API_KEY;
const GEN_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const EMBED_MODEL = "gemini-embedding-2";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

if (!API_KEY) {
  console.warn("[gemini] GEMINI_API_KEY is not set — API calls will fail.");
}

/**
 * Embed a piece of text into a 768-dim vector.
 * Used both when seeding docs_chunks and when embedding a user's chat query.
 */
export async function embedText(text) {
  const res = await fetch(`${BASE}/models/${EMBED_MODEL}:embedContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    content: { parts: [{ text }] },
    output_dimensionality: 768,
}),
  });
  if (!res.ok) throw new Error(`Gemini embed failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values; // array of 768 floats
}

/**
 * Ask Gemini a question, optionally with a system instruction and grounding context.
 * Returns plain text.
 */
export async function generateText({ prompt, system, temperature = 0.4 }) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(`${BASE}/models/${GEN_MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini generate failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? "";
}

// POST /api/chat  { question: string }
// RAG pipeline: embed the question -> Atlas vector search over docs_chunks -> Gemini answer grounded in top matches.

import { embedText, generateText } from "../lib/gemini.js";
import { getDb } from "../lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing 'question' string in body" });
    }

    const queryVector = await embedText(question);
    const db = await getDb();

    const matches = await db.collection("docs_chunks").aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 50,
          limit: 4,
        },
      },
      { $project: { text: 1, source: 1, score: { $meta: "vectorSearchScore" } } },
    ]).toArray();

    if (matches.length === 0) {
      return res.status(200).json({
        answer: "I don't have a grounded source for that yet — try adding the relevant policy document to the knowledge base.",
        sources: [],
      });
    }

    const context = matches.map((m, i) => `[Source ${i + 1}: ${m.source}]\n${m.text}`).join("\n\n");

    const answer = await generateText({
      system:
        "You are EcoMitra, a campus sustainability copilot. Answer ONLY using the provided context. " +
        "If the context doesn't fully answer the question, say so plainly. Keep answers concise and practical. " +
        "Always mention which source(s) you drew from by name.",
      prompt: `Context:\n${context}\n\nQuestion: ${question}`,
    });

    return res.status(200).json({
      answer,
      sources: [...new Set(matches.map(m => m.source))],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong generating the answer." });
  }
}

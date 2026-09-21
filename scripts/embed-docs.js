// Run once (and again whenever you add/change docs): node scripts/embed-docs.js
// Chunks every file in docs/ and stores {text, source, embedding} in the docs_chunks collection.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedText } from "../lib/gemini.js";
import { getDb } from "../lib/mongodb.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "..", "docs");
const CHUNK_SIZE = 800; // characters — small enough for precise retrieval, large enough for context

function chunkText(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function main() {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".md") || f.endsWith(".txt"));
  if (files.length === 0) {
    console.log("No .md/.txt files found in docs/ — add some sustainability policy docs first.");
    return;
  }

  const db = await getDb();
  const col = db.collection("docs_chunks");

  for (const file of files) {
    const fullPath = path.join(DOCS_DIR, file);
    const text = fs.readFileSync(fullPath, "utf-8");
    const chunks = chunkText(text);
    console.log(`Embedding ${file}: ${chunks.length} chunk(s)`);

    for (const [i, chunk] of chunks.entries()) {
      const embedding = await embedText(chunk);
      await col.updateOne(
        { source: file, chunkIndex: i },
        { $set: { source: file, chunkIndex: i, text: chunk, embedding, updatedAt: new Date() } },
        { upsert: true }
      );
    }
  }

  console.log("Done. Make sure the 'vector_index' Atlas Search index exists on docs_chunks (see README).");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

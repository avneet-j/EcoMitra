// Triggered weekly by vercel.json's cron config (Mondays 06:00 UTC).
// Aggregates last week's usage across all users, asks Gemini to summarize + flag anomalies,
// and stores the result so the dashboard can display it.

import { generateText } from "../lib/gemini.js";
import { getDb } from "../lib/mongodb.js";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default async function handler(req, res) {
  try {
    const db = await getDb();

    const weeklyByCategory = await db.collection("usage_logs").aggregate([
      { $match: { date: { $gte: daysAgo(7) } } },
      { $group: { _id: { category: "$category", block: "$block" }, total: { $sum: "$value" }, count: { $sum: 1 } } },
    ]).toArray();

    if (weeklyByCategory.length === 0) {
      return res.status(200).json({ message: "No usage data logged this week — nothing to summarize." });
    }

    const summaryLines = weeklyByCategory
      .map(g => `${g._id.block || "Unknown block"} | ${g._id.category}: total ${g.total} across ${g.count} entries`)
      .join("\n");

    const digest = await generateText({
      system:
        "You are EcoMitra's weekly reporting agent. Summarize this week's campus resource usage in 3-5 sentences " +
        "for facilities staff and the eco-club. Flag any block/category that looks like an outlier. Be concrete, not generic.",
      prompt: summaryLines,
    });

    await db.collection("digests").insertOne({
      weekOf: daysAgo(7),
      generatedAt: new Date(),
      text: digest,
      raw: weeklyByCategory,
    });

    return res.status(200).json({ message: "Digest generated.", digest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Digest generation failed." });
  }
}

// GET /api/recommend?userId=xyz
// Reads the user's recent usage_logs, compares to their own history + block average,
// asks Gemini for a short personalized, non-judgmental recommendation, and caches it.

import { generateText } from "../lib/gemini.js";
import { getDb } from "../lib/mongodb.js";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET" });

  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const db = await getDb();

    // Cache: don't regenerate more than once a day for the same user (saves free-tier API calls).
    const cached = await db.collection("recommendations").findOne({ userId });
    if (cached && cached.generatedAt > daysAgo(1)) {
      return res.status(200).json({ recommendation: cached.text, cached: true });
    }

    const recentLogs = await db.collection("usage_logs")
      .find({ userId, date: { $gte: daysAgo(14) } })
      .sort({ date: 1 })
      .toArray();

    if (recentLogs.length === 0) {
      return res.status(200).json({ recommendation: "Log a few days of usage to get your first personalized tip.", cached: false });
    }

    const summaryLines = recentLogs
      .map(l => `${l.date.toISOString().slice(0, 10)} | ${l.category}: ${l.value}${l.unit || ""}`)
      .join("\n");

    const text = await generateText({
      system:
        "You are EcoMitra. Given a resident's last two weeks of resource usage, " +
        "write ONE short, specific, non-judgmental, actionable recommendation (max 2 sentences). " +
        "Never shame or compare punitively — frame it as an opportunity.",
      prompt: `Usage log:\n${summaryLines}`,
    });

    await db.collection("recommendations").updateOne(
      { userId },
      { $set: { userId, text, generatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ recommendation: text, cached: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Couldn't generate a recommendation right now." });
  }
}

import { useEffect, useState } from "react";

export default function TipCard({ userId }) {
  const [tip, setTip] = useState("Loading your personalized tip...");

  useEffect(() => {
    fetch(`/api/recommend?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => setTip(data.recommendation || "No tip available yet."))
      .catch(() => setTip("Couldn't load a tip right now — check your API setup."));
  }, [userId]);

  return (
    <div className="card tip-card">
      <span className="label">This week's tip</span>
      <p style={{ margin: "10px 0 0", fontSize: 14 }}>{tip}</p>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function DigestCard() {
  const [digest, setDigest] = useState(null);

  useEffect(() => {
    // In production, fetch the latest saved digest from your own read endpoint.
    // Trigger /api/cron-digest manually while testing to generate one.
    fetch("/api/cron-digest")
      .then(r => r.json())
      .then(data => setDigest(data.digest || data.message))
      .catch(() => setDigest("Run the weekly digest job to see a summary here."));
  }, []);

  return (
    <div className="card">
      <h2>Weekly sustainability digest</h2>
      <p style={{ fontSize: 13, color: "var(--sub)", margin: 0 }}>{digest || "Loading..."}</p>
    </div>
  );
}

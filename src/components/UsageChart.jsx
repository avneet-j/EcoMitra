import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

// Expects `data`: [{ date: "Mon", you: 42, blockAvg: 50 }, ...]
export default function UsageChart({ title, unit, data }) {
  return (
    <div className="card">
      <h2>{title} {unit ? `(${unit})` : ""}</h2>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5efe9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="you" stroke="#0f6b47" strokeWidth={2} name="Your usage" dot={false} />
            <Line type="monotone" dataKey="blockAvg" stroke="#9bc53d" strokeWidth={2} strokeDasharray="4 4" name="Block average" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

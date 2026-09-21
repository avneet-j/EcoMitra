import UsageChart from "./components/UsageChart.jsx";
import TipCard from "./components/TipCard.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import DigestCard from "./components/DigestCard.jsx";

// Replace with your real auth/user context — hardcoded here for the prototype.
const CURRENT_USER_ID = "demo-user-1";

// Replace with a real fetch from /api once you've seeded usage_logs.
// This mock keeps the UI renderable before the backend is wired up.
const MOCK_ELECTRICITY = [
  { date: "Mon", you: 6.2, blockAvg: 7.1 },
  { date: "Tue", you: 5.8, blockAvg: 7.0 },
  { date: "Wed", you: 7.4, blockAvg: 7.2 },
  { date: "Thu", you: 6.9, blockAvg: 7.3 },
  { date: "Fri", you: 8.1, blockAvg: 7.4 },
  { date: "Sat", you: 5.0, blockAvg: 6.8 },
  { date: "Sun", you: 4.6, blockAvg: 6.5 },
];

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>EcoMitra</h1>
        <p>Your campus sustainability copilot — track, ask, and improve.</p>
      </div>

      <div className="grid">
        <div>
          <UsageChart title="Electricity usage" unit="kWh/day" data={MOCK_ELECTRICITY} />
          <ChatWidget />
        </div>
        <div>
          <TipCard userId={CURRENT_USER_ID} />
          <DigestCard />
        </div>
      </div>
    </div>
  );
}

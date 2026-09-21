import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Ask me anything about campus sustainability policy — I'll answer from the actual documents, not guesses." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;
    setMessages(m => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "bot", text: data.answer, sources: data.sources }]);
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Something went wrong — check your API keys and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Sustainability copilot</h2>
      <div className="chat-log">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.text}
            {m.sources?.length > 0 && <span className="sources">Source: {m.sources.join(", ")}</span>}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="e.g. How should I segregate e-waste?"
        />
        <button onClick={send} disabled={loading}>{loading ? "..." : "Ask"}</button>
      </div>
    </div>
  );
}

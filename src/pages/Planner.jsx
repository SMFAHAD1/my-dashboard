import { useState } from "react";

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function addTask() {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input, date, done: false, id: Date.now() }]);
    setInput("");
  }

  function toggleDone(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const filtered = tasks.filter(t => t.date === date);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Planner</h2>
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Add a task..." style={{ flex: 1, minWidth: 180 }}
            onKeyDown={e => e.key === "Enter" && addTask()} />
          <button onClick={addTask}>Add</button>
        </div>
        {filtered.length === 0 && <p style={{ color: "#aaa", fontSize: 14 }}>No tasks for this date.</p>}
        {filtered.map(t => (
          <div key={t.id} onClick={() => toggleDone(t.id)} style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 8,
            background: t.done ? "#f0faf5" : "#fafafa", cursor: "pointer",
            border: "1px solid #eee", textDecoration: t.done ? "line-through" : "none",
            color: t.done ? "#aaa" : "#222", fontSize: 14
          }}>
            {t.done ? "✓ " : "○ "}{t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
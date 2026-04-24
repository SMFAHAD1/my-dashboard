import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CATEGORIES = ["Study", "Personal", "Work", "Health", "Finance", "Other"];
const STATUSES   = ["Pending", "In Progress", "Done", "Cancelled"];

const STATUS_BADGE = {
  "Pending":     "badge-yellow",
  "In Progress": "badge-blue",
  "Done":        "badge-green",
  "Cancelled":   "badge-red",
};

const EMPTY = { title: "", category: "Study", status: "Pending", dueDate: "", note: "" };

export default function Planner() {
  const [plans, setPlans]   = useLocalStorage("dashboard-plans", [], 1);
  const [form, setForm]     = useState(EMPTY);
  const [filter, setFilter] = useState("All");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = () => {
    if (!form.title.trim()) return;
    setPlans(p => [{ ...form, id: Date.now() }, ...p]);
    setForm(EMPTY);
  };

  const remove  = (id) => setPlans(p => p.filter(x => x.id !== id));
  const toggle  = (id, status) => setPlans(p => p.map(x => x.id === id ? { ...x, status } : x));

  const filtered = filter === "All" ? plans : plans.filter(p => p.status === filter);

  // Analytics
  const total   = plans.length;
  const done    = plans.filter(p => p.status === "Done").length;
  const pending = plans.filter(p => p.status === "Pending").length;
  const inProg  = plans.filter(p => p.status === "In Progress").length;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Planner</h1>
        <p>Track your tasks, plans, and goals</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--warning)"}}>{pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent)"}}>{inProg}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--success)"}}>{done}</div><div className="stat-label">Done</div></div>
      </div>

      {/* Add Form */}
      <div className="card">
        <div className="card-title">Add Plan</div>
        <div className="form-row">
          <div className="input-group" style={{flex:3}}>
            <label>Title</label>
            <input placeholder="What do you plan to do?" value={form.title} onChange={e => set("title", e.target.value)}
              onKeyDown={e => e.key === "Enter" && add()} />
          </div>
          <div className="input-group">
            <label>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={add} style={{alignSelf:"flex-end"}}>Add</button>
        </div>
        <div className="form-row">
          <div className="input-group" style={{flex:1}}>
            <label>Note (optional)</label>
            <input placeholder="Any notes..." value={form.note} onChange={e => set("note", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{display:"flex", gap:8, marginBottom:16, flexWrap:"wrap"}}>
        {["All", ...STATUSES].map(s => (
          <button key={s} className={`btn ${filter === s ? "btn-primary" : "btn-ghost"}`}
            style={{padding:"6px 14px", fontSize:"0.82rem"}} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {/* List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>No plans yet. Add one above!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Title</th><th>Category</th><th>Status</th><th>Due Date</th><th>Note</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{fontWeight:500}}>{p.title}</td>
                    <td><span className="badge badge-purple">{p.category}</span></td>
                    <td>
                      <select value={p.status} onChange={e => toggle(p.id, e.target.value)}
                        style={{background:"transparent", border:"none", color:"var(--text)", fontSize:"0.85rem", padding:0, cursor:"pointer"}}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{color:"var(--muted)", fontSize:"0.85rem"}}>{p.dueDate || "—"}</td>
                    <td style={{color:"var(--muted)", fontSize:"0.85rem", maxWidth:200}}>{p.note || "—"}</td>
                    <td><button className="btn btn-danger" onClick={() => remove(p.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

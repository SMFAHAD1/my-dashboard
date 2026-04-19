import { useState } from "react";

const STATUS_COLORS = {
  applied: { bg: "#e8f0fe", color: "#185FA5" },
  interview: { bg: "#fff8e1", color: "#854F0B" },
  offer: { bg: "#e8f5e9", color: "#3B6D11" },
  rejected: { bg: "#fce8e8", color: "#A32D2D" },
};

export default function JobPrep() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");

  function addJob() {
    if (!company.trim()) return;
    setJobs([...jobs, { id: Date.now(), company, role, status, date: new Date().toISOString().split("T")[0] }]);
    setCompany(""); setRole("");
  }

  function updateStatus(id, val) {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: val } : j));
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Job Prep</h2>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1 }} />
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role" style={{ flex: 1 }} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={addJob}>Add</button>
        </div>
      </div>
      {jobs.map(j => (
        <div key={j.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500 }}>{j.company}</p>
            <p style={{ fontSize: 13, color: "#888" }}>{j.role} — {j.date}</p>
          </div>
          <select value={j.status} onChange={e => updateStatus(j.id, e.target.value)}
            style={{ background: STATUS_COLORS[j.status].bg, color: STATUS_COLORS[j.status].color, border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 500 }}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      ))}
    </div>
  );
}
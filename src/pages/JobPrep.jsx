// src/pages/JobPrep.jsx
import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
    </div>
  );
}

const APP_STATUS = {
  requirement: { label: "Requirement",  bg: "#e8f0fe", color: "#185FA5", icon: "📋" },
  ongoing:     { label: "Ongoing",      bg: "#fff8e1", color: "#854F0B", icon: "🔄" },
  complete:    { label: "Complete",     bg: "#e8f5e9", color: "#3B6D11", icon: "✅" },
  rejection:   { label: "Rejected",    bg: "#fce8e8", color: "#A32D2D", icon: "❌" },
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"];

export default function JobPrep() {
  const [applications, setApplications] = useLocalStorage("dashboard-jobs-applications", []);
  const [skills, setSkills]             = useLocalStorage("dashboard-jobs-skills", []);
  const [resources, setResources]       = useLocalStorage("dashboard-jobs-resources", []);

  // Application form
  const [company, setCompany]     = useState("");
  const [role, setRole]           = useState("");
  const [jobType, setJobType]     = useState("Full-time");
  const [status, setStatus]       = useState("requirement");
  const [appDate, setAppDate]     = useState(today);
  const [deadline, setDeadline]   = useState("");
  const [link, setLink]           = useState("");
  const [salary, setSalary]       = useState("");
  const [notes, setNotes]         = useState("");
  const [filter, setFilter]       = useState("all");

  function addApplication() {
    if (!company.trim() && !role.trim()) return;
    setApplications(prev => [...prev, {
      id: Date.now(), company: company.trim(), role: role.trim(),
      jobType, status, appDate, deadline, link: link.trim(),
      salary: salary.trim(), notes: notes.trim(),
    }]);
    setCompany(""); setRole(""); setJobType("Full-time"); setStatus("requirement");
    setAppDate(today); setDeadline(""); setLink(""); setSalary(""); setNotes("");
  }

  function updateStatus(id, val) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: val } : a));
  }
  function deleteApp(id) { setApplications(prev => prev.filter(a => a.id !== id)); }

  // Skills form
  const [skillName, setSkillName]   = useState("");
  const [skillLevel, setSkillLevel] = useState("learning");
  const SKILL_LEVELS = {
    learning:     { label: "Learning",    bg: "#fff8e1", color: "#854F0B" },
    intermediate: { label: "Intermediate", bg: "#e8f0fe", color: "#185FA5" },
    proficient:   { label: "Proficient",  bg: "#e8f5e9", color: "#3B6D11" },
  };
  function addSkill() {
    if (!skillName.trim()) return;
    setSkills(prev => [...prev, { id: Date.now(), name: skillName.trim(), level: skillLevel }]);
    setSkillName(""); setSkillLevel("learning");
  }

  // Resources form
  const [resTitle, setResTitle]   = useState("");
  const [resType, setResType]     = useState("Course");
  const [resDone, setResDone]     = useState(false);
  function addResource() {
    if (!resTitle.trim()) return;
    setResources(prev => [...prev, { id: Date.now(), title: resTitle.trim(), type: resType, done: false }]);
    setResTitle("");
  }
  function toggleResource(id) { setResources(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r)); }

  // Stats
  const counts = Object.keys(APP_STATUS).reduce((acc, k) => {
    acc[k] = applications.filter(a => a.status === k).length;
    return acc;
  }, {});

  const filtered = filter === "all" ? applications : applications.filter(a => a.status === filter);

  // Timeline: recent activity
  const recent = [...applications].sort((a, b) => (b.appDate || "").localeCompare(a.appDate || "")).slice(0, 5);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Job Preparation</h2>

      {/* Stats */}
      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: "#f0f0f0", color: "#555", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{applications.length}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>Total</div>
          </div>
          {Object.entries(APP_STATUS).map(([key, meta]) => (
            <div key={key} style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: meta.bg, color: meta.color, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{meta.label}</div>
            </div>
          ))}
          {applications.length > 0 && counts.complete + counts.rejection > 0 && (
            <div style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: "#e8f5e9", color: "#3B6D11", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {Math.round((counts.complete / (counts.complete + counts.rejection || 1)) * 100)}%
              </div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Success Rate</div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {applications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 1 }}>
            {Object.entries(APP_STATUS).map(([key, meta]) => {
              const pct = (counts[key] / applications.length) * 100;
              return pct > 0 ? (
                <div key={key} title={`${meta.label}: ${counts[key]}`}
                  style={{ width: `${pct}%`, background: meta.color, transition: "width 0.4s" }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            {Object.entries(APP_STATUS).map(([key, meta]) => (
              <span key={key} style={{ fontSize: 10, color: meta.color }}>
                {meta.icon} {meta.label} {counts[key]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Application ── */}
      <Divider label="APPLICATION TRACKER" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelSt}>Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              placeholder="Company name" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelSt}>Role / Position</label>
            <input value={role} onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addApplication()}
              placeholder="Job title" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={labelSt}>Type</label>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ width: "100%" }}>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelSt}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%" }}>
              {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Applied date</label>
            <input type="date" value={appDate} onChange={e => setAppDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Expected salary</label>
            <input value={salary} onChange={e => setSalary(e.target.value)}
              placeholder="e.g. 50,000 BDT" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelSt}>Job link</label>
            <input value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://..." style={{ width: "100%" }} />
          </div>
          <button onClick={addApplication} style={{ alignSelf: "flex-end" }}>Add</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={labelSt}>Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Interview notes, contact person, requirements..." style={{ width: "100%" }} />
        </div>
      </div>

      {/* Filter tabs */}
      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[["all", "All", "#555", "#f0f0f0"], ...Object.entries(APP_STATUS).map(([k, v]) => [k, v.icon + " " + v.label, v.color, v.bg])].map(([key, label, color, bg]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ fontSize: 11, padding: "4px 14px", borderRadius: 99, border: "1px solid #e0e0e0", cursor: "pointer",
                background: filter === key ? color : "#fff",
                color: filter === key ? "#fff" : color,
                fontWeight: filter === key ? 600 : 400 }}>
              {label} {key !== "all" ? `(${counts[key] || 0})` : `(${applications.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Application cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {applications.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>No applications yet. Add one above.</p>
        )}
        {filtered.sort((a, b) => (b.appDate || "").localeCompare(a.appDate || "")).map(a => {
          const st  = APP_STATUS[a.status];
          const isDeadlinePast = a.deadline && a.deadline < today && a.status === "requirement";
          return (
            <div key={a.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${st.color}` }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{a.company || "—"}</p>
                    <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 99, background: "#f0f0f0", color: "#555" }}>{a.jobType}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>{a.role}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {a.appDate  && <span style={{ fontSize: 11, color: "#aaa" }}>Applied {formatDate(a.appDate)}</span>}
                    {a.deadline && (
                      <span style={{ fontSize: 11, color: isDeadlinePast ? "#A32D2D" : "#888", fontWeight: isDeadlinePast ? 600 : 400 }}>
                        {isDeadlinePast ? "⚠ Deadline past · " : "Deadline · "}{formatDate(a.deadline)}
                      </span>
                    )}
                    {a.salary && <span style={{ fontSize: 11, color: "#6B21A8" }}>💰 {a.salary}</span>}
                  </div>
                  {a.notes && <p style={{ fontSize: 11, color: "#888", marginTop: 5, fontStyle: "italic" }}>{a.notes}</p>}
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#185FA5", marginTop: 4, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      🔗 {a.link}
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "none",
                      background: st.bg, color: st.color, cursor: "pointer", fontWeight: 600 }}>
                    {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                  <button onClick={() => deleteApp(a.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Skills ── */}
      <Divider label="SKILLS TO LEARN" />
      <div className="card" style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label style={labelSt}>Skill name</label>
          <input value={skillName} onChange={e => setSkillName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            placeholder="e.g. React, SQL, Communication..." style={{ width: "100%" }} />
        </div>
        <div style={{ minWidth: 120 }}>
          <label style={labelSt}>Level</label>
          <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} style={{ width: "100%" }}>
            {Object.entries(SKILL_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <button onClick={addSkill} style={{ alignSelf: "flex-end" }}>Add Skill</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {skills.length === 0 && <p style={{ fontSize: 13, color: "#bbb", padding: "12px 0" }}>No skills added yet.</p>}
        {skills.map(s => {
          const lv = SKILL_LEVELS[s.level];
          return (
            <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
              padding: "6px 14px", borderRadius: 99, background: lv.bg, color: lv.color }}>
              {s.name}
              <span style={{ fontSize: 10, opacity: 0.8 }}>{lv.label}</span>
              <span onClick={() => setSkills(prev => prev.filter(x => x.id !== s.id))}
                style={{ cursor: "pointer", opacity: 0.5, fontSize: 11 }}>✕</span>
            </span>
          );
        })}
      </div>

      {/* ── Resources ── */}
      <Divider label="RESOURCES & PREPARATION" />
      <div className="card" style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label style={labelSt}>Resource / Course name</label>
          <input value={resTitle} onChange={e => setResTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addResource()}
            placeholder="e.g. LeetCode, System Design Course..." style={{ width: "100%" }} />
        </div>
        <div style={{ minWidth: 120 }}>
          <label style={labelSt}>Type</label>
          <select value={resType} onChange={e => setResType(e.target.value)} style={{ width: "100%" }}>
            {["Course","Book","Platform","YouTube","Article","Practice"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={addResource} style={{ alignSelf: "flex-end" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.length === 0 && <p style={{ fontSize: 13, color: "#bbb", padding: "12px 0" }}>No resources added yet.</p>}
        {resources.map(r => (
          <div key={r.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, opacity: r.done ? 0.55 : 1 }}>
            <div onClick={() => toggleResource(r.id)}
              style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                border: r.done ? "none" : "2px solid #ddd", background: r.done ? "#3B6D11" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>
              {r.done ? "✓" : ""}
            </div>
            <p style={{ flex: 1, fontWeight: 500, fontSize: 13, textDecoration: r.done ? "line-through" : "none", color: r.done ? "#aaa" : "inherit" }}>{r.title}</p>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#e8f0fe", color: "#185FA5" }}>{r.type}</span>
            <button onClick={() => setResources(prev => prev.filter(x => x.id !== r.id))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 13 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelSt = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

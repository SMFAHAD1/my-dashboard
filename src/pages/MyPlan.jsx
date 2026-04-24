// src/pages/MyPlan.jsx
import { useState, useMemo } from "react";
import { useSupabase } from "../hooks/useSupabase";

const today = new Date().toISOString().split("T")[0];
const todayDate = new Date();

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function getWeekKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7); // YYYY-MM
}

function getYearKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 4);
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

const PLAN_STATUS = {
  ongoing:    { label: "Ongoing",   bg: "#e8f0fe", color: "#185FA5", icon: "🔄" },
  complete:   { label: "Complete",  bg: "#e8f5e9", color: "#3B6D11", icon: "✅" },
  rejection:  { label: "Rejected",  bg: "#fce8e8", color: "#A32D2D", icon: "❌" },
};

const PLAN_CATEGORIES = ["Personal", "Career", "Health", "Finance", "Learning", "Project", "Other"];

// ── Simple SVG Pie Chart ──────────────────────────────────────────────────
function PieChart({ data, size = 130 }) {
  // data: [{label, value, color}]
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#eee" }} />;

  let cumAngle = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return { ...d, angle, x1, y1, x2, y2, largeArc };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i}
          d={`M${cx},${cy} L${s.x1},${s.y1} A${r},${r} 0 ${s.largeArc},1 ${s.x2},${s.y2} Z`}
          fill={s.color} stroke="#fff" strokeWidth={1.5} />
      ))}
      {/* Donut hole */}
      <circle cx={cx} cy={cy} r={r * 0.45} fill="#fff" />
    </svg>
  );
}

// ── Analysis Panel ────────────────────────────────────────────────────────
function AnalysisPanel({ plans, period }) {
  // period: "weekly" | "monthly" | "yearly"
  const getKey = period === "weekly" ? getWeekKey : period === "monthly" ? getMonthKey : getYearKey;

  // Current period key
  const currentKey = getKey(today);

  // Group plans by period key (use addedDate)
  const grouped = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      const key = getKey(p.addedDate || p.dueDate || today);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [plans, period]);

  const periodKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!plans.length) return (
    <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "16px 0" }}>No plans to analyse.</p>
  );

  function periodLabel(key) {
    if (period === "weekly") {
      const [yr, w] = key.split("-W");
      return `Week ${parseInt(w)}, ${yr}`;
    }
    if (period === "monthly") {
      const [yr, mo] = key.split("-");
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${months[parseInt(mo) - 1]} ${yr}`;
    }
    return key;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {periodKeys.map(key => {
        const items = grouped[key];
        const counts = {
          ongoing:   items.filter(p => p.status === "ongoing").length,
          complete:  items.filter(p => p.status === "complete").length,
          rejection: items.filter(p => p.status === "rejection").length,
        };
        const pieData = Object.entries(PLAN_STATUS).map(([k, v]) => ({
          label: v.label, value: counts[k], color: v.color,
        }));
        const isCurrent = key === currentKey;

        return (
          <div key={key} style={{ border: `1px solid ${isCurrent ? "#185FA5" : "#eee"}`, borderRadius: 12,
            padding: 16, background: isCurrent ? "#f7faff" : "#fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{periodLabel(key)}</span>
                {isCurrent && <span style={{ fontSize: 10, marginLeft: 8, padding: "1px 7px", borderRadius: 99, background: "#185FA5", color: "#fff" }}>Current</span>}
              </div>
              <span style={{ fontSize: 12, color: "#888" }}>{items.length} plan{items.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Pie chart */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <PieChart data={pieData} size={110} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {Object.entries(PLAN_STATUS).map(([k, v]) => (
                    counts[k] > 0 && (
                      <span key={k} style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, display: "inline-block" }} />
                        <span style={{ color: "#555" }}>{v.label} {counts[k]}</span>
                      </span>
                    )
                  ))}
                </div>
              </div>

              {/* Plan list */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {items.map(p => {
                    const st = PLAN_STATUS[p.status];
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                        borderRadius: 7, background: "#fff", border: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 12 }}>{st.icon}</span>
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#333",
                          textDecoration: p.status === "rejection" ? "line-through" : "none",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </span>
                        {p.category && (
                          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "#f0f0f0", color: "#555", whiteSpace: "nowrap" }}>
                            {p.category}
                          </span>
                        )}
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function MyPlan() {
  const [plans, setPlans] = useSupabase("plans", []);
  const [analysisPeriod, setAnalysisPeriod] = useState("weekly");
  const [filter, setFilter]   = useState("all");

  // Form
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [category, setCategory]   = useState("Personal");
  const [status, setStatus]       = useState("ongoing");
  const [addedDate, setAddedDate] = useState(today);
  const [dueDate, setDueDate]     = useState("");

  function addPlan() {
    if (!title.trim()) return;
    setPlans(prev => [...prev, {
      id: Date.now(), title: title.trim(), description: description.trim(),
      category, status, addedDate, dueDate,
    }]);
    setTitle(""); setDesc(""); setCategory("Personal"); setStatus("ongoing");
    setAddedDate(today); setDueDate("");
  }

  function updateStatus(id, val) { setPlans(prev => prev.map(p => p.id === id ? { ...p, status: val } : p)); }
  function deletePlan(id)        { setPlans(prev => prev.filter(p => p.id !== id)); }

  // Counts
  const counts = Object.keys(PLAN_STATUS).reduce((acc, k) => {
    acc[k] = plans.filter(p => p.status === k).length;
    return acc;
  }, {});

  const filtered = filter === "all" ? plans : plans.filter(p => p.status === filter);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>My Plan</h2>

      {/* Stats */}
      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: "#f0f0f0", color: "#555", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{plans.length}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>Total Plans</div>
          </div>
          {Object.entries(PLAN_STATUS).map(([key, meta]) => (
            <div key={key} style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: meta.bg, color: meta.color, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{meta.label}</div>
            </div>
          ))}
          {counts.complete + counts.rejection > 0 && (
            <div style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: "#e8f5e9", color: "#3B6D11", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {Math.round((counts.complete / (counts.complete + counts.rejection)) * 100)}%
              </div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Success</div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Plan ── */}
      <Divider label="ADD PLAN" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 3, minWidth: 180 }}>
            <label style={labelSt}>Plan title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPlan()}
              placeholder="What do you want to achieve?" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelSt}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }}>
              {PLAN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 115 }}>
            <label style={labelSt}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%" }}>
              {Object.entries(PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelSt}>Description (optional)</label>
          <input value={description} onChange={e => setDesc(e.target.value)}
            placeholder="Details, milestones, notes..." style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Added date</label>
            <input type="date" value={addedDate} onChange={e => setAddedDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Due / target date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <button onClick={addPlan} style={{ alignSelf: "flex-end" }}>Add Plan</button>
        </div>
      </div>

      {/* Filter tabs */}
      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[["all","All","#555","#f0f0f0"], ...Object.entries(PLAN_STATUS).map(([k,v]) => [k, v.icon+" "+v.label, v.color, v.bg])].map(([key, label, color, bg]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ fontSize: 11, padding: "4px 14px", borderRadius: 99, border: "1px solid #e0e0e0", cursor: "pointer",
                background: filter === key ? color : "#fff",
                color: filter === key ? "#fff" : color,
                fontWeight: filter === key ? 600 : 400 }}>
              {label} ({key === "all" ? plans.length : counts[key] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Plan list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plans.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>No plans yet. Add your first plan above.</p>
        )}
        {filtered.sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || "")).map(p => {
          const st = PLAN_STATUS[p.status];
          const isOverdue = p.dueDate && p.dueDate < today && p.status === "ongoing";
          return (
            <div key={p.id} className="card" style={{ padding: "12px 16px", borderLeft: `3px solid ${st.color}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                    <p style={{ fontWeight: 600, fontSize: 14,
                      textDecoration: p.status === "rejection" ? "line-through" : "none",
                      color: p.status === "rejection" ? "#aaa" : "inherit" }}>
                      {st.icon} {p.title}
                    </p>
                    {p.category && (
                      <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "#f0f0f0", color: "#555" }}>{p.category}</span>
                    )}
                  </div>
                  {p.description && <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{p.description}</p>}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {p.addedDate && <span style={{ fontSize: 11, color: "#aaa" }}>Added {formatDate(p.addedDate)}</span>}
                    {p.dueDate && (
                      <span style={{ fontSize: 11, color: isOverdue ? "#A32D2D" : "#888", fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? "⚠ Overdue · " : "Due · "}{formatDate(p.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "none",
                      background: st.bg, color: st.color, cursor: "pointer", fontWeight: 600 }}>
                    {Object.entries(PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                  <button onClick={() => deletePlan(p.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Analysis ── */}
      {plans.length > 0 && (
        <>
          <Divider label="ANALYSIS" />

          {/* Period tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["weekly", "monthly", "yearly"].map(p => (
              <button key={p} onClick={() => setAnalysisPeriod(p)}
                style={{ fontSize: 12, padding: "6px 18px", borderRadius: 99, border: "1px solid #e0e0e0", cursor: "pointer",
                  background: analysisPeriod === p ? "#185FA5" : "#fff",
                  color: analysisPeriod === p ? "#fff" : "#555",
                  fontWeight: analysisPeriod === p ? 600 : 400, textTransform: "capitalize" }}>
                {p}
              </button>
            ))}
          </div>

          <AnalysisPanel plans={plans} period={analysisPeriod} />
        </>
      )}
    </div>
  );
}

const labelSt = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

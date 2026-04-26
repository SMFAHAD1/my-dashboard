import { useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function getWeekKey(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(dateString) {
  if (!dateString) return null;
  return dateString.slice(0, 7);
}

function getYearKey(dateString) {
  if (!dateString) return null;
  return dateString.slice(0, 4);
}

function getDayKey(dateString) {
  if (!dateString) return null;
  return dateString;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#667085", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
    </div>
  );
}

const PLAN_STATUS = {
  ongoing: { label: "Ongoing", bg: "#eef4ff", color: "#111827" },
  complete: { label: "Complete", bg: "#f2f4f7", color: "#111827" },
  rejection: { label: "Rejected", bg: "#fef3c7", color: "#475467" },
};

const PLAN_PERIODS = {
  daily: { label: "Daily" },
  weekly: { label: "Weekly" },
  monthly: { label: "Monthly" },
  yearly: { label: "Yearly" },
};

const PLAN_CATEGORIES = ["Personal", "Career", "Health", "Finance", "Learning", "Project", "Other"];

function PieChart({ data, size = 120 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div style={{ width: size, height: size, borderRadius: "50%", background: "#f2f4f7" }} />;
  }

  let angleCursor = -Math.PI / 2;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  const slices = data
    .filter((item) => item.value > 0)
    .map((item) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const x1 = cx + radius * Math.cos(angleCursor);
      const y1 = cy + radius * Math.sin(angleCursor);
      angleCursor += angle;
      const x2 = cx + radius * Math.cos(angleCursor);
      const y2 = cy + radius * Math.sin(angleCursor);
      return { ...item, x1, y1, x2, y2, largeArc: angle > Math.PI ? 1 : 0 };
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, index) => (
        <path
          key={index}
          d={`M${cx},${cy} L${slice.x1},${slice.y1} A${radius},${radius} 0 ${slice.largeArc},1 ${slice.x2},${slice.y2} Z`}
          fill={slice.color}
          stroke="#111827"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={cx} cy={cy} r={radius * 0.42} fill="#111827" />
    </svg>
  );
}

function AnalysisPanel({ plans, period }) {
  const getKey = period === "daily" ? getDayKey : period === "weekly" ? getWeekKey : period === "monthly" ? getMonthKey : getYearKey;
  const currentKey = getKey(today);

  const grouped = useMemo(() => {
    const map = {};
    plans.forEach((plan) => {
      const key = getKey(plan.addedDate || plan.dueDate || today);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(plan);
    });
    return map;
  }, [plans, period]);

  const periodKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!plans.length) {
    return <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "16px 0" }}>No plans to analyze.</p>;
  }

  function periodLabel(key) {
    if (period === "daily") {
      return formatDate(key);
    }
    if (period === "weekly") {
      const [year, week] = key.split("-W");
      return `Week ${parseInt(week, 10)}, ${year}`;
    }
    if (period === "monthly") {
      const [year, month] = key.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return key;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {periodKeys.map((key) => {
        const items = grouped[key];
        const counts = {
          ongoing: items.filter((plan) => plan.status === "ongoing").length,
          complete: items.filter((plan) => plan.status === "complete").length,
          rejection: items.filter((plan) => plan.status === "rejection").length,
        };
        const pieData = [
          { label: "Ongoing", value: counts.ongoing, color: "#111827" },
          { label: "Complete", value: counts.complete, color: "#667085" },
          { label: "Rejected", value: counts.rejection, color: "#d0d5dd" },
        ];
        const isCurrent = key === currentKey;

        return (
          <div
            key={key}
            style={{
              border: `1px solid ${isCurrent ? "#98a2b3" : "#d9dee7"}`,
              borderRadius: 12,
              padding: 16,
              background: isCurrent ? "#f8fafc" : "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{periodLabel(key)}</span>
                {isCurrent && (
                  <span style={{ fontSize: 10, marginLeft: 8, padding: "1px 7px", borderRadius: 99, background: "#111827", color: "#ffffff" }}>
                    Current
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#667085" }}>{items.length} plan{items.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <PieChart data={pieData} size={110} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {pieData.map((item) =>
                    item.value > 0 ? (
                      <span key={item.label} style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                        <span style={{ color: "#475467" }}>{item.label} {item.value}</span>
                      </span>
                    ) : null
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map((plan) => {
                    const meta = PLAN_STATUS[plan.status];
                    return (
                      <div key={plan.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "#ffffff", border: "1px solid #d9dee7" }}>
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#111827", textDecoration: plan.status === "rejection" ? "line-through" : "none" }}>
                          {plan.title}
                        </span>
                        {plan.category && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "#f2f4f7", color: "#475467" }}>{plan.category}</span>}
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: meta.bg, color: meta.color, border: "1px solid #d0d5dd" }}>
                          {meta.label}
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

export default function MyPlan() {
  const [plans, setPlans] = useLocalStorage("dashboard-my-plan-items", [], 1);
  const [analysisPeriod, setAnalysisPeriod] = useState("weekly");
  const [filter, setFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [planPeriod, setPlanPeriod] = useState("daily");
  const [status, setStatus] = useState("ongoing");
  const [addedDate, setAddedDate] = useState(today);
  const [dueDate, setDueDate] = useState("");

  function addPlan() {
    if (!title.trim()) return;
    setPlans((current) => [
      ...current,
      { id: Date.now(), title: title.trim(), description: description.trim(), category, period: planPeriod, status, addedDate, dueDate },
    ]);
    setTitle("");
    setDescription("");
    setCategory("Personal");
    setPlanPeriod("daily");
    setStatus("ongoing");
    setAddedDate(today);
    setDueDate("");
  }

  function updateStatus(id, value) {
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, status: value } : plan)));
  }

  function deletePlan(id) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
  }

  const counts = Object.keys(PLAN_STATUS).reduce((accumulator, key) => {
    accumulator[key] = plans.filter((plan) => plan.status === key).length;
    return accumulator;
  }, {});

  const periodCounts = Object.keys(PLAN_PERIODS).reduce((accumulator, key) => {
    accumulator[key] = plans.filter((plan) => (plan.period || "daily") === key).length;
    return accumulator;
  }, {});

  const filtered = plans.filter((plan) => {
    const matchesStatus = filter === "all" || plan.status === filter;
    const matchesPeriod = periodFilter === "all" || (plan.period || "daily") === periodFilter;
    return matchesStatus && matchesPeriod;
  });

  const filteredByPeriod = Object.keys(PLAN_PERIODS).reduce((accumulator, key) => {
    accumulator[key] = [...filtered]
      .filter((plan) => (plan.period || "daily") === key)
      .sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || ""));
    return accumulator;
  }, {});

  const visiblePeriods = periodFilter === "all" ? Object.keys(PLAN_PERIODS) : [periodFilter];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>My Plan</h2>

      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <StatCard label="Total Plans" value={plans.length} />
          {Object.entries(PLAN_STATUS).map(([key, meta]) => (
            <StatCard key={key} label={meta.label} value={counts[key]} />
          ))}
          {counts.complete + counts.rejection > 0 && (
            <StatCard label="Success" value={`${Math.round((counts.complete / (counts.complete + counts.rejection)) * 100)}%`} />
          )}
        </div>
      )}

      <Divider label="ADD PLAN" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 3, minWidth: 180 }}>
            <label style={labelStyle}>Plan Title</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addPlan()} placeholder="What do you want to achieve?" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} style={{ width: "100%" }}>
              {PLAN_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 115 }}>
            <label style={labelStyle}>Plan Type</label>
            <select value={planPeriod} onChange={(event) => setPlanPeriod(event.target.value)} style={{ width: "100%" }}>
              {Object.entries(PLAN_PERIODS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 115 }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: "100%" }}>
              {Object.entries(PLAN_STATUS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Description</label>
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Details, milestones, notes..." style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added Date</label>
            <input type="date" value={addedDate} onChange={(event) => setAddedDate(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Due / Target Date</label>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <button onClick={addPlan} style={buttonStyle}>Add Plan</button>
        </div>
      </div>

      {plans.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["all", "All"], ...Object.entries(PLAN_PERIODS).map(([key, meta]) => [key, meta.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriodFilter(key)}
                style={{
                  fontSize: 11,
                  padding: "4px 14px",
                  borderRadius: 99,
                  border: "1px solid #d0d5dd",
                  cursor: "pointer",
                  background: periodFilter === key ? "#111827" : "#ffffff",
                  color: periodFilter === key ? "#ffffff" : "#475467",
                  fontWeight: periodFilter === key ? 600 : 400,
                }}
              >
                {label} ({key === "all" ? plans.length : periodCounts[key] || 0})
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["all", "All Status"], ...Object.entries(PLAN_STATUS).map(([key, meta]) => [key, meta.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  fontSize: 11,
                  padding: "4px 14px",
                  borderRadius: 99,
                  border: "1px solid #d0d5dd",
                  cursor: "pointer",
                  background: filter === key ? "#111827" : "#ffffff",
                  color: filter === key ? "#ffffff" : "#475467",
                  fontWeight: filter === key ? 600 : 400,
                }}
              >
                {label} ({key === "all" ? plans.length : counts[key] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plans.length === 0 && <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>No plans yet. Add your first plan above.</p>}
        {plans.length > 0 && filtered.length === 0 && <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>No plans match these filters.</p>}
        {visiblePeriods.map((periodKey) => {
          const periodPlans = filteredByPeriod[periodKey];
          if (!periodPlans.length) return null;

          return (
            <div key={periodKey}>
              <Divider label={`${PLAN_PERIODS[periodKey].label.toUpperCase()} PLANS`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {periodPlans.map((plan) => {
                  const meta = PLAN_STATUS[plan.status];
                  const isOverdue = plan.dueDate && plan.dueDate < today && plan.status === "ongoing";
                  return (
                    <div key={plan.id} className="card" style={{ padding: "12px 16px", borderLeft: "3px solid #98a2b3", marginBottom: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                            <p style={{ fontWeight: 600, fontSize: 14, textDecoration: plan.status === "rejection" ? "line-through" : "none", color: plan.status === "rejection" ? "#667085" : "inherit" }}>
                              {plan.title}
                            </p>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "#eef4ff", color: "#1d4ed8", fontWeight: 600 }}>
                              {PLAN_PERIODS[plan.period || "daily"].label}
                            </span>
                            {plan.category && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "#eef4ff", color: "#475467" }}>{plan.category}</span>}
                          </div>
                          {plan.description && <p style={{ fontSize: 12, color: "#667085", marginBottom: 4 }}>{plan.description}</p>}
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {plan.addedDate && <span style={{ fontSize: 11, color: "#667085" }}>Added {formatDate(plan.addedDate)}</span>}
                            {plan.dueDate && <span style={{ fontSize: 11, color: isOverdue ? "#111827" : "#667085", fontWeight: isOverdue ? 600 : 400 }}>{isOverdue ? "Overdue - " : "Due - "}{formatDate(plan.dueDate)}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                          <select value={plan.status} onChange={(event) => updateStatus(plan.id, event.target.value)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: meta.bg, color: meta.color, cursor: "pointer", fontWeight: 600, border: "1px solid #d0d5dd" }}>
                            {Object.entries(PLAN_STATUS).map(([key, item]) => (
                              <option key={key} value={key}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => deletePlan(plan.id)} style={ghostButtonStyle}>Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {plans.length > 0 && (
        <>
          <Divider label="ANALYSIS" />
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {Object.keys(PLAN_PERIODS).map((period) => (
              <button
                key={period}
                onClick={() => setAnalysisPeriod(period)}
                style={{
                  fontSize: 12,
                  padding: "6px 18px",
                  borderRadius: 99,
                  border: "1px solid #d0d5dd",
                  cursor: "pointer",
                  background: analysisPeriod === period ? "#111827" : "#ffffff",
                  color: analysisPeriod === period ? "#ffffff" : "#475467",
                  fontWeight: analysisPeriod === period ? 600 : 400,
                  textTransform: "capitalize",
                }}
              >
                {period}
              </button>
            ))}
          </div>
          <AnalysisPanel plans={plans} period={analysisPeriod} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10, background: "#ffffff", color: "#111827", textAlign: "center", border: "1px solid #d9dee7" }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 2, color: "#667085" }}>{label}</div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: "#667085", display: "block", marginBottom: 3 };
const buttonStyle = { alignSelf: "flex-end", background: "#111827", color: "#ffffff", border: "1px solid #98a2b3", borderRadius: 8, padding: "9px 16px", cursor: "pointer" };
const ghostButtonStyle = { background: "transparent", border: "1px solid #d0d5dd", cursor: "pointer", color: "#475467", borderRadius: 8, padding: "6px 10px", fontSize: 12 };

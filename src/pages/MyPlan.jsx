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

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
    </div>
  );
}

const PLAN_STATUS = {
  ongoing: { label: "Ongoing", bg: "#e8f0fe", color: "#185FA5", icon: "In progress" },
  complete: { label: "Complete", bg: "#e8f5e9", color: "#3B6D11", icon: "Done" },
  rejection: { label: "Rejected", bg: "#fce8e8", color: "#A32D2D", icon: "Closed" },
};

const PLAN_CATEGORIES = ["Personal", "Career", "Health", "Finance", "Learning", "Project", "Other"];

function PieChart({ data, size = 130 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: "50%", background: "#eee" }}
      />
    );
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

      return {
        ...item,
        x1,
        y1,
        x2,
        y2,
        largeArc: angle > Math.PI ? 1 : 0,
      };
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, index) => (
        <path
          key={index}
          d={`M${cx},${cy} L${slice.x1},${slice.y1} A${radius},${radius} 0 ${slice.largeArc},1 ${slice.x2},${slice.y2} Z`}
          fill={slice.color}
          stroke="#fff"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={cx} cy={cy} r={radius * 0.45} fill="#fff" />
    </svg>
  );
}

function AnalysisPanel({ plans, period }) {
  const getKey =
    period === "weekly" ? getWeekKey : period === "monthly" ? getMonthKey : getYearKey;

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
  }, [getKey, plans]);

  const periodKeys = Object.keys(grouped).sort((left, right) => right.localeCompare(left));

  if (!plans.length) {
    return (
      <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "16px 0" }}>
        No plans to analyze.
      </p>
    );
  }

  function periodLabel(key) {
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
        const pieData = Object.entries(PLAN_STATUS).map(([statusKey, meta]) => ({
          label: meta.label,
          value: counts[statusKey],
          color: meta.color,
        }));
        const isCurrent = key === currentKey;

        return (
          <div
            key={key}
            style={{
              border: `1px solid ${isCurrent ? "#185FA5" : "#eee"}`,
              borderRadius: 12,
              padding: 16,
              background: isCurrent ? "#f7faff" : "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>
                  {periodLabel(key)}
                </span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 8,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: "#185FA5",
                      color: "#fff",
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#888" }}>
                {items.length} plan{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <PieChart data={pieData} size={110} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {Object.entries(PLAN_STATUS).map(([statusKey, meta]) =>
                    counts[statusKey] > 0 ? (
                      <span
                        key={statusKey}
                        style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: meta.color,
                            display: "inline-block",
                          }}
                        />
                        <span style={{ color: "#555" }}>
                          {meta.label} {counts[statusKey]}
                        </span>
                      </span>
                    ) : null
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {items.map((plan) => {
                    const meta = PLAN_STATUS[plan.status];

                    return (
                      <div
                        key={plan.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 7,
                          background: "#fff",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <span style={{ fontSize: 12 }}>{meta.icon}</span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#333",
                            textDecoration: plan.status === "rejection" ? "line-through" : "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {plan.title}
                        </span>
                        {plan.category && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: "1px 6px",
                              borderRadius: 99,
                              background: "#f0f0f0",
                              color: "#555",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {plan.category}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 99,
                            background: meta.bg,
                            color: meta.color,
                            whiteSpace: "nowrap",
                          }}
                        >
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [status, setStatus] = useState("ongoing");
  const [addedDate, setAddedDate] = useState(today);
  const [dueDate, setDueDate] = useState("");

  function addPlan() {
    if (!title.trim()) return;

    setPlans((current) => [
      ...current,
      {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        addedDate,
        dueDate,
      },
    ]);

    setTitle("");
    setDescription("");
    setCategory("Personal");
    setStatus("ongoing");
    setAddedDate(today);
    setDueDate("");
  }

  function updateStatus(id, value) {
    setPlans((current) =>
      current.map((plan) => (plan.id === id ? { ...plan, status: value } : plan))
    );
  }

  function deletePlan(id) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
  }

  const counts = Object.keys(PLAN_STATUS).reduce((accumulator, key) => {
    accumulator[key] = plans.filter((plan) => plan.status === key).length;
    return accumulator;
  }, {});

  const filteredPlans =
    filter === "all" ? plans : plans.filter((plan) => plan.status === filter);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>My Plan</h2>

      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <div
            style={{
              flex: 1,
              minWidth: 80,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#f0f0f0",
              color: "#555",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700 }}>{plans.length}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>Total Plans</div>
          </div>
          {Object.entries(PLAN_STATUS).map(([key, meta]) => (
            <div
              key={key}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "12px 14px",
                borderRadius: 10,
                background: meta.bg,
                color: meta.color,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{meta.label}</div>
            </div>
          ))}
          {counts.complete + counts.rejection > 0 && (
            <div
              style={{
                flex: 1,
                minWidth: 80,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#e8f5e9",
                color: "#3B6D11",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {Math.round((counts.complete / (counts.complete + counts.rejection)) * 100)}%
              </div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Success</div>
            </div>
          )}
        </div>
      )}

      <Divider label="ADD PLAN" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 3, minWidth: 180 }}>
            <label style={labelStyle}>Plan Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addPlan()}
              placeholder="What do you want to achieve?"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{ width: "100%" }}
            >
              {PLAN_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 115 }}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ width: "100%" }}
            >
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
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Details, milestones, notes..."
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added Date</label>
            <input type="date" value={addedDate} onChange={(event) => setAddedDate(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Target Date</label>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <button onClick={addPlan} style={{ alignSelf: "flex-end" }}>
            Add Plan
          </button>
        </div>
      </div>

      {plans.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            ["all", "All", "#555"],
            ...Object.entries(PLAN_STATUS).map(([key, meta]) => [key, meta.label, meta.color]),
          ].map(([key, label, color]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontSize: 11,
                padding: "4px 14px",
                borderRadius: 99,
                border: "1px solid #e0e0e0",
                cursor: "pointer",
                background: filter === key ? color : "#fff",
                color: filter === key ? "#fff" : color,
                fontWeight: filter === key ? 600 : 400,
              }}
            >
              {label} ({key === "all" ? plans.length : counts[key] || 0})
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plans.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>
            No plans yet. Add your first plan above.
          </p>
        )}

        {[...filteredPlans]
          .sort((left, right) => (right.addedDate || "").localeCompare(left.addedDate || ""))
          .map((plan) => {
            const meta = PLAN_STATUS[plan.status];
            const isOverdue = plan.dueDate && plan.dueDate < today && plan.status === "ongoing";

            return (
              <div
                key={plan.id}
                className="card"
                style={{ padding: "12px 16px", borderLeft: `3px solid ${meta.color}` }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          textDecoration: plan.status === "rejection" ? "line-through" : "none",
                          color: plan.status === "rejection" ? "#aaa" : "inherit",
                        }}
                      >
                        {plan.title}
                      </p>
                      {plan.category && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 7px",
                            borderRadius: 99,
                            background: "#f0f0f0",
                            color: "#555",
                          }}
                        >
                          {plan.category}
                        </span>
                      )}
                    </div>

                    {plan.description && (
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                        {plan.description}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {plan.addedDate && (
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          Added {formatDate(plan.addedDate)}
                        </span>
                      )}
                      {plan.dueDate && (
                        <span
                          style={{
                            fontSize: 11,
                            color: isOverdue ? "#A32D2D" : "#888",
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {isOverdue ? "Overdue - " : "Due - "}
                          {formatDate(plan.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <select
                      value={plan.status}
                      onChange={(event) => updateStatus(plan.id, event.target.value)}
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 99,
                        border: "none",
                        background: meta.bg,
                        color: meta.color,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {Object.entries(PLAN_STATUS).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ccc",
                        fontSize: 12,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {plans.length > 0 && (
        <>
          <Divider label="ANALYSIS" />

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["weekly", "monthly", "yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setAnalysisPeriod(period)}
                style={{
                  fontSize: 12,
                  padding: "6px 18px",
                  borderRadius: 99,
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  background: analysisPeriod === period ? "#185FA5" : "#fff",
                  color: analysisPeriod === period ? "#fff" : "#555",
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

const labelStyle = {
  fontSize: 11,
  color: "#888",
  display: "block",
  marginBottom: 3,
};

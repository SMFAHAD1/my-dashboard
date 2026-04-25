import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CATEGORIES = ["Study", "Personal", "Work", "Health", "Finance", "Other"];
const STATUSES = ["Pending", "In Progress", "Done", "Cancelled"];
const PERIODS = ["Daily", "Weekly", "Monthly"];

const EMPTY = {
  title: "",
  category: "Study",
  period: "Daily",
  status: "Pending",
  dueDate: "",
  note: "",
};

export default function Planner() {
  const [plans, setPlans] = useLocalStorage("dashboard-planner-items", [], 1);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("All");

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addPlan = () => {
    if (!form.title.trim()) return;

    setPlans((current) => [{ ...form, id: Date.now() }, ...current]);
    setForm(EMPTY);
  };

  const removePlan = (id) => {
    setPlans((current) => current.filter((item) => item.id !== id));
  };

  const updateStatus = (id, status) => {
    setPlans((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const filteredPlans =
    filter === "All" ? plans : plans.filter((plan) => plan.status === filter);

  const plansByPeriod = PERIODS.map((period) => ({
    period,
    items: filteredPlans.filter((plan) => (plan.period || "Daily") === period),
  }));

  const total = plans.length;
  const pending = plans.filter((plan) => plan.status === "Pending").length;
  const inProgress = plans.filter((plan) => plan.status === "In Progress").length;
  const done = plans.filter((plan) => plan.status === "Done").length;

  return (
    <div>
      <div className="page-header">
        <h1>Planner</h1>
        <p>Track your tasks, plans, and goals.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--warning)" }}>
            {pending}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {inProgress}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {done}
          </div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Add Plan</div>
        <div className="form-row">
          <div className="input-group" style={{ flex: 3 }}>
            <label>Title</label>
            <input
              placeholder="What do you plan to do?"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addPlan()}
            />
          </div>
          <div className="input-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Plan Type</label>
            <select
              value={form.period}
              onChange={(event) => setField("period", event.target.value)}
            >
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(event) => setField("status", event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setField("dueDate", event.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={addPlan}
            style={{ alignSelf: "flex-end" }}
          >
            Add
          </button>
        </div>
        <div className="form-row">
          <div className="input-group" style={{ flex: 1 }}>
            <label>Note</label>
            <input
              placeholder="Any notes..."
              value={form.note}
              onChange={(event) => setField("note", event.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", ...STATUSES].map((status) => (
          <button
            key={status}
            className={`btn ${filter === status ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">List</div>
            <p>No plans yet. Add one above.</p>
          </div>
        </div>
      ) : (
        plansByPeriod.map(({ period, items }) => (
          <div className="card" key={period} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div className="card-title" style={{ marginBottom: 0 }}>
                {period} Plans
              </div>
              <span className="badge badge-purple">{items.length}</span>
            </div>

            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: "16px 0 0" }}>
                <p>No {period.toLowerCase()} plans in this filter.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Note</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((plan) => (
                      <tr key={plan.id}>
                        <td style={{ fontWeight: 500 }}>{plan.title}</td>
                        <td>
                          <span className="badge badge-purple">{plan.category}</span>
                        </td>
                        <td>
                          <select
                            value={plan.status}
                            onChange={(event) =>
                              updateStatus(plan.id, event.target.value)
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text)",
                              fontSize: "0.85rem",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {plan.dueDate || "-"}
                        </td>
                        <td
                          style={{
                            color: "var(--muted)",
                            fontSize: "0.85rem",
                            maxWidth: 200,
                          }}
                        >
                          {plan.note || "-"}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => removePlan(plan.id)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

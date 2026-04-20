// src/pages/Academic.jsx
import { useState } from "react";

const today = new Date().toISOString().split("T")[0];

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

const SUBJECT_COLORS = [
  { bg: "#e8f0fe", color: "#185FA5" },
  { bg: "#e8f5e9", color: "#3B6D11" },
  { bg: "#fff8e1", color: "#854F0B" },
  { bg: "#fce8e8", color: "#A32D2D" },
  { bg: "#f3e8ff", color: "#6B21A8" },
  { bg: "#e0f7fa", color: "#0B6E74" },
];

const STATUS_OPTIONS = ["ongoing", "completed", "upcoming", "dropped"];
const STATUS_STYLES = {
  ongoing:   { bg: "#e8f0fe", color: "#185FA5" },
  completed: { bg: "#e8f5e9", color: "#3B6D11" },
  upcoming:  { bg: "#fff8e1", color: "#854F0B" },
  dropped:   { bg: "#fce8e8", color: "#A32D2D" },
};

export default function Academic() {
  // ── Courses ──────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [courseInstitution, setCourseInstitution] = useState("");
  const [courseStatus, setCourseStatus] = useState("ongoing");
  const [courseGrade, setCourseGrade] = useState("");
  const [courseStart, setCourseStart] = useState("");
  const [courseEnd, setCourseEnd] = useState("");

  function addCourse() {
    if (!courseName.trim()) return;
    setCourses(prev => [...prev, {
      id: Date.now(),
      name: courseName.trim(),
      institution: courseInstitution.trim(),
      status: courseStatus,
      grade: courseGrade.trim(),
      startDate: courseStart,
      endDate: courseEnd,
      colorIdx: prev.length % SUBJECT_COLORS.length,
    }]);
    setCourseName(""); setCourseInstitution(""); setCourseGrade("");
    setCourseStart(""); setCourseEnd(""); setCourseStatus("ongoing");
  }

  function deleteCourse(id) {
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  function updateCourseStatus(id, val) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: val } : c));
  }

  // ── Assignments / Tasks ───────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");

  function addTask() {
    if (!taskTitle.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: taskTitle.trim(),
      subject: taskSubject.trim(),
      due: taskDue,
      priority: taskPriority,
      done: false,
      addedDate: today,
    }]);
    setTaskTitle(""); setTaskSubject(""); setTaskDue(""); setTaskPriority("medium");
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const PRIORITY = {
    high:   { bg: "#fce8e8", color: "#A32D2D", label: "High" },
    medium: { bg: "#fff8e1", color: "#854F0B", label: "Medium" },
    low:    { bg: "#e8f5e9", color: "#3B6D11", label: "Low" },
  };

  const pending = tasks.filter(t => !t.done).length;
  const completed = tasks.filter(t => t.done).length;

  // ── Stats ─────────────────────────────────────────────
  const ongoingCount   = courses.filter(c => c.status === "ongoing").length;
  const completedCount = courses.filter(c => c.status === "completed").length;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Academic</h2>

      {/* ── Stats Row ── */}
      {(courses.length > 0 || tasks.length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total Courses", value: courses.length, bg: "#e8f0fe", color: "#185FA5" },
            { label: "Ongoing", value: ongoingCount, bg: "#fff8e1", color: "#854F0B" },
            { label: "Completed", value: completedCount, bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Pending Tasks", value: pending, bg: "#fce8e8", color: "#A32D2D" },
            { label: "Done Tasks", value: completed, bg: "#e8f5e9", color: "#3B6D11" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, minWidth: 100, padding: "12px 16px", borderRadius: 10,
              background: s.bg, color: s.color, textAlign: "center"
            }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ COURSES SECTION ══════════════ */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#444" }}>
        Courses & Subjects
      </h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCourse()}
            placeholder="Course / Subject name..."
            style={{ flex: 2, minWidth: 160 }}
          />
          <input
            value={courseInstitution}
            onChange={e => setCourseInstitution(e.target.value)}
            placeholder="Institution (optional)"
            style={{ flex: 2, minWidth: 140 }}
          />
          <input
            value={courseGrade}
            onChange={e => setCourseGrade(e.target.value)}
            placeholder="Grade / Score"
            style={{ flex: 1, minWidth: 90 }}
          />
          <select value={courseStatus} onChange={e => setCourseStatus(e.target.value)} style={{ minWidth: 110 }}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={{ fontSize: 11, color: "#888" }}>Start date</label>
            <input type="date" value={courseStart} onChange={e => setCourseStart(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={{ fontSize: 11, color: "#888" }}>End date</label>
            <input type="date" value={courseEnd} onChange={e => setCourseEnd(e.target.value)} />
          </div>
          <button onClick={addCourse} style={{ alignSelf: "flex-end" }}>Add Course</button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {courses.map(c => {
          const col = SUBJECT_COLORS[c.colorIdx];
          const st = STATUS_STYLES[c.status];
          return (
            <div key={c.id} className="card" style={{ padding: 14, position: "relative" }}>
              {/* color accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "10px 10px 0 0", background: col.color }} />
              <div style={{ marginTop: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, lineHeight: 1.3 }}>{c.name}</p>
                {c.institution && <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{c.institution}</p>}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <select
                    value={c.status}
                    onChange={e => updateCourseStatus(c.id, e.target.value)}
                    style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99, border: "none",
                      background: st.bg, color: st.color, cursor: "pointer" }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  {c.grade && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{c.grade}</span>
                  )}
                </div>

                {(c.startDate || c.endDate) && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #eee" }}>
                    {c.startDate && <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>▶ {formatDate(c.startDate)}</p>}
                    {c.endDate   && <p style={{ fontSize: 11, color: "#888" }}>⬛ {formatDate(c.endDate)}</p>}
                  </div>
                )}

                <button
                  onClick={() => deleteCourse(c.id)}
                  style={{ marginTop: 10, fontSize: 11, color: "#bbb", background: "none",
                    border: "none", cursor: "pointer", padding: 0 }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════ TASKS / ASSIGNMENTS ══════════════ */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#444" }}>
        Assignments & Tasks
      </h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Assignment or task..."
            style={{ flex: 2, minWidth: 180 }}
          />
          <input
            value={taskSubject}
            onChange={e => setTaskSubject(e.target.value)}
            placeholder="Subject"
            style={{ flex: 1, minWidth: 110 }}
          />
          <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} style={{ minWidth: 100 }}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 150 }}>
            <label style={{ fontSize: 11, color: "#888" }}>Due date</label>
            <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
          </div>
          <button onClick={addTask} style={{ alignSelf: "flex-end" }}>Add Task</button>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>
            No tasks yet. Add an assignment above.
          </p>
        )}
        {tasks
          .sort((a, b) => {
            if (a.done !== b.done) return a.done ? 1 : -1;
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
          })
          .map(t => {
            const pr = PRIORITY[t.priority];
            const isOverdue = t.due && !t.done && t.due < today;
            return (
              <div key={t.id} className="card"
                style={{ display: "flex", alignItems: "center", gap: 12,
                  opacity: t.done ? 0.55 : 1, transition: "opacity 0.2s" }}
              >
                {/* Checkbox */}
                <div
                  onClick={() => toggleTask(t.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                    border: t.done ? "none" : "2px solid #ddd",
                    background: t.done ? "#3B6D11" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#fff",
                  }}
                >{t.done ? "✓" : ""}</div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 14, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#aaa" : "inherit" }}>
                    {t.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
                    {t.subject && <span style={{ marginRight: 8 }}>{t.subject}</span>}
                    {t.due && (
                      <span style={{ color: isOverdue ? "#A32D2D" : "#888", fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? "⚠ Overdue · " : "Due · "}{formatDate(t.due)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Priority badge */}
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99,
                  background: pr.bg, color: pr.color, whiteSpace: "nowrap" }}>
                  {pr.label}
                </span>

                {/* Delete */}
                <button onClick={() => deleteTask(t.id)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#ccc", fontSize: 14, padding: "0 4px" }}>✕</button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
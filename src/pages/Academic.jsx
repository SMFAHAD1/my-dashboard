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

// ── CGPA helpers ────────────────────────────────────────────────────────
// Converts a letter grade or numeric score → grade point (4.0 scale)
function gradeToPoint(grade) {
  if (!grade) return null;
  const g = grade.trim().toUpperCase();
  const map = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0,
  };
  if (map[g] !== undefined) return map[g];
  // Try numeric percentage → 4.0 scale
  const num = parseFloat(g);
  if (!isNaN(num)) {
    if (num >= 90) return 4.0;
    if (num >= 85) return 3.7;
    if (num >= 80) return 3.3;
    if (num >= 75) return 3.0;
    if (num >= 70) return 2.7;
    if (num >= 65) return 2.3;
    if (num >= 60) return 2.0;
    if (num >= 55) return 1.7;
    if (num >= 50) return 1.0;
    return 0.0;
  }
  return null;
}

function gradeLabel(point) {
  if (point === null) return "";
  if (point >= 3.85) return "A / A+";
  if (point >= 3.5)  return "A-";
  if (point >= 3.15) return "B+";
  if (point >= 2.85) return "B";
  if (point >= 2.5)  return "B-";
  if (point >= 2.15) return "C+";
  if (point >= 1.85) return "C";
  if (point >= 1.5)  return "C-";
  if (point >= 1.15) return "D+";
  if (point >= 0.85) return "D";
  return "F";
}

function cgpaColor(cgpa) {
  if (cgpa >= 3.5) return { color: "#3B6D11", bg: "#e8f5e9" };
  if (cgpa >= 3.0) return { color: "#185FA5", bg: "#e8f0fe" };
  if (cgpa >= 2.5) return { color: "#854F0B", bg: "#fff8e1" };
  return { color: "#A32D2D", bg: "#fce8e8" };
}

// ── CGPA Summary Card ────────────────────────────────────────────────────
function CGPASummary({ courses }) {
  const completed = courses.filter(c => c.status === "completed" && c.credit > 0 && gradeToPoint(c.grade) !== null);
  if (completed.length === 0) return null;

  const totalCredits  = completed.reduce((s, c) => s + c.credit, 0);
  const weightedSum   = completed.reduce((s, c) => s + gradeToPoint(c.grade) * c.credit, 0);
  const cgpa          = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const { color, bg } = cgpaColor(cgpa);

  return (
    <div style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#555", letterSpacing: 0.4 }}>📊 CGPA SUMMARY</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f0fe", color: "#185FA5", fontWeight: 500 }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </span>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11", fontWeight: 500 }}>
            {totalCredits} credits completed
          </span>
        </div>
      </div>

      {/* Main CGPA display */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", padding: "14px 24px", borderRadius: 12, background: bg, minWidth: 120 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{cgpa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 500 }}>CGPA / 4.0</div>
          <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 2 }}>{gradeLabel(cgpa)}</div>
        </div>

        {/* Per-course breakdown */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {completed.map(c => {
              const gp = gradeToPoint(c.grade);
              const barW = (gp / 4.0) * 100;
              const col = cgpaColor(gp);
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#555", minWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: col.color, borderRadius: 99, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: col.color, minWidth: 28, textAlign: "right" }}>{gp.toFixed(1)}</span>
                  <span style={{ fontSize: 10, color: "#aaa", minWidth: 30, textAlign: "right" }}>{c.credit}cr</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Class Test Section ───────────────────────────────────────────────────
function ClassTests({ courses }) {
  const [tests, setTests]             = useState([]);
  const [testTitle, setTestTitle]     = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDate, setTestDate]       = useState("");
  const [testScore, setTestScore]     = useState("");
  const [testTotal, setTestTotal]     = useState("100");
  const [filterSubj, setFilterSubj]   = useState("all");

  function addTest() {
    if (!testTitle.trim()) return;
    setTests(prev => [...prev, {
      id: Date.now(),
      title: testTitle.trim(),
      subject: testSubject.trim(),
      date: testDate,
      score: testScore !== "" ? parseFloat(testScore) : null,
      total: testTotal !== "" ? parseFloat(testTotal) : 100,
    }]);
    setTestTitle(""); setTestSubject(""); setTestDate("");
    setTestScore(""); setTestTotal("100");
  }

  function deleteTest(id) { setTests(prev => prev.filter(t => t.id !== id)); }

  // Subject list from courses + manually entered subjects in tests
  const subjectOptions = [
    ...new Set([
      ...courses.map(c => c.name).filter(Boolean),
      ...tests.map(t => t.subject).filter(Boolean),
    ]),
  ];

  const filtered = filterSubj === "all" ? tests : tests.filter(t => t.subject === filterSubj);

  // Per-subject average for the filter
  const subjTests   = tests.filter(t => t.subject === filterSubj && t.score !== null);
  const subjAvg     = subjTests.length > 0
    ? (subjTests.reduce((s, t) => s + (t.score / t.total) * 100, 0) / subjTests.length).toFixed(1)
    : null;

  // Overall stats
  const scoredTests = tests.filter(t => t.score !== null);
  const overallAvg  = scoredTests.length > 0
    ? (scoredTests.reduce((s, t) => s + (t.score / t.total) * 100, 0) / scoredTests.length).toFixed(1)
    : null;

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#444" }}>
        Class Tests
      </h3>

      {/* Add form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Test / Quiz title</label>
            <input
              value={testTitle}
              onChange={e => setTestTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTest()}
              placeholder="e.g. Mid-term quiz 1"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Subject</label>
            <input
              list="subj-datalist"
              value={testSubject}
              onChange={e => setTestSubject(e.target.value)}
              placeholder="Subject"
              style={{ width: "100%" }}
            />
            <datalist id="subj-datalist">
              {subjectOptions.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div style={{ minWidth: 90 }}>
            <label style={labelStyle}>Score</label>
            <input
              type="number" min="0"
              value={testScore}
              onChange={e => setTestScore(e.target.value)}
              placeholder="e.g. 82"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 90 }}>
            <label style={labelStyle}>Out of</label>
            <input
              type="number" min="1"
              value={testTotal}
              onChange={e => setTestTotal(e.target.value)}
              placeholder="100"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={labelStyle}>Test date</label>
            <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} style={{ width: "100%" }} />
          </div>
          <button onClick={addTest} style={{ alignSelf: "flex-end" }}>Add Test</button>
        </div>
      </div>

      {tests.length > 0 && (
        <>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "#e8f0fe", color: "#185FA5", textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{tests.length}</div>
              <div style={{ fontSize: 11, marginTop: 1 }}>Total Tests</div>
            </div>
            {overallAvg && (
              <div style={{ padding: "10px 16px", borderRadius: 10, background: cgpaColor(parseFloat(overallAvg) / 25).bg, color: cgpaColor(parseFloat(overallAvg) / 25).color, textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{overallAvg}%</div>
                <div style={{ fontSize: 11, marginTop: 1 }}>Overall Avg</div>
              </div>
            )}
            {/* Per subject mini pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {[...new Set(tests.map(t => t.subject).filter(Boolean))].map(subj => {
                const st = tests.filter(t => t.subject === subj && t.score !== null);
                const avg = st.length > 0 ? (st.reduce((s, t) => s + (t.score / t.total) * 100, 0) / st.length).toFixed(1) : null;
                return (
                  <span key={subj} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: "#f0f0f0", color: "#555", fontWeight: 500 }}>
                    {subj}: {avg ? `${avg}%` : `${st.length} tests`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {["all", ...new Set(tests.map(t => t.subject).filter(Boolean))].map(s => (
              <button
                key={s}
                onClick={() => setFilterSubj(s)}
                style={{
                  fontSize: 12, padding: "4px 14px", borderRadius: 99, border: "1px solid #e0e0e0",
                  cursor: "pointer", fontWeight: filterSubj === s ? 600 : 400,
                  background: filterSubj === s ? "#185FA5" : "#fff",
                  color: filterSubj === s ? "#fff" : "#555",
                  transition: "all 0.15s",
                }}
              >{s === "all" ? "All" : s}</button>
            ))}
          </div>

          {/* Test rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered
              .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
              .map(t => {
                const pct   = t.score !== null ? ((t.score / t.total) * 100).toFixed(1) : null;
                const barW  = pct ? Math.min(parseFloat(pct), 100) : 0;
                const col   = pct ? cgpaColor(parseFloat(pct) / 25) : { color: "#aaa", bg: "#f5f5f5" };
                return (
                  <div key={t.id} className="card" style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{t.title}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {t.subject && (
                            <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 99, background: "#e8f0fe", color: "#185FA5" }}>{t.subject}</span>
                          )}
                          {t.date && (
                            <span style={{ fontSize: 11, color: "#888" }}>{formatDate(t.date)}</span>
                          )}
                        </div>
                      </div>

                      {/* Score bar */}
                      {pct && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180, flex: 1 }}>
                          <div style={{ flex: 1, height: 7, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${barW}%`, height: "100%", background: col.color, borderRadius: 99, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: col.color, minWidth: 44, textAlign: "right" }}>{pct}%</span>
                          <span style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>{t.score}/{t.total}</span>
                        </div>
                      )}
                      {!pct && (
                        <span style={{ fontSize: 12, color: "#bbb" }}>No score</span>
                      )}

                      <button onClick={() => deleteTest(t.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14, padding: "0 4px" }}>✕</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {tests.length === 0 && (
        <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>
          No tests yet. Add a class test above.
        </p>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
export default function Academic() {
  // ── Courses ─────────────────────────────────────────
  const [courses, setCourses]               = useState([]);
  const [courseName, setCourseName]         = useState("");
  const [courseInstitution, setCourseInstitution] = useState("");
  const [courseStatus, setCourseStatus]     = useState("ongoing");
  const [courseGrade, setCourseGrade]       = useState("");
  const [courseCredit, setCourseCredit]     = useState("");
  const [courseStart, setCourseStart]       = useState("");
  const [courseEnd, setCourseEnd]           = useState("");

  function addCourse() {
    if (!courseName.trim()) return;
    setCourses(prev => [...prev, {
      id: Date.now(),
      name: courseName.trim(),
      institution: courseInstitution.trim(),
      status: courseStatus,
      grade: courseGrade.trim(),
      credit: courseCredit !== "" ? parseFloat(courseCredit) : 0,
      startDate: courseStart,
      endDate: courseEnd,
      colorIdx: prev.length % SUBJECT_COLORS.length,
    }]);
    setCourseName(""); setCourseInstitution(""); setCourseGrade("");
    setCourseCredit(""); setCourseStart(""); setCourseEnd(""); setCourseStatus("ongoing");
  }

  function deleteCourse(id) { setCourses(prev => prev.filter(c => c.id !== id)); }

  function updateCourseStatus(id, val) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: val } : c));
  }

  // ── Tasks ────────────────────────────────────────────
  const [tasks, setTasks]               = useState([]);
  const [taskTitle, setTaskTitle]       = useState("");
  const [taskSubject, setTaskSubject]   = useState("");
  const [taskDue, setTaskDue]           = useState("");
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

  function toggleTask(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }

  const PRIORITY = {
    high:   { bg: "#fce8e8", color: "#A32D2D", label: "High" },
    medium: { bg: "#fff8e1", color: "#854F0B", label: "Medium" },
    low:    { bg: "#e8f5e9", color: "#3B6D11", label: "Low" },
  };

  const pending   = tasks.filter(t => !t.done).length;
  const completed = tasks.filter(t => t.done).length;

  // ── Course stats ─────────────────────────────────────
  const ongoingCount   = courses.filter(c => c.status === "ongoing").length;
  const completedCount = courses.filter(c => c.status === "completed").length;
  const totalCredits   = courses.filter(c => c.status === "completed").reduce((s, c) => s + (c.credit || 0), 0);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Academic</h2>

      {/* ── Stats Row ── */}
      {(courses.length > 0 || tasks.length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total Courses",   value: courses.length,  bg: "#e8f0fe", color: "#185FA5" },
            { label: "Ongoing",         value: ongoingCount,    bg: "#fff8e1", color: "#854F0B" },
            { label: "Completed",       value: completedCount,  bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Credits Earned",  value: totalCredits,    bg: "#f3e8ff", color: "#6B21A8" },
            { label: "Pending Tasks",   value: pending,         bg: "#fce8e8", color: "#A32D2D" },
            { label: "Done Tasks",      value: completed,       bg: "#e8f5e9", color: "#3B6D11" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, minWidth: 90, padding: "12px 16px", borderRadius: 10,
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Course / Subject name</label>
            <input
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCourse()}
              placeholder="e.g. Data Structures"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Institution</label>
            <input
              value={courseInstitution}
              onChange={e => setCourseInstitution(e.target.value)}
              placeholder="Optional"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 80 }}>
            <label style={labelStyle}>Credit hrs</label>
            <input
              type="number" min="0" step="0.5"
              value={courseCredit}
              onChange={e => setCourseCredit(e.target.value)}
              placeholder="3"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={labelStyle}>Grade</label>
            <input
              value={courseGrade}
              onChange={e => setCourseGrade(e.target.value)}
              placeholder="A / 85 / 3.5"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={labelStyle}>Status</label>
            <select value={courseStatus} onChange={e => setCourseStatus(e.target.value)} style={{ width: "100%" }}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Start date</label>
            <input type="date" value={courseStart} onChange={e => setCourseStart(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>End date</label>
            <input type="date" value={courseEnd} onChange={e => setCourseEnd(e.target.value)} />
          </div>
          <div style={{ fontSize: 11, color: "#aaa", alignSelf: "flex-end", paddingBottom: 8, flex: 2 }}>
            Grade accepts: A+, A, A−, B+, B… or numeric score (0–100)
          </div>
          <button onClick={addCourse} style={{ alignSelf: "flex-end" }}>Add Course</button>
        </div>
      </div>

      {/* CGPA Summary (shows only when completed courses with credits exist) */}
      <CGPASummary courses={courses} />

      {/* Course Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {courses.map(c => {
          const col = SUBJECT_COLORS[c.colorIdx];
          const st  = STATUS_STYLES[c.status];
          const gp  = gradeToPoint(c.grade);
          return (
            <div key={c.id} className="card" style={{ padding: 14, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "10px 10px 0 0", background: col.color }} />
              <div style={{ marginTop: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, lineHeight: 1.3 }}>{c.name}</p>
                {c.institution && <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{c.institution}</p>}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
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
                  {c.credit > 0 && (
                    <span style={{ fontSize: 11, color: "#888" }}>{c.credit} cr</span>
                  )}
                </div>

                {/* Grade + grade point row */}
                {(c.grade || gp !== null) && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    {c.grade && (
                      <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>{c.grade}</span>
                    )}
                    {gp !== null && (
                      <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 99, background: cgpaColor(gp).bg, color: cgpaColor(gp).color, fontWeight: 500 }}>
                        {gp.toFixed(1)} GP
                      </span>
                    )}
                  </div>
                )}

                {(c.startDate || c.endDate) && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #eee" }}>
                    {c.startDate && <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>▶ {formatDate(c.startDate)}</p>}
                    {c.endDate   && <p style={{ fontSize: 11, color: "#888" }}>⬛ {formatDate(c.endDate)}</p>}
                  </div>
                )}

                <button
                  onClick={() => deleteCourse(c.id)}
                  style={{ marginTop: 10, fontSize: 11, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════ CLASS TESTS ══════════════ */}
      <ClassTests courses={courses} />

      {/* ══════════════ TASKS / ASSIGNMENTS ══════════════ */}
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "28px 0 10px", color: "#444" }}>
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
            <label style={labelStyle}>Due date</label>
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

                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99,
                  background: pr.bg, color: pr.color, whiteSpace: "nowrap" }}>
                  {pr.label}
                </span>

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

// ── Shared styles ────────────────────────────────────────────────────────
const labelStyle = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

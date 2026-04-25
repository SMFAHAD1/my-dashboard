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
  { bg: "#16292b", color: "#0B6E74" },
];

const STATUS_OPTIONS = ["ongoing", "completed", "upcoming", "dropped"];
const STATUS_STYLES = {
  ongoing:   { bg: "#e8f0fe", color: "#185FA5" },
  completed: { bg: "#e8f5e9", color: "#3B6D11" },
  upcoming:  { bg: "#fff8e1", color: "#854F0B" },
  dropped:   { bg: "#fce8e8", color: "#A32D2D" },
};
const TERM_STATUS_OPTIONS = ["ongoing", "completed", "upcoming"];
const TERM_STATUS_STYLES = {
  ongoing:   { bg: "#e8f0fe", color: "#185FA5" },
  completed: { bg: "#e8f5e9", color: "#3B6D11" },
  upcoming:  { bg: "#fff8e1", color: "#854F0B" },
};

// ── CGPA helpers ──────────────────────────────────────────────────────────
function gradeToPoint(grade) {
  if (!grade) return null;
  const g = grade.trim().toUpperCase();
  const letterMap = {
    "A+": 4.0, "A": 3.75, "A-": 3.50,
    "B+": 3.25, "B": 3.0, "B-": 2.75,
    "C+": 2.50, "C": 2.25, "D": 2.0, "F": 0.0,
  };
  if (letterMap[g] !== undefined) return letterMap[g];
  const num = parseFloat(g);
  if (!isNaN(num) && num >= 0 && num <= 4.0) return num;
  return null;
}

function gradeLabel(p) {
  if (p === null || p === undefined) return "";
  if (p >= 4)    return "A+";
  if (p >= 3.75) return "A";
  if (p >= 3.5)  return "A-";
  if (p >= 3.25) return "B+";
  if (p >= 3.00) return "B";
  if (p >= 2.75) return "B-";
  if (p >= 2.5)  return "C+";
  if (p >= 2.25) return "C";
  if (p >= 2.00) return "D";
  return "F";
}

function cgpaColor(v) {
  if (v >= 3.5) return { color: "#3B6D11", bg: "#e8f5e9" };
  if (v >= 3.0) return { color: "#185FA5", bg: "#e8f0fe" };
  if (v >= 2.5) return { color: "#854F0B", bg: "#fff8e1" };
  return { color: "#A32D2D", bg: "#fce8e8" };
}

function getEligibleCourses(courses) {
  return courses.filter(
    c => c.status === "completed" && c.credit > 0 && gradeToPoint(c.grade) !== null
  );
}

function calcTermTotalCredits(courses) {
  return getEligibleCourses(courses).reduce((sum, course) => sum + course.credit, 0);
}

function calcTermQualityPoints(courses) {
  return getEligibleCourses(courses).reduce(
    (sum, course) => sum + course.credit * gradeToPoint(course.grade),
    0
  );
}

function calcTermGPA(courses) {
  const totalCredits = calcTermTotalCredits(courses);
  if (totalCredits === 0) return null;
  return calcTermQualityPoints(courses) / totalCredits;
}

function calcFinalCGPA(terms) {
  const completedTerms = terms.filter(t => t.status === "completed");
  const totalCredits = completedTerms.reduce(
    (sum, term) => sum + calcTermTotalCredits(term.courses),
    0
  );
  if (totalCredits === 0) return null;
  const totalQualityPoints = completedTerms.reduce(
    (sum, term) => sum + calcTermQualityPoints(term.courses),
    0
  );
  return totalQualityPoints / totalCredits;
}

// ── Shared style helpers ──────────────────────────────────────────────────
const labelStyle = { fontSize: 11, color: "#667085", display: "block", marginBottom: 3 };

function pill(bg, color) {
  return { fontSize: 11, padding: "3px 10px", borderRadius: 99, background: bg, color, fontWeight: 500, border: "1px solid #d9dee7" };
}

function statBox(bg, color) {
  return { padding: "10px 16px", borderRadius: 10, background: bg, color, textAlign: "center", minWidth: 80, border: "1px solid #d9dee7" };
}

// ── Overall CGPA Summary ──────────────────────────────────────────────────
function CGPASummary({ terms }) {
  const completedTermsWithGPA = terms.filter(
    t => t.status === "completed" && calcTermGPA(t.courses) !== null
  );
  if (completedTermsWithGPA.length === 0) return null;

  const finalCGPA = calcFinalCGPA(terms);
  const { color, bg } = cgpaColor(finalCGPA);
  const totalCourses = terms.reduce((s, t) => s + t.courses.length, 0);
  const totalCredits = terms.reduce((s, t) =>
    s + t.courses.filter(c => c.status === "completed" && c.credit > 0)
                  .reduce((cs, c) => cs + c.credit, 0), 0);

  return (
    <div style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 12,
      border: "1px solid #d9dee7", background: "#ffffff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#d0d5dd", letterSpacing: 0.4 }}>📊 OVERALL CGPA</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={pill("#e8f0fe", "#185FA5")}>{totalCourses} courses</span>
          <span style={pill("#f3e8ff", "#6B21A8")}>{totalCredits} credits</span>
          <span style={pill("#e8f5e9", "#3B6D11")}>{completedTermsWithGPA.length} term{completedTermsWithGPA.length !== 1 ? "s" : ""} done</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        {/* Big CGPA */}
        <div style={{ textAlign: "center", padding: "14px 28px", borderRadius: 12, background: bg, minWidth: 130 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1 }}>{finalCGPA.toFixed(2)}</div>
          <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 500 }}>CGPA / 4.0</div>
          <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 2 }}>{gradeLabel(finalCGPA)}</div>
          <div style={{ fontSize: 10, color: "#667085", marginTop: 6 }}>Σ term GPAs ÷ {completedTermsWithGPA.length}</div>
        </div>

        {/* Per-term bars */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {completedTermsWithGPA.map(t => {
              const gpa = calcTermGPA(t.courses);
              const col = cgpaColor(gpa);
              const eligible = t.courses.filter(c => c.status === "completed" && gradeToPoint(c.grade) !== null);
              return (
                <div key={t.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#475467", minWidth: 120,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                    <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${(gpa / 4) * 100}%`, height: "100%",
                        background: col.color, borderRadius: 99, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col.color, minWidth: 36, textAlign: "right" }}>{gpa.toFixed(2)}</span>
                  </div>
                  <div style={{ paddingLeft: 128, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {eligible.map(c => {
                      const gp = gradeToPoint(c.grade);
                      const cc = cgpaColor(gp);
                      return (
                        <span key={c.id} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99,
                          background: cc.bg, color: cc.color, fontWeight: 500 }}>
                          {c.name.length > 12 ? c.name.slice(0, 11) + "…" : c.name} {gp.toFixed(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8,
              borderTop: "1px dashed #d9dee7", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#667085" }}>
                Sum: {completedTermsWithGPA.reduce((s, t) => s + calcTermGPA(t.courses), 0).toFixed(2)}
              </span>
              <span style={{ fontSize: 11, color: "#667085" }}>÷ {completedTermsWithGPA.length} terms</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>= {finalCGPA.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single Term Block ─────────────────────────────────────────────────────
function TermBlock({ term, onUpdateTerm, onDeleteTerm, colorOffset }) {
  const [courseName,   setCourseName]   = useState("");
  const [courseInst,   setCourseInst]   = useState("");
  const [courseStatus, setCourseStatus] = useState("ongoing");
  const [courseGrade,  setCourseGrade]  = useState("");
  const [courseCredit, setCourseCredit] = useState("");
  const [courseStart,  setCourseStart]  = useState("");
  const [courseEnd,    setCourseEnd]    = useState("");
  const [collapsed,    setCollapsed]    = useState(false);

  function addCourse() {
    if (!courseName.trim()) return;
    onUpdateTerm(term.id, {
      courses: [...term.courses, {
        id: Date.now(),
        name: courseName.trim(),
        institution: courseInst.trim(),
        status: courseStatus,
        grade: courseGrade.trim(),
        credit: courseCredit !== "" ? parseFloat(courseCredit) : 0,
        startDate: courseStart,
        endDate: courseEnd,
        colorIdx: (colorOffset + term.courses.length) % SUBJECT_COLORS.length,
      }],
    });
    setCourseName(""); setCourseInst(""); setCourseGrade("");
    setCourseCredit(""); setCourseStart(""); setCourseEnd(""); setCourseStatus("ongoing");
  }

  function deleteCourse(cid) {
    onUpdateTerm(term.id, { courses: term.courses.filter(c => c.id !== cid) });
  }

  function updateCourseField(cid, field, val) {
    onUpdateTerm(term.id, {
      courses: term.courses.map(c => c.id === cid ? { ...c, [field]: val } : c),
    });
  }

  const termGPA = calcTermGPA(term.courses);
  const eligibleCourses = getEligibleCourses(term.courses);
  const totalCredits = calcTermTotalCredits(term.courses);
  const totalQualityPoints = calcTermQualityPoints(term.courses);
  const tStyle = TERM_STATUS_STYLES[term.status] || TERM_STATUS_STYLES.ongoing;

  return (
    <div style={{ border: "1px solid #d9dee7", borderRadius: 12, overflow: "hidden",
      marginBottom: 16, background: "#121821" }}>

      {/* Term header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        background: "#19222d", borderBottom: collapsed ? "none" : "1px solid #d9dee7", flexWrap: "wrap" }}>
        <button onClick={() => setCollapsed(p => !p)}
          style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#667085", padding: 0 }}>
          {collapsed ? "▶" : "▼"}
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111827", flex: 1, minWidth: 120 }}>{term.name}</span>
        <select value={term.status} onChange={e => onUpdateTerm(term.id, { status: e.target.value })}
          style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, border: "none",
            background: tStyle.bg, color: tStyle.color, cursor: "pointer" }}>
          {TERM_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={pill("#e8f0fe", "#185FA5")}>{term.courses.length} course{term.courses.length !== 1 ? "s" : ""}</span>
        {totalCredits > 0 && <span style={pill("#f3e8ff", "#6B21A8")}>{totalCredits} cr</span>}
        {termGPA !== null && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
            background: cgpaColor(termGPA).bg, color: cgpaColor(termGPA).color }}>
            GPA {termGPA.toFixed(2)}
          </span>
        )}
        <button onClick={() => onDeleteTerm(term.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 14, padding: "0 4px" }}>✕</button>
      </div>

      {!collapsed && (
        <div style={{ padding: "14px 16px" }}>

          {/* Add course form */}
          <div style={{ background: "#19222d", borderRadius: 10, padding: "12px 14px",
            marginBottom: 14, border: "1px solid #d9dee7" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#475467", marginBottom: 10 }}>Add course to {term.name}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 2, minWidth: 150 }}>
                <label style={labelStyle}>Course name</label>
                <input value={courseName} onChange={e => setCourseName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCourse()}
                  placeholder="e.g. Data Structures" style={{ width: "100%" }} />
              </div>
              <div style={{ minWidth: 70 }}>
                <label style={labelStyle}>Credit hrs</label>
                <input type="number" min="0" step="0.5" value={courseCredit}
                  onChange={e => setCourseCredit(e.target.value)} placeholder="3" style={{ width: "100%" }} />
              </div>
              <div style={{ minWidth: 100 }}>
                <label style={labelStyle}>Grade / GPA</label>
                <input value={courseGrade} onChange={e => setCourseGrade(e.target.value)}
                  placeholder="A / A- / 3.5" style={{ width: "100%" }} />
              </div>
              <div style={{ minWidth: 105 }}>
                <label style={labelStyle}>Status</label>
                <select value={courseStatus} onChange={e => setCourseStatus(e.target.value)} style={{ width: "100%" }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 120 }}>
                <label style={labelStyle}>Institution</label>
                <input value={courseInst} onChange={e => setCourseInst(e.target.value)}
                  placeholder="Optional" style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 120 }}>
                <label style={labelStyle}>Start date</label>
                <input type="date" value={courseStart} onChange={e => setCourseStart(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 120 }}>
                <label style={labelStyle}>End date</label>
                <input type="date" value={courseEnd} onChange={e => setCourseEnd(e.target.value)} />
              </div>
              <div style={{ fontSize: 10, color: "#667085", alignSelf: "flex-end", paddingBottom: 6, flex: 2 }}>
                Use letter grades or GPA values from 0.0 to 4.0 only
              </div>
              <button onClick={addCourse} style={{ alignSelf: "flex-end" }}>Add Course</button>
            </div>
          </div>

          {/* Course cards grid */}
          {term.courses.length === 0 && (
            <p style={{ fontSize: 12, color: "#667085", textAlign: "center", padding: "12px 0" }}>No courses yet.</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 10, marginBottom: 12 }}>
            {term.courses.map(c => {
              const col = SUBJECT_COLORS[c.colorIdx % SUBJECT_COLORS.length];
              const st  = STATUS_STYLES[c.status] || STATUS_STYLES.ongoing;
              const gp  = gradeToPoint(c.grade);
              return (
                <div key={c.id} className="card" style={{ padding: 12, position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    borderRadius: "10px 10px 0 0", background: col.color }} />
                  <div style={{ marginTop: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{c.name}</p>
                    {c.institution && <p style={{ fontSize: 10, color: "#667085", marginBottom: 4 }}>{c.institution}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                      <select value={c.status}
                        onChange={e => updateCourseField(c.id, "status", e.target.value)}
                        style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 99,
                          border: "none", background: st.bg, color: st.color, cursor: "pointer" }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      {c.credit > 0 && <span style={{ fontSize: 10, color: "#667085" }}>{c.credit} cr</span>}
                    </div>
                    {(c.grade || gp !== null) && (
                      <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 4 }}>
                        {c.grade && <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{c.grade}</span>}
                        {gp !== null && (
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99,
                            background: cgpaColor(gp).bg, color: cgpaColor(gp).color, fontWeight: 600 }}>
                            {gp.toFixed(1)} GP
                          </span>
                        )}
                      </div>
                    )}
                    {(c.startDate || c.endDate) && (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: "0.5px solid #eee" }}>
                        {c.startDate && <p style={{ fontSize: 10, color: "#667085", marginBottom: 1 }}>▶ {formatDate(c.startDate)}</p>}
                        {c.endDate   && <p style={{ fontSize: 10, color: "#667085" }}>⬛ {formatDate(c.endDate)}</p>}
                      </div>
                    )}
                    <button onClick={() => deleteCourse(c.id)}
                      style={{ marginTop: 8, fontSize: 10, color: "#667085", background: "none",
                        border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Term GPA formula breakdown */}
          {eligibleCourses.length > 0 && (
            <div style={{ padding: "10px 14px", background: "#fafafa", borderRadius: 10,
              border: "1px solid #d9dee7" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#667085", marginBottom: 8 }}>
                GPA Breakdown — {term.name}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {eligibleCourses.map(c => {
                  const gp  = gradeToPoint(c.grade);
                  const col = cgpaColor(gp);
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#d0d5dd", minWidth: 120, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: "#667085", minWidth: 28 }}>{c.credit}cr</span>
                      <div style={{ flex: 1, height: 5, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${(gp / 4) * 100}%`, height: "100%",
                          background: col.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: col.color, minWidth: 28, textAlign: "right" }}>{gp.toFixed(1)}</span>
                      <span style={{ fontSize: 10, color: "#667085", minWidth: 46, textAlign: "right" }}>
                        {c.credit}×{gp.toFixed(1)}={(c.credit * gp).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {/* Formula row */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4,
                  paddingTop: 6, borderTop: "0.5px solid #eee" }}>
                  <span style={{ fontSize: 11, color: "#667085" }}>
                    Sum(credit x GP) = {totalQualityPoints.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 11, color: "#667085" }}>/ {totalCredits.toFixed(1)} credits</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cgpaColor(termGPA).color }}>
                    = {termGPA.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Class Tests ───────────────────────────────────────────────────────────
function ClassTests({ terms }) {
  const [tests, setTests]             = useState([]);
  const [testTitle, setTestTitle]     = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDate, setTestDate]       = useState("");
  const [testScore, setTestScore]     = useState("");
  const [testTotal, setTestTotal]     = useState("");
  const [activeTab, setActiveTab]     = useState("all");

  const allCourseNames = [
    ...new Set(terms.flatMap(t => t.courses.map(c => c.name)).filter(Boolean)),
  ];
  const subjectOptions = [...new Set([...allCourseNames, ...tests.map(t => t.subject).filter(Boolean)])];

  function addTest() {
    if (!testTitle.trim() || testTotal === "") return;
    setTests(prev => [...prev, {
      id: Date.now(),
      title: testTitle.trim(),
      subject: testSubject.trim(),
      date: testDate,
      score: testScore !== "" ? parseFloat(testScore) : null,
      total: parseFloat(testTotal),
    }]);
    setTestTitle(""); setTestSubject(""); setTestDate(""); setTestScore(""); setTestTotal("");
  }

  function deleteTest(id) { setTests(prev => prev.filter(t => t.id !== id)); }

  const testSubjects = [...new Set(tests.map(t => t.subject).filter(Boolean))];

  // FIX: was using st.count (undefined) — now uses st.length correctly
  function subjectStats(subj) {
    const st = tests.filter(t => t.subject === subj && t.score !== null);
    if (st.length === 0) return null;
    const pcts     = st.map(t => (t.score / t.total) * 100);
    const avg      = pcts.reduce((s, p) => s + p, 0) / pcts.length;
    const best3    = [...st].sort((a, b) => (b.score / b.total) - (a.score / a.total)).slice(0, 3);
    const best3avg = best3.reduce((s, t) => s + (t.score / t.total) * 100, 0) / best3.length;
    return { count: st.length, all: st, avg, best3, best3avg };
  }

  const displayTests = activeTab === "all" ? tests : tests.filter(t => t.subject === activeTab);

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#d0d5dd" }}>Class Tests</h3>

      {/* Add form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Test / Quiz title</label>
            <input value={testTitle} onChange={e => setTestTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTest()}
              placeholder="e.g. Mid-term quiz 1" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Subject</label>
            <input list="subj-dl" value={testSubject} onChange={e => setTestSubject(e.target.value)}
              placeholder="Subject" style={{ width: "100%" }} />
            <datalist id="subj-dl">
              {subjectOptions.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div style={{ minWidth: 80 }}>
            <label style={labelStyle}>Score</label>
            <input type="number" min="0" value={testScore}
              onChange={e => setTestScore(e.target.value)} placeholder="82" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 75 }}>
            <label style={labelStyle}>Out of</label>
            <input type="number" min="1" value={testTotal}
              onChange={e => setTestTotal(e.target.value)} placeholder="100" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 138 }}>
            <label style={labelStyle}>Test date</label>
            <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} style={{ width: "100%" }} />
          </div>
          <button onClick={addTest} style={{ alignSelf: "flex-end" }}>Add Test</button>
        </div>
      </div>

      {tests.length === 0 && (
        <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "20px 0" }}>No tests yet.</p>
      )}

      {tests.length > 0 && (
        <>
          {/* Overall stats */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={statBox("#e8f0fe", "#185FA5")}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{tests.length}</div>
              <div style={{ fontSize: 10, marginTop: 1 }}>Total Tests</div>
            </div>
            <div style={statBox("#e8f5e9", "#3B6D11")}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{testSubjects.length}</div>
              <div style={{ fontSize: 10, marginTop: 1 }}>Subjects</div>
            </div>
          </div>

          {/* Subject-wise analysis */}
          {testSubjects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#667085", marginBottom: 10, letterSpacing: 0.3 }}>
                SUBJECT-WISE ANALYSIS
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {testSubjects.map((subj, si) => {
                  const stats = subjectStats(subj);
                  if (!stats) return null;
                  const col    = SUBJECT_COLORS[si % SUBJECT_COLORS.length];
                  const avgCol = cgpaColor(stats.avg / 25);
                  return (
                    <div key={subj} style={{ border: "1px solid #eee", borderRadius: 10,
                      overflow: "hidden", background: "#fff" }}>
                      {/* Card header */}
                      <div style={{ padding: "10px 14px", background: col.bg, borderBottom: "1px solid #eee" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: col.color }}>{subj}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
                            background: avgCol.bg, color: avgCol.color }}>Avg {stats.avg.toFixed(1)}%</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {/* FIX: was stats.count (undefined) — now uses stats.all.length */}
                          <span style={{ fontSize: 11, color: col.color, opacity: 0.75 }}>
                            {stats.all.length} test{stats.all.length !== 1 ? "s" : ""}
                          </span>
                          {stats.best3avg !== null && (
                            <span style={{ fontSize: 10, color: col.color, opacity: 0.65 }}>
                              · Best 3 avg: {stats.best3avg.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: "10px 14px" }}>
                        {/* Best 3 */}
                        <p style={{ fontSize: 10, fontWeight: 600, color: "#667085", marginBottom: 7, letterSpacing: 0.3 }}>
                          🏆 BEST 3 TESTS
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                          {stats.best3.map((t, idx) => {
                            const pct = (t.score / t.total) * 100;
                            const tc  = cgpaColor(pct / 25);
                            const medals = ["🥇", "🥈", "🥉"];
                            return (
                              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: 13, minWidth: 20 }}>{medals[idx]}</span>
                                <span style={{ fontSize: 11, color: "#d0d5dd", flex: 1, overflow: "hidden",
                                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                                {t.date && <span style={{ fontSize: 9, color: "#667085", whiteSpace: "nowrap" }}>{formatDate(t.date)}</span>}
                                <div style={{ width: 55, height: 5, background: "#eee", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                                  <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%",
                                    background: tc.color, borderRadius: 99 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: tc.color,
                                  minWidth: 40, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* All other tests (if >3) */}
                        {stats.all.length > 3 && (
                          <>
                            <p style={{ fontSize: 10, fontWeight: 600, color: "#667085", marginBottom: 5, letterSpacing: 0.3 }}>
                              ALL TESTS  <span style={{ fontWeight: 400 }}>(★ = in top 3)</span>
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {stats.all
                                .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                                .map(t => {
                                  const pct    = (t.score / t.total) * 100;
                                  const tc     = cgpaColor(pct / 25);
                                  const isBest = stats.best3.some(b => b.id === t.id);
                                  return (
                                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ fontSize: 9, color: isBest ? "#f0a500" : "#ddd", minWidth: 12 }}>★</span>
                                      <span style={{ fontSize: 10, color: "#d0d5dd", flex: 1, overflow: "hidden",
                                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                                      <div style={{ width: 48, height: 4, background: "#eee", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                                        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%",
                                          background: isBest ? tc.color : "#667085", borderRadius: 99 }} />
                                      </div>
                                      <span style={{ fontSize: 10, color: isBest ? tc.color : "#667085",
                                        minWidth: 38, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                                    </div>
                                  );
                                })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {["all", ...testSubjects].map(s => (
              <button key={s} onClick={() => setActiveTab(s)}
                style={{ fontSize: 12, padding: "4px 14px", borderRadius: 99,
                  border: "1px solid #475467", cursor: "pointer",
                  fontWeight: activeTab === s ? 600 : 400,
                  background: activeTab === s ? "#185FA5" : "#fff",
                  color: activeTab === s ? "#fff" : "#d0d5dd", transition: "all 0.15s" }}>
                {s === "all" ? "All tests" : s}
              </button>
            ))}
          </div>

          {/* Test list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayTests
              .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
              .map(t => {
                const pct    = t.score !== null ? (t.score / t.total) * 100 : null;
                const col    = pct !== null ? cgpaColor(pct / 25) : { color: "#667085", bg: "#f2f4f7" };
                const isBest = t.subject
                  ? (subjectStats(t.subject)?.best3 || []).some(b => b.id === t.id)
                  : false;
                return (
                  <div key={t.id} className="card" style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</p>
                          {isBest && (
                            <span style={{ fontSize: 9, background: "#fff8e1", color: "#854F0B",
                              padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>Top 3</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 2 }}>
                          {t.subject && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99,
                            background: "#e8f0fe", color: "#185FA5" }}>{t.subject}</span>}
                          {t.date && <span style={{ fontSize: 10, color: "#667085" }}>{formatDate(t.date)}</span>}
                        </div>
                      </div>
                      {pct !== null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160, flex: 1 }}>
                          <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%",
                              background: col.color, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: col.color,
                            minWidth: 44, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                          <span style={{ fontSize: 11, color: "#667085", whiteSpace: "nowrap" }}>{t.score}/{t.total}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#667085" }}>No score</span>
                      )}
                      <button onClick={() => deleteTest(t.id)}
                        style={{ background: "none", border: "none", cursor: "pointer",
                          color: "#667085", fontSize: 14, padding: "0 2px" }}>✕</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function Academic() {
  const [terms, setTerms]                 = useState([]);
  const [newTermName, setNewTermName]     = useState("");
  const [newTermStatus, setNewTermStatus] = useState("ongoing");

  const [tasks, setTasks]               = useState([]);
  const [taskTitle, setTaskTitle]       = useState("");
  const [taskSubject, setTaskSubject]   = useState("");
  const [taskDue, setTaskDue]           = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");

  function addTerm() {
    if (!newTermName.trim()) return;
    setTerms(prev => [...prev, {
      id: Date.now(), name: newTermName.trim(), status: newTermStatus, courses: [],
    }]);
    setNewTermName(""); setNewTermStatus("ongoing");
  }

  function updateTerm(id, patch) {
    setTerms(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function deleteTerm(id) { setTerms(prev => prev.filter(t => t.id !== id)); }

  function addTask() {
    if (!taskTitle.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(), title: taskTitle.trim(), subject: taskSubject.trim(),
      due: taskDue, priority: taskPriority, done: false, addedDate: today,
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

  const allCourses     = terms.flatMap(t => t.courses);
  const totalCourses   = allCourses.length;
  const ongoingCourses = allCourses.filter(c => c.status === "ongoing").length;
  const completedCount = allCourses.filter(c => c.status === "completed").length;
  const totalCredits   = allCourses.filter(c => c.status === "completed").reduce((s, c) => s + (c.credit || 0), 0);
  const finalCGPA      = calcFinalCGPA(terms);
  const pending        = tasks.filter(t => !t.done).length;
  const done           = tasks.filter(t => t.done).length;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Academic</h2>

      {/* Stats row */}
      {(terms.length > 0 || tasks.length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Terms",          value: terms.length,   bg: "#e8f0fe", color: "#185FA5" },
            { label: "Total Courses",  value: totalCourses,   bg: "#e0f7fa", color: "#0B6E74" },
            { label: "Ongoing",        value: ongoingCourses, bg: "#fff8e1", color: "#854F0B" },
            { label: "Completed",      value: completedCount, bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Credits Earned", value: totalCredits,   bg: "#f3e8ff", color: "#6B21A8" },
            finalCGPA !== null
              ? { label: "CGPA", value: finalCGPA.toFixed(2), bg: cgpaColor(finalCGPA).bg, color: cgpaColor(finalCGPA).color }
              : null,
            { label: "Pending Tasks", value: pending, bg: "#fce8e8", color: "#A32D2D" },
            { label: "Done Tasks",    value: done,    bg: "#e8f5e9", color: "#3B6D11" },
          ].filter(Boolean).map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 10,
              background: s.bg, color: s.color, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ══ COURSES — TERM WISE ══ */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#d0d5dd" }}>
        Courses & Subjects — Term Wise
      </h3>

      {/* Add term */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: "#d0d5dd" }}>Add new term / semester</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Term name</label>
            <input value={newTermName} onChange={e => setNewTermName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTerm()}
              placeholder="e.g. Semester 1, Fall 2024, Year 1 Term 2"
              style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Status</label>
            <select value={newTermStatus} onChange={e => setNewTermStatus(e.target.value)} style={{ width: "100%" }}>
              {TERM_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={addTerm} style={{ alignSelf: "flex-end" }}>Add Term</button>
        </div>
      </div>

      {/* Overall CGPA */}
      <CGPASummary terms={terms} />

      {terms.length === 0 && (
        <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>
          No terms yet. Add a term above to start tracking courses.
        </p>
      )}

      {terms.map((term, index) => {
        const colorOffset = terms
          .slice(0, index)
          .reduce((sum, currentTerm) => sum + currentTerm.courses.length, 0);
        const block = (
          <TermBlock key={term.id} term={term}
            onUpdateTerm={updateTerm} onDeleteTerm={deleteTerm}
            colorOffset={colorOffset} />
        );
        return block;
      })}

      {/* ══ CLASS TESTS ══ */}
      <div style={{ marginTop: 8, marginBottom: 28 }}>
        <ClassTests terms={terms} />
      </div>

      {/* ══ TASKS ══ */}
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "#d0d5dd" }}>
        Assignments & Tasks
      </h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Assignment or task..." style={{ flex: 2, minWidth: 180 }} />
          <input value={taskSubject} onChange={e => setTaskSubject(e.target.value)}
            placeholder="Subject" style={{ flex: 1, minWidth: 110 }} />
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.length === 0 && (
          <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>
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
                  opacity: t.done ? 0.55 : 1, transition: "opacity 0.2s" }}>
                <div onClick={() => toggleTask(t.id)}
                  style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                    border: t.done ? "none" : "2px solid #ddd",
                    background: t.done ? "#3B6D11" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#fff" }}>
                  {t.done ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 14,
                    textDecoration: t.done ? "line-through" : "none",
                    color: t.done ? "#667085" : "inherit" }}>
                    {t.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#667085", marginTop: 1 }}>
                    {t.subject && <span style={{ marginRight: 8 }}>{t.subject}</span>}
                    {t.due && (
                      <span style={{ color: isOverdue ? "#A32D2D" : "#667085", fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? "⚠ Overdue · " : "Due · "}{formatDate(t.due)}
                      </span>
                    )}
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99,
                  background: pr.bg, color: pr.color, whiteSpace: "nowrap" }}>{pr.label}</span>
                <button onClick={() => deleteTask(t.id)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#667085", fontSize: 14, padding: "0 4px" }}>✕</button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

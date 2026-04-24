import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// ── Grade scale ──────────────────────────────────────────────
const GRADE_MAP = { "A+":4.00,"A":3.75,"A-":3.50,"B+":3.25,"B":3.00,"B-":2.75,"C+":2.50,"C":2.25,"D":2.00,"F":0.00 };
const GRADE_LABELS = Object.keys(GRADE_MAP);

function gradePoint(g) {
  if (!g && g !== 0) return null;
  const s = String(g).trim().toUpperCase();
  if (GRADE_MAP[s] !== undefined) return GRADE_MAP[s];
  const n = parseFloat(s);
  if (!isNaN(n) && n >= 0 && n <= 4) return n;
  return null;
}

function gpLabel(gp) {
  if (gp === null) return "—";
  if (gp >= 4.00) return "A+";
  if (gp >= 3.75) return "A";
  if (gp >= 3.50) return "A-";
  if (gp >= 3.25) return "B+";
  if (gp >= 3.00) return "B";
  if (gp >= 2.75) return "B-";
  if (gp >= 2.50) return "C+";
  if (gp >= 2.25) return "C";
  if (gp >= 2.00) return "D";
  return "F";
}

// ── Term defaults ────────────────────────────────────────────
const EMPTY_COURSE = { name: "", credits: 3, grade: "A" };
const EMPTY_TERM   = { name: "", completed: false, courses: [] };
const EMPTY_TEST   = { title: "", subject: "", score: "", outOf: "", date: "" };
const EMPTY_TASK   = { title: "", subject: "", due: "", done: false };

// ── Tab ──────────────────────────────────────────────────────
const TABS = ["Terms & CGPA", "Class Tests", "Assignments"];

export default function Academic() {
  const [terms, setTerms]   = useLocalStorage("dashboard-academic-terms", [], 1);
  const [tests, setTests]   = useLocalStorage("dashboard-academic-tests", [], 1);
  const [tasks, setTasks]   = useLocalStorage("dashboard-academic-tasks", [], 1);
  const [tab, setTab]       = useState("Terms & CGPA");
  const [editTermIdx, setEditTermIdx] = useState(null);
  const [newTerm, setNewTerm]         = useState(EMPTY_TERM);
  const [newTest, setNewTest]         = useState(EMPTY_TEST);
  const [newTask, setNewTask]         = useState(EMPTY_TASK);

  // All course names for autocomplete
  const allSubjects = useMemo(() => [...new Set(terms.flatMap(t => t.courses.map(c => c.name)).filter(Boolean))], [terms]);

  // ── CGPA calculation ─────────────────────────────────────
  const termGPAs = useMemo(() => terms.map(term => {
    const valid = term.courses.filter(c => gradePoint(c.grade) !== null && +c.credits > 0);
    const totalCredits = valid.reduce((s, c) => s + +c.credits, 0);
    const weightedSum  = valid.reduce((s, c) => s + +c.credits * gradePoint(c.grade), 0);
    return totalCredits > 0 ? weightedSum / totalCredits : null;
  }), [terms]);

  const completedGPAs = termGPAs.filter((g, i) => g !== null && terms[i].completed);
  const cgpa = completedGPAs.length > 0
    ? (completedGPAs.reduce((s, g) => s + g, 0) / completedGPAs.length).toFixed(2)
    : null;

  // ── Term helpers ──────────────────────────────────────────
  const addTerm = () => {
    if (!newTerm.name.trim()) return;
    setTerms(t => [...t, { ...newTerm, id: Date.now(), courses: [] }]);
    setNewTerm(EMPTY_TERM);
  };

  const removeTerm = (id) => setTerms(t => t.filter(x => x.id !== id));

  const toggleCompleted = (id) => setTerms(t => t.map(x => x.id === id ? { ...x, completed: !x.completed } : x));

  const addCourse = (termId, course) => {
    setTerms(t => t.map(x => x.id === termId ? { ...x, courses: [...x.courses, { ...course, id: Date.now() }] } : x));
  };

  const removeCourse = (termId, courseId) => {
    setTerms(t => t.map(x => x.id === termId ? { ...x, courses: x.courses.filter(c => c.id !== courseId) } : x));
  };

  const updateCourseGrade = (termId, courseId, grade) => {
    setTerms(t => t.map(x => x.id === termId
      ? { ...x, courses: x.courses.map(c => c.id === courseId ? { ...c, grade } : c) }
      : x));
  };

  // ── Test helpers ──────────────────────────────────────────
  const addTest = () => {
    if (!newTest.title.trim() || !newTest.score || !newTest.outOf) return;
    setTests(t => [{ ...newTest, id: Date.now() }, ...t]);
    setNewTest(EMPTY_TEST);
  };

  const removeTest = (id) => setTests(t => t.filter(x => x.id !== id));

  // Best 3 per subject
  const top3Map = useMemo(() => {
    const bySubject = {};
    tests.forEach(t => {
      if (!bySubject[t.subject]) bySubject[t.subject] = [];
      bySubject[t.subject].push(t);
    });
    const result = {};
    Object.entries(bySubject).forEach(([subj, arr]) => {
      const sorted = [...arr].sort((a,b) => (b.score/b.outOf) - (a.score/a.outOf));
      sorted.slice(0,3).forEach(t => { result[t.id] = true; });
    });
    return result;
  }, [tests]);

  // ── Task helpers ──────────────────────────────────────────
  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(t => [{ ...newTask, id: Date.now() }, ...t]);
    setNewTask(EMPTY_TASK);
  };
  const removeTask = (id) => setTasks(t => t.filter(x => x.id !== id));
  const toggleTask = (id) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

  return (
    <div>
      <div className="page-header">
        <h1>🎓 Academic</h1>
        <p>Terms, CGPA, class tests, and assignments</p>
      </div>

      {/* CGPA Banner */}
      {cgpa && (
        <div className="card" style={{background:"linear-gradient(135deg, #1a2040, #1a1d27)", borderColor:"var(--accent)", marginBottom:24}}>
          <div style={{display:"flex", alignItems:"center", gap:24, flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:"0.8rem", color:"var(--muted)", marginBottom:4}}>Current CGPA</div>
              <div style={{fontSize:"3rem", fontWeight:800, fontFamily:"var(--mono)", color:"var(--accent)"}}>{cgpa}</div>
              <div style={{color:"var(--muted)", fontSize:"0.85rem"}}>{gpLabel(parseFloat(cgpa))} — based on {completedGPAs.length} completed term(s)</div>
            </div>
            <div style={{flex:1, display:"flex", gap:12, flexWrap:"wrap"}}>
              {terms.map((term, i) => termGPAs[i] !== null && (
                <div key={term.id} style={{background:"var(--surface2)", borderRadius:8, padding:"10px 16px", minWidth:110}}>
                  <div style={{fontSize:"0.75rem", color:"var(--muted)"}}>{term.name}</div>
                  <div style={{fontFamily:"var(--mono)", color: term.completed ? "var(--success)" : "var(--warning)", fontWeight:700}}>{termGPAs[i].toFixed(2)}</div>
                  <div style={{fontSize:"0.72rem", color:"var(--muted)"}}>{term.completed ? "Completed" : "Ongoing"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex", gap:8, marginBottom:20}}>
        {TABS.map(t => (
          <button key={t} className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
            style={{padding:"8px 18px"}} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── TERMS TAB ── */}
      {tab === "Terms & CGPA" && (
        <>
          {/* Add term */}
          <div className="card">
            <div className="card-title">Add Term</div>
            <div className="form-row">
              <div className="input-group" style={{flex:2}}>
                <label>Term Name</label>
                <input placeholder='e.g. "Spring 2025" or "Year 1 Semester 1"'
                  value={newTerm.name} onChange={e => setNewTerm(x => ({...x, name: e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addTerm} style={{alignSelf:"flex-end"}}>Add Term</button>
            </div>
          </div>

          {terms.length === 0 && (
            <div className="empty-state card"><div className="icon">🎓</div><p>No terms yet. Add your first semester!</p></div>
          )}

          {terms.map((term, ti) => {
            const gpa = termGPAs[ti];
            return (
              <div key={term.id} className="card">
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8}}>
                  <div style={{display:"flex", alignItems:"center", gap:12}}>
                    <span style={{fontWeight:700, fontSize:"1rem"}}>{term.name}</span>
                    {gpa !== null && (
                      <span className="badge badge-blue" style={{fontFamily:"var(--mono)", fontSize:"0.85rem"}}>GPA: {gpa.toFixed(2)} ({gpLabel(gpa)})</span>
                    )}
                    <span className={`badge ${term.completed ? "badge-green" : "badge-yellow"}`}>{term.completed ? "Completed" : "Ongoing"}</span>
                  </div>
                  <div style={{display:"flex", gap:8}}>
                    <button className="btn btn-ghost" style={{padding:"5px 12px", fontSize:"0.8rem"}} onClick={() => toggleCompleted(term.id)}>
                      {term.completed ? "Mark Ongoing" : "Mark Complete"}
                    </button>
                    <button className="btn btn-danger" onClick={() => removeTerm(term.id)}>✕ Remove Term</button>
                  </div>
                </div>

                {/* Course list */}
                {term.courses.length > 0 && (
                  <div className="table-wrap" style={{marginBottom:16}}>
                    <table>
                      <thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>GP</th><th>Credit × GP</th><th></th></tr></thead>
                      <tbody>
                        {term.courses.map(c => {
                          const gp = gradePoint(c.grade);
                          return (
                            <tr key={c.id}>
                              <td style={{fontWeight:500}}>{c.name}</td>
                              <td style={{fontFamily:"var(--mono)"}}>{c.credits}</td>
                              <td>
                                <select value={c.grade} onChange={e => updateCourseGrade(term.id, c.id, e.target.value)}
                                  style={{background:"transparent", border:"1px solid var(--border)", color:"var(--text)", borderRadius:6, padding:"3px 8px", cursor:"pointer"}}>
                                  {GRADE_LABELS.map(g => <option key={g}>{g}</option>)}
                                  <option value="custom">Custom #</option>
                                </select>
                              </td>
                              <td style={{fontFamily:"var(--mono)", color:"var(--accent)"}}>{gp !== null ? gp.toFixed(2) : "—"}</td>
                              <td style={{fontFamily:"var(--mono)"}}>{gp !== null ? (gp * c.credits).toFixed(2) : "—"}</td>
                              <td><button className="btn btn-danger" onClick={() => removeCourse(term.id, c.id)}>✕</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add course inline */}
                <AddCourseForm onAdd={course => addCourse(term.id, course)} />
              </div>
            );
          })}
        </>
      )}

      {/* ── TESTS TAB ── */}
      {tab === "Class Tests" && (
        <>
          <div className="card">
            <div className="card-title">Add Class Test</div>
            <div className="form-row">
              <div className="input-group" style={{flex:2}}>
                <label>Title</label>
                <input placeholder="Test / Quiz title" value={newTest.title} onChange={e => setNewTest(x=>({...x, title:e.target.value}))} />
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>Subject</label>
                <input placeholder="Subject name" list="subjects-list" value={newTest.subject}
                  onChange={e => setNewTest(x=>({...x, subject:e.target.value}))} />
                <datalist id="subjects-list">
                  {allSubjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="input-group">
                <label>Score</label>
                <input type="number" min="0" placeholder="e.g. 17" value={newTest.score}
                  onChange={e => setNewTest(x=>({...x, score:+e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Out Of</label>
                <input type="number" min="1" placeholder="e.g. 20" value={newTest.outOf}
                  onChange={e => setNewTest(x=>({...x, outOf:+e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input type="date" value={newTest.date} onChange={e => setNewTest(x=>({...x, date:e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addTest} style={{alignSelf:"flex-end"}}>Add</button>
            </div>
          </div>

          {tests.length === 0 ? (
            <div className="empty-state card"><div className="icon">📝</div><p>No tests recorded yet.</p></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Subject</th><th>Score</th><th>%</th><th>Date</th><th>Top 3</th><th></th></tr></thead>
                  <tbody>
                    {tests.map(t => {
                      const pct = t.outOf ? ((t.score / t.outOf) * 100).toFixed(1) : "—";
                      const isTop = top3Map[t.id];
                      return (
                        <tr key={t.id}>
                          <td style={{fontWeight:500}}>{t.title}</td>
                          <td><span className="badge badge-purple">{t.subject || "—"}</span></td>
                          <td style={{fontFamily:"var(--mono)"}}>{t.score} / {t.outOf}</td>
                          <td>
                            <span style={{fontFamily:"var(--mono)", color: +pct >= 80 ? "var(--success)" : +pct >= 60 ? "var(--warning)" : "var(--danger)"}}>{pct}%</span>
                          </td>
                          <td style={{color:"var(--muted)"}}>{t.date || "—"}</td>
                          <td>{isTop ? <span className="badge badge-yellow">★ Top 3</span> : ""}</td>
                          <td><button className="btn btn-danger" onClick={() => removeTest(t.id)}>✕</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ASSIGNMENTS TAB ── */}
      {tab === "Assignments" && (
        <>
          <div className="card">
            <div className="card-title">Add Assignment</div>
            <div className="form-row">
              <div className="input-group" style={{flex:2}}>
                <label>Title</label>
                <input placeholder="Assignment name" value={newTask.title} onChange={e => setNewTask(x=>({...x, title:e.target.value}))} />
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>Subject</label>
                <input placeholder="Subject" list="subjects-list2" value={newTask.subject}
                  onChange={e => setNewTask(x=>({...x, subject:e.target.value}))} />
                <datalist id="subjects-list2">
                  {allSubjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" value={newTask.due} onChange={e => setNewTask(x=>({...x, due:e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addTask} style={{alignSelf:"flex-end"}}>Add</button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state card"><div className="icon">📎</div><p>No assignments yet.</p></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Done</th><th>Title</th><th>Subject</th><th>Due</th><th></th></tr></thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id} style={{opacity: t.done ? 0.5 : 1}}>
                        <td>
                          <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}
                            style={{width:16, height:16, cursor:"pointer"}} />
                        </td>
                        <td style={{fontWeight:500, textDecoration: t.done ? "line-through" : "none"}}>{t.title}</td>
                        <td><span className="badge badge-purple">{t.subject || "—"}</span></td>
                        <td style={{color:"var(--muted)"}}>{t.due || "—"}</td>
                        <td><button className="btn btn-danger" onClick={() => removeTask(t.id)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Sub-component: inline add-course form ───────────────────
function AddCourseForm({ onAdd }) {
  const [c, setC] = useState({ name: "", credits: 3, grade: "A" });
  const handle = () => {
    if (!c.name.trim()) return;
    onAdd(c);
    setC({ name: "", credits: 3, grade: "A" });
  };
  return (
    <div className="form-row" style={{background:"var(--surface2)", borderRadius:8, padding:"12px", margin:0}}>
      <div className="input-group" style={{flex:3}}>
        <label>Course Name</label>
        <input placeholder="e.g. Data Structures" value={c.name} onChange={e => setC(x=>({...x,name:e.target.value}))}
          onKeyDown={e => e.key === "Enter" && handle()} />
      </div>
      <div className="input-group">
        <label>Credits</label>
        <input type="number" min="1" max="6" value={c.credits} onChange={e => setC(x=>({...x,credits:+e.target.value}))} />
      </div>
      <div className="input-group">
        <label>Grade</label>
        <select value={c.grade} onChange={e => setC(x=>({...x,grade:e.target.value}))}>
          {Object.keys(GRADE_MAP).map(g => <option key={g}>{g}</option>)}
        </select>
      </div>
      <button className="btn btn-ghost" onClick={handle} style={{alignSelf:"flex-end", fontSize:"0.82rem"}}>+ Add Course</button>
    </div>
  );
}

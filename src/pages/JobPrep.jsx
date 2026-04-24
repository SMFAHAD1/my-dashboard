import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const JOB_STATUSES  = ["Applied", "OA Sent", "Interview", "Offer", "Rejected", "Ghosted"];
const SKILL_LEVELS  = ["Beginner", "Intermediate", "Advanced"];
const RESOURCE_TYPES = ["Course", "Book", "Video", "Article", "Practice", "Other"];

const STATUS_BADGE = {
  "Applied":   "badge-blue",  "OA Sent":   "badge-purple",
  "Interview": "badge-yellow","Offer":      "badge-green",
  "Rejected":  "badge-red",   "Ghosted":    "",
};

const EMPTY_JOB  = { company: "", role: "", date: "", status: "Applied", link: "", note: "" };
const EMPTY_SKILL = { name: "", level: "Beginner", note: "" };
const EMPTY_RES   = { title: "", type: "Course", url: "", done: false, note: "" };

const TABS = ["Applications", "Skills", "Resources"];

export default function JobPrep() {
  const [jobs,      setJobs]      = useLocalStorage("dashboard-jobs-applications", [], 1);
  const [skills,    setSkills]    = useLocalStorage("dashboard-jobs-skills",       [], 1);
  const [resources, setResources] = useLocalStorage("dashboard-jobs-resources",    [], 1);
  const [tab,       setTab]       = useState("Applications");
  const [jForm,     setJForm]     = useState(EMPTY_JOB);
  const [sForm,     setSForm]     = useState(EMPTY_SKILL);
  const [rForm,     setRForm]     = useState(EMPTY_RES);

  // Jobs
  const addJob    = () => { if (!jForm.company.trim()) return; setJobs(j => [{ ...jForm, id: Date.now() }, ...j]); setJForm(EMPTY_JOB); };
  const removeJob = (id) => setJobs(j => j.filter(x => x.id !== id));
  const updateJobStatus = (id, status) => setJobs(j => j.map(x => x.id === id ? { ...x, status } : x));

  // Skills
  const addSkill    = () => { if (!sForm.name.trim()) return; setSkills(s => [{ ...sForm, id: Date.now() }, ...s]); setSForm(EMPTY_SKILL); };
  const removeSkill = (id) => setSkills(s => s.filter(x => x.id !== id));

  // Resources
  const addRes      = () => { if (!rForm.title.trim()) return; setResources(r => [{ ...rForm, id: Date.now() }, ...r]); setRForm(EMPTY_RES); };
  const removeRes   = (id) => setResources(r => r.filter(x => x.id !== id));
  const toggleRes   = (id) => setResources(r => r.map(x => x.id === id ? { ...x, done: !x.done } : x));

  return (
    <div>
      <div className="page-header">
        <h1>💼 Job Prep</h1>
        <p>Track applications, skills, and learning resources</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{jobs.length}</div><div className="stat-label">Applications</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--success)"}}>{jobs.filter(j=>j.status==="Offer").length}</div><div className="stat-label">Offers</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--warning)"}}>{jobs.filter(j=>j.status==="Interview").length}</div><div className="stat-label">Interviews</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent2)"}}>{skills.length}</div><div className="stat-label">Skills</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent)"}}>{resources.filter(r=>r.done).length}/{resources.length}</div><div className="stat-label">Resources Done</div></div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", gap:8, marginBottom:20}}>
        {TABS.map(t => (
          <button key={t} className={`btn ${tab===t ? "btn-primary" : "btn-ghost"}`}
            style={{padding:"8px 18px"}} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── APPLICATIONS ── */}
      {tab === "Applications" && (
        <>
          <div className="card">
            <div className="card-title">Add Application</div>
            <div className="form-row">
              <div className="input-group" style={{flex:2}}>
                <label>Company</label>
                <input placeholder="Company name" value={jForm.company} onChange={e => setJForm(x=>({...x,company:e.target.value}))} />
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>Role</label>
                <input placeholder="Job title" value={jForm.role} onChange={e => setJForm(x=>({...x,role:e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Date Applied</label>
                <input type="date" value={jForm.date} onChange={e => setJForm(x=>({...x,date:e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Status</label>
                <select value={jForm.status} onChange={e => setJForm(x=>({...x,status:e.target.value}))}>
                  {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={addJob} style={{alignSelf:"flex-end"}}>Add</button>
            </div>
            <div className="form-row">
              <div className="input-group" style={{flex:2}}>
                <label>Link (optional)</label>
                <input placeholder="Job posting URL" value={jForm.link} onChange={e => setJForm(x=>({...x,link:e.target.value}))} />
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>Note</label>
                <input placeholder="Any notes" value={jForm.note} onChange={e => setJForm(x=>({...x,note:e.target.value}))} />
              </div>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state card"><div className="icon">💼</div><p>No applications yet. Start tracking!</p></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Company</th><th>Role</th><th>Date</th><th>Status</th><th>Link</th><th>Note</th><th></th></tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td style={{fontWeight:600}}>{j.company}</td>
                        <td>{j.role}</td>
                        <td style={{color:"var(--muted)", fontSize:"0.85rem", fontFamily:"var(--mono)"}}>{j.date || "—"}</td>
                        <td>
                          <select value={j.status} onChange={e => updateJobStatus(j.id, e.target.value)}
                            style={{background:"transparent", border:"none", color:"var(--text)", fontSize:"0.85rem", padding:0, cursor:"pointer"}}>
                            {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>{j.link ? <a href={j.link} target="_blank" rel="noreferrer" style={{color:"var(--accent)", fontSize:"0.82rem"}}>🔗 Link</a> : "—"}</td>
                        <td style={{color:"var(--muted)", fontSize:"0.82rem", maxWidth:150}}>{j.note || "—"}</td>
                        <td><button className="btn btn-danger" onClick={() => removeJob(j.id)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SKILLS ── */}
      {tab === "Skills" && (
        <>
          <div className="card">
            <div className="card-title">Add Skill</div>
            <div className="form-row">
              <div className="input-group" style={{flex:3}}>
                <label>Skill Name</label>
                <input placeholder="e.g. React, SQL, System Design" value={sForm.name} onChange={e => setSForm(x=>({...x,name:e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Level</label>
                <select value={sForm.level} onChange={e => setSForm(x=>({...x,level:e.target.value}))}>
                  {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>Note</label>
                <input placeholder="Optional" value={sForm.note} onChange={e => setSForm(x=>({...x,note:e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addSkill} style={{alignSelf:"flex-end"}}>Add</button>
            </div>
          </div>

          {skills.length === 0 ? (
            <div className="empty-state card"><div className="icon">🛠</div><p>No skills tracked yet.</p></div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12}}>
              {skills.map(s => (
                <div key={s.id} className="card" style={{padding:"16px", position:"relative"}}>
                  <div style={{fontWeight:600, marginBottom:6}}>{s.name}</div>
                  <span className={`badge ${s.level==="Advanced"?"badge-green":s.level==="Intermediate"?"badge-blue":"badge-yellow"}`}>{s.level}</span>
                  {s.note && <p style={{fontSize:"0.78rem", color:"var(--muted)", marginTop:8}}>{s.note}</p>}
                  <button className="btn btn-danger" onClick={() => removeSkill(s.id)}
                    style={{position:"absolute", top:10, right:10, padding:"3px 8px", fontSize:"0.72rem"}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── RESOURCES ── */}
      {tab === "Resources" && (
        <>
          <div className="card">
            <div className="card-title">Add Resource</div>
            <div className="form-row">
              <div className="input-group" style={{flex:3}}>
                <label>Title</label>
                <input placeholder="Resource name" value={rForm.title} onChange={e => setRForm(x=>({...x,title:e.target.value}))} />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select value={rForm.type} onChange={e => setRForm(x=>({...x,type:e.target.value}))}>
                  {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group" style={{flex:2}}>
                <label>URL (optional)</label>
                <input placeholder="https://..." value={rForm.url} onChange={e => setRForm(x=>({...x,url:e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addRes} style={{alignSelf:"flex-end"}}>Add</button>
            </div>
          </div>

          {resources.length > 0 && (
            <div style={{marginBottom:12}}>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${(resources.filter(r=>r.done).length / resources.length)*100}%`, background:"var(--success)"}} />
              </div>
              <div style={{fontSize:"0.78rem", color:"var(--muted)", marginTop:4}}>
                {resources.filter(r=>r.done).length} of {resources.length} completed
              </div>
            </div>
          )}

          {resources.length === 0 ? (
            <div className="empty-state card"><div className="icon">📖</div><p>No resources added yet.</p></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Done</th><th>Title</th><th>Type</th><th>Link</th><th></th></tr></thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r.id} style={{opacity: r.done ? 0.5 : 1}}>
                        <td><input type="checkbox" checked={r.done} onChange={() => toggleRes(r.id)} style={{width:16,height:16,cursor:"pointer"}} /></td>
                        <td style={{fontWeight:500, textDecoration: r.done ? "line-through" : "none"}}>{r.title}</td>
                        <td><span className="badge badge-blue">{r.type}</span></td>
                        <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{color:"var(--accent)", fontSize:"0.82rem"}}>🔗 Open</a> : "—"}</td>
                        <td><button className="btn btn-danger" onClick={() => removeRes(r.id)}>✕</button></td>
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

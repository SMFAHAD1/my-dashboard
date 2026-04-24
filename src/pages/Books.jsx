import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const EMPTY = { title: "", author: "", genre: "", status: "Want to Read", rating: 0, year: new Date().getFullYear(), type: "Reading List", note: "" };
const STATUSES = ["Want to Read", "Reading", "Finished", "Dropped"];
const TYPES    = ["Reading List", "Buy List"];

function Stars({ value, onChange }) {
  return (
    <span style={{cursor: onChange ? "pointer" : "default", fontSize:"1.1rem"}}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange && onChange(n)}
          style={{color: n <= value ? "#fbbf24" : "#2e3248"}}>★</span>
      ))}
    </span>
  );
}

export default function Books() {
  const [books, setBooks] = useLocalStorage("dashboard-books", [], 1);
  const [form, setForm]   = useState(EMPTY);
  const [filter, setFilter] = useState("All");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const add = () => {
    if (!form.title.trim()) return;
    setBooks(b => [{ ...form, id: Date.now() }, ...b]);
    setForm(EMPTY);
  };
  const remove = (id) => setBooks(b => b.filter(x => x.id !== id));

  const filtered = filter === "All" ? books : books.filter(b => b.type === filter || b.status === filter);

  // Year analysis
  const byYear = books.filter(b => b.status === "Finished")
    .reduce((acc, b) => { acc[b.year] = (acc[b.year] || 0) + 1; return acc; }, {});

  return (
    <div>
      <div className="page-header">
        <h1>📚 Books</h1>
        <p>Track your reading list, buy list, and progress</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{books.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--success)"}}>{books.filter(b=>b.status==="Finished").length}</div><div className="stat-label">Finished</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent)"}}>{books.filter(b=>b.status==="Reading").length}</div><div className="stat-label">Reading</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--warning)"}}>{books.filter(b=>b.type==="Buy List").length}</div><div className="stat-label">To Buy</div></div>
      </div>

      {/* Add Form */}
      <div className="card">
        <div className="card-title">Add Book</div>
        <div className="form-row">
          <div className="input-group" style={{flex:2}}>
            <label>Title</label>
            <input placeholder="Book title" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="input-group" style={{flex:2}}>
            <label>Author</label>
            <input placeholder="Author name" value={form.author} onChange={e => set("author", e.target.value)} />
          </div>
          <div className="input-group">
            <label>Genre</label>
            <input placeholder="e.g. Fiction" value={form.genre} onChange={e => set("genre", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>List</label>
            <select value={form.type} onChange={e => set("type", e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Year Read</label>
            <input type="number" min="2000" max="2099" value={form.year} onChange={e => set("year", +e.target.value)} />
          </div>
          <div className="input-group">
            <label>Rating</label>
            <Stars value={form.rating} onChange={v => set("rating", v)} />
          </div>
          <button className="btn btn-primary" onClick={add} style={{alignSelf:"flex-end"}}>Add</button>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>Note</label>
            <input placeholder="Optional note" value={form.note} onChange={e => set("note", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Year analysis */}
      {Object.keys(byYear).length > 0 && (
        <div className="card">
          <div className="card-title">Books Finished by Year</div>
          <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
            {Object.entries(byYear).sort(([a],[b]) => b-a).map(([yr, cnt]) => (
              <div key={yr} style={{background:"var(--surface2)", borderRadius:8, padding:"10px 18px", textAlign:"center"}}>
                <div style={{fontFamily:"var(--mono)", color:"var(--accent)", fontWeight:700}}>{cnt}</div>
                <div style={{fontSize:"0.78rem", color:"var(--muted)"}}>{yr}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{display:"flex", gap:8, marginBottom:16, flexWrap:"wrap"}}>
        {["All", ...TYPES, ...STATUSES].map(f => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{padding:"6px 14px", fontSize:"0.82rem"}} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📚</div><p>No books yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>List</th><th>Status</th><th>Rating</th><th>Year</th><th></th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{fontWeight:500}}>{b.title}</td>
                    <td style={{color:"var(--muted)"}}>{b.author || "—"}</td>
                    <td>{b.genre ? <span className="badge badge-purple">{b.genre}</span> : "—"}</td>
                    <td><span className={`badge ${b.type === "Buy List" ? "badge-yellow" : "badge-blue"}`}>{b.type}</span></td>
                    <td><span className={`badge ${b.status==="Finished"?"badge-green":b.status==="Reading"?"badge-blue":"badge-yellow"}`}>{b.status}</span></td>
                    <td><Stars value={b.rating} /></td>
                    <td style={{color:"var(--muted)", fontFamily:"var(--mono)"}}>{b.year}</td>
                    <td><button className="btn btn-danger" onClick={() => remove(b.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

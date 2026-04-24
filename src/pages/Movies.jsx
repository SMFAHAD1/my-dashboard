import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const OMDB_KEY = "YOUR_OMDB_KEY"; // Replace at: https://www.omdbapi.com/apikey.aspx (free)
const TYPES    = ["Movie", "Series", "Documentary", "Anime"];
const EMPTY    = { title: "", type: "Movie", year: new Date().getFullYear(), rating: 0, note: "", poster: "", imdbRating: "" };

function Stars({ value, onChange }) {
  return (
    <span style={{cursor: onChange ? "pointer" : "default"}}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange && onChange(n)}
          style={{color: n <= value ? "#fbbf24" : "#2e3248", fontSize:"1.05rem"}}>★</span>
      ))}
    </span>
  );
}

export default function Movies() {
  const [movies, setMovies] = useLocalStorage("dashboard-movies", [], 1);
  const [form, setForm]     = useState(EMPTY);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Fetch poster + info from OMDb
  const fetchOMDb = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(form.title)}&apikey=${OMDB_KEY}`);
      const data = await res.json();
      if (data.Response === "True") {
        setForm(f => ({
          ...f,
          poster: data.Poster !== "N/A" ? data.Poster : "",
          imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : "",
        }));
      }
    } catch {}
    setLoading(false);
  };

  const add = () => {
    if (!form.title.trim()) return;
    setMovies(m => [{ ...form, id: Date.now() }, ...m]);
    setForm(EMPTY);
  };

  const remove = (id) => setMovies(m => m.filter(x => x.id !== id));

  const filtered = filter === "All" ? movies : movies.filter(m => m.type === filter);

  // Year-watched analysis
  const byYear = movies.reduce((acc, m) => { acc[m.year] = (acc[m.year] || 0) + 1; return acc; }, {});

  return (
    <div>
      <div className="page-header">
        <h1>🎬 Movies</h1>
        <p>Track movies, series, documentaries, and anime</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{movies.length}</div><div className="stat-label">Total</div></div>
        {TYPES.map(t => (
          <div className="stat-card" key={t}>
            <div className="stat-value" style={{color:"var(--accent2)"}}>{movies.filter(m=>m.type===t).length}</div>
            <div className="stat-label">{t}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div className="card">
        <div className="card-title">Add Entry</div>
        <div className="form-row">
          <div className="input-group" style={{flex:3}}>
            <label>Title</label>
            <input placeholder="Movie / Series title" value={form.title}
              onChange={e => set("title", e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchOMDb()} />
          </div>
          <div className="input-group">
            <label>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Year Watched</label>
            <input type="number" min="1900" max="2099" value={form.year} onChange={e => set("year", +e.target.value)} />
          </div>
          <div className="input-group">
            <label>My Rating</label>
            <Stars value={form.rating} onChange={v => set("rating", v)} />
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>Note</label>
            <input placeholder="Thoughts..." value={form.note} onChange={e => set("note", e.target.value)} />
          </div>
          <button className="btn btn-ghost" onClick={fetchOMDb} style={{alignSelf:"flex-end"}}
            disabled={loading}>{loading ? "Fetching…" : "🔍 Fetch Poster"}</button>
          <button className="btn btn-primary" onClick={add} style={{alignSelf:"flex-end"}}>Add</button>
        </div>
        {form.poster && (
          <div style={{marginTop:12}}>
            <img src={form.poster} alt="poster" style={{height:80, borderRadius:6}} />
            {form.imdbRating && <span style={{marginLeft:12, color:"var(--warning)", fontFamily:"var(--mono)"}}>IMDb: {form.imdbRating}</span>}
          </div>
        )}
        {OMDB_KEY === "YOUR_OMDB_KEY" && (
          <p style={{color:"var(--warning)", fontSize:"0.78rem", marginTop:8}}>
            ⚠ Set your free OMDb API key in Movies.jsx (line 4) to enable poster fetching.
          </p>
        )}
      </div>

      {/* Year analysis */}
      {Object.keys(byYear).length > 0 && (
        <div className="card">
          <div className="card-title">Watched by Year</div>
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
        {["All", ...TYPES].map(f => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{padding:"6px 14px", fontSize:"0.82rem"}} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card"><div className="icon">🎬</div><p>No entries yet.</p></div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14}}>
          {filtered.map(m => (
            <div key={m.id} className="card" style={{padding:0, overflow:"hidden", position:"relative"}}>
              {m.poster
                ? <img src={m.poster} alt={m.title} style={{width:"100%", display:"block", maxHeight:200, objectFit:"cover"}} />
                : <div style={{background:"var(--surface2)", height:120, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem"}}>🎬</div>
              }
              <div style={{padding:"12px 14px"}}>
                <div style={{fontWeight:600, fontSize:"0.9rem", marginBottom:4}}>{m.title}</div>
                <div style={{display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginBottom:6}}>
                  <span className="badge badge-blue" style={{fontSize:"0.7rem"}}>{m.type}</span>
                  <span style={{fontSize:"0.75rem", color:"var(--muted)", fontFamily:"var(--mono)"}}>{m.year}</span>
                  {m.imdbRating && <span style={{fontSize:"0.75rem", color:"var(--warning)"}}>★ {m.imdbRating}</span>}
                </div>
                <Stars value={m.rating} />
                {m.note && <p style={{fontSize:"0.78rem", color:"var(--muted)", marginTop:6}}>{m.note}</p>}
              </div>
              <button className="btn btn-danger" onClick={() => remove(m.id)}
                style={{position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", border:"none", color:"#fff", padding:"3px 8px", fontSize:"0.75rem"}}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

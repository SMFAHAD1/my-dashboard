import { useState, useRef, useEffect } from "react";

const APIKEY = "trilogy";
const today = new Date().toISOString().split("T")[0];

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function Stars({ rating, max = 10 }) {
  return (
    <span style={{ color: "#f0a500", fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(rating)}{"☆".repeat(max - rating)}
      <span style={{ fontSize: 10, color: "#888", marginLeft: 5 }}>{rating}/10</span>
    </span>
  );
}

const formDefaults = {
  title: "", type: "movie", rating: 7, country: "",
  startDate: "", endDate: "", addedDate: today,
};

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ ...formDefaults });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const suggestTimeout = useRef(null);
  const inputWrapRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const hide = (e) => {
      if (!inputWrapRef.current?.contains(e.target)) setSuggestions([]);
    };
    document.addEventListener("click", hide);
    return () => document.removeEventListener("click", hide);
  }, []);

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function fetchSuggestions(q) {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${APIKEY}`);
      const data = await res.json();
      setSuggestions(data.Search ? data.Search.slice(0, 5) : []);
    } catch { setSuggestions([]); }
  }

  function onTitleChange(e) {
    setField("title", e.target.value);
    clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => fetchSuggestions(e.target.value.trim()), 300);
  }

  async function addOrUpdate() {
    const t = form.title.trim();
    if (!t) return;
    setSuggestions([]);
    setLoading(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(t)}&apikey=${APIKEY}`);
      const data = await res.json();
      const entry = {
        id: editId || Date.now(),
        title: data.Title || t,
        year: data.Year || "",
        poster: data.Poster !== "N/A" ? data.Poster : null,
        rating: form.rating,
        type: form.type,
        country: form.country,
        genre: data.Genre ? data.Genre.split(",").slice(0, 2).map(g => g.trim()) : [],
        director: data.Director !== "N/A" ? data.Director : "",
        imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : null,
        runtime: data.Runtime !== "N/A" ? data.Runtime : "",
        startDate: form.startDate,
        endDate: form.endDate,
        addedDate: form.addedDate || today,
      };
      if (editId) {
        setMovies(prev => prev.map(m => m.id === editId ? entry : m));
        setEditId(null);
      } else {
        setMovies(prev => [...prev, entry]);
      }
      setForm({ ...formDefaults });
    } catch {}
    setLoading(false);
  }

  function startEdit(id) {
    const m = movies.find(x => x.id === id);
    if (!m) return;
    setEditId(id);
    setForm({
      title: m.title,
      type: m.type,
      rating: m.rating,
      country: m.country || "",
      startDate: m.startDate || "",
      endDate: m.endDate || "",
      addedDate: m.addedDate || today,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ ...formDefaults });
    setSuggestions([]);
  }

  function deleteMovie(id) {
    setMovies(prev => prev.filter(m => m.id !== id));
    if (editId === id) cancelEdit();
  }

  const movieCount = movies.filter(m => m.type === "movie").length;
  const seriesCount = movies.filter(m => m.type === "series").length;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Movies & Series</h2>

      {/* ── FORM ── */}
      <div ref={formRef} className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
          {editId ? "Edit entry" : "Add movie or series"}
        </p>

        {/* Row 1: title, type, country */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div ref={inputWrapRef} style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={onTitleChange}
              onKeyDown={e => {
                if (e.key === "Enter") addOrUpdate();
                if (e.key === "Escape") setSuggestions([]);
              }}
              placeholder="Search title..."
              style={{ width: "100%" }}
            />
            {suggestions.length > 0 && (
              <div style={suggestBoxStyle}>
                {suggestions.map(s => (
                  <div key={s.imdbID}
                    onClick={() => {
                      setField("title", s.Title);
                      if (s.Type === "series") setField("type", "series");
                      else if (s.Type === "movie") setField("type", "movie");
                      setSuggestions([]);
                      setTimeout(() => addOrUpdate(), 0);
                    }}
                    style={suggestItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    {s.Poster && s.Poster !== "N/A"
                      ? <img src={s.Poster} style={{ width: 28, height: 40, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 28, height: 40, borderRadius: 3, background: "#eee", flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.Title}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{s.Year} · {s.Type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => setField("type", e.target.value)} style={{ width: "100%" }}>
              <option value="movie">🎬 Movie</option>
              <option value="series">📺 TV Series</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Country</label>
            <input
              value={form.country}
              onChange={e => setField("country", e.target.value)}
              placeholder="e.g. Bangladesh"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Row 2: rating slider */}
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Your rating: <strong style={{ color: "#333" }}>{form.rating} / 10</strong></label>
          <input
            type="range"
            min={1} max={10} step={1}
            value={form.rating}
            onChange={e => setField("rating", Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginTop: 2 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>

        {/* Row 3: dates + buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Start watching</label>
            <input type="date" value={form.startDate} onChange={e => setField("startDate", e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Finish date</label>
            <input type="date" value={form.endDate} onChange={e => setField("endDate", e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added on</label>
            <input type="date" value={form.addedDate} onChange={e => setField("addedDate", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
            <button onClick={addOrUpdate} disabled={loading} style={btnPrimary}>
              {loading ? "Searching..." : editId ? "Save changes" : "Add"}
            </button>
            {editId && (
              <button onClick={cancelEdit} style={btnSecondary}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      {movies.length > 0 && (
        <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
          {movies.length} total · {movieCount} movie{movieCount !== 1 ? "s" : ""} · {seriesCount} series
        </p>
      )}

      {/* ── GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 14 }}>
        {movies.map(m => (
          <div key={m.id} className="card"
            style={{ padding: 0, overflow: "hidden", position: "relative", outline: editId === m.id ? "2px solid #185FA5" : "none" }}
            onMouseEnter={e => e.currentTarget.querySelector(".action-btns").style.opacity = 1}
            onMouseLeave={e => e.currentTarget.querySelector(".action-btns").style.opacity = 0}
          >
            {/* Poster */}
            <div style={{ position: "relative", aspectRatio: "2/3", background: "#f0f0f0" }}>
              {m.poster
                ? <img src={m.poster} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: "#ccc" }}>🎬</div>}

              {/* Type badge */}
              <span style={{
                position: "absolute", top: 7, left: 7, fontSize: 10, fontWeight: 500,
                padding: "2px 8px", borderRadius: 99,
                background: m.type === "movie" ? "#E6F1FB" : "#EAF3DE",
                color: m.type === "movie" ? "#185FA5" : "#3B6D11",
              }}>{m.type === "movie" ? "Movie" : "Series"}</span>

              {/* Edit + Delete buttons */}
              <div className="action-btns" style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
                <button onClick={() => startEdit(m.id)}
                  style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(59,109,17,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Edit">✎</button>
                <button onClick={() => deleteMovie(m.id)}
                  style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(163,45,45,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Delete">✕</button>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "10px 10px 12px" }}>
              <p style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.35, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {m.title}
              </p>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                {[m.year, m.runtime, m.imdbRating ? `⭐ ${m.imdbRating}` : null].filter(Boolean).join(" · ")}
              </p>
              {m.country && (
                <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🌍 {m.country}</p>
              )}
              <Stars rating={m.rating} />
              <div style={{ marginTop: 4 }}>
                {m.genre.map(g => (
                  <span key={g} style={{ display: "inline-block", fontSize: 10, background: "#e8f0fe", color: "#1a56db", padding: "2px 7px", borderRadius: 99, marginRight: 3, marginTop: 3 }}>{g}</span>
                ))}
              </div>
              {m.director && (
                <p style={{ fontSize: 11, color: "#888", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Dir. {m.director}</p>
              )}
              {(m.startDate || m.endDate || m.addedDate) && (
                <div style={{ marginTop: 7, paddingTop: 7, borderTop: "0.5px solid #eee" }}>
                  {m.startDate && <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>▶ Started <strong style={{ fontWeight: 500 }}>{formatDate(m.startDate)}</strong></p>}
                  {m.endDate && <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>✓ Finished <strong style={{ fontWeight: 500 }}>{formatDate(m.endDate)}</strong></p>}
                  {m.addedDate && <p style={{ fontSize: 11, color: "#888" }}>+ Added <strong style={{ fontWeight: 500 }}>{formatDate(m.addedDate)}</strong></p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ──
const labelStyle = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

const btnPrimary = {
  padding: "7px 16px", background: "#185FA5", color: "#E6F1FB",
  border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
};

const btnSecondary = {
  padding: "7px 14px", background: "#fff", color: "#333",
  border: "1px solid #e0e0e0", borderRadius: 8, cursor: "pointer", fontSize: 13,
};

const suggestBoxStyle = {
  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
  background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8,
  marginTop: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden",
};

const suggestItemStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0",
  background: "#fff",
};
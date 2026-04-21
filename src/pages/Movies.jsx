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

const TYPE_OPTIONS = [
  { value: "movie",       label: "🎬 Movie" },
  { value: "series",      label: "📺 TV Series" },
  { value: "documentary", label: "🎥 Documentary" },
  { value: "anime",       label: "🌸 Anime" },
];

const TYPE_META = {
  movie:       { label: "Movie",       color: "#185FA5", bg: "#E6F1FB" },
  series:      { label: "Series",      color: "#3B6D11", bg: "#EAF3DE" },
  documentary: { label: "Documentary", color: "#854F0B", bg: "#FAEEDA" },
  anime:       { label: "Anime",       color: "#993556", bg: "#FBEAF0" },
};

const formDefaults = {
  title: "", type: "movie", rating: 7, country: "",
  startDate: "", endDate: "", addedDate: today,
};

// ── Year-by-Year Analysis ──────────────────────────────────────────────
function YearAnalysis({ movies }) {
  const [expandedYear, setExpandedYear] = useState(null);

  if (movies.length === 0) return null;

  // Build per-year stats grouped by START WATCHING year
  const yearMap = {};
  movies.forEach(m => {
    const yr = m.startDate ? m.startDate.split("-")[0] : "Not set";
    if (!yearMap[yr]) {
      yearMap[yr] = { year: yr, total: 0, movie: 0, series: 0, documentary: 0, anime: 0, imdbSum: 0, imdbCount: 0, items: [] };
    }
    const y = yearMap[yr];
    y.total++;
    if (y[m.type] !== undefined) y[m.type]++;
    if (m.imdbRating) { y.imdbSum += parseFloat(m.imdbRating); y.imdbCount++; }
    y.items.push(m);
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxTotal = Math.max(...years.map(y => y.total));

  const typeColors = { movie: "#185FA5", series: "#3B6D11", documentary: "#854F0B", anime: "#993556" };
  const typeBgs   = { movie: "#E6F1FB", series: "#EAF3DE", documentary: "#FAEEDA", anime: "#FBEAF0" };

  return (
    <div style={{ marginTop: 36 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 1, background: "#eee" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#555", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
          📅 YEAR-BY-YEAR WATCHED ANALYSIS
        </span>
        <div style={{ flex: 1, height: 1, background: "#eee" }} />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 18 }}>Grouped by start watching year</p>

      {/* Summary pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {Object.entries(typeColors).map(([type, color]) => {
          const count = movies.filter(m => m.type === type).length;
          if (!count) return null;
          return (
            <span key={type} style={{
              fontSize: 12, fontWeight: 500,
              padding: "4px 12px", borderRadius: 99,
              background: typeBgs[type], color,
            }}>
              {TYPE_META[type]?.label}: {count}
            </span>
          );
        })}
        <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#f0f0f0", color: "#555" }}>
          Total: {movies.length}
        </span>
        {(() => {
          const rated = movies.filter(m => m.imdbRating);
          if (!rated.length) return null;
          const avg = (rated.reduce((s, m) => s + parseFloat(m.imdbRating), 0) / rated.length).toFixed(1);
          return (
            <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#fffbe6", color: "#b45309" }}>
              ⭐ Avg IMDb: {avg}
            </span>
          );
        })()}
      </div>

      {/* Year rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {years.map(y => {
          const barPct = maxTotal > 0 ? (y.total / maxTotal) * 100 : 0;
          const avgImdb = y.imdbCount > 0 ? (y.imdbSum / y.imdbCount).toFixed(1) : null;
          const isOpen = expandedYear === y.year;

          return (
            <div key={y.year} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", background: "#fafafa" }}>
              {/* Row header — clickable */}
              <div
                onClick={() => setExpandedYear(isOpen ? null : y.year)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}
              >
                {/* Year label */}
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 52, color: y.year === "Not set" ? "#aaa" : "#222" }}>{y.year}</span>

                {/* Bar track */}
                <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: "#185FA5", borderRadius: 99, transition: "width 0.4s" }} />
                </div>

                {/* Count */}
                <span style={{ fontSize: 13, fontWeight: 500, color: "#555", minWidth: 24, textAlign: "right" }}>{y.total}</span>

                {/* Type breakdown badges */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minWidth: 160, justifyContent: "flex-end" }}>
                  {Object.entries(typeColors).map(([type, color]) => {
                    const cnt = y[type];
                    if (!cnt) return null;
                    return (
                      <span key={type} style={{
                        fontSize: 10, fontWeight: 500,
                        padding: "2px 7px", borderRadius: 99,
                        background: typeBgs[type], color,
                      }}>
                        {TYPE_META[type]?.label} {cnt}
                      </span>
                    );
                  })}
                </div>

                {/* IMDb avg */}
                {avgImdb && (
                  <span style={{ fontSize: 12, color: "#b45309", background: "#fffbe6", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
                    ⭐ {avgImdb}
                  </span>
                )}

                {/* Expand chevron */}
                <span style={{ fontSize: 12, color: "#aaa", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </div>

              {/* Expanded: mini cards for that year */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #eee" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginTop: 12 }}>
                    {y.items.map(m => (
                      <div key={m.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, overflow: "hidden", display: "flex", gap: 8, padding: 8 }}>
                        {m.poster
                          ? <img src={m.poster} style={{ width: 36, height: 54, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                          : <div style={{ width: 36, height: 54, background: "#f0f0f0", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
                        }
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.3, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.title}</p>
                          <span style={{
                            fontSize: 9, fontWeight: 500,
                            padding: "1px 6px", borderRadius: 99,
                            background: typeBgs[m.type] || "#eee",
                            color: typeColors[m.type] || "#555",
                            display: "inline-block", marginBottom: 3,
                          }}>{TYPE_META[m.type]?.label || m.type}</span>
                          {m.imdbRating && <p style={{ fontSize: 10, color: "#b45309" }}>⭐ {m.imdbRating}</p>}
                          <p style={{ fontSize: 10, color: "#f0a500" }}>{"★".repeat(m.rating)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
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
      title: m.title, type: m.type, rating: m.rating, country: m.country || "",
      startDate: m.startDate || "", endDate: m.endDate || "", addedDate: m.addedDate || today,
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

  const counts = TYPE_OPTIONS.reduce((acc, { value }) => {
    acc[value] = movies.filter(m => m.type === value).length;
    return acc;
  }, {});

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

          <div style={{ minWidth: 150 }}>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => setField("type", e.target.value)} style={{ width: "100%" }}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            type="range" min={1} max={10} step={1} value={form.rating}
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
            {editId && <button onClick={cancelEdit} style={btnSecondary}>Cancel</button>}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      {movies.length > 0 && (
        <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
          {movies.length} total
          {counts.movie     > 0 ? ` · ${counts.movie} movie${counts.movie !== 1 ? "s" : ""}` : ""}
          {counts.series    > 0 ? ` · ${counts.series} series` : ""}
          {counts.documentary > 0 ? ` · ${counts.documentary} doc${counts.documentary !== 1 ? "s" : ""}` : ""}
          {counts.anime     > 0 ? ` · ${counts.anime} anime` : ""}
        </p>
      )}

      {/* ── GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 14 }}>
        {movies.map(m => {
          const tm = TYPE_META[m.type] || { label: m.type, color: "#555", bg: "#eee" };
          return (
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
                  background: tm.bg, color: tm.color,
                }}>{tm.label}</span>

                {/* Edit + Delete */}
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
                {m.country && <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🌍 {m.country}</p>}
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
                    {m.endDate   && <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>✓ Finished <strong style={{ fontWeight: 500 }}>{formatDate(m.endDate)}</strong></p>}
                    {m.addedDate && <p style={{ fontSize: 11, color: "#888" }}>+ Added <strong style={{ fontWeight: 500 }}>{formatDate(m.addedDate)}</strong></p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── YEAR-BY-YEAR ANALYSIS ── */}
      <YearAnalysis movies={movies} />
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────
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

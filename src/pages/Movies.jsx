import { useEffect, useRef, useState } from "react";
import { useSupabase } from "../hooks/useSupabase";

const APIKEY = "trilogy";
const today = new Date().toISOString().split("T")[0];

const TYPE_OPTIONS = [
  { value: "movie", label: "Movie" },
  { value: "series", label: "TV Series" },
  { value: "documentary", label: "Documentary" },
  { value: "anime", label: "Anime" },
];

const TYPE_META = {
  movie: { label: "Movie", color: "#185FA5", bg: "#E6F1FB" },
  series: { label: "Series", color: "#3B6D11", bg: "#EAF3DE" },
  documentary: { label: "Documentary", color: "#854F0B", bg: "#FAEEDA" },
  anime: { label: "Anime", color: "#993556", bg: "#FBEAF0" },
};

const watchFormDefaults = {
  title: "",
  type: "movie",
  rating: "",
  country: "",
  startDate: "",
  endDate: "",
  addedDate: today,
};

const futureFormDefaults = {
  title: "",
  type: "movie",
  country: "",
  addedDate: today,
};

function normalizeRating(value) {
  if (value === "" || value == null) return "";
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return "";
  return Math.max(0, Math.min(10, parsed));
}

function formatRating(value) {
  const rating = normalizeRating(value);
  return rating === "" ? "" : rating.toFixed(1);
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
    </div>
  );
}

function PosterThumb({ src, alt }) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f8fafc" }} />;
  }
  return (
    <div style={{ width: 40, height: 56, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f8fafc", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>
      POSTER
    </div>
  );
}

function YearAnalysis({ movies }) {
  const [expandedYear, setExpandedYear] = useState(null);
  if (movies.length === 0) return null;

  const yearMap = {};
  movies.forEach((m) => {
    const yr = m.startDate ? m.startDate.split("-")[0] : "Not set";
    if (!yearMap[yr]) {
      yearMap[yr] = { year: yr, total: 0, movie: 0, series: 0, documentary: 0, anime: 0, ratingSum: 0, ratingCount: 0, items: [] };
    }
    const y = yearMap[yr];
    y.total++;
    if (y[m.type] !== undefined) y[m.type]++;
    const rating = normalizeRating(m.rating);
    if (rating !== "") {
      y.ratingSum += rating;
      y.ratingCount++;
    }
    y.items.push(m);
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxTotal = Math.max(...years.map((y) => y.total));

  return (
    <div style={{ marginTop: 36 }}>
      <Divider label="YEAR-BY-YEAR WATCHED ANALYSIS" />
      <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 18 }}>Grouped by start watching year</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {TYPE_OPTIONS.map(({ value }) => {
          const count = movies.filter((m) => m.type === value).length;
          if (!count) return null;
          return (
            <span key={value} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: TYPE_META[value].bg, color: TYPE_META[value].color }}>
              {TYPE_META[value].label}: {count}
            </span>
          );
        })}
        <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#f0f0f0", color: "#555" }}>
          Total: {movies.length}
        </span>
        {(() => {
          const rated = movies.map((m) => normalizeRating(m.rating)).filter((rating) => rating !== "");
          if (!rated.length) return null;
          const avg = (rated.reduce((s, rating) => s + rating, 0) / rated.length).toFixed(1);
          return (
            <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 99, background: "#fffbe6", color: "#b45309" }}>
              Avg rating: {avg}/10
            </span>
          );
        })()}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {years.map((y) => {
          const barPct = maxTotal > 0 ? (y.total / maxTotal) * 100 : 0;
          const avgRating = y.ratingCount > 0 ? (y.ratingSum / y.ratingCount).toFixed(1) : null;
          const isOpen = expandedYear === y.year;

          return (
            <div key={y.year} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", background: "#fafafa" }}>
              <div
                onClick={() => setExpandedYear(isOpen ? null : y.year)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}
              >
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 52, color: y.year === "Not set" ? "#aaa" : "#222" }}>{y.year}</span>
                <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: "#185FA5", borderRadius: 99, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#555", minWidth: 24, textAlign: "right" }}>{y.total}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minWidth: 160, justifyContent: "flex-end" }}>
                  {TYPE_OPTIONS.map(({ value }) => {
                    const count = y[value];
                    if (!count) return null;
                    return (
                      <span key={value} style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: TYPE_META[value].bg, color: TYPE_META[value].color }}>
                        {TYPE_META[value].label} {count}
                      </span>
                    );
                  })}
                </div>
                {avgRating && (
                  <span style={{ fontSize: 12, color: "#b45309", background: "#fffbe6", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
                    {avgRating}/10
                  </span>
                )}
                <span style={{ fontSize: 12, color: "#aaa", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>v</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #eee" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
                    {y.items.map((m) => (
                      <div key={m.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <PosterThumb src={m.poster} alt={m.title} />
                        <div>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{m.title}</p>
                        <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: TYPE_META[m.type]?.bg || "#eee", color: TYPE_META[m.type]?.color || "#555" }}>
                          {TYPE_META[m.type]?.label || m.type}
                        </span>
                        {formatRating(m.rating) && <p style={{ fontSize: 11, color: "#854F0B", marginTop: 6 }}>Rating {formatRating(m.rating)}/10</p>}
                        <div style={{ fontSize: 10, color: "#888", marginTop: 6 }}>
                          {m.startDate && <div>Started {formatDate(m.startDate)}</div>}
                          {m.endDate && <div>Finished {formatDate(m.endDate)}</div>}
                        </div>
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

export default function Movies() {
  const [movies, setMovies] = useSupabase("dashboard-movies", []);
  const [watchForm, setWatchForm] = useState({ ...watchFormDefaults });
  const [futureForm, setFutureForm] = useState({ ...futureFormDefaults });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [futureSuggestions, setFutureSuggestions] = useState([]);
  const suggestTimeout = useRef(null);
  const futureSuggestTimeout = useRef(null);
  const watchInputWrapRef = useRef(null);
  const futureInputWrapRef = useRef(null);
  const formRef = useRef(null);

  const normalizedMovies = movies.map((m) => ({
    ...m,
    section: m.section || "watched",
    rating: m.section === "future" ? "" : normalizeRating(m.rating),
  }));

  useEffect(() => {
    const hide = (e) => {
      if (!watchInputWrapRef.current?.contains(e.target)) setSuggestions([]);
      if (!futureInputWrapRef.current?.contains(e.target)) setFutureSuggestions([]);
    };
    document.addEventListener("click", hide);
    return () => document.removeEventListener("click", hide);
  }, []);

  function setWatchField(key, value) {
    setWatchForm((prev) => ({ ...prev, [key]: value }));
  }

  function setFutureField(key, value) {
    setFutureForm((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchSuggestions(q, setter) {
    if (q.length < 2) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${APIKEY}`);
      const data = await res.json();
      setter(data.Search ? data.Search.slice(0, 5) : []);
    } catch {
      setter([]);
    }
  }

  function onWatchTitleChange(e) {
    const value = e.target.value;
    setWatchField("title", value);
    clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => fetchSuggestions(value.trim(), setSuggestions), 300);
  }

  function onFutureTitleChange(e) {
    const value = e.target.value;
    setFutureField("title", value);
    clearTimeout(futureSuggestTimeout.current);
    futureSuggestTimeout.current = setTimeout(() => fetchSuggestions(value.trim(), setFutureSuggestions), 300);
  }

  async function fetchMovieDetails(title) {
    try {
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${APIKEY}`);
      return await res.json();
    } catch {
      return {};
    }
  }

  async function addOrUpdateWatched(prefillTitle) {
    const title = (prefillTitle ?? watchForm.title).trim();
    if (!title) return;
    setSuggestions([]);
    setLoading(true);
    try {
      const data = await fetchMovieDetails(title);
      const entry = {
        id: editId || Date.now(),
        section: "watched",
        title: data.Title || title,
        year: data.Year || "",
        poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
        rating: normalizeRating(watchForm.rating),
        type: watchForm.type,
        country: watchForm.country || "",
        genre: data.Genre ? data.Genre.split(",").slice(0, 2).map((g) => g.trim()) : [],
        director: data.Director && data.Director !== "N/A" ? data.Director : "",
        imdbRating: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
        runtime: data.Runtime && data.Runtime !== "N/A" ? data.Runtime : "",
        startDate: watchForm.startDate,
        endDate: watchForm.endDate,
        addedDate: watchForm.addedDate || today,
      };

      if (editId) {
        setMovies((prev) => prev.map((m) => (m.id === editId ? entry : m)));
        setEditId(null);
      } else {
        setMovies((prev) => [...prev, entry]);
      }
      setWatchForm({ ...watchFormDefaults });
    } finally {
      setLoading(false);
    }
  }

  async function addFutureMovie(prefillTitle) {
    const title = (prefillTitle ?? futureForm.title).trim();
    if (!title) return;
    setFutureSuggestions([]);
    try {
      const data = await fetchMovieDetails(title);
      const entry = {
        id: Date.now(),
        section: "future",
        title: data.Title || title,
        year: data.Year || "",
        poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
        type: futureForm.type,
        country: futureForm.country || "",
        genre: data.Genre ? data.Genre.split(",").slice(0, 2).map((g) => g.trim()) : [],
        director: data.Director && data.Director !== "N/A" ? data.Director : "",
        imdbRating: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
        runtime: data.Runtime && data.Runtime !== "N/A" ? data.Runtime : "",
        addedDate: futureForm.addedDate || today,
      };
      setMovies((prev) => [...prev, entry]);
      setFutureForm({ ...futureFormDefaults });
    } catch {}
  }

  function startEdit(id) {
    const movie = normalizedMovies.find((m) => m.id === id && m.section === "watched");
    if (!movie) return;
    setEditId(id);
    setWatchForm({
      title: movie.title,
      type: movie.type,
      rating: formatRating(movie.rating),
      country: movie.country || "",
      startDate: movie.startDate || "",
      endDate: movie.endDate || "",
      addedDate: movie.addedDate || today,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setWatchForm({ ...watchFormDefaults });
    setSuggestions([]);
  }

  function deleteMovie(id) {
    setMovies((prev) => prev.filter((m) => m.id !== id));
    if (editId === id) cancelEdit();
  }

  const watchedMovies = normalizedMovies.filter((m) => m.section !== "future");
  const futureMovies = normalizedMovies.filter((m) => m.section === "future");
  const finishedCount = watchedMovies.filter((m) => m.endDate).length;
  const inProgressCount = watchedMovies.filter((m) => m.startDate && !m.endDate).length;
  const avgRating = watchedMovies.map((m) => normalizeRating(m.rating)).filter((rating) => rating !== "");
  const avgRatingValue = avgRating.length ? (avgRating.reduce((s, rating) => s + rating, 0) / avgRating.length).toFixed(1) : null;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Movies & Series</h2>

      {(watchedMovies.length > 0 || futureMovies.length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Watched List", value: watchedMovies.length, bg: "#e8f0fe", color: "#185FA5" },
            { label: "Finished", value: finishedCount, bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Watching", value: inProgressCount, bg: "#fff8e1", color: "#854F0B" },
            { label: "Future Watch", value: futureMovies.length, bg: "#fce8e8", color: "#A32D2D" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, minWidth: 90, padding: "12px 14px", borderRadius: 10, background: s.bg, color: s.color, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
          {avgRatingValue && (
            <div style={{ flex: 1, minWidth: 90, padding: "12px 14px", borderRadius: 10, background: "#fff7e6", color: "#b45309", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{avgRatingValue}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Avg Rating</div>
            </div>
          )}
        </div>
      )}

      <Divider label="WATCHED LIST" />

      <div ref={formRef} className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{editId ? "Edit watched entry" : "Add watched or current movie"}</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div ref={watchInputWrapRef} style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <label style={labelStyle}>Title</label>
            <input
              value={watchForm.title}
              onChange={onWatchTitleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") addOrUpdateWatched();
                if (e.key === "Escape") setSuggestions([]);
              }}
              placeholder="Search title..."
              style={{ width: "100%" }}
            />
            {suggestions.length > 0 && (
              <div style={suggestBoxStyle}>
                {suggestions.map((s) => (
                  <div
                    key={s.imdbID}
                    onClick={() => {
                      setWatchField("title", s.Title);
                      if (s.Type === "series") setWatchField("type", "series");
                      else if (s.Type === "movie") setWatchField("type", "movie");
                      setSuggestions([]);
                      setTimeout(() => addOrUpdateWatched(s.Title), 0);
                    }}
                    style={suggestItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {s.Poster && s.Poster !== "N/A" ? (
                      <img src={s.Poster} alt="" style={{ width: 28, height: 40, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 40, borderRadius: 3, background: "#eee", flexShrink: 0 }} />
                    )}
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
            <select value={watchForm.type} onChange={(e) => setWatchField("type", e.target.value)} style={{ width: "100%" }}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Country</label>
            <input value={watchForm.country} onChange={(e) => setWatchField("country", e.target.value)} placeholder="e.g. Bangladesh" style={{ width: "100%" }} />
          </div>

          <div style={{ minWidth: 130 }}>
            <label style={labelStyle}>Your rating (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={watchForm.rating}
              onChange={(e) => setWatchField("rating", e.target.value)}
              placeholder="e.g. 3.7"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Start watching</label>
            <input type="date" value={watchForm.startDate} onChange={(e) => setWatchField("startDate", e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Finish date</label>
            <input type="date" value={watchForm.endDate} onChange={(e) => setWatchField("endDate", e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added on</label>
            <input type="date" value={watchForm.addedDate} onChange={(e) => setWatchField("addedDate", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
            <button onClick={addOrUpdateWatched} disabled={loading} style={btnPrimary}>
              {loading ? "Searching..." : editId ? "Save changes" : "Add"}
            </button>
            {editId && <button onClick={cancelEdit} style={btnSecondary}>Cancel</button>}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        {watchedMovies.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No watched movies yet.</p>
        )}
        {watchedMovies.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                    {["SL", "Poster", "Title", "Type", "Rating", "Country", "IMDb", "Added", "Start", "Finish", "Action"].map((head) => (
                      <th key={head} style={tableHead}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {watchedMovies.map((m, index) => (
                    <tr key={m.id} style={{ borderBottom: index === watchedMovies.length - 1 ? "none" : "1px solid #eef2f7", background: index % 2 === 0 ? "#ffffff" : "#fcfcfd" }}>
                      <td style={tableCell}>{index + 1}</td>
                      <td style={tableCell}><PosterThumb src={m.poster} alt={m.title} /></td>
                      <td style={tableCellTitle}>{m.title}</td>
                      <td style={tableCell}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: TYPE_META[m.type]?.bg || "#eee", color: TYPE_META[m.type]?.color || "#555", whiteSpace: "nowrap" }}>
                          {TYPE_META[m.type]?.label || m.type}
                        </span>
                      </td>
                      <td style={tableCell}>{formatRating(m.rating) ? `${formatRating(m.rating)}/10` : "-"}</td>
                      <td style={tableCell}>{m.country || "-"}</td>
                      <td style={tableCell}>{m.imdbRating || "-"}</td>
                      <td style={tableCell}>{m.addedDate ? formatDate(m.addedDate) : "-"}</td>
                      <td style={tableCell}>{m.startDate ? formatDate(m.startDate) : "-"}</td>
                      <td style={tableCell}>{m.endDate ? formatDate(m.endDate) : "-"}</td>
                      <td style={tableCell}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => startEdit(m.id)} style={actionBtn}>Edit</button>
                          <button onClick={() => deleteMovie(m.id)} style={actionBtnMuted}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <YearAnalysis movies={watchedMovies} />

      <Divider label="FUTURE WATCH LIST" />

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Add movie for future watching</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div ref={futureInputWrapRef} style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <label style={labelStyle}>Title</label>
            <input
              value={futureForm.title}
              onChange={onFutureTitleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") addFutureMovie();
                if (e.key === "Escape") setFutureSuggestions([]);
              }}
              placeholder="Search title..."
              style={{ width: "100%" }}
            />
            {futureSuggestions.length > 0 && (
              <div style={suggestBoxStyle}>
                {futureSuggestions.map((s) => (
                  <div
                    key={s.imdbID}
                    onClick={() => {
                      setFutureField("title", s.Title);
                      if (s.Type === "series") setFutureField("type", "series");
                      else if (s.Type === "movie") setFutureField("type", "movie");
                      setFutureSuggestions([]);
                      setTimeout(() => addFutureMovie(s.Title), 0);
                    }}
                    style={suggestItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {s.Poster && s.Poster !== "N/A" ? (
                      <img src={s.Poster} alt="" style={{ width: 28, height: 40, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 40, borderRadius: 3, background: "#eee", flexShrink: 0 }} />
                    )}
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
            <select value={futureForm.type} onChange={(e) => setFutureField("type", e.target.value)} style={{ width: "100%" }}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Country</label>
            <input value={futureForm.country} onChange={(e) => setFutureField("country", e.target.value)} placeholder="Optional" style={{ width: "100%" }} />
          </div>

          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added on</label>
            <input type="date" value={futureForm.addedDate} onChange={(e) => setFutureField("addedDate", e.target.value)} />
          </div>

          <button onClick={addFutureMovie} style={btnPrimary}>Add</button>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        {futureMovies.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No future watch movies yet.</p>
        )}
        {futureMovies.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                    {["SL", "Poster", "Title", "Type", "Country", "IMDb", "Added", "Action"].map((head) => (
                      <th key={head} style={tableHead}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {futureMovies.map((m, index) => (
                    <tr key={m.id} style={{ borderBottom: index === futureMovies.length - 1 ? "none" : "1px solid #eef2f7", background: index % 2 === 0 ? "#ffffff" : "#fcfcfd" }}>
                      <td style={tableCell}>{index + 1}</td>
                      <td style={tableCell}><PosterThumb src={m.poster} alt={m.title} /></td>
                      <td style={tableCellTitle}>{m.title}</td>
                      <td style={tableCell}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: TYPE_META[m.type]?.bg || "#eee", color: TYPE_META[m.type]?.color || "#555", whiteSpace: "nowrap" }}>
                          {TYPE_META[m.type]?.label || m.type}
                        </span>
                      </td>
                      <td style={tableCell}>{m.country || "-"}</td>
                      <td style={tableCell}>{m.imdbRating || "-"}</td>
                      <td style={tableCell}>{m.addedDate ? formatDate(m.addedDate) : "-"}</td>
                      <td style={tableCell}>
                        <button onClick={() => deleteMovie(m.id)} style={actionBtnMuted}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

const btnPrimary = {
  padding: "7px 16px",
  background: "#185FA5",
  color: "#E6F1FB",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

const btnSecondary = {
  padding: "7px 14px",
  background: "#fff",
  color: "#333",
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};

const actionBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#185FA5",
  fontSize: 12,
  padding: 0,
};

const actionBtnMuted = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#9ca3af",
  fontSize: 12,
  padding: 0,
};

const suggestBoxStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 20,
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  marginTop: 4,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const suggestItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
};

const tableHead = {
  textAlign: "left",
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 600,
  letterSpacing: 0.3,
  padding: "12px 14px",
  whiteSpace: "nowrap",
};

const tableCell = {
  fontSize: 12,
  color: "#4b5563",
  padding: "12px 14px",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const tableCellTitle = {
  ...tableCell,
  fontWeight: 600,
  color: "#111827",
  minWidth: 220,
};

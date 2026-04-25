import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const APIKEY = "trilogy";
const today = new Date().toISOString().split("T")[0];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatDecimal(value, digits = 1) {
  return Number(value || 0).toFixed(digits);
}

const TYPE_OPTIONS = [
  { value: "movie", label: "Movie" },
  { value: "series", label: "TV Series" },
  { value: "documentary", label: "Documentary" },
  { value: "anime", label: "Anime" },
];

const TYPE_META = {
  movie: { label: "Movie" },
  series: { label: "Series" },
  documentary: { label: "Documentary" },
  anime: { label: "Anime" },
};

const watchedDefaults = {
  title: "",
  type: "movie",
  rating: 7.0,
  country: "",
  startDate: "",
  endDate: "",
  addedDate: today,
};

const watchlistDefaults = {
  name: "",
  type: "movie",
  country: "",
  addedDate: today,
};

function YearAnalysis({ movies }) {
  const [expandedYear, setExpandedYear] = useState(null);
  if (movies.length === 0) return null;

  const yearMap = {};
  movies.forEach((movie) => {
    const year = movie.startDate ? movie.startDate.split("-")[0] : "Not set";
    if (!yearMap[year]) {
      yearMap[year] = { year, total: 0, movie: 0, series: 0, documentary: 0, anime: 0, imdbSum: 0, imdbCount: 0, ratingSum: 0, items: [] };
    }
    yearMap[year].total += 1;
    if (yearMap[year][movie.type] !== undefined) yearMap[year][movie.type] += 1;
    if (movie.imdbRating) {
      yearMap[year].imdbSum += parseFloat(movie.imdbRating);
      yearMap[year].imdbCount += 1;
    }
    yearMap[year].ratingSum += Number(movie.rating || 0);
    yearMap[year].items.push(movie);
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxTotal = Math.max(...years.map((entry) => entry.total));

  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475467", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
          YEAR-BY-YEAR WATCHED ANALYSIS
        </span>
        <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
      </div>
      <p style={{ fontSize: 11, color: "#667085", textAlign: "center", marginBottom: 18 }}>Grouped by start watching year</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {years.map((entry) => {
          const barPercent = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
          const avgImdb = entry.imdbCount > 0 ? (entry.imdbSum / entry.imdbCount).toFixed(1) : null;
          const avgRating = entry.total > 0 ? (entry.ratingSum / entry.total).toFixed(1) : null;
          const isOpen = expandedYear === entry.year;

          return (
            <div key={entry.year} style={{ border: "1px solid #d9dee7", borderRadius: 10, overflow: "hidden", background: "#ffffff" }}>
              <div
                onClick={() => setExpandedYear(isOpen ? null : entry.year)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none", flexWrap: "wrap" }}
              >
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 52, color: entry.year === "Not set" ? "#667085" : "#111827" }}>{entry.year}</span>
                <div style={{ flex: 1, height: 8, background: "#d9dee7", borderRadius: 99, overflow: "hidden", minWidth: 120 }}>
                  <div style={{ width: `${barPercent}%`, height: "100%", background: "#2563eb", borderRadius: 99, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#475467", minWidth: 24, textAlign: "right" }}>{entry.total}</span>
                {avgImdb && <span style={pillStyle}>IMDb {avgImdb}</span>}
                {avgRating && <span style={pillStyle}>Your rating {avgRating}</span>}
                <span style={{ fontSize: 11, color: "#667085", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>v</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #d9dee7" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 12 }}>
                    {entry.items.map((movie) => (
                      <div key={movie.id} style={{ background: "#ffffff", border: "1px solid #d9dee7", borderRadius: 8, overflow: "hidden", display: "flex", gap: 8, padding: 8 }}>
                        {movie.poster ? (
                          <img src={movie.poster} alt={movie.title} style={{ width: 38, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 38, height: 56, background: "#f2f4f7", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#667085" }}>
                            No image
                          </div>
                        )}
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.3, marginBottom: 4 }}>{movie.title}</p>
                          <p style={{ fontSize: 10, color: "#667085", marginBottom: 3 }}>{TYPE_META[movie.type]?.label}</p>
                          {movie.imdbRating && <p style={{ fontSize: 10, color: "#475467" }}>IMDb {movie.imdbRating}</p>}
                          <p style={{ fontSize: 10, color: "#475467" }}>Your rating {formatDecimal(movie.rating)}</p>
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
  const [movies, setMovies] = useLocalStorage("dashboard-movies", [], 1);
  const [watchlist, setWatchlist] = useLocalStorage("dashboard-movies-watchlist", [], 1);
  const [form, setForm] = useState({ ...watchedDefaults });
  const [watchlistForm, setWatchlistForm] = useState({ ...watchlistDefaults });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const suggestTimeout = useRef(null);
  const inputWrapRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const hide = (event) => {
      if (!inputWrapRef.current?.contains(event.target)) setSuggestions([]);
    };
    document.addEventListener("click", hide);
    return () => document.removeEventListener("click", hide);
  }, []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setWatchlistField(key, value) {
    setWatchlistForm((current) => ({ ...current, [key]: value }));
  }

  async function fetchMoviePoster(title) {
    if (!title) return "";
    try {
      const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${APIKEY}`);
      const data = await response.json();
      return data.Poster && data.Poster !== "N/A" ? data.Poster : "";
    } catch {
      return "";
    }
  }

  async function fetchSuggestions(query) {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${APIKEY}`);
      const data = await response.json();
      setSuggestions(data.Search ? data.Search.slice(0, 5) : []);
    } catch {
      setSuggestions([]);
    }
  }

  function onTitleChange(event) {
    setField("title", event.target.value);
    clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => fetchSuggestions(event.target.value.trim()), 300);
  }

  async function addOrUpdate() {
    const title = form.title.trim();
    if (!title) return;
    setSuggestions([]);
    setLoading(true);

    try {
      const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${APIKEY}`);
      const data = await response.json();
      const entry = {
        id: editId || Date.now(),
        title: data.Title || title,
        year: data.Year || "",
        poster: data.Poster !== "N/A" ? data.Poster : null,
        rating: Number(form.rating),
        type: form.type,
        country: form.country,
        genre: data.Genre ? data.Genre.split(",").slice(0, 2).map((item) => item.trim()) : [],
        director: data.Director !== "N/A" ? data.Director : "",
        imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : null,
        runtime: data.Runtime !== "N/A" ? data.Runtime : "",
        startDate: form.startDate,
        endDate: form.endDate,
        addedDate: form.addedDate || today,
      };

      if (editId) {
        setMovies((current) => current.map((item) => (item.id === editId ? entry : item)));
        setEditId(null);
      } else {
        setMovies((current) => [...current, entry]);
      }

      setForm({ ...watchedDefaults });
    } catch {
      // Keep silent to match current page behavior.
    }

    setLoading(false);
  }

  function startEdit(id) {
    const movie = movies.find((item) => item.id === id);
    if (!movie) return;
    setEditId(id);
    setForm({
      title: movie.title,
      type: movie.type,
      rating: movie.rating,
      country: movie.country || "",
      startDate: movie.startDate || "",
      endDate: movie.endDate || "",
      addedDate: movie.addedDate || today,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ ...watchedDefaults });
    setSuggestions([]);
  }

  function deleteMovie(id) {
    setMovies((current) => current.filter((item) => item.id !== id));
    if (editId === id) cancelEdit();
  }

  async function addToWatchlist() {
    if (!watchlistForm.name.trim()) return;
    const name = watchlistForm.name.trim();
    const poster = await fetchMoviePoster(name);
    setWatchlist((current) => [...current, { id: Date.now(), ...watchlistForm, name, poster }]);
    setWatchlistForm({ ...watchlistDefaults });
  }

  function deleteWatchlistItem(id) {
    setWatchlist((current) => current.filter((item) => item.id !== id));
  }

  const counts = TYPE_OPTIONS.reduce((accumulator, { value }) => {
    accumulator[value] = movies.filter((movie) => movie.type === value).length;
    return accumulator;
  }, {});

  const sortedMovies = [...movies].sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || ""));
  const sortedWatchlist = [...watchlist].sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || ""));

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Movies & Series</h2>

      <div ref={formRef} className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {editId ? "Edit entry" : "Add watched movie or series"}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div ref={inputWrapRef} style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={onTitleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") addOrUpdate();
                if (event.key === "Escape") setSuggestions([]);
              }}
              placeholder="Search title..."
              style={{ width: "100%" }}
            />
            {suggestions.length > 0 && (
              <div style={suggestBoxStyle}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.imdbID}
                    onClick={() => {
                      setField("title", suggestion.Title);
                      if (suggestion.Type === "series") setField("type", "series");
                      if (suggestion.Type === "movie") setField("type", "movie");
                      setSuggestions([]);
                      setTimeout(() => addOrUpdate(), 0);
                    }}
                    style={suggestItemStyle}
                  >
                    {suggestion.Poster && suggestion.Poster !== "N/A" ? (
                      <img src={suggestion.Poster} alt={suggestion.Title} style={{ width: 28, height: 40, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 40, borderRadius: 3, background: "#fef3c7", flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{suggestion.Title}</div>
                      <div style={{ fontSize: 11, color: "#667085" }}>{suggestion.Year} - {suggestion.Type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ minWidth: 150 }}>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={(event) => setField("type", event.target.value)} style={{ width: "100%" }}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Country</label>
            <input value={form.country} onChange={(event) => setField("country", event.target.value)} placeholder="e.g. Japan" style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div style={{ minWidth: 150 }}>
            <label style={labelStyle}>Your Rating</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={form.rating}
              onChange={(event) => setField("rating", Math.min(10, Math.max(0, Number(event.target.value) || 0)))}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Start Watching</label>
            <input type="date" value={form.startDate} onChange={(event) => setField("startDate", event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Finish Date</label>
            <input type="date" value={form.endDate} onChange={(event) => setField("endDate", event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added On</label>
            <input type="date" value={form.addedDate} onChange={(event) => setField("addedDate", event.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
            <button onClick={addOrUpdate} disabled={loading} style={buttonStyle}>
              {loading ? "Searching..." : editId ? "Save Changes" : "Add"}
            </button>
            {editId && (
              <button onClick={cancelEdit} style={secondaryButtonStyle}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {movies.length > 0 && (
        <p style={{ fontSize: 13, color: "#667085", marginBottom: 12 }}>
          {movies.length} total
          {counts.movie > 0 ? ` - ${counts.movie} movies` : ""}
          {counts.series > 0 ? ` - ${counts.series} series` : ""}
          {counts.documentary > 0 ? ` - ${counts.documentary} documentaries` : ""}
          {counts.anime > 0 ? ` - ${counts.anime} anime` : ""}
        </p>
      )}

      {movies.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Watched List</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Country</th>
                  <th>Your Rating</th>
                  <th>IMDb</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedMovies.map((movie, index) => (
                  <tr key={movie.id}>
                    <td>{index + 1}</td>
                    <td>
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} style={{ width: 60, height: 88, objectFit: "cover", borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 60, height: 88, background: "#f2f4f7", borderRadius: 6 }} />
                      )}
                    </td>
                    <td>{movie.title}</td>
                    <td>{TYPE_META[movie.type]?.label || movie.type}</td>
                    <td>{movie.country || "-"}</td>
                    <td>{formatDecimal(movie.rating)}</td>
                    <td>{movie.imdbRating || "-"}</td>
                    <td>{movie.addedDate ? formatDate(movie.addedDate) : "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(movie.id)} style={ghostButtonStyle}>Edit</button>
                        <button onClick={() => deleteMovie(movie.id)} style={ghostButtonStyle}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14, marginBottom: 24 }}>
        {sortedMovies.map((movie, index) => (
          <div key={movie.id} className="card" style={{ padding: 0, overflow: "hidden", position: "relative", outline: editId === movie.id ? "2px solid #2563eb" : "none" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", background: "#f7f8fa" }}>
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#667085" }}>
                  No poster
                </div>
              )}

              <span style={{ position: "absolute", top: 7, left: 7, fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: "#eef2ff", color: "#111827", border: "1px solid #d0d5dd" }}>
                #{index + 1}
              </span>

              <span style={{ position: "absolute", top: 7, left: 56, fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: "#eef2ff", color: "#111827", border: "1px solid #d0d5dd" }}>
                {TYPE_META[movie.type]?.label || movie.type}
              </span>

              <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
                <button onClick={() => startEdit(movie.id)} style={iconButtonStyle}>
                  Edit
                </button>
                <button onClick={() => deleteMovie(movie.id)} style={iconButtonStyle}>
                  Del
                </button>
              </div>
            </div>

            <div style={{ padding: "9px 9px 11px" }}>
              <p style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.35, marginBottom: 3 }}>{movie.title}</p>
              <p style={{ fontSize: 11, color: "#667085", marginBottom: 4 }}>
                {[movie.year, movie.runtime, movie.imdbRating ? `IMDb ${movie.imdbRating}` : null].filter(Boolean).join(" - ")}
              </p>
              {movie.country && <p style={{ fontSize: 11, color: "#667085", marginBottom: 4 }}>{movie.country}</p>}
              <p style={{ fontSize: 12, color: "#111827", marginBottom: 4 }}>Your rating {formatDecimal(movie.rating)}</p>
              <div style={{ marginTop: 4 }}>
                {movie.genre.map((genre) => (
                  <span key={genre} style={{ display: "inline-block", fontSize: 10, background: "#eef4ff", color: "#475467", padding: "2px 7px", borderRadius: 99, marginRight: 3, marginTop: 3, border: "1px solid #d0d5dd" }}>
                    {genre}
                  </span>
                ))}
              </div>
              {movie.director && <p style={{ fontSize: 11, color: "#667085", marginTop: 5 }}>Dir. {movie.director}</p>}
              {(movie.startDate || movie.endDate || movie.addedDate) && (
                <div style={{ marginTop: 7, paddingTop: 7, borderTop: "0.5px solid #d9dee7" }}>
                  {movie.startDate && <p style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}>Started {formatDate(movie.startDate)}</p>}
                  {movie.endDate && <p style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}>Finished {formatDate(movie.endDate)}</p>}
                  {movie.addedDate && <p style={{ fontSize: 11, color: "#667085" }}>Added {formatDate(movie.addedDate)}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <YearAnalysis movies={movies} />

      <div className="card" style={{ marginTop: 24, marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Want to Watch</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Name</label>
            <input value={watchlistForm.name} onChange={(event) => setWatchlistField("name", event.target.value)} placeholder="Title to watch later" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 150 }}>
            <label style={labelStyle}>Type</label>
            <select value={watchlistForm.type} onChange={(event) => setWatchlistField("type", event.target.value)} style={{ width: "100%" }}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Country</label>
            <input value={watchlistForm.country} onChange={(event) => setWatchlistField("country", event.target.value)} placeholder="Country" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added Date</label>
            <input type="date" value={watchlistForm.addedDate} onChange={(event) => setWatchlistField("addedDate", event.target.value)} />
          </div>
          <button onClick={addToWatchlist} style={buttonStyle}>
            Add to Box
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          {sortedWatchlist.length === 0 ? (
            <p style={{ fontSize: 13, color: "#667085" }}>No watchlist items yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Country</th>
                    <th>Added Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWatchlist.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        {item.poster ? (
                          <img src={item.poster} alt={item.name} style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 48, height: 68, background: "#f2f4f7", borderRadius: 6 }} />
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>{TYPE_META[item.type]?.label || item.type}</td>
                      <td>{item.country || "-"}</td>
                      <td>{item.addedDate ? formatDate(item.addedDate) : "-"}</td>
                      <td>
                        <button onClick={() => deleteWatchlistItem(item.id)} style={ghostButtonStyle}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: "#667085", display: "block", marginBottom: 3 };

const buttonStyle = {
  padding: "9px 16px",
  background: "#111827",
  color: "#ffffff",
  border: "1px solid #111827",
  borderRadius: 8,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "9px 14px",
  background: "#f8fafc",
  color: "#111827",
  border: "1px solid #d0d5dd",
  borderRadius: 8,
  cursor: "pointer",
};

const ghostButtonStyle = {
  background: "transparent",
  color: "#475467",
  border: "1px solid #d0d5dd",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
};

const iconButtonStyle = {
  minWidth: 38,
  height: 24,
  borderRadius: 999,
  background: "rgba(0,0,0,0.75)",
  border: "1px solid rgba(255,255,255,0.24)",
  color: "#fff",
  fontSize: 10,
  cursor: "pointer",
};

const suggestBoxStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 20,
  background: "#ffffff",
  border: "1px solid #d0d5dd",
  borderRadius: 8,
  marginTop: 4,
  boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
  overflow: "hidden",
};

const suggestItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #d9dee7",
  background: "#ffffff",
};

const pillStyle = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 99,
  background: "#f7f8fa",
  color: "#111827",
  border: "1px solid #d0d5dd",
  whiteSpace: "nowrap",
};

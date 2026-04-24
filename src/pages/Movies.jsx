import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY || "";
const TYPES = ["Movie", "Series", "Documentary", "Anime"];
const EMPTY = {
  title: "",
  type: "Movie",
  year: new Date().getFullYear(),
  rating: 0,
  note: "",
  poster: "",
  imdbRating: "",
};

function Stars({ value, onChange }) {
  return (
    <span style={{ cursor: onChange ? "pointer" : "default" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange && onChange(star)}
          style={{
            color: star <= value ? "#fbbf24" : "#2e3248",
            fontSize: "1.05rem",
          }}
        >
          *
        </span>
      ))}
    </span>
  );
}

export default function Movies() {
  const [movies, setMovies] = useLocalStorage("dashboard-movies", [], 1);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const fetchFromOmdb = async () => {
    if (!form.title.trim()) return;

    if (!OMDB_KEY) {
      setFetchMessage("Add VITE_OMDB_API_KEY to use poster and IMDb fetching.");
      return;
    }

    setLoading(true);
    setFetchMessage("");

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(form.title)}&apikey=${OMDB_KEY}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        setForm((current) => ({
          ...current,
          poster: data.Poster !== "N/A" ? data.Poster : "",
          imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : "",
          year: data.Year && /^\d{4}$/.test(data.Year) ? Number(data.Year) : current.year,
        }));
        setFetchMessage("Movie info loaded.");
      } else {
        setFetchMessage(data.Error || "Movie not found.");
      }
    } catch {
      setFetchMessage("Could not fetch movie data right now.");
    } finally {
      setLoading(false);
    }
  };

  const addMovie = () => {
    if (!form.title.trim()) return;

    setMovies((current) => [{ ...form, id: Date.now() }, ...current]);
    setForm(EMPTY);
    setFetchMessage("");
  };

  const removeMovie = (id) => {
    setMovies((current) => current.filter((item) => item.id !== id));
  };

  const filteredMovies =
    filter === "All" ? movies : movies.filter((movie) => movie.type === filter);

  const byYear = movies.reduce((accumulator, movie) => {
    accumulator[movie.year] = (accumulator[movie.year] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1>Movies</h1>
        <p>Track movies, series, documentaries, and anime.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{movies.length}</div>
          <div className="stat-label">Total</div>
        </div>
        {TYPES.map((type) => (
          <div className="stat-card" key={type}>
            <div className="stat-value" style={{ color: "var(--accent2)" }}>
              {movies.filter((movie) => movie.type === type).length}
            </div>
            <div className="stat-label">{type}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Add Entry</div>
        <div className="form-row">
          <div className="input-group" style={{ flex: 3 }}>
            <label>Title</label>
            <input
              placeholder="Movie or series title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && fetchFromOmdb()}
            />
          </div>
          <div className="input-group">
            <label>Type</label>
            <select
              value={form.type}
              onChange={(event) => setField("type", event.target.value)}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Year Watched</label>
            <input
              type="number"
              min="1900"
              max="2099"
              value={form.year}
              onChange={(event) => setField("year", Number(event.target.value))}
            />
          </div>
          <div className="input-group">
            <label>My Rating</label>
            <Stars value={form.rating} onChange={(value) => setField("rating", value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Note</label>
            <input
              placeholder="Thoughts..."
              value={form.note}
              onChange={(event) => setField("note", event.target.value)}
            />
          </div>
          <button
            className="btn btn-ghost"
            onClick={fetchFromOmdb}
            style={{ alignSelf: "flex-end" }}
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch Poster"}
          </button>
          <button className="btn btn-primary" onClick={addMovie} style={{ alignSelf: "flex-end" }}>
            Add
          </button>
        </div>

        {fetchMessage && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 8 }}>
            {fetchMessage}
          </p>
        )}

        {form.poster && (
          <div style={{ marginTop: 12 }}>
            <img src={form.poster} alt="poster" style={{ height: 80, borderRadius: 6 }} />
            {form.imdbRating && (
              <span
                style={{ marginLeft: 12, color: "var(--warning)", fontFamily: "var(--mono)" }}
              >
                IMDb: {form.imdbRating}
              </span>
            )}
          </div>
        )}
      </div>

      {Object.keys(byYear).length > 0 && (
        <div className="card">
          <div className="card-title">Watched by Year</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(byYear)
              .sort(([left], [right]) => Number(right) - Number(left))
              .map(([year, count]) => (
                <div
                  key={year}
                  style={{
                    background: "var(--surface2)",
                    borderRadius: 8,
                    padding: "10px 18px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{year}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", ...TYPES].map((type) => (
          <button
            key={type}
            className={`btn ${filter === type ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredMovies.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">Film</div>
          <p>No entries yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="card"
              style={{ padding: 0, overflow: "hidden", position: "relative" }}
            >
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    background: "var(--surface2)",
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    color: "var(--muted)",
                  }}
                >
                  No poster
                </div>
              )}

              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
                  {movie.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                    {movie.type}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {movie.year}
                  </span>
                  {movie.imdbRating && (
                    <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>
                      IMDb {movie.imdbRating}
                    </span>
                  )}
                </div>
                <Stars value={movie.rating} />
                {movie.note && (
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 6 }}>
                    {movie.note}
                  </p>
                )}
              </div>

              <button
                className="btn btn-danger"
                onClick={() => removeMovie(movie.id)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "#fff",
                  padding: "3px 8px",
                  fontSize: "0.75rem",
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

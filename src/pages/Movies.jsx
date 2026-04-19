import { useState } from "react";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  async function addMovie() {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=trilogy`);
    const data = await res.json();
    setMovies([...movies, {
      id: Date.now(),
      title: data.Title || title,
      year: data.Year || "",
      poster: data.Poster !== "N/A" ? data.Poster : null,
      rating
    }]);
    setTitle(""); setLoading(false);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Movies</h2>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Movie title..." style={{ flex: 1, minWidth: 180 }}
            onKeyDown={e => e.key === "Enter" && addMovie()} />
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
          </select>
          <button onClick={addMovie} disabled={loading}>{loading ? "Searching..." : "Add"}</button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {movies.map(m => (
          <div key={m.id} className="card" style={{ width: 150, textAlign: "center", padding: 12 }}>
            {m.poster ? <img src={m.poster} style={{ width: 90, borderRadius: 4 }} />
              : <div style={{ width: 90, height: 120, background: "#eee", borderRadius: 4, margin: "0 auto" }} />}
            <p style={{ fontWeight: 500, fontSize: 13, marginTop: 8 }}>{m.title}</p>
            <p style={{ fontSize: 12, color: "#888" }}>{m.year}</p>
            <p style={{ fontSize: 13, color: "#f0a500" }}>{"★".repeat(m.rating)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
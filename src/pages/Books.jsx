import { useState } from "react";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  async function addBook() {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`);
    const data = await res.json();
    const book = data.docs[0];
    const cover = book?.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null;
    setBooks([...books, {
      id: Date.now(),
      title: book?.title || title,
      author: book?.author_name?.[0] || "Unknown",
      cover, rating
    }]);
    setTitle(""); setLoading(false);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Books</h2>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Book title..." style={{ flex: 1, minWidth: 180 }}
            onKeyDown={e => e.key === "Enter" && addBook()} />
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
          </select>
          <button onClick={addBook} disabled={loading}>{loading ? "Searching..." : "Add"}</button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {books.map(b => (
          <div key={b.id} className="card" style={{ width: 150, textAlign: "center", padding: 12 }}>
            {b.cover ? <img src={b.cover} style={{ width: 90, borderRadius: 4 }} />
              : <div style={{ width: 90, height: 120, background: "#eee", borderRadius: 4, margin: "0 auto" }} />}
            <p style={{ fontWeight: 500, fontSize: 13, marginTop: 8 }}>{b.title}</p>
            <p style={{ fontSize: 12, color: "#888" }}>{b.author}</p>
            <p style={{ fontSize: 13, color: "#f0a500" }}>{"★".repeat(b.rating)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
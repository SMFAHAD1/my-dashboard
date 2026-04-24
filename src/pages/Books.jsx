// src/pages/Books.jsx
import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function StarRating({ rating, max = 5, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          onClick={() => onChange && onChange(i + 1)}
          style={{ fontSize: 18, cursor: onChange ? "pointer" : "default",
            color: i < rating ? "#f0a500" : "#e0e0e0", lineHeight: 1 }}>
          ★
        </span>
      ))}
    </div>
  );
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

// ── Year-by-Year Analysis ─────────────────────────────────────────────────
function YearAnalysis({ books }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const reading = books.filter(b => b.section === "reading");
  if (!reading.length) return null;

  const yearMap = {};
  reading.forEach(b => {
    const yr = b.startDate ? b.startDate.split("-")[0] : "Not set";
    if (!yearMap[yr]) yearMap[yr] = { year: yr, items: [], ratingSum: 0, ratingCount: 0 };
    yearMap[yr].items.push(b);
    if (b.rating) { yearMap[yr].ratingSum += b.rating; yearMap[yr].ratingCount++; }
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxCount = Math.max(...years.map(y => y.items.length));

  return (
    <div style={{ marginTop: 32 }}>
      <Divider label="YEAR-BY-YEAR READING ANALYSIS" />
      <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 16, marginTop: -8 }}>Grouped by start reading year</p>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f0fe", color: "#185FA5", fontWeight: 500 }}>
          {reading.length} book{reading.length !== 1 ? "s" : ""} total
        </span>
        {(() => {
          const rated = reading.filter(b => b.rating);
          if (!rated.length) return null;
          const avg = (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1);
          return (
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#fff8e1", color: "#854F0B", fontWeight: 500 }}>
              ★ Avg rating: {avg}/5
            </span>
          );
        })()}
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11", fontWeight: 500 }}>
          {reading.filter(b => b.finishDate).length} finished
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {years.map(y => {
          const barPct = maxCount > 0 ? (y.items.length / maxCount) * 100 : 0;
          const avgRating = y.ratingCount > 0 ? (y.ratingSum / y.ratingCount).toFixed(1) : null;
          const isOpen = expandedYear === y.year;

          return (
            <div key={y.year} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", background: "#fafafa" }}>
              <div onClick={() => setExpandedYear(isOpen ? null : y.year)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 52, color: y.year === "Not set" ? "#aaa" : "#222" }}>{y.year}</span>
                <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: "#185FA5", borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#555", minWidth: 20, textAlign: "right" }}>{y.items.length}</span>
                {avgRating && (
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#fff8e1", color: "#854F0B", whiteSpace: "nowrap" }}>★ {avgRating}</span>
                )}
                <span style={{ fontSize: 11, color: "#aaa", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #eee" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {y.items.map(b => (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{b.title}</p>
                          {b.author && <p style={{ fontSize: 11, color: "#888" }}>{b.author}</p>}
                        </div>
                        {b.rating ? (
                          <span style={{ fontSize: 12, color: "#f0a500" }}>{"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)}</span>
                        ) : null}
                        <div style={{ fontSize: 10, color: "#aaa", textAlign: "right" }}>
                          {b.startDate && <div>Started {formatDate(b.startDate)}</div>}
                          {b.finishDate && <div>Finished {formatDate(b.finishDate)}</div>}
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

// ── Main ──────────────────────────────────────────────────────────────────
export default function Books() {
  const [books, setBooks] = useLocalStorage("dashboard-books", []);

  // Reading form
  const [rTitle, setRTitle]         = useState("");
  const [rAuthor, setRAuthor]       = useState("");
  const [rRating, setRRating]       = useState(0);
  const [rAdded, setRAdded]         = useState(today);
  const [rStart, setRStart]         = useState("");
  const [rFinish, setRFinish]       = useState("");

  // Buy list form
  const [bTitle, setBTitle]         = useState("");
  const [bAuthor, setBAuthor]       = useState("");
  const [bPrice, setBPrice]         = useState("");
  const [bCurrency, setBCurrency]   = useState("BDT");
  const [bNotes, setBNotes]         = useState("");

  function addReadingBook() {
    if (!rTitle.trim()) return;
    setBooks(prev => [...prev, {
      id: Date.now(), section: "reading",
      title: rTitle.trim(), author: rAuthor.trim(),
      rating: rRating, addedDate: rAdded,
      startDate: rStart, finishDate: rFinish,
    }]);
    setRTitle(""); setRAuthor(""); setRRating(0); setRAdded(today); setRStart(""); setRFinish("");
  }

  function addBuyBook() {
    if (!bTitle.trim()) return;
    setBooks(prev => [...prev, {
      id: Date.now(), section: "buy",
      title: bTitle.trim(), author: bAuthor.trim(),
      price: bPrice !== "" ? parseFloat(bPrice) : null, currency: bCurrency,
      notes: bNotes.trim(), addedDate: today,
    }]);
    setBTitle(""); setBAuthor(""); setBPrice(""); setBNotes("");
  }

  function deleteBook(id) { setBooks(prev => prev.filter(b => b.id !== id)); }
  function toggleBought(id) { setBooks(prev => prev.map(b => b.id === id ? { ...b, bought: !b.bought } : b)); }

  const readingBooks = books.filter(b => b.section === "reading");
  const buyBooks     = books.filter(b => b.section === "buy");
  const finished     = readingBooks.filter(b => b.finishDate).length;
  const totalBuyPrice = buyBooks.filter(b => !b.bought).reduce((s, b) => s + (b.price || 0), 0);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Books</h2>

      {/* Stats */}
      {books.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Reading List", value: readingBooks.length, bg: "#e8f0fe", color: "#185FA5" },
            { label: "Finished",     value: finished,            bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Buy List",     value: buyBooks.length,     bg: "#fff8e1", color: "#854F0B" },
            { label: "To Buy",       value: buyBooks.filter(b => !b.bought).length, bg: "#fce8e8", color: "#A32D2D" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 90, padding: "12px 14px", borderRadius: 10, background: s.bg, color: s.color, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
          {totalBuyPrice > 0 && (
            <div style={{ flex: 1, minWidth: 90, padding: "12px 14px", borderRadius: 10, background: "#f3e8ff", color: "#6B21A8", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{totalBuyPrice.toLocaleString()}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Est. Cost ({buyBooks[0]?.currency || "BDT"})</div>
            </div>
          )}
        </div>
      )}

      {/* ── Reading List ── */}
      <Divider label="READING LIST" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelSt}>Book title</label>
            <input value={rTitle} onChange={e => setRTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addReadingBook()}
              placeholder="Book title..." style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Author</label>
            <input value={rAuthor} onChange={e => setRAuthor(e.target.value)}
              placeholder="Author name" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={labelSt}>Rating (1–5)</label>
            <StarRating rating={rRating} onChange={setRRating} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Added date</label>
            <input type="date" value={rAdded} onChange={e => setRAdded(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Start reading</label>
            <input type="date" value={rStart} onChange={e => setRStart(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Finish date</label>
            <input type="date" value={rFinish} onChange={e => setRFinish(e.target.value)} />
          </div>
          <button onClick={addReadingBook} style={{ alignSelf: "flex-end" }}>Add Book</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {readingBooks.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No books yet.</p>
        )}
        {readingBooks.map(b => (
          <div key={b.id} className="card" style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{b.title}</p>
              {b.author && <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{b.author}</p>}
              {b.rating > 0 && (
                <div style={{ marginBottom: 4 }}>
                  <StarRating rating={b.rating} />
                </div>
              )}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {b.addedDate  && <span style={{ fontSize: 11, color: "#aaa" }}>Added {formatDate(b.addedDate)}</span>}
                {b.startDate  && <span style={{ fontSize: 11, color: "#888" }}>▶ Started {formatDate(b.startDate)}</span>}
                {b.finishDate && <span style={{ fontSize: 11, color: "#3B6D11", fontWeight: 500 }}>✓ Finished {formatDate(b.finishDate)}</span>}
              </div>
            </div>
            {b.finishDate && (
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11", fontWeight: 500, whiteSpace: "nowrap" }}>Done</span>
            )}
            <button onClick={() => deleteBook(b.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Year analysis */}
      <YearAnalysis books={books} />

      {/* ── Buy List ── */}
      <Divider label="BOOKS TO BUY" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelSt}>Book title</label>
            <input value={bTitle} onChange={e => setBTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addBuyBook()}
              placeholder="Book to buy..." style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Author</label>
            <input value={bAuthor} onChange={e => setBAuthor(e.target.value)}
              placeholder="Author" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={labelSt}>Price</label>
            <input type="number" min="0" value={bPrice} onChange={e => setBPrice(e.target.value)}
              placeholder="0" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 80 }}>
            <label style={labelSt}>Currency</label>
            <select value={bCurrency} onChange={e => setBCurrency(e.target.value)} style={{ width: "100%" }}>
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Notes</label>
            <input value={bNotes} onChange={e => setBNotes(e.target.value)}
              placeholder="Where to buy, edition..." style={{ width: "100%" }} />
          </div>
          <button onClick={addBuyBook} style={{ alignSelf: "flex-end" }}>Add</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {buyBooks.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No books on the buy list yet.</p>
        )}
        {buyBooks.map(b => (
          <div key={b.id} className="card"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: b.bought ? 0.55 : 1 }}>
            <div onClick={() => toggleBought(b.id)}
              style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                border: b.bought ? "none" : "2px solid #ddd", background: b.bought ? "#3B6D11" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>
              {b.bought ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14, textDecoration: b.bought ? "line-through" : "none", color: b.bought ? "#aaa" : "inherit" }}>{b.title}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                {b.author && <span style={{ fontSize: 12, color: "#888" }}>{b.author}</span>}
                {b.notes   && <span style={{ fontSize: 11, color: "#aaa" }}>{b.notes}</span>}
              </div>
            </div>
            {b.price != null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6B21A8", whiteSpace: "nowrap" }}>
                {b.currency} {b.price.toLocaleString()}
              </span>
            )}
            {b.bought && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11" }}>Bought</span>}
            <button onClick={() => deleteBook(b.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelSt = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };

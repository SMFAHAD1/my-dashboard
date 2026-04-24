// src/pages/Books.jsx
import { useState } from "react";
import { useSupabase } from "../hooks/useSupabase";

const today = new Date().toISOString().split("T")[0];

async function fetchBookCover(title, author = "") {
  try {
    const query = new URLSearchParams({
      title,
      ...(author ? { author } : {}),
      limit: "1",
    });
    const res = await fetch(`https://openlibrary.org/search.json?${query.toString()}`);
    const data = await res.json();
    const doc = data?.docs?.[0];
    if (doc?.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    if (doc?.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
  } catch {}
  return null;
}

function normalizeRating(value) {
  if (value === "" || value == null) return "";
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return "";
  return Math.max(0, Math.min(5, parsed));
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

function CoverThumb({ src, alt, kind = "book" }) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f8fafc" }} />;
  }
  return (
    <div style={{ width: 40, height: 56, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f8fafc", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>
      {kind === "book" ? "BOOK" : "POSTER"}
    </div>
  );
}

function YearAnalysis({ books }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const reading = books.filter((b) => b.section === "reading");
  if (!reading.length) return null;

  const yearMap = {};
  reading.forEach((b) => {
    const yr = b.startDate ? b.startDate.split("-")[0] : "Not set";
    if (!yearMap[yr]) yearMap[yr] = { year: yr, items: [], ratingSum: 0, ratingCount: 0 };
    yearMap[yr].items.push(b);
    const rating = normalizeRating(b.rating);
    if (rating !== "") {
      yearMap[yr].ratingSum += rating;
      yearMap[yr].ratingCount++;
    }
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxCount = Math.max(...years.map((y) => y.items.length));

  return (
    <div style={{ marginTop: 32 }}>
      <Divider label="YEAR-BY-YEAR READING ANALYSIS" />
      <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 16, marginTop: -8 }}>
        Grouped by start reading year
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f0fe", color: "#185FA5", fontWeight: 500 }}>
          {reading.length} book{reading.length !== 1 ? "s" : ""} total
        </span>
        {(() => {
          const rated = reading.map((b) => normalizeRating(b.rating)).filter((rating) => rating !== "");
          if (!rated.length) return null;
          const avg = (rated.reduce((s, rating) => s + rating, 0) / rated.length).toFixed(1);
          return (
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#fff8e1", color: "#854F0B", fontWeight: 500 }}>
              Avg rating: {avg}/5
            </span>
          );
        })()}
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11", fontWeight: 500 }}>
          {reading.filter((b) => b.finishDate).length} finished
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {years.map((y) => {
          const barPct = maxCount > 0 ? (y.items.length / maxCount) * 100 : 0;
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
                  <div style={{ width: `${barPct}%`, height: "100%", background: "#185FA5", borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#555", minWidth: 20, textAlign: "right" }}>{y.items.length}</span>
                {avgRating && (
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#fff8e1", color: "#854F0B", whiteSpace: "nowrap" }}>
                    {avgRating}/5
                  </span>
                )}
                <span style={{ fontSize: 11, color: "#aaa", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>v</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #eee" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {y.items.map((b) => (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
                        <CoverThumb src={b.cover} alt={b.title} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{b.title}</p>
                          {b.author && <p style={{ fontSize: 11, color: "#888" }}>{b.author}</p>}
                        </div>
                        {formatRating(b.rating) ? (
                          <span style={{ fontSize: 12, color: "#854F0B", fontWeight: 600 }}>{formatRating(b.rating)}/5</span>
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

export default function Books() {
  const [books, setBooks, loading] = useSupabase("dashboard-books", []);

  const [rTitle, setRTitle] = useState("");
  const [rAuthor, setRAuthor] = useState("");
  const [rRating, setRRating] = useState("");
  const [rAdded, setRAdded] = useState(today);
  const [rStart, setRStart] = useState("");
  const [rFinish, setRFinish] = useState("");

  const [bTitle, setBTitle] = useState("");
  const [bAuthor, setBAuthor] = useState("");
  const [bPrice, setBPrice] = useState("");
  const [bCurrency, setBCurrency] = useState("BDT");
  const [bNotes, setBNotes] = useState("");

  async function addReadingBook() {
    if (!rTitle.trim()) return;
    const cover = await fetchBookCover(rTitle.trim(), rAuthor.trim());
    setBooks((prev) => [
      ...prev,
      {
        id: Date.now(),
        section: "reading",
        title: rTitle.trim(),
        author: rAuthor.trim(),
        cover,
        rating: normalizeRating(rRating),
        addedDate: rAdded,
        startDate: rStart,
        finishDate: rFinish,
      },
    ]);
    setRTitle("");
    setRAuthor("");
    setRRating("");
    setRAdded(today);
    setRStart("");
    setRFinish("");
  }

  async function addBuyBook() {
    if (!bTitle.trim()) return;
    const cover = await fetchBookCover(bTitle.trim(), bAuthor.trim());
    setBooks((prev) => [
      ...prev,
      {
        id: Date.now(),
        section: "buy",
        title: bTitle.trim(),
        author: bAuthor.trim(),
        cover,
        price: bPrice !== "" ? parseFloat(bPrice) : null,
        currency: bCurrency,
        notes: bNotes.trim(),
        addedDate: today,
      },
    ]);
    setBTitle("");
    setBAuthor("");
    setBPrice("");
    setBNotes("");
  }

  function deleteBook(id) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  function toggleBought(id) {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, bought: !b.bought } : b)));
  }

  const readingBooks = books.filter((b) => b.section === "reading");
  const buyBooks = books.filter((b) => b.section === "buy");
  const finished = readingBooks.filter((b) => b.finishDate).length;
  const totalBuyPrice = buyBooks.filter((b) => !b.bought).reduce((s, b) => s + (b.price || 0), 0);

  if (loading) return <div style={{ padding: "32px" }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Books</h2>

      {books.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Reading List", value: readingBooks.length, bg: "#e8f0fe", color: "#185FA5" },
            { label: "Finished", value: finished, bg: "#e8f5e9", color: "#3B6D11" },
            { label: "Buy List", value: buyBooks.length, bg: "#fff8e1", color: "#854F0B" },
            { label: "To Buy", value: buyBooks.filter((b) => !b.bought).length, bg: "#fce8e8", color: "#A32D2D" },
          ].map((s) => (
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

      <Divider label="READING LIST" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelSt}>Book title</label>
            <input
              value={rTitle}
              onChange={(e) => setRTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addReadingBook()}
              placeholder="Book title..."
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Author</label>
            <input value={rAuthor} onChange={(e) => setRAuthor(e.target.value)} placeholder="Author name" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={labelSt}>Rating (0-5)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rRating}
              onChange={(e) => setRRating(e.target.value)}
              placeholder="e.g. 3.7"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Added date</label>
            <input type="date" value={rAdded} onChange={(e) => setRAdded(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Start reading</label>
            <input type="date" value={rStart} onChange={(e) => setRStart(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Finish date</label>
            <input type="date" value={rFinish} onChange={(e) => setRFinish(e.target.value)} />
          </div>
          <button onClick={addReadingBook} style={{ alignSelf: "flex-end" }}>Add Book</button>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        {readingBooks.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No books yet.</p>
        )}
        {readingBooks.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                    {["SL", "Cover", "Title", "Author", "Rating", "Added", "Start", "Finish", "Status", "Action"].map((head) => (
                      <th key={head} style={tableHead}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readingBooks.map((b, index) => (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: index === readingBooks.length - 1 ? "none" : "1px solid #eef2f7",
                        background: index % 2 === 0 ? "#ffffff" : "#fcfcfd",
                      }}
                    >
                      <td style={tableCell}>{index + 1}</td>
                      <td style={tableCell}><CoverThumb src={b.cover} alt={b.title} /></td>
                      <td style={tableCellTitle}>{b.title}</td>
                      <td style={tableCell}>{b.author || "-"}</td>
                      <td style={tableCell}>{formatRating(b.rating) ? `${formatRating(b.rating)}/5` : "-"}</td>
                      <td style={tableCell}>{b.addedDate ? formatDate(b.addedDate) : "-"}</td>
                      <td style={tableCell}>{b.startDate ? formatDate(b.startDate) : "-"}</td>
                      <td style={tableCell}>{b.finishDate ? formatDate(b.finishDate) : "-"}</td>
                      <td style={tableCell}>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: b.finishDate ? "#e8f5e9" : "#fff8e1",
                            color: b.finishDate ? "#3B6D11" : "#854F0B",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {b.finishDate ? "Done" : "Reading"}
                        </span>
                      </td>
                      <td style={tableCell}>
                        <button
                          onClick={() => deleteBook(b.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 12 }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <YearAnalysis books={books} />

      <Divider label="BOOKS TO BUY" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelSt}>Book title</label>
            <input
              value={bTitle}
              onChange={(e) => setBTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBuyBook()}
              placeholder="Book to buy..."
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Author</label>
            <input value={bAuthor} onChange={(e) => setBAuthor(e.target.value)} placeholder="Author" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={labelSt}>Price</label>
            <input type="number" min="0" value={bPrice} onChange={(e) => setBPrice(e.target.value)} placeholder="0" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 80 }}>
            <label style={labelSt}>Currency</label>
            <select value={bCurrency} onChange={(e) => setBCurrency(e.target.value)} style={{ width: "100%" }}>
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelSt}>Notes</label>
            <input
              value={bNotes}
              onChange={(e) => setBNotes(e.target.value)}
              placeholder="Where to buy, edition..."
              style={{ width: "100%" }}
            />
          </div>
          <button onClick={addBuyBook} style={{ alignSelf: "flex-end" }}>Add</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {buyBooks.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No books on the buy list yet.</p>
        )}
        {buyBooks.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: b.bought ? 0.55 : 1 }}
          >
            <CoverThumb src={b.cover} alt={b.title} />
            <div
              onClick={() => toggleBought(b.id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                flexShrink: 0,
                cursor: "pointer",
                border: b.bought ? "none" : "2px solid #ddd",
                background: b.bought ? "#3B6D11" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
              }}
            >
              {b.bought ? "OK" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14, textDecoration: b.bought ? "line-through" : "none", color: b.bought ? "#aaa" : "inherit" }}>
                {b.title}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                {b.author && <span style={{ fontSize: 12, color: "#888" }}>{b.author}</span>}
                {b.notes && <span style={{ fontSize: 11, color: "#aaa" }}>{b.notes}</span>}
              </div>
            </div>
            {b.price != null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6B21A8", whiteSpace: "nowrap" }}>
                {b.currency} {b.price.toLocaleString()}
              </span>
            )}
            {b.bought && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#e8f5e9", color: "#3B6D11" }}>Bought</span>}
            <button onClick={() => deleteBook(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 12 }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelSt = { fontSize: 11, color: "#888", display: "block", marginBottom: 3 };
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
  minWidth: 180,
};

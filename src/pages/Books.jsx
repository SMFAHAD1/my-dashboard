import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
      <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#9a9a9a", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
    </div>
  );
}

function YearAnalysis({ books }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const reading = books.filter((book) => book.section === "reading");
  if (!reading.length) return null;

  const yearMap = {};
  reading.forEach((book) => {
    const year = book.startDate ? book.startDate.split("-")[0] : "Not set";
    if (!yearMap[year]) yearMap[year] = { year, items: [], ratingSum: 0, ratingCount: 0 };
    yearMap[year].items.push(book);
    if (book.rating) {
      yearMap[year].ratingSum += Number(book.rating);
      yearMap[year].ratingCount += 1;
    }
  });

  const years = Object.values(yearMap).sort((a, b) => {
    if (a.year === "Not set") return 1;
    if (b.year === "Not set") return -1;
    return b.year.localeCompare(a.year);
  });

  const maxCount = Math.max(...years.map((entry) => entry.items.length));

  return (
    <div style={{ marginTop: 32 }}>
      <Divider label="YEAR-BY-YEAR READING ANALYSIS" />
      <p style={{ fontSize: 11, color: "#888", textAlign: "center", marginBottom: 16, marginTop: -8 }}>Grouped by start reading year</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={summaryPillStyle}>{reading.length} books total</span>
        {reading.filter((book) => book.rating).length > 0 && (
          <span style={summaryPillStyle}>
            Avg rating{" "}
            {(
              reading.filter((book) => book.rating).reduce((sum, book) => sum + Number(book.rating), 0) /
              reading.filter((book) => book.rating).length
            ).toFixed(1)}
            /10
          </span>
        )}
        <span style={summaryPillStyle}>{reading.filter((book) => book.finishDate).length} finished</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {years.map((entry) => {
          const barPercent = maxCount > 0 ? (entry.items.length / maxCount) * 100 : 0;
          const avgRating = entry.ratingCount > 0 ? (entry.ratingSum / entry.ratingCount).toFixed(1) : null;
          const isOpen = expandedYear === entry.year;

          return (
            <div key={entry.year} style={{ border: "1px solid #303030", borderRadius: 10, overflow: "hidden", background: "#121212" }}>
              <div
                onClick={() => setExpandedYear(isOpen ? null : entry.year)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}
              >
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 52, color: entry.year === "Not set" ? "#8e8e8e" : "#f0f0f0" }}>{entry.year}</span>
                <div style={{ flex: 1, height: 8, background: "#2c2c2c", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${barPercent}%`, height: "100%", background: "#f2f2f2", borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#c6c6c6", minWidth: 20, textAlign: "right" }}>{entry.items.length}</span>
                {avgRating && <span style={summaryPillStyle}>{avgRating}</span>}
                <span style={{ fontSize: 11, color: "#888", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>v</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #292929" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {entry.items.map((book) => (
                      <div key={book.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#181818", borderRadius: 8, border: "1px solid #2f2f2f" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{book.title}</p>
                          {book.author && <p style={{ fontSize: 11, color: "#9f9f9f" }}>{book.author}</p>}
                        </div>
                        {book.rating ? <span style={{ fontSize: 12, color: "#e2e2e2" }}>{formatRating(book.rating)}/10</span> : null}
                        <div style={{ fontSize: 10, color: "#8e8e8e", textAlign: "right" }}>
                          {book.startDate && <div>Started {formatDate(book.startDate)}</div>}
                          {book.finishDate && <div>Finished {formatDate(book.finishDate)}</div>}
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
  const [books, setBooks] = useLocalStorage("dashboard-books", [], 1);

  const [readingTitle, setReadingTitle] = useState("");
  const [readingAuthor, setReadingAuthor] = useState("");
  const [readingRating, setReadingRating] = useState("0");
  const [readingAdded, setReadingAdded] = useState(today);
  const [readingStart, setReadingStart] = useState("");
  const [readingFinish, setReadingFinish] = useState("");

  const [buyTitle, setBuyTitle] = useState("");
  const [buyAuthor, setBuyAuthor] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyCurrency, setBuyCurrency] = useState("BDT");
  const [buyNotes, setBuyNotes] = useState("");

  async function fetchBookCover(title, author) {
    if (!title) return "";
    try {
      const params = new URLSearchParams({ title, limit: "1" });
      if (author) params.set("author", author);
      const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
      const data = await response.json();
      const match = data.docs?.[0];
      if (match?.cover_i) return `https://covers.openlibrary.org/b/id/${match.cover_i}-M.jpg`;
      if (match?.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${match.isbn[0]}-M.jpg`;
      return "";
    } catch {
      return "";
    }
  }

  function addReadingBook() {
    if (!readingTitle.trim()) return;
    addReadingBookWithCover();
  }

  async function addReadingBookWithCover() {
    const title = readingTitle.trim();
    if (!title) return;
    const author = readingAuthor.trim();
    const coverUrl = await fetchBookCover(title, author);
    setBooks((current) => [
      ...current,
      {
        id: Date.now(),
        section: "reading",
        title,
        author,
        rating: readingRating !== "" ? Number(readingRating) : 0,
        coverUrl,
        addedDate: readingAdded,
        startDate: readingStart,
        finishDate: readingFinish,
      },
    ]);
    setReadingTitle("");
    setReadingAuthor("");
    setReadingRating("0");
    setReadingAdded(today);
    setReadingStart("");
    setReadingFinish("");
  }

  async function addBuyBook() {
    if (!buyTitle.trim()) return;
    const title = buyTitle.trim();
    const author = buyAuthor.trim();
    const coverUrl = await fetchBookCover(title, author);
    setBooks((current) => [
      ...current,
      {
        id: Date.now(),
        section: "buy",
        title,
        author,
        price: buyPrice !== "" ? parseFloat(buyPrice) : null,
        currency: buyCurrency,
        notes: buyNotes.trim(),
        coverUrl,
        addedDate: today,
      },
    ]);
    setBuyTitle("");
    setBuyAuthor("");
    setBuyPrice("");
    setBuyNotes("");
  }

  function deleteBook(id) {
    setBooks((current) => current.filter((book) => book.id !== id));
  }

  function toggleBought(id) {
    setBooks((current) => current.map((book) => (book.id === id ? { ...book, bought: !book.bought } : book)));
  }

  const readingBooks = books.filter((book) => book.section === "reading");
  const buyBooks = books.filter((book) => book.section === "buy");
  const sortedReadingBooks = [...readingBooks].sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || ""));
  const sortedBuyBooks = [...buyBooks].sort((a, b) => (b.addedDate || "").localeCompare(a.addedDate || ""));
  const finished = readingBooks.filter((book) => book.finishDate).length;
  const totalBuyPrice = buyBooks.filter((book) => !book.bought).reduce((sum, book) => sum + (book.price || 0), 0);

  useEffect(() => {
    const booksNeedingCovers = buyBooks.filter((book) => !book.coverUrl && book.title);
    if (!booksNeedingCovers.length) return;

    let cancelled = false;

    async function hydrateBuyCovers() {
      for (const book of booksNeedingCovers) {
        const coverUrl = await fetchBookCover(book.title, book.author || "");
        if (cancelled || !coverUrl) continue;

        setBooks((current) =>
          current.map((item) => (item.id === book.id && !item.coverUrl ? { ...item, coverUrl } : item))
        );
      }
    }

    hydrateBuyCovers();

    return () => {
      cancelled = true;
    };
  }, [books, setBooks]);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Books</h2>

      {books.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Reading List", value: readingBooks.length },
            { label: "Finished", value: finished },
            { label: "Buy List", value: buyBooks.length },
            { label: "To Buy", value: buyBooks.filter((book) => !book.bought).length },
          ].map((stat) => (
            <div key={stat.label} style={statCardStyle}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 10, marginTop: 2, color: "#9e9e9e" }}>{stat.label}</div>
            </div>
          ))}
          {totalBuyPrice > 0 && (
            <div style={statCardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{totalBuyPrice.toLocaleString()}</div>
              <div style={{ fontSize: 10, marginTop: 2, color: "#9e9e9e" }}>Est. Cost ({buyBooks[0]?.currency || "BDT"})</div>
            </div>
          )}
        </div>
      )}

      <Divider label="READING LIST" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Book Title</label>
            <input value={readingTitle} onChange={(event) => setReadingTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addReadingBook()} placeholder="Book title..." style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Author</label>
            <input value={readingAuthor} onChange={(event) => setReadingAuthor(event.target.value)} placeholder="Author name" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={labelStyle}>Rating (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={readingRating}
              onChange={(event) => setReadingRating(event.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Added Date</label>
            <input type="date" value={readingAdded} onChange={(event) => setReadingAdded(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Start Reading</label>
            <input type="date" value={readingStart} onChange={(event) => setReadingStart(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Finish Date</label>
            <input type="date" value={readingFinish} onChange={(event) => setReadingFinish(event.target.value)} />
          </div>
          <button onClick={addReadingBookWithCover} style={buttonStyle}>
            Add Book
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {readingBooks.length === 0 && (
          <p style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "20px 0" }}>No books yet.</p>
        )}
        {sortedReadingBooks.map((book, index) => (
          <div key={book.id} className="card" style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 0 }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: 999, background: "#1d1d1d", border: "1px solid #373737", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f1f1", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {index + 1}
            </div>
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} style={{ width: 54, height: 76, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 54, height: 76, borderRadius: 6, background: "#1f1f1f", flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{book.title}</p>
              {book.author && <p style={{ fontSize: 13, color: "#a4a4a4", marginBottom: 4 }}>{book.author}</p>}
              {book.rating > 0 && <div style={{ marginBottom: 4, fontSize: 13, color: "#efefef" }}>Rating {formatRating(book.rating)}/10</div>}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {book.addedDate && <span style={{ fontSize: 12, color: "#8f8f8f" }}>Added {formatDate(book.addedDate)}</span>}
                {book.startDate && <span style={{ fontSize: 12, color: "#a8a8a8" }}>Started {formatDate(book.startDate)}</span>}
                {book.finishDate && <span style={{ fontSize: 12, color: "#f1f1f1", fontWeight: 500 }}>Finished {formatDate(book.finishDate)}</span>}
              </div>
            </div>
            {book.finishDate && <span style={summaryPillStyle}>Done</span>}
            <button onClick={() => deleteBook(book.id)} style={ghostButtonStyle}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <YearAnalysis books={books} />

      <Divider label="BOOKS TO BUY" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Book Title</label>
            <input value={buyTitle} onChange={(event) => setBuyTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addBuyBook()} placeholder="Book to buy..." style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Author</label>
            <input value={buyAuthor} onChange={(event) => setBuyAuthor(event.target.value)} placeholder="Author" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={labelStyle}>Price</label>
            <input type="number" min="0" value={buyPrice} onChange={(event) => setBuyPrice(event.target.value)} placeholder="0" style={{ width: "100%" }} />
          </div>
          <div style={{ minWidth: 80 }}>
            <label style={labelStyle}>Currency</label>
            <select value={buyCurrency} onChange={(event) => setBuyCurrency(event.target.value)} style={{ width: "100%" }}>
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Notes</label>
            <input value={buyNotes} onChange={(event) => setBuyNotes(event.target.value)} placeholder="Where to buy, edition..." style={{ width: "100%" }} />
          </div>
          <button onClick={addBuyBook} style={buttonStyle}>
            Add
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {buyBooks.length === 0 && <p style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "20px 0" }}>No books on the buy list yet.</p>}
        {sortedBuyBooks.map((book, index) => (
          <div key={book.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: book.bought ? 0.55 : 1, marginBottom: 0 }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: 999, background: "#1d1d1d", border: "1px solid #373737", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f1f1", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {index + 1}
            </div>
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 48, height: 68, borderRadius: 6, background: "#1f1f1f", flexShrink: 0 }} />
            )}
            <div
              onClick={() => toggleBought(book.id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                flexShrink: 0,
                cursor: "pointer",
                border: book.bought ? "1px solid #888" : "2px solid #5d5d5d",
                background: book.bought ? "#f1f1f1" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#111",
              }}
            >
              {book.bought ? "OK" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14, textDecoration: book.bought ? "line-through" : "none", color: book.bought ? "#8f8f8f" : "inherit" }}>{book.title}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                {book.author && <span style={{ fontSize: 12, color: "#9f9f9f" }}>{book.author}</span>}
                {book.notes && <span style={{ fontSize: 11, color: "#8a8a8a" }}>{book.notes}</span>}
              </div>
            </div>
            {book.price != null && <span style={{ fontSize: 13, fontWeight: 700, color: "#f2f2f2", whiteSpace: "nowrap" }}>{book.currency} {book.price.toLocaleString()}</span>}
            {book.bought && <span style={summaryPillStyle}>Bought</span>}
            <button onClick={() => deleteBook(book.id)} style={ghostButtonStyle}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 12, color: "#9a9a9a", display: "block", marginBottom: 4 };

const statCardStyle = {
  flex: 1,
  minWidth: 90,
  padding: "12px 14px",
  borderRadius: 10,
  background: "#121212",
  color: "#f0f0f0",
  textAlign: "center",
  border: "1px solid #363636",
};

const buttonStyle = {
  alignSelf: "flex-end",
  background: "#f2f2f2",
  color: "#111111",
  border: "1px solid #676767",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 13,
};

const ghostButtonStyle = {
  background: "transparent",
  border: "1px solid #616161",
  cursor: "pointer",
  color: "#d3d3d3",
  borderRadius: 8,
  padding: "7px 11px",
  fontSize: 13,
};

const summaryPillStyle = {
  fontSize: 12,
  padding: "4px 12px",
  borderRadius: 99,
  background: "#171717",
  color: "#f1f1f1",
  fontWeight: 500,
  border: "1px solid #4a4a4a",
};

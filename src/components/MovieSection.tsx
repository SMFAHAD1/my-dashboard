"use client";

import { useState } from "react";

type MediaType = "Movie" | "Series";

interface MediaEntry {
  id: number;
  title: string;
  type: MediaType;
  rating: number;
  country: string;
  startDate: string;
  endDate: string;
  addedDate: string;
}

const initialData: MediaEntry[] = [
  {
    id: 1,
    title: "Oppenheimer",
    type: "Movie",
    rating: 9,
    country: "USA",
    startDate: "2023-07-21",
    endDate: "2023-07-21",
    addedDate: "2024-01-10",
  },
  {
    id: 2,
    title: "Breaking Bad",
    type: "Series",
    rating: 10,
    country: "USA",
    startDate: "2008-01-20",
    endDate: "2013-09-29",
    addedDate: "2024-02-05",
  },
  {
    id: 3,
    title: "Parasite",
    type: "Movie",
    rating: 9,
    country: "South Korea",
    startDate: "2019-05-30",
    endDate: "2019-05-30",
    addedDate: "2024-03-01",
  },
];

const COUNTRIES = [
  "USA", "UK", "South Korea", "Japan", "France", "Germany",
  "India", "Spain", "Italy", "Canada", "Australia", "Bangladesh",
  "China", "Brazil", "Mexico", "Turkey", "Sweden", "Denmark",
  "Norway", "Other",
];

const STAR_COLORS: Record<number, string> = {
  1: "#e24b4a", 2: "#e24b4a", 3: "#ef9f27",
  4: "#ef9f27", 5: "#ef9f27", 6: "#63991f",
  7: "#63991f", 8: "#1d9e75", 9: "#1d9e75", 10: "#1d9e75",
};

function RatingBadge({ rating }: { rating: number }) {
  const color = STAR_COLORS[rating] ?? "#888";
  return (
    <span
      style={{
        background: color + "22",
        color: color,
        border: `1px solid ${color}55`,
        borderRadius: "6px",
        padding: "2px 10px",
        fontWeight: 600,
        fontSize: "13px",
        letterSpacing: "0.02em",
        minWidth: "36px",
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {rating}/10
    </span>
  );
}

function TypeBadge({ type }: { type: MediaType }) {
  const isMovie = type === "Movie";
  return (
    <span
      style={{
        background: isMovie ? "#e6f1fb" : "#eeedfe",
        color: isMovie ? "#185fa5" : "#534ab7",
        border: `1px solid ${isMovie ? "#b5d4f4" : "#cecbf6"}`,
        borderRadius: "6px",
        padding: "2px 10px",
        fontWeight: 500,
        fontSize: "12px",
      }}
    >
      {type}
    </span>
  );
}

export default function MovieSection() {
  const [entries, setEntries] = useState<MediaEntry[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<"All" | MediaType>("All");
  const [sortBy, setSortBy] = useState<"addedDate" | "rating" | "title">("addedDate");
  const [editId, setEditId] = useState<number | null>(null);

  const emptyForm = {
    title: "",
    type: "Movie" as MediaType,
    rating: 7,
    country: "USA",
    startDate: "",
    endDate: "",
    addedDate: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) return;
    if (editId !== null) {
      setEntries((prev) =>
        prev.map((en) => (en.id === editId ? { ...form, id: editId } : en))
      );
      setEditId(null);
    } else {
      setEntries((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (entry: MediaEntry) => {
    setForm({
      title: entry.title,
      type: entry.type,
      rating: entry.rating,
      country: entry.country,
      startDate: entry.startDate,
      endDate: entry.endDate,
      addedDate: entry.addedDate,
    });
    setEditId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((en) => en.id !== id));
  };

  const filtered = entries
    .filter((en) => filterType === "All" || en.type === filterType)
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    });

  const avgRating =
    entries.length > 0
      ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1)
      : "—";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Movies &amp; Series
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track your watchlist with ratings and dates
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: entries.length },
          { label: "Movies", value: entries.filter((e) => e.type === "Movie").length },
          { label: "Series", value: entries.filter((e) => e.type === "Series").length },
          { label: "Avg Rating", value: avgRating },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(["All", "Movie", "Series"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filterType === t
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="addedDate">Sort: Date Added</option>
          <option value="rating">Sort: Rating</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {editId !== null ? "Edit Entry" : "Add New Entry"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. The Dark Knight"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Type *
                </label>
                <div className="flex gap-3 mt-1">
                  {(["Movie", "Series"] as MediaType[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={form.type === t}
                        onChange={() => setForm({ ...form, type: t })}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Rating: <span style={{ color: STAR_COLORS[form.rating] }} className="font-bold">{form.rating}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Country *
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Starting Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Ending Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Date Added *
                </label>
                <input
                  type="date"
                  required
                  value={form.addedDate}
                  onChange={(e) => setForm({ ...form, addedDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editId !== null ? "Save Changes" : "Add Entry"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">End</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Added</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400 dark:text-gray-500">
                    No entries yet. Click &quot;+ Add Entry&quot; to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{entry.title}</td>
                    <td className="px-4 py-3"><TypeBadge type={entry.type} /></td>
                    <td className="px-4 py-3"><RatingBadge rating={entry.rating} /></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{entry.country}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{entry.startDate || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{entry.endDate || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.addedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-xs px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-xs px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

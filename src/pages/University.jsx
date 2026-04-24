// src/pages/University.jsx
// Add to App.jsx: import University from "./pages/University";
// Add route: <Route path="/university" element={<University />} />
// Add NavLink: <NavLink to="/university">University</NavLink>

import { useState, useEffect } from "react";

// ── useLocalStorage hook (same as your existing one) ──────────────────────────
function useLocalStorage(key, initialValue, version = 1) {
  const versionedKey = `${key}__v${version}`;
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(versionedKey);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(versionedKey, JSON.stringify(state));
  }, [versionedKey, state]);
  return [state, setState];
}

// ── constants ─────────────────────────────────────────────────────────────────
const DEGREE_TYPES = ["Masters", "PhD"];
const STATUS_OPTIONS = ["Interested", "Researching", "Applied", "Accepted", "Rejected", "Enrolled"];
const STATUS_COLORS = {
  Interested:  { bg: "#171717", text: "#d4d4d4" },
  Researching: { bg: "#1f1f1f", text: "#e5e5e5" },
  Applied:     { bg: "#262626", text: "#f5f5f5" },
  Accepted:    { bg: "#2d2d2d", text: "#fafafa" },
  Rejected:    { bg: "#101010", text: "#bdbdbd" },
  Enrolled:    { bg: "#222222", text: "#ededed" },
};

const EMPTY_FORM = {
  id: null,
  degreeType: "Masters",
  universityName: "",
  ranking: "",
  country: "",
  status: "Interested",
  requirements: {
    gpa: "",
    ielts: "",
    toefl: "",
    gre: "",
    gmat: "",
    workExp: "",
    researchExp: "",
    sop: false,
    lor: "",
    cv: false,
    other: "",
  },
  deadline: "",
  tuitionFee: "",
  scholarship: "",
  additionalLinks: [{ label: "", url: "" }],
  notes: "",
};

// ── helpers ───────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function groupByDegree(universities) {
  return {
    Masters: universities.filter((u) => u.degreeType === "Masters"),
    PhD: universities.filter((u) => u.degreeType === "PhD"),
  };
}

// ── main component ────────────────────────────────────────────────────────────
export default function University() {
  const [universities, setUniversities] = useLocalStorage(
    "dashboard-universities",
    [],
    1
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("Masters");
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // ── form helpers ────────────────────────────────────────────────────────────
  const updateForm = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateReq = (field, value) =>
    setForm((f) => ({ ...f, requirements: { ...f.requirements, [field]: value } }));

  const addLink = () =>
    setForm((f) => ({
      ...f,
      additionalLinks: [...f.additionalLinks, { label: "", url: "" }],
    }));

  const updateLink = (i, field, value) =>
    setForm((f) => {
      const links = [...f.additionalLinks];
      links[i] = { ...links[i], [field]: value };
      return { ...f, additionalLinks: links };
    });

  const removeLink = (i) =>
    setForm((f) => ({
      ...f,
      additionalLinks: f.additionalLinks.filter((_, idx) => idx !== i),
    }));

  // ── save / edit / delete ────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, degreeType: activeTab });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (uni) => {
    setForm({ ...uni });
    setEditingId(uni.id);
    setShowForm(true);
  };

  const saveEntry = () => {
    if (!form.universityName.trim()) return;
    if (editingId) {
      setUniversities((prev) =>
        prev.map((u) => (u.id === editingId ? { ...form, id: editingId } : u))
      );
    } else {
      setUniversities((prev) => [...prev, { ...form, id: generateId() }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const deleteEntry = (id) => {
    setUniversities((prev) => prev.filter((u) => u.id !== id));
    setShowDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
  };

  // ── filtered list ───────────────────────────────────────────────────────────
  const grouped = groupByDegree(universities);
  const visibleList = (grouped[activeTab] || []).filter((u) => {
    const matchSearch =
      u.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── stats ───────────────────────────────────────────────────────────────────
  const stats = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = (grouped[activeTab] || []).filter((u) => u.status === s).length;
    return acc;
  }, {});

  // ── styles ──────────────────────────────────────────────────────────────────
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

    .uni-page {
      --uni-bg: #050505;
      --uni-surface: #101010;
      --uni-surface-soft: #171717;
      --uni-surface-strong: #1f1f1f;
      --uni-border: #2d2d2d;
      --uni-border-strong: #4a4a4a;
      --uni-text: #f5f5f5;
      --uni-text-soft: #cfcfcf;
      --uni-text-muted: #9a9a9a;
      --uni-text-faint: #6f6f6f;
      font-family: 'DM Sans', sans-serif;
      background: radial-gradient(circle at top, #1a1a1a 0%, #090909 40%, #030303 100%);
      min-height: 100vh;
      color: var(--uni-text);
      padding: 28px 20px 60px;
    }
    .uni-page * { box-sizing: border-box; }

    /* header */
    .uni-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .uni-title {
      font-family: 'DM Serif Display', serif;
      font-size: 2rem;
      color: #ffffff;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }
    .uni-subtitle { font-size: 0.82rem; color: var(--uni-text-muted); margin: 0; }

    /* tabs */
    .uni-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
    }
    .uni-tab {
      padding: 8px 24px;
      border-radius: 8px;
      border: 1.5px solid var(--uni-border);
      background: transparent;
      color: var(--uni-text-muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .uni-tab.active {
      background: var(--uni-surface-strong);
      border-color: #6d6d6d;
      color: #ffffff;
    }
    .uni-tab-count {
      display: inline-block;
      background: #242424;
      border-radius: 50px;
      padding: 0 7px;
      font-size: 0.75rem;
      margin-left: 6px;
    }

    /* stats strip */
    .uni-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .uni-stat-chip {
      padding: 5px 12px;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid var(--uni-border);
      transition: all 0.18s;
    }
    .uni-stat-chip.selected { outline: 2px solid #f5f5f5; outline-offset: 1px; }

    /* search + filter */
    .uni-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .uni-search {
      flex: 1;
      min-width: 180px;
      padding: 9px 14px;
      border-radius: 9px;
      border: 1.5px solid var(--uni-border);
      background: var(--uni-surface);
      color: var(--uni-text);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .uni-search:focus { border-color: #7a7a7a; }
    .uni-search::placeholder { color: var(--uni-text-faint); }

    .uni-filter-select {
      padding: 9px 12px;
      border-radius: 9px;
      border: 1.5px solid var(--uni-border);
      background: var(--uni-surface);
      color: var(--uni-text);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      outline: none;
      cursor: pointer;
    }

    /* add button */
    .uni-add-btn {
      padding: 9px 20px;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg, #f5f5f5, #bdbdbd);
      color: #050505;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .uni-add-btn:hover { opacity: 0.85; }

    /* card */
    .uni-card {
      border-radius: 14px;
      border: 1.5px solid var(--uni-border);
      background: rgba(16, 16, 16, 0.96);
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .uni-card:hover { border-color: var(--uni-border-strong); }

    .uni-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      cursor: pointer;
    }
    .uni-rank-badge {
      background: #0b0b0b;
      border: 1.5px solid #313131;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--uni-text-soft);
      font-weight: 600;
      white-space: nowrap;
      min-width: 52px;
      text-align: center;
    }
    .uni-card-main { flex: 1; min-width: 0; }
    .uni-card-name {
      font-weight: 600;
      font-size: 0.97rem;
      color: #ffffff;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .uni-card-meta { font-size: 0.78rem; color: var(--uni-text-muted); }

    .uni-status-pill {
      padding: 3px 11px;
      border-radius: 50px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .uni-card-actions { display: flex; gap: 6px; align-items: center; }
    .uni-icon-btn {
      background: transparent;
      border: 1px solid var(--uni-border);
      border-radius: 7px;
      color: var(--uni-text-muted);
      cursor: pointer;
      padding: 5px 8px;
      font-size: 0.82rem;
      transition: all 0.18s;
    }
    .uni-icon-btn:hover { border-color: #6d6d6d; color: #ffffff; }
    .uni-icon-btn.del:hover { border-color: #8c8c8c; color: #f0f0f0; }

    .uni-expand-icon { color: var(--uni-text-faint); font-size: 0.8rem; }

    /* expanded detail */
    .uni-detail {
      padding: 0 18px 18px;
      border-top: 1px solid #1f1f1f;
    }
    .uni-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .uni-detail-section {
      background: var(--uni-surface-soft);
      border-radius: 10px;
      padding: 14px;
    }
    .uni-detail-section-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--uni-text-faint);
      margin-bottom: 10px;
      font-weight: 600;
    }
    .uni-req-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 0.82rem;
    }
    .uni-req-label { color: var(--uni-text-muted); }
    .uni-req-value { color: var(--uni-text-soft); font-weight: 500; }
    .uni-req-check { color: #fafafa; font-weight: 700; }
    .uni-req-cross { color: #8a8a8a; font-weight: 700; }

    .uni-link-item {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 0.82rem;
    }
    .uni-link-item a {
      color: #f0f0f0;
      text-decoration: none;
      word-break: break-all;
    }
    .uni-link-item a:hover { text-decoration: underline; }

    .uni-notes-box {
      background: var(--uni-surface-soft);
      border-radius: 10px;
      padding: 12px 14px;
      margin-top: 14px;
      font-size: 0.83rem;
      color: var(--uni-text-soft);
      line-height: 1.6;
      border-left: 3px solid #5a5a5a;
    }

    /* empty state */
    .uni-empty {
      text-align: center;
      padding: 60px 20px;
      color: var(--uni-text-faint);
    }
    .uni-empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .uni-empty-text { font-size: 1rem; }

    /* ── MODAL ── */
    .uni-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      padding: 20px 12px 40px;
      overflow-y: auto;
    }
    .uni-modal {
      background: #0d0d0d;
      border: 1.5px solid var(--uni-border);
      border-radius: 16px;
      width: 100%;
      max-width: 680px;
      padding: 28px;
    }
    .uni-modal-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.4rem;
      color: #ffffff;
      margin: 0 0 22px;
    }

    .uni-form-section {
      margin-bottom: 22px;
    }
    .uni-form-section-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--uni-text-faint);
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #1f1f1f;
    }
    .uni-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .uni-form-grid.cols3 { grid-template-columns: 1fr 1fr 1fr; }
    .uni-form-grid.cols1 { grid-template-columns: 1fr; }

    .uni-field { display: flex; flex-direction: column; gap: 5px; }
    .uni-field.full { grid-column: 1 / -1; }
    .uni-label { font-size: 0.78rem; color: var(--uni-text-muted); font-weight: 500; }
    .uni-input, .uni-select, .uni-textarea {
      background: #111111;
      border: 1.5px solid var(--uni-border);
      border-radius: 8px;
      color: var(--uni-text);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.86rem;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .uni-input:focus, .uni-select:focus, .uni-textarea:focus { border-color: #7a7a7a; }
    .uni-input::placeholder, .uni-textarea::placeholder { color: var(--uni-text-faint); }
    .uni-textarea { resize: vertical; min-height: 80px; }

    .uni-check-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.84rem;
      color: var(--uni-text-soft);
      cursor: pointer;
    }
    .uni-check-row input[type="checkbox"] { cursor: pointer; accent-color: #d4d4d4; width: 15px; height: 15px; }

    .uni-deg-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }
    .uni-deg-btn {
      flex: 1;
      padding: 9px;
      border-radius: 8px;
      border: 1.5px solid var(--uni-border);
      background: transparent;
      color: var(--uni-text-muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .uni-deg-btn.active { background: #222222; border-color: #6d6d6d; color: #ffffff; }

    /* links */
    .uni-link-row {
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    .uni-remove-link {
      background: transparent;
      border: 1px solid #353535;
      border-radius: 6px;
      color: var(--uni-text-muted);
      cursor: pointer;
      padding: 5px 8px;
      font-size: 0.8rem;
      transition: all 0.18s;
    }
    .uni-remove-link:hover { border-color: #7a7a7a; color: #ffffff; }
    .uni-add-link-btn {
      background: transparent;
      border: 1px dashed #4a4a4a;
      border-radius: 7px;
      color: var(--uni-text-soft);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      cursor: pointer;
      padding: 7px 12px;
      width: 100%;
      transition: all 0.2s;
      margin-top: 4px;
    }
    .uni-add-link-btn:hover { border-color: #8a8a8a; color: #ffffff; }

    /* modal footer */
    .uni-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
    .uni-cancel-btn {
      padding: 9px 20px;
      border-radius: 8px;
      border: 1.5px solid var(--uni-border);
      background: transparent;
      color: var(--uni-text-soft);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      cursor: pointer;
    }
    .uni-save-btn {
      padding: 9px 24px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #f5f5f5, #bdbdbd);
      color: #050505;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      font-weight: 600;
      cursor: pointer;
    }
    .uni-save-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* confirm delete */
    .uni-confirm {
      background: #111111;
      border: 1.5px solid #353535;
      border-radius: 12px;
      padding: 18px;
      margin-top: 10px;
      font-size: 0.85rem;
      color: var(--uni-text-soft);
    }
    .uni-confirm-btns { display: flex; gap: 8px; margin-top: 12px; }
    .uni-confirm-del {
      padding: 7px 18px;
      border-radius: 7px;
      border: none;
      background: #f0f0f0;
      color: #050505;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .uni-confirm-cancel {
      padding: 7px 16px;
      border-radius: 7px;
      border: 1px solid #353535;
      background: transparent;
      color: var(--uni-text-muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem;
      cursor: pointer;
    }

    @media (max-width: 520px) {
      .uni-form-grid { grid-template-columns: 1fr; }
      .uni-form-grid.cols3 { grid-template-columns: 1fr 1fr; }
      .uni-link-row { grid-template-columns: 1fr 1fr auto; }
      .uni-modal { padding: 18px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="uni-page">

        {/* Header */}
        <div className="uni-header">
          <div>
            <h1 className="uni-title">🎓 University Tracker</h1>
            <p className="uni-subtitle">Track Masters & PhD applications across the world</p>
          </div>
          <button className="uni-add-btn" onClick={openAdd}>+ Add University</button>
        </div>

        {/* Degree tabs */}
        <div className="uni-tabs">
          {DEGREE_TYPES.map((dt) => (
            <button
              key={dt}
              className={`uni-tab ${activeTab === dt ? "active" : ""}`}
              onClick={() => { setActiveTab(dt); setExpandedId(null); setFilterStatus("All"); setSearchQuery(""); }}
            >
              {dt}
              <span className="uni-tab-count">{(grouped[dt] || []).length}</span>
            </button>
          ))}
        </div>

        {/* Status stats */}
        <div className="uni-stats">
          <span
            className={`uni-stat-chip ${filterStatus === "All" ? "selected" : ""}`}
            style={{ background: "#141414", color: "#cfcfcf", borderColor: "#2d2d2d" }}
            onClick={() => setFilterStatus("All")}
          >All {(grouped[activeTab] || []).length}</span>
          {STATUS_OPTIONS.map((s) => stats[s] > 0 && (
            <span
              key={s}
              className={`uni-stat-chip ${filterStatus === s ? "selected" : ""}`}
              style={{ background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, borderColor: "transparent" }}
              onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
            >{s} {stats[s]}</span>
          ))}
        </div>

        {/* Search + filter */}
        <div className="uni-controls">
          <input
            className="uni-search"
            placeholder="Search university or country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="uni-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Cards */}
        {visibleList.length === 0 ? (
          <div className="uni-empty">
            <div className="uni-empty-icon">🌐</div>
            <div className="uni-empty-text">
              {(grouped[activeTab] || []).length === 0
                ? `No ${activeTab} universities added yet. Click "Add University" to start.`
                : "No results match your search or filter."}
            </div>
          </div>
        ) : (
          visibleList.map((uni) => (
            <div key={uni.id} className="uni-card">
              <div className="uni-card-header" onClick={() => setExpandedId(expandedId === uni.id ? null : uni.id)}>
                <div className="uni-rank-badge">
                  {uni.ranking ? `#${uni.ranking}` : "—"}
                </div>
                <div className="uni-card-main">
                  <div className="uni-card-name">{uni.universityName}</div>
                  <div className="uni-card-meta">
                    {uni.country || "Country not set"}
                    {uni.deadline ? ` · Deadline: ${uni.deadline}` : ""}
                    {uni.tuitionFee ? ` · ${uni.tuitionFee}` : ""}
                  </div>
                </div>
                <span
                  className="uni-status-pill"
                  style={{ background: STATUS_COLORS[uni.status]?.bg, color: STATUS_COLORS[uni.status]?.text }}
                >{uni.status}</span>
                <div className="uni-card-actions">
                  <button className="uni-icon-btn" onClick={(e) => { e.stopPropagation(); openEdit(uni); }}>✏️</button>
                  <button className="uni-icon-btn del" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(uni.id); setExpandedId(uni.id); }}>🗑</button>
                </div>
                <span className="uni-expand-icon">{expandedId === uni.id ? "▲" : "▼"}</span>
              </div>

              {expandedId === uni.id && (
                <div className="uni-detail">

                  {/* delete confirm */}
                  {showDeleteConfirm === uni.id && (
                    <div className="uni-confirm">
                      Are you sure you want to delete <strong>{uni.universityName}</strong>? This cannot be undone.
                      <div className="uni-confirm-btns">
                        <button className="uni-confirm-del" onClick={() => deleteEntry(uni.id)}>Yes, Delete</button>
                        <button className="uni-confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="uni-detail-grid">
                    {/* Requirements */}
                    <div className="uni-detail-section">
                      <div className="uni-detail-section-title">📋 Requirements</div>
                      {uni.requirements.gpa && <div className="uni-req-row"><span className="uni-req-label">Min GPA</span><span className="uni-req-value">{uni.requirements.gpa}</span></div>}
                      {uni.requirements.ielts && <div className="uni-req-row"><span className="uni-req-label">IELTS</span><span className="uni-req-value">{uni.requirements.ielts}</span></div>}
                      {uni.requirements.toefl && <div className="uni-req-row"><span className="uni-req-label">TOEFL</span><span className="uni-req-value">{uni.requirements.toefl}</span></div>}
                      {uni.requirements.gre && <div className="uni-req-row"><span className="uni-req-label">GRE</span><span className="uni-req-value">{uni.requirements.gre}</span></div>}
                      {uni.requirements.gmat && <div className="uni-req-row"><span className="uni-req-label">GMAT</span><span className="uni-req-value">{uni.requirements.gmat}</span></div>}
                      {uni.requirements.workExp && <div className="uni-req-row"><span className="uni-req-label">Work Exp</span><span className="uni-req-value">{uni.requirements.workExp}</span></div>}
                      {uni.requirements.researchExp && <div className="uni-req-row"><span className="uni-req-label">Research</span><span className="uni-req-value">{uni.requirements.researchExp}</span></div>}
                      {uni.requirements.lor && <div className="uni-req-row"><span className="uni-req-label">LOR</span><span className="uni-req-value">{uni.requirements.lor} letters</span></div>}
                      <div className="uni-req-row"><span className="uni-req-label">SOP</span><span className={uni.requirements.sop ? "uni-req-check" : "uni-req-cross"}>{uni.requirements.sop ? "✓ Required" : "✗ Not required"}</span></div>
                      <div className="uni-req-row"><span className="uni-req-label">CV</span><span className={uni.requirements.cv ? "uni-req-check" : "uni-req-cross"}>{uni.requirements.cv ? "✓ Required" : "✗ Not required"}</span></div>
                      {uni.requirements.other && <div className="uni-req-row" style={{flexDirection:"column",alignItems:"flex-start",gap:4}}><span className="uni-req-label">Other</span><span className="uni-req-value" style={{fontSize:"0.79rem"}}>{uni.requirements.other}</span></div>}
                    </div>

                    {/* Financials + links */}
                    <div className="uni-detail-section">
                      <div className="uni-detail-section-title">💰 Financials & Links</div>
                      {uni.tuitionFee && <div className="uni-req-row"><span className="uni-req-label">Tuition</span><span className="uni-req-value">{uni.tuitionFee}</span></div>}
                      {uni.scholarship && <div className="uni-req-row"><span className="uni-req-label">Scholarship</span><span className="uni-req-value">{uni.scholarship}</span></div>}
                      {uni.deadline && <div className="uni-req-row"><span className="uni-req-label">Deadline</span><span className="uni-req-value">{uni.deadline}</span></div>}

                      {uni.additionalLinks?.filter(l => l.url).length > 0 && (
                        <>
                          <div style={{height:10}}/>
                          <div className="uni-detail-section-title" style={{marginBottom:8}}>🔗 Links</div>
                          {uni.additionalLinks.filter(l => l.url).map((link, i) => (
                            <div key={i} className="uni-link-item">
                              <span>→</span>
                              <a href={link.url.startsWith("http") ? link.url : "https://" + link.url} target="_blank" rel="noreferrer">
                                {link.label || link.url}
                              </a>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {uni.notes && (
                    <div className="uni-notes-box">
                      <strong style={{color:"#bdbdbd",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.8px"}}>Notes</strong>
                      <div style={{marginTop:6}}>{uni.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showForm && (
        <div className="uni-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="uni-modal">
            <h2 className="uni-modal-title">{editingId ? "Edit University" : "Add University"}</h2>

            {/* Degree type toggle */}
            <div className="uni-deg-toggle">
              {DEGREE_TYPES.map((dt) => (
                <button
                  key={dt}
                  className={`uni-deg-btn ${form.degreeType === dt ? "active" : ""}`}
                  onClick={() => updateForm("degreeType", dt)}
                >{dt}</button>
              ))}
            </div>

            {/* Basic info */}
            <div className="uni-form-section">
              <div className="uni-form-section-title">Basic Information</div>
              <div className="uni-form-grid">
                <div className="uni-field full">
                  <label className="uni-label">University Name *</label>
                  <input className="uni-input" placeholder="e.g. MIT, TU Berlin" value={form.universityName} onChange={(e) => updateForm("universityName", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Country</label>
                  <input className="uni-input" placeholder="e.g. USA, Germany" value={form.country} onChange={(e) => updateForm("country", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">World Ranking</label>
                  <input className="uni-input" placeholder="e.g. 50" type="number" min="1" value={form.ranking} onChange={(e) => updateForm("ranking", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Status</label>
                  <select className="uni-select" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="uni-field">
                  <label className="uni-label">Application Deadline</label>
                  <input className="uni-input" type="date" value={form.deadline} onChange={(e) => updateForm("deadline", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="uni-form-section">
              <div className="uni-form-section-title">Requirements</div>
              <div className="uni-form-grid cols3">
                <div className="uni-field">
                  <label className="uni-label">Min GPA</label>
                  <input className="uni-input" placeholder="e.g. 3.5 / 4.0" value={form.requirements.gpa} onChange={(e) => updateReq("gpa", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">IELTS Score</label>
                  <input className="uni-input" placeholder="e.g. 6.5" value={form.requirements.ielts} onChange={(e) => updateReq("ielts", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">TOEFL Score</label>
                  <input className="uni-input" placeholder="e.g. 90" value={form.requirements.toefl} onChange={(e) => updateReq("toefl", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">GRE Score</label>
                  <input className="uni-input" placeholder="e.g. 320" value={form.requirements.gre} onChange={(e) => updateReq("gre", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">GMAT Score</label>
                  <input className="uni-input" placeholder="e.g. 650" value={form.requirements.gmat} onChange={(e) => updateReq("gmat", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">LOR (# letters)</label>
                  <input className="uni-input" placeholder="e.g. 3" type="number" min="0" value={form.requirements.lor} onChange={(e) => updateReq("lor", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Work Experience</label>
                  <input className="uni-input" placeholder="e.g. 2 years" value={form.requirements.workExp} onChange={(e) => updateReq("workExp", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Research Experience</label>
                  <input className="uni-input" placeholder="e.g. 1 year / optional" value={form.requirements.researchExp} onChange={(e) => updateReq("researchExp", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                <label className="uni-check-row">
                  <input type="checkbox" checked={form.requirements.sop} onChange={(e) => updateReq("sop", e.target.checked)} />
                  SOP Required
                </label>
                <label className="uni-check-row">
                  <input type="checkbox" checked={form.requirements.cv} onChange={(e) => updateReq("cv", e.target.checked)} />
                  CV Required
                </label>
              </div>
              <div className="uni-field" style={{ marginTop: 12 }}>
                <label className="uni-label">Other Requirements</label>
                <input className="uni-input" placeholder="e.g. Writing sample, Portfolio, Interview…" value={form.requirements.other} onChange={(e) => updateReq("other", e.target.value)} />
              </div>
            </div>

            {/* Financials */}
            <div className="uni-form-section">
              <div className="uni-form-section-title">Financials</div>
              <div className="uni-form-grid">
                <div className="uni-field">
                  <label className="uni-label">Tuition Fee</label>
                  <input className="uni-input" placeholder="e.g. $50,000/year" value={form.tuitionFee} onChange={(e) => updateForm("tuitionFee", e.target.value)} />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Scholarship Info</label>
                  <input className="uni-input" placeholder="e.g. Merit-based, 50% available" value={form.scholarship} onChange={(e) => updateForm("scholarship", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="uni-form-section">
              <div className="uni-form-section-title">Additional Links</div>
              {form.additionalLinks.map((link, i) => (
                <div key={i} className="uni-link-row">
                  <input className="uni-input" placeholder="Label" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} />
                  <input className="uni-input" placeholder="https://…" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
                  <button className="uni-remove-link" onClick={() => removeLink(i)}>✕</button>
                </div>
              ))}
              <button className="uni-add-link-btn" onClick={addLink}>+ Add another link</button>
            </div>

            {/* Notes */}
            <div className="uni-form-section">
              <div className="uni-form-section-title">Notes</div>
              <textarea
                className="uni-textarea"
                placeholder="Any additional notes, contacts, thoughts…"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
              />
            </div>

            <div className="uni-modal-footer">
              <button className="uni-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="uni-save-btn" onClick={saveEntry} disabled={!form.universityName.trim()}>
                {editingId ? "Save Changes" : "Add University"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

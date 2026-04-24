import { useEffect, useMemo, useState } from "react";

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
  }, [state, versionedKey]);

  return [state, setState];
}

const DEGREE_TYPES = ["Masters", "PhD"];
const STATUS_OPTIONS = ["Interested", "Researching", "Applied", "Accepted", "Rejected", "Enrolled"];
const STATUS_COLORS = {
  Interested: { bg: "#1e3a5f", text: "#60b3f7" },
  Researching: { bg: "#2a2a00", text: "#f5d020" },
  Applied: { bg: "#1a2a3a", text: "#7ecfff" },
  Accepted: { bg: "#0d3320", text: "#4ade80" },
  Rejected: { bg: "#3a0d0d", text: "#f87171" },
  Enrolled: { bg: "#1e1060", text: "#a78bfa" },
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

function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function normalizeLink(url) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function cloneForm(data) {
  return {
    ...data,
    requirements: { ...EMPTY_FORM.requirements, ...data.requirements },
    additionalLinks:
      data.additionalLinks && data.additionalLinks.length
        ? data.additionalLinks.map((link) => ({ ...link }))
        : [{ label: "", url: "" }],
  };
}

export default function University() {
  const [universities, setUniversities] = useLocalStorage("dashboard-universities", [], 1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("Masters");
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateRequirement = (field, value) => {
    setForm((current) => ({
      ...current,
      requirements: { ...current.requirements, [field]: value },
    }));
  };

  const addLink = () => {
    setForm((current) => ({
      ...current,
      additionalLinks: [...current.additionalLinks, { label: "", url: "" }],
    }));
  };

  const updateLink = (index, field, value) => {
    setForm((current) => {
      const additionalLinks = [...current.additionalLinks];
      additionalLinks[index] = { ...additionalLinks[index], [field]: value };
      return { ...current, additionalLinks };
    });
  };

  const removeLink = (index) => {
    setForm((current) => {
      const remaining = current.additionalLinks.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...current,
        additionalLinks: remaining.length ? remaining : [{ label: "", url: "" }],
      };
    });
  };

  const openAdd = () => {
    setForm(cloneForm({ ...EMPTY_FORM, degreeType: activeTab }));
    setEditingId(null);
    setShowDeleteConfirm(null);
    setShowForm(true);
  };

  const openEdit = (university) => {
    setForm(cloneForm(university));
    setEditingId(university.id);
    setShowDeleteConfirm(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const saveEntry = () => {
    if (!form.universityName.trim()) return;

    const cleaned = {
      ...form,
      universityName: form.universityName.trim(),
      country: form.country.trim(),
      tuitionFee: form.tuitionFee.trim(),
      scholarship: form.scholarship.trim(),
      notes: form.notes.trim(),
      requirements: Object.fromEntries(
        Object.entries(form.requirements).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
      ),
      additionalLinks: form.additionalLinks
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.label || link.url),
    };

    if (editingId) {
      setUniversities((current) =>
        current.map((item) => (item.id === editingId ? { ...cleaned, id: editingId } : item))
      );
    } else {
      setUniversities((current) => [...current, { ...cleaned, id: generateId() }]);
    }

    closeForm();
  };

  const deleteEntry = (id) => {
    setUniversities((current) => current.filter((item) => item.id !== id));
    setShowDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
  };

  const grouped = useMemo(
    () => ({
      Masters: universities.filter((item) => item.degreeType === "Masters"),
      PhD: universities.filter((item) => item.degreeType === "PhD"),
    }),
    [universities]
  );

  const visibleList = useMemo(() => {
    return (grouped[activeTab] || []).filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        item.universityName.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query);
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [activeTab, filterStatus, grouped, searchQuery]);

  const stats = useMemo(
    () =>
      STATUS_OPTIONS.reduce((accumulator, status) => {
        accumulator[status] = (grouped[activeTab] || []).filter((item) => item.status === status).length;
        return accumulator;
      }, {}),
    [activeTab, grouped]
  );

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

    .uni-page {
      font-family: 'DM Sans', sans-serif;
      background: #0a0f1e;
      min-height: 100vh;
      color: #c8d6f0;
      padding: 28px 20px 60px;
    }
    .uni-page * { box-sizing: border-box; }
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
      color: #e8f0ff;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }
    .uni-subtitle { font-size: 0.82rem; color: #5a6a8a; margin: 0; }
    .uni-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
    }
    .uni-tab {
      padding: 8px 24px;
      border-radius: 8px;
      border: 1.5px solid #1e2d4a;
      background: transparent;
      color: #5a7aaa;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .uni-tab.active {
      background: #1a2d4a;
      border-color: #2d5a9e;
      color: #7ec8ff;
    }
    .uni-tab-count {
      display: inline-block;
      background: #0f1c30;
      border-radius: 50px;
      padding: 0 7px;
      font-size: 0.75rem;
      margin-left: 6px;
    }
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
      border: 1.5px solid transparent;
      transition: all 0.18s;
    }
    .uni-stat-chip.selected { outline: 2px solid #7ec8ff; outline-offset: 1px; }
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
      border: 1.5px solid #1e2d4a;
      background: #0e1625;
      color: #c8d6f0;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .uni-search:focus { border-color: #2d5a9e; }
    .uni-search::placeholder { color: #3a4a6a; }
    .uni-filter-select {
      padding: 9px 12px;
      border-radius: 9px;
      border: 1.5px solid #1e2d4a;
      background: #0e1625;
      color: #c8d6f0;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      outline: none;
      cursor: pointer;
    }
    .uni-add-btn {
      padding: 9px 20px;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg, #1a4a8a, #2d6acc);
      color: #e8f4ff;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .uni-add-btn:hover { opacity: 0.85; }
    .uni-card {
      border-radius: 14px;
      border: 1.5px solid #1a2a3e;
      background: #0e1625;
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .uni-card:hover { border-color: #2a4a7a; }
    .uni-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      cursor: pointer;
    }
    .uni-rank-badge {
      background: #0a1525;
      border: 1.5px solid #1e3555;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.75rem;
      color: #5a8aaa;
      font-weight: 600;
      white-space: nowrap;
      min-width: 52px;
      text-align: center;
    }
    .uni-card-main { flex: 1; min-width: 0; }
    .uni-card-name {
      font-weight: 600;
      font-size: 0.97rem;
      color: #dce8ff;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .uni-card-meta { font-size: 0.78rem; color: #4a6080; }
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
      border: 1px solid #1e2d4a;
      border-radius: 7px;
      color: #4a6080;
      cursor: pointer;
      padding: 5px 8px;
      font-size: 0.82rem;
      transition: all 0.18s;
    }
    .uni-icon-btn:hover { border-color: #3a6aaa; color: #7ec8ff; }
    .uni-icon-btn.del:hover { border-color: #8a2020; color: #f87171; }
    .uni-expand-icon { color: #3a5070; font-size: 0.8rem; }
    .uni-detail {
      padding: 0 18px 18px;
      border-top: 1px solid #141f30;
    }
    .uni-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .uni-detail-section {
      background: #0a1220;
      border-radius: 10px;
      padding: 14px;
    }
    .uni-detail-section-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #3a5070;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .uni-req-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 0.82rem;
      gap: 10px;
    }
    .uni-req-label { color: #4a6080; }
    .uni-req-value { color: #9ab8d8; font-weight: 500; text-align: right; }
    .uni-req-check { color: #4ade80; font-weight: 700; }
    .uni-req-cross { color: #f87171; font-weight: 700; }
    .uni-link-item {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 0.82rem;
    }
    .uni-link-item a {
      color: #60b3f7;
      text-decoration: none;
      word-break: break-all;
    }
    .uni-link-item a:hover { text-decoration: underline; }
    .uni-notes-box {
      background: #0a1220;
      border-radius: 10px;
      padding: 12px 14px;
      margin-top: 14px;
      font-size: 0.83rem;
      color: #6a8aaa;
      line-height: 1.6;
      border-left: 3px solid #1a3a6a;
    }
    .uni-empty {
      text-align: center;
      padding: 60px 20px;
      color: #2a3a5a;
    }
    .uni-empty-icon { font-size: 2rem; margin-bottom: 12px; }
    .uni-empty-text { font-size: 1rem; }
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
      background: #0e1625;
      border: 1.5px solid #1e2d4a;
      border-radius: 16px;
      width: 100%;
      max-width: 680px;
      padding: 28px;
    }
    .uni-modal-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.4rem;
      color: #e0ecff;
      margin: 0 0 22px;
    }
    .uni-form-section { margin-bottom: 22px; }
    .uni-form-section-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #3a5070;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #141f30;
    }
    .uni-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .uni-form-grid.cols3 { grid-template-columns: 1fr 1fr 1fr; }
    .uni-field { display: flex; flex-direction: column; gap: 5px; }
    .uni-field.full { grid-column: 1 / -1; }
    .uni-label { font-size: 0.78rem; color: #4a6080; font-weight: 500; }
    .uni-input, .uni-select, .uni-textarea {
      background: #0a1220;
      border: 1.5px solid #1a2a3e;
      border-radius: 8px;
      color: #c8d6f0;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.86rem;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .uni-input:focus, .uni-select:focus, .uni-textarea:focus { border-color: #2d5a9e; }
    .uni-input::placeholder, .uni-textarea::placeholder { color: #2a3a5a; }
    .uni-textarea { resize: vertical; min-height: 80px; }
    .uni-check-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.84rem;
      color: #7a9aba;
      cursor: pointer;
    }
    .uni-check-row input[type="checkbox"] { cursor: pointer; accent-color: #3a7adc; width: 15px; height: 15px; }
    .uni-deg-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }
    .uni-deg-btn {
      flex: 1;
      padding: 9px;
      border-radius: 8px;
      border: 1.5px solid #1e2d4a;
      background: transparent;
      color: #4a6080;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .uni-deg-btn.active { background: #1a3a6a; border-color: #2d6acc; color: #7ec8ff; }
    .uni-link-row {
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    .uni-remove-link {
      background: transparent;
      border: 1px solid #2a1a1a;
      border-radius: 6px;
      color: #6a3a3a;
      cursor: pointer;
      padding: 5px 8px;
      font-size: 0.8rem;
      transition: all 0.18s;
    }
    .uni-remove-link:hover { border-color: #8a2020; color: #f87171; }
    .uni-add-link-btn {
      background: transparent;
      border: 1px dashed #1e3050;
      border-radius: 7px;
      color: #3a6090;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      cursor: pointer;
      padding: 7px 12px;
      width: 100%;
      transition: all 0.2s;
      margin-top: 4px;
    }
    .uni-add-link-btn:hover { border-color: #2d6acc; color: #7ec8ff; }
    .uni-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
    .uni-cancel-btn {
      padding: 9px 20px;
      border-radius: 8px;
      border: 1.5px solid #1e2d4a;
      background: transparent;
      color: #5a7aaa;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      cursor: pointer;
    }
    .uni-save-btn {
      padding: 9px 24px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #1a4a8a, #2d6acc);
      color: #e8f4ff;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.87rem;
      font-weight: 600;
      cursor: pointer;
    }
    .uni-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .uni-confirm {
      background: #150a0a;
      border: 1.5px solid #3a1010;
      border-radius: 12px;
      padding: 18px;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #c07070;
    }
    .uni-confirm-btns { display: flex; gap: 8px; margin-top: 12px; }
    .uni-confirm-del {
      padding: 7px 18px;
      border-radius: 7px;
      border: none;
      background: #8a1515;
      color: #ffc0c0;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .uni-confirm-cancel {
      padding: 7px 16px;
      border-radius: 7px;
      border: 1px solid #2a1a1a;
      background: transparent;
      color: #6a4a4a;
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
        <div className="uni-header">
          <div>
            <h1 className="uni-title">University Tracker</h1>
            <p className="uni-subtitle">Track Masters and PhD applications in one place.</p>
          </div>
          <button className="uni-add-btn" onClick={openAdd}>
            Add University
          </button>
        </div>

        <div className="uni-tabs">
          {DEGREE_TYPES.map((degreeType) => (
            <button
              key={degreeType}
              className={`uni-tab ${activeTab === degreeType ? "active" : ""}`}
              onClick={() => {
                setActiveTab(degreeType);
                setExpandedId(null);
                setFilterStatus("All");
                setSearchQuery("");
              }}
            >
              {degreeType}
              <span className="uni-tab-count">{(grouped[degreeType] || []).length}</span>
            </button>
          ))}
        </div>

        <div className="uni-stats">
          <span
            className={`uni-stat-chip ${filterStatus === "All" ? "selected" : ""}`}
            style={{ background: "#111a2a", color: "#4a6080", borderColor: "#1e2d4a" }}
            onClick={() => setFilterStatus("All")}
          >
            All {(grouped[activeTab] || []).length}
          </span>
          {STATUS_OPTIONS.map((status) =>
            stats[status] > 0 ? (
              <span
                key={status}
                className={`uni-stat-chip ${filterStatus === status ? "selected" : ""}`}
                style={{
                  background: STATUS_COLORS[status].bg,
                  color: STATUS_COLORS[status].text,
                  borderColor: "transparent",
                }}
                onClick={() => setFilterStatus(filterStatus === status ? "All" : status)}
              >
                {status} {stats[status]}
              </span>
            ) : null
          )}
        </div>

        <div className="uni-controls">
          <input
            className="uni-search"
            placeholder="Search university or country..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className="uni-filter-select"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {visibleList.length === 0 ? (
          <div className="uni-empty">
            <div className="uni-empty-icon">No entries</div>
            <div className="uni-empty-text">
              {(grouped[activeTab] || []).length === 0
                ? `No ${activeTab} universities added yet.`
                : "No results match your search or filter."}
            </div>
          </div>
        ) : (
          visibleList.map((university) => (
            <div key={university.id} className="uni-card">
              <div
                className="uni-card-header"
                onClick={() => setExpandedId(expandedId === university.id ? null : university.id)}
              >
                <div className="uni-rank-badge">
                  {university.ranking ? `#${university.ranking}` : "-"}
                </div>
                <div className="uni-card-main">
                  <div className="uni-card-name">{university.universityName}</div>
                  <div className="uni-card-meta">
                    {university.country || "Country not set"}
                    {university.deadline ? ` - Deadline: ${university.deadline}` : ""}
                    {university.tuitionFee ? ` - ${university.tuitionFee}` : ""}
                  </div>
                </div>
                <span
                  className="uni-status-pill"
                  style={{
                    background: STATUS_COLORS[university.status]?.bg,
                    color: STATUS_COLORS[university.status]?.text,
                  }}
                >
                  {university.status}
                </span>
                <div className="uni-card-actions">
                  <button
                    className="uni-icon-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(university);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="uni-icon-btn del"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowDeleteConfirm(university.id);
                      setExpandedId(university.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <span className="uni-expand-icon">{expandedId === university.id ? "Hide" : "Show"}</span>
              </div>

              {expandedId === university.id && (
                <div className="uni-detail">
                  {showDeleteConfirm === university.id && (
                    <div className="uni-confirm">
                      Are you sure you want to delete <strong>{university.universityName}</strong>?
                      <div className="uni-confirm-btns">
                        <button className="uni-confirm-del" onClick={() => deleteEntry(university.id)}>
                          Yes, Delete
                        </button>
                        <button className="uni-confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="uni-detail-grid">
                    <div className="uni-detail-section">
                      <div className="uni-detail-section-title">Requirements</div>
                      {university.requirements.gpa && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Min GPA</span>
                          <span className="uni-req-value">{university.requirements.gpa}</span>
                        </div>
                      )}
                      {university.requirements.ielts && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">IELTS</span>
                          <span className="uni-req-value">{university.requirements.ielts}</span>
                        </div>
                      )}
                      {university.requirements.toefl && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">TOEFL</span>
                          <span className="uni-req-value">{university.requirements.toefl}</span>
                        </div>
                      )}
                      {university.requirements.gre && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">GRE</span>
                          <span className="uni-req-value">{university.requirements.gre}</span>
                        </div>
                      )}
                      {university.requirements.gmat && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">GMAT</span>
                          <span className="uni-req-value">{university.requirements.gmat}</span>
                        </div>
                      )}
                      {university.requirements.workExp && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Work Experience</span>
                          <span className="uni-req-value">{university.requirements.workExp}</span>
                        </div>
                      )}
                      {university.requirements.researchExp && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Research Experience</span>
                          <span className="uni-req-value">{university.requirements.researchExp}</span>
                        </div>
                      )}
                      {university.requirements.lor && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">LOR</span>
                          <span className="uni-req-value">{university.requirements.lor} letters</span>
                        </div>
                      )}
                      <div className="uni-req-row">
                        <span className="uni-req-label">SOP</span>
                        <span className={university.requirements.sop ? "uni-req-check" : "uni-req-cross"}>
                          {university.requirements.sop ? "Required" : "Not required"}
                        </span>
                      </div>
                      <div className="uni-req-row">
                        <span className="uni-req-label">CV</span>
                        <span className={university.requirements.cv ? "uni-req-check" : "uni-req-cross"}>
                          {university.requirements.cv ? "Required" : "Not required"}
                        </span>
                      </div>
                      {university.requirements.other && (
                        <div className="uni-req-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                          <span className="uni-req-label">Other</span>
                          <span className="uni-req-value" style={{ textAlign: "left" }}>
                            {university.requirements.other}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="uni-detail-section">
                      <div className="uni-detail-section-title">Financials and Links</div>
                      {university.tuitionFee && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Tuition</span>
                          <span className="uni-req-value">{university.tuitionFee}</span>
                        </div>
                      )}
                      {university.scholarship && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Scholarship</span>
                          <span className="uni-req-value">{university.scholarship}</span>
                        </div>
                      )}
                      {university.deadline && (
                        <div className="uni-req-row">
                          <span className="uni-req-label">Deadline</span>
                          <span className="uni-req-value">{university.deadline}</span>
                        </div>
                      )}

                      {university.additionalLinks?.filter((link) => link.url).length > 0 && (
                        <>
                          <div style={{ height: 10 }} />
                          <div className="uni-detail-section-title" style={{ marginBottom: 8 }}>
                            Links
                          </div>
                          {university.additionalLinks
                            .filter((link) => link.url)
                            .map((link, index) => (
                              <div key={index} className="uni-link-item">
                                <span>Link</span>
                                <a href={normalizeLink(link.url)} target="_blank" rel="noreferrer">
                                  {link.label || link.url}
                                </a>
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  </div>

                  {university.notes && (
                    <div className="uni-notes-box">
                      <strong
                        style={{
                          color: "#4a6080",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        Notes
                      </strong>
                      <div style={{ marginTop: 6 }}>{university.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="uni-modal-overlay" onClick={(event) => event.target === event.currentTarget && closeForm()}>
          <div className="uni-modal">
            <h2 className="uni-modal-title">{editingId ? "Edit University" : "Add University"}</h2>

            <div className="uni-deg-toggle">
              {DEGREE_TYPES.map((degreeType) => (
                <button
                  key={degreeType}
                  className={`uni-deg-btn ${form.degreeType === degreeType ? "active" : ""}`}
                  onClick={() => updateForm("degreeType", degreeType)}
                >
                  {degreeType}
                </button>
              ))}
            </div>

            <div className="uni-form-section">
              <div className="uni-form-section-title">Basic Information</div>
              <div className="uni-form-grid">
                <div className="uni-field full">
                  <label className="uni-label">University Name</label>
                  <input
                    className="uni-input"
                    placeholder="e.g. MIT or TU Berlin"
                    value={form.universityName}
                    onChange={(event) => updateForm("universityName", event.target.value)}
                  />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Country</label>
                  <input
                    className="uni-input"
                    placeholder="e.g. USA or Germany"
                    value={form.country}
                    onChange={(event) => updateForm("country", event.target.value)}
                  />
                </div>
                <div className="uni-field">
                  <label className="uni-label">World Ranking</label>
                  <input
                    className="uni-input"
                    placeholder="e.g. 50"
                    type="number"
                    min="1"
                    value={form.ranking}
                    onChange={(event) => updateForm("ranking", event.target.value)}
                  />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Status</label>
                  <select
                    className="uni-select"
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="uni-field">
                  <label className="uni-label">Application Deadline</label>
                  <input
                    className="uni-input"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => updateForm("deadline", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="uni-form-section">
              <div className="uni-form-section-title">Requirements</div>
              <div className="uni-form-grid cols3">
                {[
                  ["gpa", "Min GPA", "e.g. 3.5 / 4.0"],
                  ["ielts", "IELTS", "e.g. 6.5"],
                  ["toefl", "TOEFL", "e.g. 90"],
                  ["gre", "GRE", "e.g. 320"],
                  ["gmat", "GMAT", "e.g. 650"],
                  ["lor", "LOR Letters", "e.g. 3"],
                  ["workExp", "Work Experience", "e.g. 2 years"],
                  ["researchExp", "Research Experience", "e.g. optional"],
                ].map(([key, label, placeholder]) => (
                  <div className="uni-field" key={key}>
                    <label className="uni-label">{label}</label>
                    <input
                      className="uni-input"
                      placeholder={placeholder}
                      value={form.requirements[key]}
                      onChange={(event) => updateRequirement(key, event.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                <label className="uni-check-row">
                  <input
                    type="checkbox"
                    checked={form.requirements.sop}
                    onChange={(event) => updateRequirement("sop", event.target.checked)}
                  />
                  SOP Required
                </label>
                <label className="uni-check-row">
                  <input
                    type="checkbox"
                    checked={form.requirements.cv}
                    onChange={(event) => updateRequirement("cv", event.target.checked)}
                  />
                  CV Required
                </label>
              </div>

              <div className="uni-field" style={{ marginTop: 12 }}>
                <label className="uni-label">Other Requirements</label>
                <input
                  className="uni-input"
                  placeholder="e.g. portfolio, interview, writing sample"
                  value={form.requirements.other}
                  onChange={(event) => updateRequirement("other", event.target.value)}
                />
              </div>
            </div>

            <div className="uni-form-section">
              <div className="uni-form-section-title">Financials</div>
              <div className="uni-form-grid">
                <div className="uni-field">
                  <label className="uni-label">Tuition Fee</label>
                  <input
                    className="uni-input"
                    placeholder="e.g. $50,000/year"
                    value={form.tuitionFee}
                    onChange={(event) => updateForm("tuitionFee", event.target.value)}
                  />
                </div>
                <div className="uni-field">
                  <label className="uni-label">Scholarship Info</label>
                  <input
                    className="uni-input"
                    placeholder="e.g. 50% merit scholarship"
                    value={form.scholarship}
                    onChange={(event) => updateForm("scholarship", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="uni-form-section">
              <div className="uni-form-section-title">Additional Links</div>
              {form.additionalLinks.map((link, index) => (
                <div key={index} className="uni-link-row">
                  <input
                    className="uni-input"
                    placeholder="Label"
                    value={link.label}
                    onChange={(event) => updateLink(index, "label", event.target.value)}
                  />
                  <input
                    className="uni-input"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(event) => updateLink(index, "url", event.target.value)}
                  />
                  <button className="uni-remove-link" onClick={() => removeLink(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button className="uni-add-link-btn" onClick={addLink}>
                Add another link
              </button>
            </div>

            <div className="uni-form-section">
              <div className="uni-form-section-title">Notes</div>
              <textarea
                className="uni-textarea"
                placeholder="Any notes, contacts, or reminders"
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
              />
            </div>

            <div className="uni-modal-footer">
              <button className="uni-cancel-btn" onClick={closeForm}>
                Cancel
              </button>
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

import { useEffect, useMemo, useState } from "react";
import { useFirestore } from "../hooks/useFirestore";

const DEGREE_TYPES = ["Masters", "PhD"];
const STATUS_OPTIONS = ["Interested", "Researching", "Applied", "Accepted", "Rejected", "Enrolled"];
const STATUS_STYLES = {
  Interested: { bg: "#eef4ff", text: "#111827" },
  Researching: { bg: "#f2f4f7", text: "#2563eb" },
  Applied: { bg: "#f7f8fa", text: "#111827" },
  Accepted: { bg: "#f2f4f7", text: "#111827" },
  Rejected: { bg: "#f2f4f7", text: "#475467" },
  Enrolled: { bg: "#eef2ff", text: "#111827" },
};

const EMPTY_FORM = {
  id: null,
  degreeType: "Masters",
  universityName: "",
  ranking: "",
  country: "",
  status: "Interested",
  workPolicy: "Not set",
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

function cloneEntry(entry) {
  return {
    ...entry,
    requirements: { ...EMPTY_FORM.requirements, ...entry.requirements },
    additionalLinks: entry.additionalLinks?.length ? entry.additionalLinks.map((item) => ({ ...item })) : [{ label: "", url: "" }],
  };
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#667085", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
    </div>
  );
}

export default function University() {
  const [universities, setUniversities] = useFirestore("dashboard-universities", []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(cloneEntry(EMPTY_FORM));
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("Masters");
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deleteId, setDeleteId] = useState(null);

  const grouped = useMemo(
    () => ({
      Masters: universities.filter((item) => item.degreeType === "Masters"),
      PhD: universities.filter((item) => item.degreeType === "PhD"),
    }),
    [universities]
  );

  const stats = useMemo(
    () =>
      STATUS_OPTIONS.reduce((accumulator, status) => {
        accumulator[status] = (grouped[activeTab] || []).filter((item) => item.status === status).length;
        return accumulator;
      }, {}),
    [activeTab, grouped]
  );

  const visibleList = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (grouped[activeTab] || []).filter((item) => {
      const matchesQuery =
        item.universityName.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query);
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [activeTab, filterStatus, grouped, searchQuery]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateRequirement(field, value) {
    setForm((current) => ({ ...current, requirements: { ...current.requirements, [field]: value } }));
  }

  function updateLink(index, field, value) {
    setForm((current) => {
      const additionalLinks = [...current.additionalLinks];
      additionalLinks[index] = { ...additionalLinks[index], [field]: value };
      return { ...current, additionalLinks };
    });
  }

  function addLink() {
    setForm((current) => ({ ...current, additionalLinks: [...current.additionalLinks, { label: "", url: "" }] }));
  }

  function removeLink(index) {
    setForm((current) => {
      const additionalLinks = current.additionalLinks.filter((_, currentIndex) => currentIndex !== index);
      return { ...current, additionalLinks: additionalLinks.length ? additionalLinks : [{ label: "", url: "" }] };
    });
  }

  function openAdd() {
    setForm(cloneEntry({ ...EMPTY_FORM, degreeType: activeTab }));
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(entry) {
    setForm(cloneEntry(entry));
    setEditingId(entry.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(cloneEntry(EMPTY_FORM));
  }

  function saveEntry() {
    if (!form.universityName.trim()) return;
    const entry = {
      ...form,
      universityName: form.universityName.trim(),
      country: form.country.trim(),
      tuitionFee: form.tuitionFee.trim(),
      scholarship: form.scholarship.trim(),
      notes: form.notes.trim(),
      requirements: Object.fromEntries(
        Object.entries(form.requirements).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      ),
      additionalLinks: form.additionalLinks
        .map((item) => ({ label: item.label.trim(), url: item.url.trim() }))
        .filter((item) => item.label || item.url),
    };

    if (editingId) {
      setUniversities((current) => current.map((item) => (item.id === editingId ? { ...entry, id: editingId } : item)));
    } else {
      setUniversities((current) => [...current, { ...entry, id: generateId() }]);
    }

    closeForm();
  }

  function deleteEntry(id) {
    setUniversities((current) => current.filter((item) => item.id !== id));
    setDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>University</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>University Tracker</div>
            <div style={{ fontSize: 12, color: "#667085" }}>Track Masters and PhD applications in the same grayscale style as the other pages.</div>
          </div>
          <button onClick={openAdd} style={buttonStyle}>Add University</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {DEGREE_TYPES.map((degreeType) => (
            <button
              key={degreeType}
              onClick={() => {
                setActiveTab(degreeType);
                setExpandedId(null);
                setFilterStatus("All");
                setSearchQuery("");
              }}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid #d0d5dd",
                cursor: "pointer",
                background: activeTab === degreeType ? "#111827" : "#ffffff",
                color: activeTab === degreeType ? "#ffffff" : "#475467",
                fontWeight: 600,
              }}
            >
              {degreeType} ({(grouped[degreeType] || []).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button
            onClick={() => setFilterStatus("All")}
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid #d0d5dd",
              background: filterStatus === "All" ? "#111827" : "#ffffff",
              color: filterStatus === "All" ? "#ffffff" : "#475467",
              cursor: "pointer",
            }}
          >
            All {(grouped[activeTab] || []).length}
          </button>
          {STATUS_OPTIONS.map((status) =>
            stats[status] > 0 ? (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "All" : status)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px solid #d0d5dd",
                  background: filterStatus === status ? "#111827" : STATUS_STYLES[status].bg,
                  color: filterStatus === status ? "#ffffff" : STATUS_STYLES[status].text,
                  cursor: "pointer",
                }}
              >
                {status} {stats[status]}
              </button>
            ) : null
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search university or country..." style={{ flex: 1, minWidth: 180 }} />
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} style={{ minWidth: 150 }}>
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {visibleList.length === 0 ? (
        <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>
          {(grouped[activeTab] || []).length === 0 ? `No ${activeTab} universities added yet.` : "No results match your search or filter."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleList.map((entry) => (
            <div key={entry.id} className="card" style={{ marginBottom: 0, borderLeft: "3px solid #98a2b3" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ minWidth: 56, textAlign: "center", padding: "7px 9px", borderRadius: 8, background: "#f2f4f7", border: "1px solid #d0d5dd", color: "#475467", fontSize: 13 }}>
                  {entry.ranking ? `#${entry.ranking}` : "-"}
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{entry.universityName}</div>
                  <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                    {[entry.country || "Country not set", entry.deadline ? `Deadline ${entry.deadline}` : null, entry.tuitionFee || null, entry.workPolicy !== "Not set" ? entry.workPolicy : null].filter(Boolean).join(" - ")}
                  </div>
                </div>
                <span style={{ fontSize: 12, padding: "5px 11px", borderRadius: 999, background: STATUS_STYLES[entry.status]?.bg, color: STATUS_STYLES[entry.status]?.text, border: "1px solid #d0d5dd" }}>
                  {entry.status}
                </span>
                <button onClick={() => openEdit(entry)} style={ghostButtonStyle}>Edit</button>
                <button onClick={() => setDeleteId(entry.id)} style={ghostButtonStyle}>Delete</button>
                <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} style={ghostButtonStyle}>
                  {expandedId === entry.id ? "Hide" : "Show"}
                </button>
              </div>

              {deleteId === entry.id && (
                <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "#f7f8fa", border: "1px solid #d0d5dd" }}>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>Delete <strong>{entry.universityName}</strong>?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => deleteEntry(entry.id)} style={buttonStyle}>Yes, Delete</button>
                    <button onClick={() => setDeleteId(null)} style={ghostButtonStyle}>Cancel</button>
                  </div>
                </div>
              )}

              {expandedId === entry.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #d9dee7" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    <div style={detailBoxStyle}>
                      <div style={detailTitleStyle}>Requirements</div>
                      {[
                        ["Min GPA", entry.requirements.gpa],
                        ["IELTS", entry.requirements.ielts],
                        ["TOEFL", entry.requirements.toefl],
                        ["GRE", entry.requirements.gre],
                        ["GMAT", entry.requirements.gmat],
                        ["Work Experience", entry.requirements.workExp],
                        ["Research Experience", entry.requirements.researchExp],
                        ["Student Work", entry.workPolicy !== "Not set" ? entry.workPolicy : ""],
                        ["LOR", entry.requirements.lor ? `${entry.requirements.lor} letters` : ""],
                      ].filter(([, value]) => value).map(([label, value]) => (
                        <div key={label} style={rowStyle}><span>{label}</span><span>{value}</span></div>
                      ))}
                      <div style={rowStyle}><span>SOP</span><span>{entry.requirements.sop ? "Required" : "Not required"}</span></div>
                      <div style={rowStyle}><span>CV</span><span>{entry.requirements.cv ? "Required" : "Not required"}</span></div>
                      {entry.requirements.other && <div style={{ fontSize: 12, color: "#667085", marginTop: 8 }}>{entry.requirements.other}</div>}
                    </div>

                    <div style={detailBoxStyle}>
                      <div style={detailTitleStyle}>Financials and Links</div>
                      {[
                        ["Tuition", entry.tuitionFee],
                        ["Scholarship", entry.scholarship],
                        ["Deadline", entry.deadline],
                      ].filter(([, value]) => value).map(([label, value]) => (
                        <div key={label} style={rowStyle}><span>{label}</span><span>{value}</span></div>
                      ))}
                      {entry.additionalLinks?.filter((item) => item.url).length > 0 && (
                        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                          {entry.additionalLinks.filter((item) => item.url).map((item, index) => (
                            <a key={index} href={normalizeUrl(item.url)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#111827" }}>
                              {item.label || item.url}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {entry.notes && (
                    <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f7f8fa", border: "1px solid #d9dee7", fontSize: 12, color: "#667085" }}>
                      <strong style={{ color: "#111827" }}>Notes</strong>
                      <div style={{ marginTop: 6 }}>{entry.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={overlayStyle} onClick={(event) => event.target === event.currentTarget && closeForm()}>
          <div className="card" style={{ width: "100%", maxWidth: 720, marginBottom: 0 }}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit University" : "Add University"}</h3>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {DEGREE_TYPES.map((degreeType) => (
                <button
                  key={degreeType}
                  onClick={() => updateForm("degreeType", degreeType)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: "1px solid #d0d5dd",
                    cursor: "pointer",
                    background: form.degreeType === degreeType ? "#111827" : "#ffffff",
                    color: form.degreeType === degreeType ? "#ffffff" : "#475467",
                  }}
                >
                  {degreeType}
                </button>
              ))}
            </div>

            <div style={formGridStyle}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>University Name</label>
                <input value={form.universityName} onChange={(event) => updateForm("universityName", event.target.value)} placeholder="e.g. MIT or TU Berlin" style={{ width: "100%" }} />
              </div>
              <Field label="Country" value={form.country} onChange={(value) => updateForm("country", value)} placeholder="e.g. USA" />
              <Field label="World Ranking" value={form.ranking} onChange={(value) => updateForm("ranking", value)} placeholder="e.g. 50" />
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value)} style={{ width: "100%" }}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Student Work Policy</label>
                <select value={form.workPolicy} onChange={(event) => updateForm("workPolicy", event.target.value)} style={{ width: "100%" }}>
                  {["Not set", "Can work", "Cannot work", "Limited hours"].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Application Deadline</label>
                <input type="date" value={form.deadline} onChange={(event) => updateForm("deadline", event.target.value)} style={{ width: "100%" }} />
              </div>
            </div>

            <Divider label="REQUIREMENTS" />

            <div style={formGridStyle}>
              {[
                ["gpa", "Min GPA", "e.g. 3.5 / 4.0"],
                ["ielts", "IELTS", "e.g. 6.5"],
                ["toefl", "TOEFL", "e.g. 90"],
                ["gre", "GRE", "e.g. 320"],
                ["gmat", "GMAT", "e.g. 650"],
                ["lor", "LOR Letters", "e.g. 3"],
                ["workExp", "Work Experience", "e.g. 2 years"],
                ["researchExp", "Research Experience", "optional"],
              ].map(([key, label, placeholder]) => (
                <Field key={key} label={label} value={form.requirements[key]} onChange={(value) => updateRequirement(key, value)} placeholder={placeholder} />
              ))}
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 20, flexWrap: "wrap" }}>
                <label style={checkboxStyle}>
                  <input type="checkbox" checked={form.requirements.sop} onChange={(event) => updateRequirement("sop", event.target.checked)} />
                  SOP Required
                </label>
                <label style={checkboxStyle}>
                  <input type="checkbox" checked={form.requirements.cv} onChange={(event) => updateRequirement("cv", event.target.checked)} />
                  CV Required
                </label>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Other Requirements</label>
                <input value={form.requirements.other} onChange={(event) => updateRequirement("other", event.target.value)} placeholder="e.g. interview, portfolio, writing sample" style={{ width: "100%" }} />
              </div>
            </div>

            <Divider label="FINANCIALS" />

            <div style={formGridStyle}>
              <Field label="Tuition Fee" value={form.tuitionFee} onChange={(value) => updateForm("tuitionFee", value)} placeholder="e.g. $50,000/year" />
              <Field label="Scholarship Info" value={form.scholarship} onChange={(value) => updateForm("scholarship", value)} placeholder="e.g. 50% merit scholarship" />
            </div>

            <Divider label="ADDITIONAL LINKS" />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {form.additionalLinks.map((item, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8 }}>
                  <input value={item.label} onChange={(event) => updateLink(index, "label", event.target.value)} placeholder="Label" />
                  <input value={item.url} onChange={(event) => updateLink(index, "url", event.target.value)} placeholder="https://..." />
                  <button onClick={() => removeLink(index)} style={ghostButtonStyle}>Remove</button>
                </div>
              ))}
              <button onClick={addLink} style={ghostButtonStyle}>Add another link</button>
            </div>

            <Divider label="NOTES" />

            <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Any notes, reminders, or contacts" style={{ width: "100%", minHeight: 90 }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button onClick={closeForm} style={ghostButtonStyle}>Cancel</button>
              <button onClick={saveEntry} disabled={!form.universityName.trim()} style={buttonStyle}>
                {editingId ? "Save Changes" : "Add University"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={{ width: "100%" }} />
    </div>
  );
}

const labelStyle = { fontSize: 12, color: "#667085", display: "block", marginBottom: 4 };
const buttonStyle = { background: "#111827", color: "#ffffff", border: "1px solid #98a2b3", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 };
const ghostButtonStyle = { background: "transparent", border: "1px solid #d0d5dd", cursor: "pointer", color: "#475467", borderRadius: 8, padding: "7px 11px", fontSize: 13 };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, color: "#475467", marginBottom: 7 };
const detailBoxStyle = { padding: 12, borderRadius: 10, background: "#f7f8fa", border: "1px solid #d9dee7" };
const detailTitleStyle = { fontSize: 12, fontWeight: 700, color: "#111827", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto", zIndex: 1000 };
const formGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const checkboxStyle = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475467" };

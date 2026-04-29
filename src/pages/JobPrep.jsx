import { useMemo, useState } from "react";
import { useFirestoreState } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function normalizeUrl(value) {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
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

const APP_STATUS = {
  ongoing: { label: "Ongoing", bg: "#eef4ff", color: "#1d4ed8", border: "#c7d7fe" },
  complete: { label: "Complete", bg: "#f2f4f7", color: "#111827", border: "#d0d5dd" },
  rejection: { label: "Rejected", bg: "#fef2f2", color: "#475467", border: "#d0d5dd" },
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance", "Other"];

const SKILL_LEVELS = {
  learning: { label: "Learning", bg: "#f7f8fa", color: "#111827", border: "#c7d7fe" },
  intermediate: { label: "Intermediate", bg: "#f3e8ff", color: "#1d4ed8", border: "#98a2b3" },
  proficient: { label: "Proficient", bg: "#eef2ff", color: "#111827", border: "#c084fc" },
};

const RESOURCE_TYPES = ["Course", "Book", "Platform", "YouTube", "Article", "Practice", "Other"];
const EMPTY_LINK = { label: "", url: "" };

export default function JobPrep() {
  const [applications, setApplications] = useFirestoreState("dashboard-jobs-applications", [], 1);
  const [skills, setSkills] = useFirestoreState("dashboard-jobs-skills", [], 1);
  const [resources, setResources] = useFirestoreState("dashboard-jobs-resources", [], 1);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [status, setStatus] = useState("ongoing");
  const [requirement, setRequirement] = useState("");
  const [appDate, setAppDate] = useState(today);
  const [deadline, setDeadline] = useState("");
  const [appLinks, setAppLinks] = useState([{ ...EMPTY_LINK }]);
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [usage, setUsage] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingApplicationId, setEditingApplicationId] = useState(null);

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("learning");
  const [skillLinks, setSkillLinks] = useState([{ ...EMPTY_LINK }]);
  const [skillNotes, setSkillNotes] = useState("");
  const [editingSkillId, setEditingSkillId] = useState(null);

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("Course");
  const [resourceLinks, setResourceLinks] = useState([{ ...EMPTY_LINK }]);
  const [resourceNotes, setResourceNotes] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);

  function cleanLinks(links) {
    return links
      .map((item) => ({
        label: item.label.trim(),
        url: item.url.trim(),
      }))
      .filter((item) => item.url);
  }

  function updateLinkItem(setter, index, field, value) {
    setter((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  }

  function addLinkItem(setter) {
    setter((current) => [...current, { ...EMPTY_LINK }]);
  }

  function removeLinkItem(setter, index) {
    setter((current) => (current.length === 1 ? [{ ...EMPTY_LINK }] : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  function addApplication() {
    if (!company.trim() && !role.trim()) return;
    const existing = editingApplicationId ? applications.find((item) => item.id === editingApplicationId) : null;
    const entry = {
      id: editingApplicationId || Date.now(),
      company: company.trim(),
      role: role.trim(),
      jobType,
      status,
      requirement: requirement.trim(),
      appDate,
      deadline,
      links: cleanLinks(appLinks),
      salary: salary.trim(),
      notes: notes.trim(),
      usage: usage.trim(),
      link: existing?.link,
    };
    setApplications((current) => (
      editingApplicationId
        ? current.map((item) => (item.id === editingApplicationId ? entry : item))
        : [...current, entry]
    ));

    setCompany("");
    setRole("");
    setJobType("Full-time");
    setStatus("ongoing");
    setRequirement("");
    setAppDate(today);
    setDeadline("");
    setAppLinks([{ ...EMPTY_LINK }]);
    setSalary("");
    setNotes("");
    setUsage("");
    setEditingApplicationId(null);
  }

  function startEditApplication(item) {
    setEditingApplicationId(item.id);
    setCompany(item.company || "");
    setRole(item.role || "");
    setJobType(item.jobType || "Full-time");
    setStatus(item.status === "requirement" ? "ongoing" : (item.status || "ongoing"));
    setRequirement(item.requirement || "");
    setAppDate(item.appDate || today);
    setDeadline(item.deadline || "");
    setAppLinks(item.links?.length ? item.links.map((linkItem) => ({ ...EMPTY_LINK, ...linkItem })) : item.link ? [{ label: "Job Link", url: item.link }] : [{ ...EMPTY_LINK }]);
    setSalary(item.salary || "");
    setNotes(item.notes || "");
    setUsage(item.usage || "");
  }

  function cancelEditApplication() {
    setEditingApplicationId(null);
    setCompany("");
    setRole("");
    setJobType("Full-time");
    setStatus("ongoing");
    setRequirement("");
    setAppDate(today);
    setDeadline("");
    setAppLinks([{ ...EMPTY_LINK }]);
    setSalary("");
    setNotes("");
    setUsage("");
  }

  function updateApplicationStatus(id, value) {
    setApplications((current) =>
      current.map((item) => (item.id === id ? { ...item, status: value } : item))
    );
  }

  function deleteApplication(id) {
    setApplications((current) => current.filter((item) => item.id !== id));
    if (editingApplicationId === id) cancelEditApplication();
  }

  function addSkill() {
    if (!skillName.trim()) return;
    const existing = editingSkillId ? skills.find((item) => item.id === editingSkillId) : null;
    const entry = {
      id: editingSkillId || Date.now(),
      name: skillName.trim(),
      level: skillLevel,
      links: cleanLinks(skillLinks),
      notes: skillNotes.trim(),
      link: existing?.link,
    };
    setSkills((current) => (
      editingSkillId
        ? current.map((item) => (item.id === editingSkillId ? entry : item))
        : [...current, entry]
    ));
    setSkillName("");
    setSkillLevel("learning");
    setSkillLinks([{ ...EMPTY_LINK }]);
    setSkillNotes("");
    setEditingSkillId(null);
  }

  function startEditSkill(skill) {
    setEditingSkillId(skill.id);
    setSkillName(skill.name || "");
    setSkillLevel(skill.level || "learning");
    setSkillLinks(skill.links?.length ? skill.links.map((linkItem) => ({ ...EMPTY_LINK, ...linkItem })) : skill.link ? [{ label: "Link", url: skill.link }] : [{ ...EMPTY_LINK }]);
    setSkillNotes(skill.notes || "");
  }

  function cancelEditSkill() {
    setEditingSkillId(null);
    setSkillName("");
    setSkillLevel("learning");
    setSkillLinks([{ ...EMPTY_LINK }]);
    setSkillNotes("");
  }

  function removeSkill(id) {
    setSkills((current) => current.filter((item) => item.id !== id));
    if (editingSkillId === id) cancelEditSkill();
  }

  function addResource() {
    if (!resourceTitle.trim()) return;
    const existing = editingResourceId ? resources.find((item) => item.id === editingResourceId) : null;
    const entry = {
      id: editingResourceId || Date.now(),
      title: resourceTitle.trim(),
      type: resourceType,
      links: cleanLinks(resourceLinks),
      notes: resourceNotes.trim(),
      done: existing?.done || false,
      link: existing?.link,
    };
    setResources((current) => (
      editingResourceId
        ? current.map((item) => (item.id === editingResourceId ? entry : item))
        : [...current, entry]
    ));
    setResourceTitle("");
    setResourceType("Course");
    setResourceLinks([{ ...EMPTY_LINK }]);
    setResourceNotes("");
    setEditingResourceId(null);
  }

  function startEditResource(resource) {
    setEditingResourceId(resource.id);
    setResourceTitle(resource.title || "");
    setResourceType(resource.type || "Course");
    setResourceLinks(resource.links?.length ? resource.links.map((linkItem) => ({ ...EMPTY_LINK, ...linkItem })) : resource.link ? [{ label: "Link", url: resource.link }] : [{ ...EMPTY_LINK }]);
    setResourceNotes(resource.notes || "");
  }

  function cancelEditResource() {
    setEditingResourceId(null);
    setResourceTitle("");
    setResourceType("Course");
    setResourceLinks([{ ...EMPTY_LINK }]);
    setResourceNotes("");
  }

  function toggleResource(id) {
    setResources((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function removeResource(id) {
    setResources((current) => current.filter((item) => item.id !== id));
    if (editingResourceId === id) cancelEditResource();
  }

  const normalizedApplications = applications.map((item) => ({
    ...item,
    status: item.status === "requirement" ? "ongoing" : item.status,
    requirement: item.requirement || (item.status === "requirement" ? "Requirement pending" : ""),
    links: item.links?.filter((linkItem) => linkItem?.url) || (item.link ? [{ label: "Job Link", url: item.link }] : []),
  }));
  const counts = Object.keys(APP_STATUS).reduce((accumulator, key) => {
    accumulator[key] = normalizedApplications.filter((item) => item.status === key).length;
    return accumulator;
  }, {});

  const filteredApplications = filter === "all" ? normalizedApplications : normalizedApplications.filter((item) => item.status === filter);
  const applicationsWithRequirements = filteredApplications.filter((item) => item.requirement);
  const applicationsWithoutRequirements = filteredApplications.filter((item) => !item.requirement);

  const successRate = counts.complete + counts.rejection > 0
    ? Math.round((counts.complete / (counts.complete + counts.rejection)) * 100)
    : null;

  const recent = useMemo(
    () => [...normalizedApplications].sort((a, b) => (b.appDate || "").localeCompare(a.appDate || "")).slice(0, 4),
    [normalizedApplications]
  );

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Job Preparation</h2>

      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <StatCard label="Total" value={applications.length} />
          {Object.entries(APP_STATUS).map(([key, meta]) => (
            <StatCard key={key} label={meta.label} value={counts[key]} />
          ))}
          {successRate !== null && <StatCard label="Success Rate" value={`${successRate}%`} />}
        </div>
      )}

      <Divider label="APPLICATION TRACKER" />

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#111827" }}>
          {editingApplicationId ? "Edit application" : "Add application"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelStyle}>Company</label>
            <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelStyle}>Role / Position</label>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addApplication()}
              placeholder="Job title"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={labelStyle}>Type</label>
            <select value={jobType} onChange={(event) => setJobType(event.target.value)} style={{ width: "100%" }}>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: "100%" }}>
              {Object.entries(APP_STATUS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Requirement</label>
            <input value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="e.g. Portfolio, visa support, final review" style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Applied Date</label>
            <input type="date" value={appDate} onChange={(event) => setAppDate(event.target.value)} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={labelStyle}>Expected Salary</label>
            <input value={salary} onChange={(event) => setSalary(event.target.value)} placeholder="e.g. 50000" style={{ width: "100%" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Links</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {appLinks.map((linkItem, index) => (
                <div key={`app-link-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.8fr) minmax(220px, 1.8fr) auto", gap: 8, alignItems: "center" }}>
                  <input
                    value={linkItem.label}
                    onChange={(event) => updateLinkItem(setAppLinks, index, "label", event.target.value)}
                    placeholder="Label"
                    style={{ width: "100%" }}
                  />
                  <input
                    value={linkItem.url}
                    onChange={(event) => updateLinkItem(setAppLinks, index, "url", event.target.value)}
                    placeholder="https://..."
                    style={{ width: "100%" }}
                  />
                  <button type="button" onClick={() => removeLinkItem(setAppLinks, index)} style={smallGhostButton}>
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button type="button" onClick={() => addLinkItem(setAppLinks)} style={smallGhostButton}>
                  Add Link
                </button>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Interview notes, contact person, follow-ups..."
              style={{ width: "100%", minHeight: 82, resize: "vertical" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Use</label>
            <input
              value={usage}
              onChange={(event) => setUsage(event.target.value)}
              placeholder="How you will use this application or next action"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gridColumn: "1 / -1", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addApplication} style={buttonStyle}>
                {editingApplicationId ? "Save Changes" : "Add"}
              </button>
              {editingApplicationId && (
                <button onClick={cancelEditApplication} style={smallGhostButton}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            ["all", "All", applications.length],
            ...Object.entries(APP_STATUS).map(([key, meta]) => [key, meta.label, counts[key] || 0]),
          ].map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontSize: 11,
                padding: "4px 14px",
                borderRadius: 99,
                border: "1px solid #d0d5dd",
                cursor: "pointer",
                background: filter === key ? "#111827" : "#ffffff",
                color: filter === key ? "#ffffff" : "#475467",
                fontWeight: filter === key ? 600 : 400,
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {applicationsWithRequirements.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid #d0d5dd", background: "#ffffff" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Requirements
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {applicationsWithRequirements.map((item) => (
              <ApplicationCard
                key={item.id}
                item={item}
                statusMeta={APP_STATUS[item.status]}
                onDelete={() => deleteApplication(item.id)}
                onChangeStatus={(value) => updateApplicationStatus(item.id, value)}
                onEdit={() => startEditApplication(item)}
              />
            ))}
          </div>
        </div>
      )}

      {applicationsWithoutRequirements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {applicationsWithoutRequirements.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              statusMeta={APP_STATUS[item.status]}
              onDelete={() => deleteApplication(item.id)}
              onChangeStatus={(value) => updateApplicationStatus(item.id, value)}
              onEdit={() => startEditApplication(item)}
            />
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <p style={{ fontSize: 13, color: "#667085", textAlign: "center", padding: "24px 0" }}>
          No applications yet. Add one above.
        </p>
      )}

      {recent.length > 0 && (
        <>
          <Divider label="RECENT ACTIVITY" />
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: 8,
                    borderBottom: "1px solid #d9dee7",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.company || "Untitled"}</div>
                    <div style={{ fontSize: 12, color: "#667085" }}>{item.role || item.jobType}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#475467", textAlign: "right" }}>
                    <div>{APP_STATUS[item.status].label}</div>
                    <div>{item.appDate ? formatDate(item.appDate) : "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Divider label="SKILLS TO LEARN" />

      <div className="card" style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
          {editingSkillId ? "Edit skill" : "Add skill"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Skill Name</label>
            <input
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addSkill()}
              placeholder="e.g. React, SQL, Communication..."
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Level</label>
            <select value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)} style={{ width: "100%" }}>
              {Object.entries(SKILL_LEVELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={skillNotes}
            onChange={(event) => setSkillNotes(event.target.value)}
            placeholder="What to study, roadmap, reminders..."
            style={{ width: "100%", minHeight: 84 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Links</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {skillLinks.map((linkItem, index) => (
              <div key={`skill-link-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.8fr) minmax(220px, 1.8fr) auto", gap: 8, alignItems: "center" }}>
                <input
                  value={linkItem.label}
                  onChange={(event) => updateLinkItem(setSkillLinks, index, "label", event.target.value)}
                  placeholder="Label"
                  style={{ width: "100%" }}
                />
                <input
                  value={linkItem.url}
                  onChange={(event) => updateLinkItem(setSkillLinks, index, "url", event.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%" }}
                />
                <button type="button" onClick={() => removeLinkItem(setSkillLinks, index)} style={smallGhostButton}>
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button type="button" onClick={() => addLinkItem(setSkillLinks)} style={smallGhostButton}>
                Add Link
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button onClick={addSkill} style={buttonStyle}>
            {editingSkillId ? "Save Skill" : "Add Skill"}
          </button>
          {editingSkillId && <button onClick={cancelEditSkill} style={{ ...smallGhostButton, marginLeft: 8 }}>Cancel</button>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {skills.length === 0 && <p style={{ fontSize: 13, color: "#667085", padding: "12px 0" }}>No skills added yet.</p>}
        {skills.map((skill) => {
          const meta = SKILL_LEVELS[skill.level];
          const skillLinksList = skill.links?.filter((linkItem) => linkItem?.url) || (skill.link ? [{ label: "Link", url: skill.link }] : []);
          return (
            <div key={skill.id} className="card" style={{ marginBottom: 0, borderLeft: `3px solid ${meta.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{skill.name}</span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {skillLinksList.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: skill.notes ? 4 : 0 }}>
                      {skillLinksList.map((linkItem, index) => (
                        <a key={`${skill.id}-link-${index}`} href={normalizeUrl(linkItem.url)} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#2563eb" }}>
                          {linkItem.label || `Link ${index + 1}`}: {linkItem.url}
                        </a>
                      ))}
                    </div>
                  )}
                  {skill.notes && <p style={{ fontSize: 12, color: "#667085" }}>{skill.notes}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEditSkill(skill)} style={ghostDangerButton}>
                    Edit
                  </button>
                  <button onClick={() => removeSkill(skill.id)} style={ghostDangerButton}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Divider label="RESOURCES AND PREPARATION" />

      <div className="card" style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
          {editingResourceId ? "Edit resource" : "Add resource"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Resource / Course Name</label>
            <input
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addResource()}
              placeholder="e.g. LeetCode, System Design Course..."
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Type</label>
            <select value={resourceType} onChange={(event) => setResourceType(event.target.value)} style={{ width: "100%" }}>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={resourceNotes}
            onChange={(event) => setResourceNotes(event.target.value)}
            placeholder="Why it matters, target chapters, checkpoints..."
            style={{ width: "100%", minHeight: 84 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Links</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resourceLinks.map((linkItem, index) => (
              <div key={`resource-link-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.8fr) minmax(220px, 1.8fr) auto", gap: 8, alignItems: "center" }}>
                <input
                  value={linkItem.label}
                  onChange={(event) => updateLinkItem(setResourceLinks, index, "label", event.target.value)}
                  placeholder="Label"
                  style={{ width: "100%" }}
                />
                <input
                  value={linkItem.url}
                  onChange={(event) => updateLinkItem(setResourceLinks, index, "url", event.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%" }}
                />
                <button type="button" onClick={() => removeLinkItem(setResourceLinks, index)} style={smallGhostButton}>
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button type="button" onClick={() => addLinkItem(setResourceLinks)} style={smallGhostButton}>
                Add Link
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={addResource} style={buttonStyle}>
            {editingResourceId ? "Save Changes" : "Add"}
          </button>
          {editingResourceId && <button onClick={cancelEditResource} style={{ ...smallGhostButton, marginLeft: 8 }}>Cancel</button>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.length === 0 && <p style={{ fontSize: 13, color: "#667085", padding: "12px 0" }}>No resources added yet.</p>}
        {resources.map((resource) => {
          const resourceLinksList = resource.links?.filter((linkItem) => linkItem?.url) || (resource.link ? [{ label: "Link", url: resource.link }] : []);
          return (
            <div
              key={resource.id}
              className="card"
              style={{
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                opacity: resource.done ? 0.55 : 1,
              }}
            >
              <div
                onClick={() => toggleResource(resource.id)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  cursor: "pointer",
                  border: resource.done ? "1px solid #667085" : "2px solid #98a2b3",
                  background: resource.done ? "#16a34a" : "transparent",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  marginTop: 2,
                }}
              >
                {resource.done ? "OK" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <p style={{ fontWeight: 500, fontSize: 13, textDecoration: resource.done ? "line-through" : "none" }}>{resource.title}</p>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#f2f4f7", color: "#111827", border: "1px solid #d0d5dd" }}>
                    {resource.type}
                  </span>
                </div>
                {resourceLinksList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: resource.notes ? 4 : 0 }}>
                    {resourceLinksList.map((linkItem, index) => (
                      <a key={`${resource.id}-link-${index}`} href={normalizeUrl(linkItem.url)} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#475467" }}>
                        {linkItem.label || `Link ${index + 1}`}: {linkItem.url}
                      </a>
                    ))}
                  </div>
                )}
                {resource.notes && <p style={{ fontSize: 12, color: "#667085" }}>{resource.notes}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEditResource(resource)} style={ghostDangerButton}>
                  Edit
                </button>
                <button onClick={() => removeResource(resource.id)} style={ghostDangerButton}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationCard({ item, statusMeta, onDelete, onChangeStatus, onEdit }) {
  const isDeadlinePast = item.deadline && item.deadline < today && item.status === "ongoing";
  const appLinksList = item.links?.filter((linkItem) => linkItem?.url) || (item.link ? [{ label: "Job Link", url: item.link }] : []);

  return (
    <div className="card" style={{ marginBottom: 0, borderLeft: `3px solid ${statusMeta.border}` }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{item.company || "-"}</p>
            <span style={{ fontSize: 12, padding: "2px 9px", borderRadius: 99, background: "#eef4ff", color: "#111827", border: "1px solid #d0d5dd" }}>
              {item.jobType}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#475467", marginBottom: 4 }}>{item.role}</p>
          {item.requirement && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>Requirement:</span>
              <span style={{ fontSize: 12, color: "#475467", marginLeft: 6 }}>{item.requirement}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {item.appDate && <span style={{ fontSize: 12, color: "#667085" }}>Applied {formatDate(item.appDate)}</span>}
            {item.deadline && (
              <span style={{ fontSize: 12, color: isDeadlinePast ? "#111827" : "#667085", fontWeight: isDeadlinePast ? 600 : 400 }}>
                {isDeadlinePast ? "Deadline past - " : "Deadline - "}
                {formatDate(item.deadline)}
              </span>
            )}
            {item.salary && <span style={{ fontSize: 12, color: "#111827" }}>Salary {item.salary}</span>}
          </div>
          {item.notes && <p style={{ fontSize: 12, color: "#667085", marginTop: 5, fontStyle: "italic" }}>{item.notes}</p>}
          {item.usage && <p style={{ fontSize: 12, color: "#475467", marginTop: 4 }}>Use: {item.usage}</p>}
          {appLinksList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              {appLinksList.map((linkItem, index) => (
                <a
                  key={`${item.id}-link-${index}`}
                  href={normalizeUrl(linkItem.url)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: "#2563eb", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {linkItem.label || `Link ${index + 1}`}: {linkItem.url}
                </a>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <select
            value={item.status}
            onChange={(event) => onChangeStatus(event.target.value)}
            style={{
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 99,
              background: statusMeta.bg,
              color: statusMeta.color,
              cursor: "pointer",
              fontWeight: 600,
              border: `1px solid ${statusMeta.border}`,
            }}
          >
            {Object.entries(APP_STATUS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onEdit} style={ghostDangerButton}>
              Edit
            </button>
            <button onClick={onDelete} style={ghostDangerButton}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 80,
        padding: "12px 14px",
        borderRadius: 10,
        background: "#ffffff",
        color: "#111827",
        textAlign: "center",
        border: "1px solid #d0d5dd",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, marginTop: 2, color: "#667085" }}>{label}</div>
    </div>
  );
}

const labelStyle = { fontSize: 12, color: "#667085", display: "block", marginBottom: 4 };

const buttonStyle = {
  alignSelf: "flex-end",
  background: "#111827",
  color: "#ffffff",
  border: "1px solid #111827",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 13,
};

const ghostDangerButton = {
  background: "transparent",
  border: "1px solid #98a2b3",
  cursor: "pointer",
  color: "#475467",
  borderRadius: 8,
  padding: "7px 11px",
  fontSize: 13,
};

const smallGhostButton = {
  background: "transparent",
  border: "1px solid #d0d5dd",
  cursor: "pointer",
  color: "#475467",
  borderRadius: 8,
  padding: "8px 11px",
  fontSize: 12,
  whiteSpace: "nowrap",
};

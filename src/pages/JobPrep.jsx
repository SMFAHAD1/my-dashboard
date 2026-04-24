import { useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#9a9a9a", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#2d2d2d" }} />
    </div>
  );
}

const APP_STATUS = {
  ongoing: { label: "Ongoing", bg: "#202020", color: "#ededed", border: "#5a5a5a" },
  complete: { label: "Complete", bg: "#111111", color: "#ffffff", border: "#707070" },
  rejection: { label: "Rejected", bg: "#1b1b1b", color: "#d4d4d4", border: "#555555" },
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance", "Other"];

const SKILL_LEVELS = {
  learning: { label: "Learning", bg: "#171717", color: "#f5f5f5", border: "#474747" },
  intermediate: { label: "Intermediate", bg: "#212121", color: "#ededed", border: "#666666" },
  proficient: { label: "Proficient", bg: "#101010", color: "#ffffff", border: "#7c7c7c" },
};

const RESOURCE_TYPES = ["Course", "Book", "Platform", "YouTube", "Article", "Practice", "Other"];

export default function JobPrep() {
  const [applications, setApplications] = useLocalStorage("dashboard-jobs-applications", [], 1);
  const [skills, setSkills] = useLocalStorage("dashboard-jobs-skills", [], 1);
  const [resources, setResources] = useLocalStorage("dashboard-jobs-resources", [], 1);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [status, setStatus] = useState("ongoing");
  const [requirement, setRequirement] = useState("");
  const [appDate, setAppDate] = useState(today);
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("learning");
  const [skillLink, setSkillLink] = useState("");
  const [skillNotes, setSkillNotes] = useState("");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("Course");
  const [resourceLink, setResourceLink] = useState("");
  const [resourceNotes, setResourceNotes] = useState("");

  function normalizeUrl(value) {
    if (!value) return "";
    return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  }

  function addApplication() {
    if (!company.trim() && !role.trim()) return;

    setApplications((current) => [
      ...current,
      {
        id: Date.now(),
        company: company.trim(),
        role: role.trim(),
        jobType,
        status,
        requirement: requirement.trim(),
        appDate,
        deadline,
        link: link.trim(),
        salary: salary.trim(),
        notes: notes.trim(),
      },
    ]);

    setCompany("");
    setRole("");
    setJobType("Full-time");
    setStatus("ongoing");
    setRequirement("");
    setAppDate(today);
    setDeadline("");
    setLink("");
    setSalary("");
    setNotes("");
  }

  function updateApplicationStatus(id, value) {
    setApplications((current) =>
      current.map((item) => (item.id === id ? { ...item, status: value } : item))
    );
  }

  function deleteApplication(id) {
    setApplications((current) => current.filter((item) => item.id !== id));
  }

  function addSkill() {
    if (!skillName.trim()) return;
    setSkills((current) => [
      ...current,
      {
        id: Date.now(),
        name: skillName.trim(),
        level: skillLevel,
        link: skillLink.trim(),
        notes: skillNotes.trim(),
      },
    ]);
    setSkillName("");
    setSkillLevel("learning");
    setSkillLink("");
    setSkillNotes("");
  }

  function removeSkill(id) {
    setSkills((current) => current.filter((item) => item.id !== id));
  }

  function addResource() {
    if (!resourceTitle.trim()) return;
    setResources((current) => [
      ...current,
      {
        id: Date.now(),
        title: resourceTitle.trim(),
        type: resourceType,
        link: resourceLink.trim(),
        notes: resourceNotes.trim(),
        done: false,
      },
    ]);
    setResourceTitle("");
    setResourceType("Course");
    setResourceLink("");
    setResourceNotes("");
  }

  function toggleResource(id) {
    setResources((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function removeResource(id) {
    setResources((current) => current.filter((item) => item.id !== id));
  }

  const normalizedApplications = applications.map((item) => ({
    ...item,
    status: item.status === "requirement" ? "ongoing" : item.status,
    requirement: item.requirement || (item.status === "requirement" ? "Requirement pending" : ""),
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Applied Date</label>
            <input type="date" value={appDate} onChange={(event) => setAppDate(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Deadline</label>
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Expected Salary</label>
            <input value={salary} onChange={(event) => setSalary(event.target.value)} placeholder="e.g. 50000" style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Job Link</label>
            <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://..." style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 2, minWidth: 220 }}>
            <label style={labelStyle}>Notes</label>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Interview notes, contact person, follow-ups..."
              style={{ width: "100%" }}
            />
          </div>
          <button onClick={addApplication} style={buttonStyle}>
            Add
          </button>
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
                border: "1px solid #4a4a4a",
                cursor: "pointer",
                background: filter === key ? "#f4f4f4" : "#111111",
                color: filter === key ? "#111111" : "#d6d6d6",
                fontWeight: filter === key ? 600 : 400,
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {applicationsWithRequirements.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid #4d4d4d", background: "#111111" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
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
            />
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <p style={{ fontSize: 13, color: "#9a9a9a", textAlign: "center", padding: "24px 0" }}>
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
                    borderBottom: "1px solid #2f2f2f",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.company || "Untitled"}</div>
                    <div style={{ fontSize: 12, color: "#a9a9a9" }}>{item.role || item.jobType}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#bdbdbd", textAlign: "right" }}>
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
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Link</label>
            <input value={skillLink} onChange={(event) => setSkillLink(event.target.value)} placeholder="https://..." style={{ width: "100%" }} />
          </div>
          <button onClick={addSkill} style={buttonStyle}>
            Add Skill
          </button>
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
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {skills.length === 0 && <p style={{ fontSize: 13, color: "#9a9a9a", padding: "12px 0" }}>No skills added yet.</p>}
        {skills.map((skill) => {
          const meta = SKILL_LEVELS[skill.level];
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
                  {skill.link && (
                    <a href={normalizeUrl(skill.link)} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#dcdcdc", marginBottom: 4 }}>
                      {skill.link}
                    </a>
                  )}
                  {skill.notes && <p style={{ fontSize: 12, color: "#a6a6a6" }}>{skill.notes}</p>}
                </div>
                <button onClick={() => removeSkill(skill.id)} style={ghostDangerButton}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Divider label="RESOURCES AND PREPARATION" />

      <div className="card" style={{ marginBottom: 12 }}>
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
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>Link</label>
            <input value={resourceLink} onChange={(event) => setResourceLink(event.target.value)} placeholder="https://..." style={{ width: "100%" }} />
          </div>
          <button onClick={addResource} style={buttonStyle}>
            Add
          </button>
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
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.length === 0 && <p style={{ fontSize: 13, color: "#9a9a9a", padding: "12px 0" }}>No resources added yet.</p>}
        {resources.map((resource) => (
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
                border: resource.done ? "1px solid #888" : "2px solid #5c5c5c",
                background: resource.done ? "#efefef" : "transparent",
                color: "#111111",
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
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#1f1f1f", color: "#efefef", border: "1px solid #555" }}>
                  {resource.type}
                </span>
              </div>
              {resource.link && (
                <a href={normalizeUrl(resource.link)} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#d8d8d8", marginBottom: 4 }}>
                  {resource.link}
                </a>
              )}
              {resource.notes && <p style={{ fontSize: 12, color: "#a6a6a6" }}>{resource.notes}</p>}
            </div>
            <button onClick={() => removeResource(resource.id)} style={ghostDangerButton}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationCard({ item, statusMeta, onDelete, onChangeStatus }) {
  const isDeadlinePast = item.deadline && item.deadline < today && item.status === "ongoing";

  return (
    <div className="card" style={{ marginBottom: 0, borderLeft: `3px solid ${statusMeta.border}` }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{item.company || "-"}</p>
            <span style={{ fontSize: 12, padding: "2px 9px", borderRadius: 99, background: "#1c1c1c", color: "#f1f1f1", border: "1px solid #4f4f4f" }}>
              {item.jobType}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#c9c9c9", marginBottom: 4 }}>{item.role}</p>
          {item.requirement && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#f0f0f0", fontWeight: 600 }}>Requirement:</span>
              <span style={{ fontSize: 12, color: "#bcbcbc", marginLeft: 6 }}>{item.requirement}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {item.appDate && <span style={{ fontSize: 12, color: "#9f9f9f" }}>Applied {formatDate(item.appDate)}</span>}
            {item.deadline && (
              <span style={{ fontSize: 12, color: isDeadlinePast ? "#ffffff" : "#9f9f9f", fontWeight: isDeadlinePast ? 600 : 400 }}>
                {isDeadlinePast ? "Deadline past - " : "Deadline - "}
                {formatDate(item.deadline)}
              </span>
            )}
            {item.salary && <span style={{ fontSize: 12, color: "#f0f0f0" }}>Salary {item.salary}</span>}
          </div>
          {item.notes && <p style={{ fontSize: 12, color: "#aaaaaa", marginTop: 5, fontStyle: "italic" }}>{item.notes}</p>}
          {item.link && (
            <a
              href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: "#dfdfdf", marginTop: 4, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {item.link}
            </a>
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
          <button onClick={onDelete} style={ghostDangerButton}>
            Remove
          </button>
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
        background: "#121212",
        color: "#f0f0f0",
        textAlign: "center",
        border: "1px solid #3f3f3f",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, marginTop: 2, color: "#aaaaaa" }}>{label}</div>
    </div>
  );
}

const labelStyle = { fontSize: 12, color: "#9a9a9a", display: "block", marginBottom: 4 };

const buttonStyle = {
  alignSelf: "flex-end",
  background: "#f2f2f2",
  color: "#111111",
  border: "1px solid #6c6c6c",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 13,
};

const ghostDangerButton = {
  background: "transparent",
  border: "1px solid #666666",
  cursor: "pointer",
  color: "#d0d0d0",
  borderRadius: 8,
  padding: "7px 11px",
  fontSize: 13,
};

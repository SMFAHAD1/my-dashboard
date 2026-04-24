import { useState } from "react";
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
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
    </div>
  );
}

const APP_STATUS = {
  requirement: { label: "Requirement", bg: "#e8f0fe", color: "#185FA5" },
  ongoing: { label: "Ongoing", bg: "#fff8e1", color: "#854F0B" },
  complete: { label: "Complete", bg: "#e8f5e9", color: "#3B6D11" },
  rejection: { label: "Rejected", bg: "#fce8e8", color: "#A32D2D" },
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"];

const SKILL_LEVELS = {
  learning: { label: "Learning", bg: "#fff8e1", color: "#854F0B" },
  intermediate: { label: "Intermediate", bg: "#e8f0fe", color: "#185FA5" },
  proficient: { label: "Proficient", bg: "#e8f5e9", color: "#3B6D11" },
};

export default function JobPrep() {
  const [applications, setApplications] = useLocalStorage("dashboard-jobs-applications", [], 1);
  const [skills, setSkills] = useLocalStorage("dashboard-jobs-skills", [], 1);
  const [resources, setResources] = useLocalStorage("dashboard-jobs-resources", [], 1);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [status, setStatus] = useState("requirement");
  const [appDate, setAppDate] = useState(today);
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("learning");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("Course");

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
    setStatus("requirement");
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
      { id: Date.now(), name: skillName.trim(), level: skillLevel },
    ]);
    setSkillName("");
    setSkillLevel("learning");
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
        done: false,
      },
    ]);
    setResourceTitle("");
    setResourceType("Course");
  }

  function toggleResource(id) {
    setResources((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function removeResource(id) {
    setResources((current) => current.filter((item) => item.id !== id));
  }

  const counts = Object.keys(APP_STATUS).reduce((accumulator, key) => {
    accumulator[key] = applications.filter((item) => item.status === key).length;
    return accumulator;
  }, {});

  const filteredApplications =
    filter === "all" ? applications : applications.filter((item) => item.status === filter);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Job Preparation</h2>

      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={statBox("#f0f0f0", "#555")}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{applications.length}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>Total</div>
          </div>
          {Object.entries(APP_STATUS).map(([key, meta]) => (
            <div key={key} style={statBox(meta.bg, meta.color)}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>{meta.label}</div>
            </div>
          ))}
          {counts.complete + counts.rejection > 0 && (
            <div style={statBox("#e8f5e9", "#3B6D11")}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {Math.round((counts.complete / (counts.complete + counts.rejection)) * 100)}%
              </div>
              <div style={{ fontSize: 10, marginTop: 2 }}>Success Rate</div>
            </div>
          )}
        </div>
      )}

      {applications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 1 }}>
            {Object.entries(APP_STATUS).map(([key, meta]) => {
              const percent = (counts[key] / applications.length) * 100;
              return percent > 0 ? (
                <div
                  key={key}
                  title={`${meta.label}: ${counts[key]}`}
                  style={{ width: `${percent}%`, background: meta.color, transition: "width 0.4s" }}
                />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            {Object.entries(APP_STATUS).map(([key, meta]) => (
              <span key={key} style={{ fontSize: 10, color: meta.color }}>
                {meta.label} {counts[key]}
              </span>
            ))}
          </div>
        </div>
      )}

      <Divider label="APPLICATION TRACKER" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelStyle}>Company</label>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company name"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <label style={labelStyle}>Role or Position</label>
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
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: "100%" }}>
              {Object.entries(APP_STATUS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
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
            <input
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              placeholder="e.g. 50,000"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Job Link</label>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://..."
              style={{ width: "100%" }}
            />
          </div>
          <button onClick={addApplication} style={{ alignSelf: "flex-end" }}>
            Add
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          <label style={labelStyle}>Notes</label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Interview notes, contact person, requirements..."
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {applications.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            ["all", "All", "#555"],
            ...Object.entries(APP_STATUS).map(([key, meta]) => [key, meta.label, meta.color]),
          ].map(([key, label, color]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontSize: 11,
                padding: "4px 14px",
                borderRadius: 99,
                border: "1px solid #e0e0e0",
                cursor: "pointer",
                background: filter === key ? color : "#fff",
                color: filter === key ? "#fff" : color,
                fontWeight: filter === key ? 600 : 400,
              }}
            >
              {label} ({key === "all" ? applications.length : counts[key] || 0})
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {applications.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "24px 0" }}>
            No applications yet. Add one above.
          </p>
        )}

        {[...filteredApplications]
          .sort((left, right) => (right.appDate || "").localeCompare(left.appDate || ""))
          .map((application) => {
            const meta = APP_STATUS[application.status];
            const isDeadlinePast =
              application.deadline &&
              application.deadline < today &&
              application.status === "requirement";

            return (
              <div
                key={application.id}
                className="card"
                style={{ padding: "14px 16px", borderLeft: `3px solid ${meta.color}` }}
              >
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{application.company || "-"}</p>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "1px 8px",
                          borderRadius: 99,
                          background: "#f0f0f0",
                          color: "#555",
                        }}
                      >
                        {application.jobType}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>{application.role}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {application.appDate && (
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          Applied {formatDate(application.appDate)}
                        </span>
                      )}
                      {application.deadline && (
                        <span
                          style={{
                            fontSize: 11,
                            color: isDeadlinePast ? "#A32D2D" : "#888",
                            fontWeight: isDeadlinePast ? 600 : 400,
                          }}
                        >
                          {isDeadlinePast ? "Deadline past - " : "Deadline - "}
                          {formatDate(application.deadline)}
                        </span>
                      )}
                      {application.salary && (
                        <span style={{ fontSize: 11, color: "#6B21A8" }}>
                          Salary {application.salary}
                        </span>
                      )}
                    </div>
                    {application.notes && (
                      <p style={{ fontSize: 11, color: "#888", marginTop: 5, fontStyle: "italic" }}>
                        {application.notes}
                      </p>
                    )}
                    {application.link && (
                      <a
                        href={application.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11,
                          color: "#185FA5",
                          marginTop: 4,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {application.link}
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <select
                      value={application.status}
                      onChange={(event) => updateApplicationStatus(application.id, event.target.value)}
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 99,
                        border: "none",
                        background: meta.bg,
                        color: meta.color,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {Object.entries(APP_STATUS).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteApplication(application.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 12 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <Divider label="SKILLS TO LEARN" />

      <div
        className="card"
        style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}
      >
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
        <button onClick={addSkill} style={{ alignSelf: "flex-end" }}>
          Add Skill
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {skills.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", padding: "12px 0" }}>No skills added yet.</p>
        )}
        {skills.map((skill) => {
          const meta = SKILL_LEVELS[skill.level];

          return (
            <span
              key={skill.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 99,
                background: meta.bg,
                color: meta.color,
              }}
            >
              {skill.name}
              <span style={{ fontSize: 10, opacity: 0.8 }}>{meta.label}</span>
              <button
                onClick={() => removeSkill(skill.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.65 }}
              >
                X
              </button>
            </span>
          );
        })}
      </div>

      <Divider label="RESOURCES AND PREPARATION" />

      <div
        className="card"
        style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <div style={{ flex: 2, minWidth: 160 }}>
          <label style={labelStyle}>Resource or Course Name</label>
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
            {["Course", "Book", "Platform", "YouTube", "Article", "Practice"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button onClick={addResource} style={{ alignSelf: "flex-end" }}>
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.length === 0 && (
          <p style={{ fontSize: 13, color: "#bbb", padding: "12px 0" }}>No resources added yet.</p>
        )}
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="card"
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
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
                border: resource.done ? "none" : "2px solid #ddd",
                background: resource.done ? "#3B6D11" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
              }}
            >
              {resource.done ? "OK" : ""}
            </div>
            <p
              style={{
                flex: 1,
                fontWeight: 500,
                fontSize: 13,
                textDecoration: resource.done ? "line-through" : "none",
                color: resource.done ? "#aaa" : "inherit",
              }}
            >
              {resource.title}
            </p>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 99,
                background: "#e8f0fe",
                color: "#185FA5",
              }}
            >
              {resource.type}
            </span>
            <button
              onClick={() => removeResource(resource.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 13 }}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function statBox(background, color) {
  return {
    flex: 1,
    minWidth: 80,
    padding: "12px 14px",
    borderRadius: 10,
    background,
    color,
    textAlign: "center",
  };
}

const labelStyle = {
  fontSize: 11,
  color: "#888",
  display: "block",
  marginBottom: 3,
};

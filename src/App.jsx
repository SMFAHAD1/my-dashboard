import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Academic from "./pages/Academic";
import Books from "./pages/Books";
import JobPrep from "./pages/JobPrep";
import Movies from "./pages/Movies";
import MyPlan from "./pages/MyPlan";
import University from "./pages/University";

const pages = [
  {
    path: "/academic",
    label: "Academic",
    description: "Track terms, courses, CGPA, tests, and tasks.",
    accent: "Sky ledger",
    element: <Academic />,
  },
  {
    path: "/my-plan",
    label: "My Plan",
    description: "Manage personal goals with weekly, monthly, and yearly analysis.",
    accent: "Focus map",
    element: <MyPlan />,
  },
  {
    path: "/movies",
    label: "Movies",
    description: "Save what you watch, ratings, dates, and yearly viewing trends.",
    accent: "Watch log",
    element: <Movies />,
  },
  {
    path: "/job-prep",
    label: "Job Prep",
    description: "Track applications, skills, learning resources, and progress.",
    accent: "Career board",
    element: <JobPrep />,
  },
  {
    path: "/books",
    label: "Books",
    description: "Keep reading logs and a buy list in one place.",
    accent: "Reading room",
    element: <Books />,
  },
  {
    path: "/university",
    label: "University",
    description: "Organize masters and PhD targets, deadlines, and requirements.",
    accent: "Study atlas",
    element: <University />,
  },
];

function Home() {
  return (
    <div className="home-layout">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="hero-kicker">Personal command center</p>
          <h2>One home for study, career, books, movies, and long-term plans.</h2>
          <p className="hero-text">
            Fahad Dashboard brings all six trackers into a single clean site so
            each part of your life stays organized without switching tools.
          </p>
          <div className="hero-actions">
            <NavLink to="/academic" className="hero-primary">
              Open Academic
            </NavLink>
            <NavLink to="/university" className="hero-secondary">
              Explore University
            </NavLink>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>6</strong>
            <span>Connected pages</span>
          </div>
          <div className="hero-stat">
            <strong>100%</strong>
            <span>Browser storage based</span>
          </div>
          <div className="hero-stat">
            <strong>Vercel</strong>
            <span>Ready to deploy</span>
          </div>
        </div>
      </section>

      <section className="home-grid">
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} className="home-card">
            <span className="home-card-kicker">{page.accent}</span>
            <h2>{page.label}</h2>
            <p>{page.description}</p>
            <span className="home-card-link">Open page</span>
          </NavLink>
        ))}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">FD</span>
          <div>
            <strong>Fahad Dashboard</strong>
            <span>Node + GitHub + Vercel ready</span>
          </div>
        </NavLink>

        <nav className="nav-list">
          {pages.map((page) => (
            <NavLink
              key={page.path}
              to={page.path}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              {page.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <header className="page-header">
          <div>
            <p className="eyebrow">Fahad Dashboard</p>
            <h1>Calm workspace, all in one place</h1>
          </div>
          <p className="header-copy">
            A personal dashboard for academics, planning, entertainment,
            career preparation, reading, and university applications.
          </p>
        </header>

        <section className="page-panel">
          <Routes>
            <Route path="/" element={<Home />} />
            {pages.map((page) => (
              <Route key={page.path} path={page.path} element={page.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

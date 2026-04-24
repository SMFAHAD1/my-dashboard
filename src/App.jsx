import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Planner   from "./pages/Planner";
import Books     from "./pages/Books";
import Movies    from "./pages/Movies";
import Academic  from "./pages/Academic";
import JobPrep   from "./pages/JobPrep";

const NAV = [
  { to: "/",         label: "Planner",  icon: "📋" },
  { to: "/books",    label: "Books",    icon: "📚" },
  { to: "/movies",   label: "Movies",   icon: "🎬" },
  { to: "/academic", label: "Academic", icon: "🎓" },
  { to: "/jobprep",  label: "Job Prep", icon: "💼" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        {/* ── Sidebar ── */}
        <nav className="sidebar">
          <div className="sidebar-brand">
            My Dashboard
            <span>Personal Hub</span>
          </div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Pages ── */}
        <main className="main-content">
          <Routes>
            <Route path="/"         element={<Planner />}  />
            <Route path="/books"    element={<Books />}    />
            <Route path="/movies"   element={<Movies />}   />
            <Route path="/academic" element={<Academic />} />
            <Route path="/jobprep"  element={<JobPrep />}  />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

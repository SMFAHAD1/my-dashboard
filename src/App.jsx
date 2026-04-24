import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import Planner from "./pages/Planner.jsx";
import MyPlan from "./pages/MyPlan.jsx";
import University from "./pages/University.jsx";
import Books from "./pages/Books.jsx";
import Movies from "./pages/Movies.jsx";
import Academic from "./pages/Academic.jsx";
import JobPrep from "./pages/JobPrep.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Planner", icon: "PL" },
  { to: "/my-plan", label: "My Plan", icon: "MP" },
  { to: "/university", label: "University", icon: "UN" },
  { to: "/books", label: "Books", icon: "BK" },
  { to: "/movies", label: "Movies", icon: "MV" },
  { to: "/academic", label: "Academic", icon: "AC" },
  { to: "/jobprep", label: "Job Prep", icon: "JP" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-brand">
            My Dashboard
            <span>Personal Hub</span>
          </div>

          <div className="sidebar-section">Pages</div>

          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Planner />} />
            <Route path="/my-plan" element={<MyPlan />} />
            <Route path="/university" element={<University />} />
            <Route path="/books" element={<Books />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/jobprep" element={<JobPrep />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

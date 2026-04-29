import { useState } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import MyPlan from "./pages/MyPlan.jsx";
import University from "./pages/University.jsx";
import Books from "./pages/Books.jsx";
import Movies from "./pages/Movies.jsx";
import Academic from "./pages/Academic.jsx";
import JobPrep from "./pages/JobPrep.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "My Plan", icon: "MP" },
  { to: "/academic", label: "Academic", icon: "AC" },
  { to: "/university", label: "University", icon: "UN" },
  { to: "/jobprep", label: "Job Prep", icon: "JP" },
  { to: "/books", label: "Books", icon: "BK" },
  { to: "/movies", label: "Movies", icon: "MV" },
];

export default function App() {
  const { authReady, currentUser, loginUser, logoutUser, profile, registerUser } = useAuth();

  if (!authReady) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Loading dashboard...</h1>
          <p>Checking your Firebase session.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen loginUser={loginUser} registerUser={registerUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-brand">
            My Dashboard
            <span>{profile?.name || currentUser.displayName || currentUser.email}</span>
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

          <div className="sidebar-footer">
            <button className="sidebar-action" onClick={logoutUser}>
              Logout
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<MyPlan />} />
            <Route path="/my-plan" element={<Navigate to="/" replace />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/university" element={<University />} />
            <Route path="/jobprep" element={<JobPrep />} />
            <Route path="/books" element={<Books />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function AuthScreen({ loginUser, registerUser }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await registerUser(name, email, password, contactNumber);
      } else {
        await loginUser(email, password);
      }
    } catch (submitError) {
      setError(submitError?.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-eyebrow">Firebase Auth</div>
        <h1>{mode === "register" ? "Create your dashboard account" : "Log in to your dashboard"}</h1>
        <p>
          {mode === "register"
            ? "Your name, email, contact number, and dashboard data will be stored in Firestore."
            : "Firebase will keep you signed in across sessions automatically."}
        </p>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "auth-toggle-button active" : "auth-toggle-button"}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "auth-toggle-button active" : "auth-toggle-button"}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" required />
              </label>
              <label>
                <span>Contact Number</span>
                <input value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Phone number" required />
              </label>
            </>
          )}

          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 6 characters" required />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "register" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

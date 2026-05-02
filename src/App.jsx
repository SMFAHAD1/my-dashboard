import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import Academic from "./pages/Academic";
import Books from "./pages/Books";
import { auth } from "./firebase";
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
            My Dashboard brings all six trackers into a single clean site so
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
            <span>Firebase cloud sync</span>
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

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (submitError) {
      setError(submitError.message.replace("Firebase: ", ""));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <p className="hero-kicker">Firebase auth</p>
        <h1>{mode === "signup" ? "Create your dashboard account" : "Sign in to your dashboard"}</h1>
        <p className="auth-copy">
          Use your email and password to access this dashboard with Firebase Authentication.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
            }}
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        console.log("Logged in:", nextUser.uid);
      } else {
        console.log("Logged out");
      }

      setUser(nextUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut(auth);
  }

  if (!authReady) {
    return (
      <div className="auth-shell">
        <section className="auth-card auth-loading">
          <p className="hero-kicker">Firebase auth</p>
          <h1>Checking your session...</h1>
        </section>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">MD</span>
          <div>
            <strong>My Dashboard</strong>
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
            <p className="eyebrow">My Dashboard</p>
            <h1>Calm workspace, all in one place</h1>
          </div>
          <div className="header-actions">
            <div className="account-chip">
              <strong>{user.email || "Signed in"}</strong>
              <span>Firebase session active</span>
            </div>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
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

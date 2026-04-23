import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import MyPlan from "./pages/MyPlan";
import Academic from "./pages/Academic";
import University from "./pages/University";
import JobPrep from "./pages/JobPrep";
import Books from "./pages/Books";
import Movies from "./pages/Movies";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <span className="brand">My Dashboard</span>
        <NavLink to="/">MyPlan</NavLink>
        <NavLink to="/academic">Academic</NavLink>
        <NavLink to="/university">University</NavLink>
        <NavLink to="/jobs">Job Prep</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/movies">Movies</NavLink>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<MyPlan />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/university" element={<University />} />
          <Route path="/jobs" element={<JobPrep />} />
          <Route path="/books" element={<Books />} />
          <Route path="/movies" element={<Movies />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
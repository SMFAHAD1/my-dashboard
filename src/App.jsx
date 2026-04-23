import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import MyPlan from "./pages/MyPlan";
import Books from "./pages/Books";
import Movies from "./pages/Movies";
import Academic from "./pages/Academic";
import JobPrep from "./pages/JobPrep";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <span className="brand">My Dashboard</span>
        <NavLink to="/">MyPlan</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/academic">Academic</NavLink>
        <NavLink to="/jobs">Job Prep</NavLink>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<MyPlan />} />
          <Route path="/books" element={<Books />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/jobs" element={<JobPrep />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
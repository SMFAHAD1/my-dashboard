import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

window.clearDashboardPage = (page) => {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(`dashboard-${page}`));
  keys.forEach((key) => localStorage.removeItem(key));
  console.log(`Cleared ${keys.length} key(s) for page: ${page}`);
  window.location.reload();
};

window.clearAllDashboard = () => {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("dashboard-"));
  keys.forEach((key) => localStorage.removeItem(key));
  console.log(`Cleared all ${keys.length} dashboard key(s).`);
  window.location.reload();
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";

window.clearDashboardPage = (page) => {
  console.warn(`clearDashboardPage("${page}") now uses Firebase-backed storage. Remove or rebuild this debug helper if needed.`);
};

window.clearAllDashboard = () => {
  console.warn("clearAllDashboard() now uses Firebase-backed storage. Remove or rebuild this debug helper if needed.");
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

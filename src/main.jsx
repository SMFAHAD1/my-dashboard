import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// Emergency console helpers — accessible via browser console (F12)
window.clearDashboardPage = (page) => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(`dashboard-${page}`));
  keys.forEach(k => localStorage.removeItem(k));
  console.log(`Cleared ${keys.length} key(s) for page: ${page}`);
  window.location.reload();
};

window.clearAllDashboard = () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('dashboard-'));
  keys.forEach(k => localStorage.removeItem(k));
  console.log(`Cleared all ${keys.length} dashboard key(s).`);
  window.location.reload();
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

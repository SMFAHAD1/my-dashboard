# My Dashboard

Personal dashboard — Planner, Books, Movies, Academic (CGPA), Job Prep.

Live: https://my-dashboard-delta-virid.vercel.app/

## Quick Start

```bash
# Install dependencies
npm install

# Run React dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Run Express server (serves built files, localhost:3000)
node index.js
```

## Deploy Update

```bash
git add .
git commit -m "describe what changed"
git push
# Vercel auto-deploys in ~30 seconds
```

## Emergency Data Reset (browser console F12)

```js
window.clearDashboardPage('academic')   // clear one page
window.clearAllDashboard()              // clear everything
```

## OMDb API (Movies poster fetch)

1. Get free key at https://www.omdbapi.com/apikey.aspx
2. Open `src/pages/Movies.jsx` line 4
3. Replace `YOUR_OMDB_KEY` with your key

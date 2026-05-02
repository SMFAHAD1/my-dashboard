# Fahad Dashboard

A personal multi-page dashboard built with React and Vite. It combines six focused pages into one site for academic tracking, personal planning, movies, job preparation, books, and university applications.

## Pages

- `Academic`: Track terms, courses, CGPA, class tests, and tasks.
- `My Plan`: Manage goals with weekly, monthly, and yearly analysis.
- `Movies`: Save watched titles, ratings, watch dates, and yearly summaries.
- `Job Prep`: Track applications, skills, and learning resources.
- `Books`: Maintain a reading list and a buy list.
- `University`: Organize masters and PhD targets, requirements, deadlines, and notes.

## Stack

- `React`
- `Vite`
- `React Router`
- `localStorage` for client-side persistence
- `Vercel` for deployment

## Project Structure

```text
src/
  App.jsx
  main.jsx
  styles.css
  hooks/
    useLocalStorage.js
  pages/
    Academic.jsx
    Books.jsx
    JobPrep.jsx
    Movies.jsx
    MyPlan.jsx
    University.jsx
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Deployment on Vercel

This project already includes a `vercel.json` rewrite so the React Router pages work correctly after deployment.

### Option 1: Deploy with GitHub

1. Push this project to a GitHub repository.
2. Import the repository into Vercel.
3. Vercel should detect it as a Vite project automatically.
4. Use the default build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

## Notes

- Data is stored in the browser with `localStorage`, so each device or browser keeps its own saved entries.
- The `Movies` page uses the OMDb API with the `trilogy` API key currently included in the component.
- `node_modules/` and `dist/` should not be committed if you add a `.gitignore`.

## Suggested `.gitignore`

```gitignore
node_modules
dist
.vercel
```

## License

You can add your preferred license here if you plan to publish the project publicly.

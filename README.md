# 🏥 Patient Registration App

A simple, offline-capable React application for registering patients, storing data locally using SQLite in the browser, and running SQL queries. Built with React, Material UI, and PGlite.

---

## ✨ Features

- 🔒 **Offline-first**: Local data storage using SQLite via PGlite in the browser
- 💅 **Material UI**: Clean, responsive design with MUI components
- 🧾 **SQL Playground**: Run raw SQL queries directly in the UI
- 🔁 **Tab Syncing**: Real-time updates across multiple tabs using BroadcastChannel

---

## 📦 Tech Stack

| Technology     | Purpose                       |
|----------------|-------------------------------|
| React          | Frontend Framework            |
| Vite           | Development and bundling tool |
| Material UI    | UI Component Library          |
| PGlite         | SQLite in the Browser         |
| BroadcastChannel | Multi-tab sync               |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shiva0123m/patient-registration-app.git
cd patient-registration-app


### 2 Install Dependecies
npm install

### 3. Start the Application
npm run dev

🖥️ App Structure
├── App.jsx            # Main application logic and UI
├── main.jsx           # Entry point
├── index.html         # HTML template
├── package.json
└── vite.config.js     # Build tool configuration

📸 UI Layout
📋 Left Panel
Patient registration form

SQL query editor

📊 Right Panel
Table of registered patients

Table of SQL query results

Responsive design ensures optimal experience on all screen sizes.


💾 Local Database (PGlite)
This app uses @electric-sql/pglite to run a full SQLite engine in your browser. Data is stored persistently via IndexedDB.


🧠 SQL Query Examples
-- View all patients
SELECT * FROM patients;

-- Count patients
SELECT COUNT(*) FROM patients;

-- Delete all records
DELETE FROM patients;


🔁 Syncing Across Tabs
This app uses the BroadcastChannel API to keep all open browser tabs in sync. Registering a patient in one tab will automatically update the list in others.




 ##Challenges I Faced During Development
1. Setting Up Tailwind with Vite and PostCSS Conflicts
Initially, the app was planned to use Tailwind CSS. However, due to a PostCSS compatibility issue (tailwindcss moving its PostCSS plugin), errors like:


It looks like you're trying to use tailwindcss directly as a PostCSS plugin...
blocked the build process. I had to either install the correct plugin (@tailwindcss/postcss) or pivot to a different UI framework.

Solution: Switched to Material UI for cleaner setup and consistent design components.

2. Browser-Side Database with SQLite (PGlite)
Using a full SQLite engine in the browser via @electric-sql/pglite was new and came with several complexities:

Ensuring data persistence via IndexedDB

Avoiding SQL injection by manually sanitizing user inputs

Handling asynchronous initialization before executing queries

Solution: Implemented an initDb() function and wrapped all interactions in try/catch blocks with loading states and validations.

3. Real-Time Sync Between Browser Tabs
Keeping the app synced across tabs required learning and implementing the BroadcastChannel API, which is not widely used and has limitations in some environments.

Solution: Set up a shared broadcast channel and used .postMessage() and .onmessage handlers to update state reactively.

4. Responsive Layout and UX Challenges
Getting the layout to:

Align forms on the left

Results on the right

Maintain a clean and balanced UI on both small and large screens

was tricky with Material UI's grid system.

Solution: Used Box, Grid, and Paper components with proper breakpoints and spacing to create a visually balanced two-column layout.

5. Deploying with Vercel (Vite + IndexedDB)
Vercel auto-detects Vite apps, but making sure IndexedDB works reliably in production (especially with hot reload off) required local testing in a real browser build.

Solution: Thoroughly tested in incognito mode and other tabs to validate offline functionality and tab sync.
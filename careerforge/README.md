# CareerForge AI — Prototype

A working, fully responsive front end for the CareerForge AI brief, built in plain **HTML, CSS and JavaScript** (no build step, no dependencies). Two separate apps sharing one design language:

- **Student app** — `index.html` — the full career-discovery journey: login/signup, profile setup, domain selection (25 domains), preference assessment, AI "future workplace" preview, dashboard, resume analysis, HR/technical interview practice, mock interview, career reflection, progress, rewards, certificate.
- **Faculty/Admin portal** — `admin.html` — intentionally a *different* visual system (dark navy sidebar, denser tables, functional search) so it reads as a distinct internal tool: dashboard with charts, student management table, domain management, AI-assisted talent insights, certificate request review/approval, analytics.

## Run it

No install needed — just open the file, or serve it locally:

```bash
cd careerforge
python3 -m http.server 8000
# then visit http://localhost:8000/index.html  (student app)
# and      http://localhost:8000/admin.html    (faculty portal)
```

Opening `index.html` directly by double-clicking also works in most browsers.

## Notes on this build

- **State** is kept in `localStorage` (`cf_state_v1` for the student app, `cf_admin_v1` for admin), so progress persists across reloads. Use Settings → Log Out (student) or the browser's dev tools (`localStorage.clear()`) to reset.
- **Auth** is a local demo (no backend) — any email/password combination works.
- **Scoring** (resume score, interview score, mock interview score, domain alignment %) is simulated with seeded pseudo-random logic so it feels responsive and consistent between visits, not wired to a real AI model.
- **Responsive breakpoints**: designed for 1440px desktop first, with explicit adjustments at 1280px and 1024px per the brief, plus graceful degradation down to tablet/mobile widths (sidebar collapses to a hamburger menu, grids reflow).
- This prototype implements the core, highest-value screens from the 46-screen spec in full working detail (not just static mockups) — assessment logic, retries, AI-generated interview Q&A with correct/incorrect feedback, certificate eligibility logic, and admin approval workflow all actually function. A few screens (e.g. Add/Edit Domain forms) are stubbed with a confirmation toast since they're pure CRUD forms with no new interaction pattern.

## Structure

```
careerforge/
├── index.html         # student app shell
├── admin.html          # faculty/admin portal shell
├── css/
│   ├── main.css         # design tokens + student app styles
│   └── admin.css        # distinct faculty portal theme
└── js/
    ├── data.js           # domains, questions, seed admin data
    ├── student.js         # student screen renderers
    ├── router.js          # student hash router + actions
    └── admin.js            # faculty portal (state, router, screens)
```

<div align="center">

# ⚡ CODEHALAAM

**The development platform where teams ship faster.**

*Free private codexes. Unlimited collaborators. Gamified contributions.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](CONTRIBUTING.md)
[![Live](https://img.shields.io/badge/LIVE-codehalaam.vercel.app-brightgreen)](https://codehalaam.vercel.app/)

---

[Features](#features) • [Quick Start](#quick-start) • [Tech Stack](#tech-stack) • [Documentation](#documentation) • [Contributing](#contributing)

---

</div>

## 🎯 What is CODEHALAAM?

CODEHALAAM is a gamified code hosting platform that combines the best of GitHub with XP-based rewards. **Everything GitHub charges for, free.**

> "Everything GitHub charges for, free." — That's our one sentence.

### Why CODEHALAAM?

| Feature | GitHub Free | GitHub Pro | **CODEHALAAM** |
|---------|-------------|------------|----------------|
| Public Codexes | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Private Codexes | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Collaborators | ⚠️ Limited | ✅ Unlimited | ✅ **Unlimited** |
| Quests & Offerings | ❌ | ❌ | ✅ **Gamified tasks** |
| **Gamification** | ❌ | ❌ | ✅ **XP & Achievements** |
| **Contribution Heatmap** | ✅ | ✅ | ✅ |
| **XP Rewards** | ❌ | ❌ | ✅ **Earn XP for every action** |
| **Forum** | ❌ | ❌ | ✅ **Community Q&A** |
| Price | Free | $4/mo | **Free forever** |

## ✨ Features

### 🚀 Core Platform
- **Unlimited codexes** — public and private
- **Unlimited collaborators** — no per-seat pricing
- **Offerings** — gamified code contributions (like PRs)
- **Quests** — gamified tasks with XP bounties
- **Code review** — approve, request changes, or comment
- **File browser** — navigate codex files with GitHub-style tree
- **Version control** — full commit history and paths (branches)

### 📱 Mobile-First Design
- **Responsive hero section** — centered logo, name, and action buttons on mobile
- **File tree preview** — expandable file tree on codex homepage
- **Stacked layout** — all content flows vertically on small screens
- **Touch-friendly buttons** — proper spacing and wrapping on mobile

### 🎮 Gamification
- **XP System** — earn experience for every contribution
  - Commit: +10 XP
  - Offering opened: +10 XP
  - Offering bound: +50 XP
  - Code Review: +25 XP
  - Quest closed: +15 XP
- **Level Up** — progress through levels as you contribute
- **Achievements** — unlock badges for milestones
- **Contribution Heatmap** — track your activity over time
- **Streak System** — maintain daily contribution streaks

### 👥 Collaboration
- **Team Management** — invite collaborators with role-based access
- **Role Permissions** — Owner, Admin, Write, Read
- **Real-time Updates** — Socket.io for live notifications
- **Activity Feed** — see what your team is working on

### 🎨 Design
- **GitHub Primer Design System** — familiar, professional interface
- **Dark & Light Themes** — comfortable for any environment
- **Responsive** — works on desktop, tablet, and mobile
- **Accessible** — WCAG 2.1 AA compliant
- **Verified Badges** — blue/red/black verified seals on user names

### 👀 Demo Mode
- **Read-only browsing** — explore the platform without an account
- **Demo user banner** — clear indicator when in demo mode
- **Server-side enforcement** — all write operations blocked for demo users
- **Easy signup** — one-tap transition from demo to real account

### 🔒 Privacy & Security
- **Private Codexes** — hide codexes from unauthorized viewers (returns 404)
- **Centralized Permissions** — single reusable permission layer (`canViewCodex`, `canEditCodex`, etc.)
- **Optional Auth** — public routes recognize logged-in users without requiring tokens
- **Viewer-Aware Profiles** — profile pages show private codexes only to owners and collaborators
- **Admin Token Security** — short-lived 2-day admin tokens, freshness re-verification, disabled-account blocking
- **First-Run Setup** — admin account created via `/setup` page (auto-disabled once any user exists)
- **Demo Mode Protection** — demo users cannot create, edit, or delete any data

### 🎨 Admin Panel
- **Fully Functional Control Room** — real DB-backed management (not mock data)
- **User Management** — search, edit level/XP/badges, delete users
- **Codex Management** — browse all codexes with search and visibility filters
- **Forum Management** — pin, close, and delete forum posts
- **Site Settings** — admin can change logo, favicon, site name, tagline, and meta description
- **Feature Flags** — toggle signup and maintenance mode from the admin panel
- **Custom Badges** — blue (verified), red (admin), black (stealth) badges, managed from admin
- **Activity Feed** — real-time platform activity

### 💬 Community Forum
- **Q&A-style posts** — ask questions, share knowledge
- **Voting system** — upvote/downvote posts
- **Accepted answers** — mark the best answer
- **Admin moderation** — pin, close, and delete posts
- **Tags and search** — find topics quickly

### 🔍 SEO & AEO
- **Meta Tags** — OpenGraph, Twitter Cards, canonical URLs
- **Structured Data** — JSON-LD `SoftwareApplication` + `FAQPage` schema for AI answer engines
- **Sitemap & Robots** — `sitemap.xml` and `robots.txt` in `client/public/`
- **Dynamic Branding** — favicon, title, and meta applied from admin-configured site settings

### 📄 Error Pages
- **GitHub-style error pages** for 400, 401, 403, 404, 500, 503
- **Client-side catch-all** — unknown routes show a friendly 404 with a ghost illustration
- **Server-side JSON errors** — every API response is valid JSON, even on failure
- **Global ErrorBoundary** — uncaught React errors render a 500 page

## 🌐 Live Deployment

**CODEHALAAM is live at [https://codehalaam.vercel.app/](https://codehalaam.vercel.app/)**

Visit `/setup` on a fresh deployment to create your admin account (auto-disabled once any user exists).

---

## 🚀 One-Tap Deploy to Vercel (Free Tier)

CODEHALAAM deploys as a **single Vercel app** — no need to run a separate database server or host the API elsewhere.

### 1. Create a free MongoDB Atlas cluster

Go to [MongoDB Atlas](https://www.mongodb.com/atlas), create a free **M0** cluster, and copy the connection string. It looks like:

```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/codehalaam
```

### 2. Deploy with one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Import the GitHub repo. Vercel auto-detects the build via `vercel.json`:

- **Install:** installs root + client + server deps
- **Build:** builds the React client (`client/dist`)
- **API:** all `/api/*` requests run as a single serverless function (`api/index.js`)
- **Static:** everything else is served as the SPA from the CDN

### 3. Set environment variables

In the Vercel project **Settings → Environment Variables**, add:

| Variable | Vercel Type | Value |
|----------|-------------|-------|
| `MONGODB_URI` | **Sensitive** | your Atlas connection string |
| `JWT_SECRET` | **Sensitive** | a long random string (e.g. `openssl rand -hex 32`) |
| `CLIENT_URL` | Plain text | your Vercel URL, e.g. `https://your-app.vercel.app` |
| `NODE_ENV` | Plain text | `production` |
| `BLOB_READ_WRITE_TOKEN` | **Sensitive** | (optional) Vercel Blob token for persistent file uploads up to 30MB |

### First-run setup

After deploying, visit `https://your-app.vercel.app/setup` to create your admin account. The setup page probes the database connection on load — if `MONGODB_URI` is set and Atlas is reachable, it shows the admin creation form. The setup page is only available when the database has zero users — it auto-disables once an admin exists.

### 4. Deploy

Click **Deploy**. That's it — one server, one database, free tier.

> **Realtime:** Socket.io WebSocket support is disabled on Vercel serverless (functions can't hold open connections). Local development keeps full realtime support via `npm run dev`. The REST API and all features work identically on Vercel.
>
> **File uploads:** With `BLOB_READ_WRITE_TOKEN` set, uploads (avatars, codex media, project files up to 30MB) persist in Vercel Blob (free tier: 1GB storage). Without it, uploads fall back to local disk (ephemeral on Vercel).
>
> **Database:** MongoDB Atlas is an external managed service — Vercel does not host the database. Create a free M0 cluster, set `MONGODB_URI`, then visit `/setup` to create the admin account inside that database.

---

## 🛠 Local Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codehalaam.git
cd codehalaam

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
```

### Configuration

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codehalaam
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5174
```

### Run Development

```bash
# Terminal 1: Client (port 5174)
cd client
npm run dev

# Terminal 2: Server (port 5000)
cd server
npm run dev

# Terminal 3: Seed database (optional)
cd server
npm run seed
```

### Demo Mode

Click **"Browse as Demo (read-only)"** on the login page to explore the platform without creating an account. Demo users can browse all public codexes, view profiles, and read forum posts — but cannot create, edit, or delete any data.

## 🛠 Tech Stack

### Frontend
- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first CSS
- **Framer Motion** — Animations
- **React Router** — Client-side routing

### Backend
- **Node.js** — Runtime
- **Express** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM
- **JWT** — Authentication
- **Socket.io** — Real-time

### Design
- **Primer Design System** — GitHub's design language
- **Lucide React** — Icons
- **Custom Theme** — Dark/Light mode

## 📁 Project Structure

```
codehalaam/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── pages/          # Route components
│   │   └── App.tsx         # Root component
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/          # Auth middleware (protect, optionalAuth, requireDemoFree)
│   ├── utils/              # Utilities (permissions.js)
│   ├── services/           # Git, upload services
│   ├── seed.js             # Database seeder
│   └── index.js            # Server entry
├── docs/                   # Documentation
│   ├── agent.md            # Agent architecture & copyright policy
│   ├── design.md           # Design system
│   └── bug-hunt-report.md  # Bug audit report
├── CONTRIBUTING.md         # Contribution guide
└── README.md               # This file
```

## 📚 Documentation

- **[Design System](docs/design.md)** — Colors, typography, components
- **[Agent Architecture](docs/agent.md)** — AI agent integration, permissions, upload persistence
- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute
- **[Definition of Done](docs/definition-of-done.md)** — Quality checklist

## 🎮 Gamification System

### Earning XP

| Action | XP |
|--------|-----|
| Commit | +10 |
| Open Offering | +10 |
| Bind Offering | +50 |
| Review Code | +25 |
| Close Quest | +15 |
| Open Quest | +5 |
| Give Ember | +2 |
| Echo Codex | +15 |
| Comment | +2 |

### Achievements

| Achievement | Requirement | Badge |
|-------------|-------------|-------|
| First Commit | Make your first commit | 🎯 |
| 7-Day Streak | Commit 7 days in a row | 🔥 |
| Team Player | Review 10 PRs | 👥 |
| Ship It | Merge 50 PRs | 🚀 |
| 30-Day Streak | Commit 30 days in a row | 🔥 |
| Centurion | 100 contributions | 💯 |
| Mentor | Help 5 newcomers | 🎓 |
| Bug Hunter | Close 25 issues | 🐛 |

### Levels

Level up by earning XP. Each level requires more XP than the last:
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 150 XP
- Level 4: 225 XP
- ...and so on (1.5x multiplier)

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/signup     - Create account
POST   /api/auth/login      - Sign in
POST   /api/auth/demo       - Browse as demo (read-only)
GET    /api/auth/me         - Get current user
PUT    /api/auth/profile    - Update profile
PUT    /api/auth/password   - Change password
```

### Codexes (Primary)
```
GET    /api/codexes/:owner/:name              - Get codex (requires optionalAuth)
GET    /api/codexes/:owner/:name/readme       - Get README
GET    /api/codexes/:owner/:name/tree         - Get file tree
GET    /api/codexes/:owner/:name/blob         - Get file content
GET    /api/codexes/:owner/:name/quests       - List quests
GET    /api/codexes/:owner/:name/offerings    - List offerings
GET    /api/codexes/:owner/:name/paths        - List paths
GET    /api/codexes/:owner/:name/releases     - List releases
GET    /api/codexes/:owner/:name/collaborators - List collaborators
POST   /api/codexes/:owner/:name/ember        - Toggle ember (auth + demo-free)
POST   /api/codexes/:owner/:name/watch        - Toggle watch (auth + demo-free)
POST   /api/codexes/:owner/:name/echo         - Toggle echo (auth + demo-free)
PATCH  /api/codexes/:owner/:name              - Update codex (auth + canEditCodex)
DELETE /api/codexes/:owner/:name              - Delete codex (auth + canDeleteCodex)
```

### Forum
```
GET    /api/forum                    - List posts (sorted by hot/new/unanswered)
GET    /api/forum/:id                - Get single post
POST   /api/forum                    - Create post (auth + demo-free)
POST   /api/forum/:id/answer         - Add answer (auth + demo-free)
POST   /api/forum/:id/vote           - Vote on post (auth + demo-free)
POST   /api/forum/:id/answer/:aid/accept - Accept answer (auth)
DELETE /api/forum/:id                - Delete post (author or admin + demo-free)
```

### Admin (requireAdmin middleware)
```
GET    /api/admin/stats              - Platform-wide stats
GET    /api/admin/users              - List all users (paginated, searchable)
GET    /api/admin/repos              - List all codexes (paginated, searchable)
GET    /api/admin/activity           - Recent activity feed
GET    /api/admin/forum              - List all forum posts (paginated, searchable)
PATCH  /api/admin/users/:userId      - Update user (level, xp, badge, class)
PATCH  /api/admin/users/:userId/badge - Update user badge (backward compat)
DELETE /api/admin/users/:userId      - Delete user permanently
PATCH  /api/admin/forum/:postId/pin  - Toggle pin on forum post
PATCH  /api/admin/forum/:postId/close - Toggle close on forum post
DELETE /api/admin/forum/:postId      - Delete any forum post
```

### Site Settings
```
GET    /api/settings                 - Public: read site branding (logo, favicon, name)
PUT    /api/settings                 - Admin: update site name, tagline, description, flags
POST   /api/settings/logo            - Admin: upload custom logo
POST   /api/settings/favicon         - Admin: upload custom favicon
```

### Setup (first-run only)
```
GET    /api/setup/status             - Check if setup is needed (no users in DB)
POST   /api/setup/admin              - Create first admin (disabled once any user exists)
```

### Notifications
```
GET    /api/notifications            - List notifications for logged-in user
PATCH  /api/notifications/read       - Mark all notifications as read
```

### Health Check
```
GET    /api/health                   - Server & database health (actively probes DB connection)
```

## 🔐 Security

- **RBAC**: Admin routes protected by `requireAdmin` middleware (backend) and `<AdminRoute>` guard (frontend)
- **JWT Auth**: All protected routes require `Bearer` token in `Authorization` header
- **Optional Auth**: Public routes use `optionalAuth` to recognize logged-in users without requiring tokens
- **Demo Mode Protection**: `requireDemoFree` middleware blocks all write operations for demo users
- **Private Codex Guard**: All read routes check `canViewCodex()` — returns 404 (not 403) for unauthorized access
- **Centralized Permissions**: Single `server/utils/permissions.js` module for all authorization logic
- **Global Error Handler**: Every endpoint returns valid JSON, even on failure (no HTML error pages, no empty responses)
- **404 Catch-all**: Unknown routes return `{ error: 'Route not found', path, method }`

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

### Good First Issues

Looking for a place to start? Check out our [good first issues](https://github.com/misterBSynthesisI/codehalaam/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the CODEHALAAM community**

[Website](https://codehalaam.vercel.app) • [GitHub](https://github.com/misterBSynthesisI/codehalaam)

</div>

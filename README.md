<div align="center">

# ⚡ CODEHALAAM

**The development platform where teams ship faster.**

*Free private repos. Unlimited collaborators. Gamified contributions.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/Discord-7289da?logo=discord&logoColor=white)](https://discord.gg/codehalaam)

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
| Public Repos | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Private Repos | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Collaborators | ⚠️ Limited | ✅ Unlimited | ✅ **Unlimited** |
| Pull Requests | ✅ | ✅ | ✅ |
| Issues | ✅ | ✅ | ✅ |
| Code Review | ✅ | ✅ | ✅ |
| **Gamification** | ❌ | ❌ | ✅ **XP & Achievements** |
| **Contribution Heatmap** | ✅ | ✅ | ✅ |
| **XP Rewards** | ❌ | ❌ | ✅ **Earn XP for every action** |
| Price | Free | $4/mo | **Free forever** |

## ✨ Features

### 🚀 Core Platform
- **Unlimited repositories** — public and private
- **Unlimited collaborators** — no per-seat pricing
- **Pull requests** — with inline comments, reviews, and approvals
- **Issues** — with labels, milestones, and assignees
- **Code review** — approve, request changes, or comment
- **File browser** — navigate repository files with ease
- **Version control** — full commit history and branches

### 🎮 Gamification
- **XP System** — earn experience for every contribution
  - Commit: +10 XP
  - Pull Request: +10 XP
  - PR Merged: +50 XP
  - Code Review: +25 XP
  - Issue Closed: +15 XP
- **Level Up** — progress through levels as you contribute
- **Achievements** — unlock badges for milestones
- **Contribution Heatmap** — track your activity over time
- **Streak System** — maintain daily contribution streaks

### 👥 Collaboration
- **Team Management** — invite collaborators with role-based access
- **Role Permissions** — Admin, Write, Triage, Read
- **Real-time Updates** — Socket.io for live notifications
- **Activity Feed** — see what your team is working on

### 🎨 Design
- **GitHub Primer Design System** — familiar, professional interface
- **Dark & Light Themes** — comfortable for any environment
- **Responsive** — works on desktop, tablet, and mobile
- **Accessible** — WCAG 2.1 AA compliant

## 🚀 Quick Start

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

### Demo Login

After seeding, use these credentials:
- **Email:** `neo@codehalaam.dev`
- **Password:** `password123`

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
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── pages/          # Route components
│   │   └── App.tsx         # Root component
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/          # Auth middleware
│   ├── seed.js             # Database seeder
│   └── index.js            # Server entry
├── docs/                   # Documentation
│   ├── agent.md            # Agent architecture
│   └── design.md           # Design system
├── CONTRIBUTING.md         # Contribution guide
└── README.md               # This file
```

## 📚 Documentation

- **[Design System](docs/design.md)** — Colors, typography, components
- **[Agent Architecture](docs/agent.md)** — AI agent integration
- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute

## 🎮 Gamification System

### Earning XP

| Action | XP |
|--------|-----|
| Commit | +10 |
| Open PR | +10 |
| Merge PR | +50 |
| Review PR | +25 |
| Close Issue | +15 |
| Open Issue | +5 |
| Star Repository | +2 |
| Fork Repository | +15 |
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
GET    /api/auth/me         - Get current user
PUT    /api/auth/profile    - Update profile
PUT    /api/auth/password   - Change password
```

### Repositories
```
GET    /api/repos                    - List user repos
GET    /api/repos/:owner/:name       - Get repository
POST   /api/repos                    - Create repository
PUT    /api/repos/:owner/:name       - Update repository
DELETE /api/repos/:owner/:name       - Delete repository
POST   /api/repos/:owner/:name/star  - Toggle star
POST   /api/repos/:owner/:name/fork  - Fork repository
GET    /api/repos/:owner/:name/commits - Get commits
```

### Issues
```
GET    /api/issues/:owner/:name          - List issues
GET    /api/issues/:owner/:name/:number  - Get issue
POST   /api/issues/:owner/:name          - Create issue
PATCH  /api/issues/:owner/:name/:number  - Update issue
POST   /api/issues/:owner/:name/:number/comment - Add comment
```

### Pull Requests
```
GET    /api/pulls/:owner/:name          - List PRs
GET    /api/pulls/:owner/:name/:number  - Get PR
POST   /api/pulls/:owner/:name          - Create PR
PATCH  /api/pulls/:owner/:name/:number  - Update PR
POST   /api/pulls/:owner/:name/:number/merge - Merge PR
POST   /api/pulls/:owner/:name/:number/review - Submit review
```

### Collaborators
```
GET    /api/collaborators/:owner/:name          - List collaborators
POST   /api/collaborators/:owner/:name          - Add collaborator
PATCH  /api/collaborators/:owner/:name/:userId  - Update role
DELETE /api/collaborators/:owner/:name/:userId  - Remove collaborator
```

### Admin (requireAdmin middleware)
```
GET    /api/admin/stats              - Platform-wide stats
GET    /api/admin/users              - List all users (paginated, searchable)
GET    /api/admin/repos              - List all repos (paginated, searchable)
GET    /api/admin/activity           - Recent activity feed
PATCH  /api/admin/users/:userId      - Update user (level, xp, badge, class)
DELETE /api/admin/users/:userId      - Delete user permanently
```

### Notifications
```
GET    /api/notifications            - List notifications for logged-in user
PATCH  /api/notifications/read       - Mark all notifications as read
```

### Health Check
```
GET    /api/health                   - Server & database health status
```

## 🔐 Security

- **RBAC**: Admin routes protected by `requireAdmin` middleware (backend) and `<AdminRoute>` guard (frontend)
- **JWT Auth**: All protected routes require `Bearer` token in `Authorization` header
- **Global Error Handler**: Every endpoint returns valid JSON, even on failure (no HTML error pages, no empty responses)
- **404 Catch-all**: Unknown routes return `{ error: 'Route not found', path, method }`

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

### Good First Issues

Looking for a place to start? Check out our [good first issues](https://github.com/your-username/codehalaam/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the CODEHALAAM community**

[Website](https://codehalaam.dev) • [Twitter](https://twitter.com/codehalaam) • [Discord](https://discord.gg/codehalaam)

</div>

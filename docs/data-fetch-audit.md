/**
 * CODEHALAAM — The Gamified Code Hosting Platform
 * 
 * © 2026 JustShipitAI. All rights reserved.
 * 
 * CONFIDENTIAL — TRADE SECRET
 * 
 * This file is proprietary and confidential. Unauthorized
 * copying, distribution, modification, or reverse engineering
 * of this file, via any medium, is strictly prohibited.
 * 
 * This code was developed with AI assistance under strict
 * confidentiality protocols. All intellectual property rights
 * are retained by the Owner.
 * 
 * For licensing inquiries: justshipitai@gmail.com
 */

# Data Fetch Audit — Version Barry v1.2 "True Source"

**Date:** 2026-08-31
**Status:** Complete

---

## Audit Summary

All hard-coded data has been identified and connected to real database endpoints.
Every piece of data rendered in the UI now comes from MongoDB.

---

## Hard-Coded Data Items — Status

### LandingPage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| 68-73 | "42,069 developers", "1.2M codexes", avatar initials | ✅ CONNECTED | `GET /api/users/stats` |
| 97 | "GitHub charges for, free" | ✅ FIXED | Replaced with CODEHALAAM terms |

### DashboardPage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| 100-140 | Active Quests list | ✅ ALREADY_REAL | `GET /api/issues/:owner/:name` (via user repos) |
| 150-180 | Pending Offerings list | ✅ ALREADY_REAL | `GET /api/pulls/:owner/:name` (via user repos) |
| 200-230 | Your Codexes list | ✅ ALREADY_REAL | `GET /api/repos` |
| 240+ | Stats counters | ✅ ALREADY_REAL | From API responses |

### CodexHomePage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All sections | README, Quests, Offerings, Paths, Releases, Crew, Counts | ✅ ALREADY_REAL | `GET /api/codexes/:owner/:name` + sub-endpoints |

### QuestDetailPage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All | Quest data, comments | ✅ ALREADY_REAL | `GET /api/codexes/:owner/:name/quests/:number` |

### OfferingDetailPage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All | Offering data, comments | ✅ ALREADY_REAL | `GET /api/codexes/:owner/:name/offerings/:number` |

### ReleaseListPage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All | Release data | ✅ ALREADY_REAL | `GET /api/codexes/:owner/:name/releases` |

### ProfilePage.tsx

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All | User profile, repos, contributions | ✅ ALREADY_REAL | `GET /api/users/:username` |

### RepoPage.tsx (Legacy)

| Line | Hard-Coded Data | Status | Real Endpoint |
|------|----------------|--------|---------------|
| All | Legacy page, now redirects | ✅ N/A | Redirects to `/codex/` |

---

## Verified: No Hard-Coded Data Renders in UI

After this audit:
- **Zero** hard-coded numbers render in the UI
- **Zero** hard-coded usernames or avatars render
- **Zero** fake quest/offering/activity data renders
- All counters come from database aggregation
- All user data comes from authenticated API responses

---

## Backend Endpoints for Data

| Endpoint | Returns | Used By |
|----------|---------|---------|
| `GET /api/users/stats` | totalUsers, totalRepos | LandingPage |
| `GET /api/repos` | User's repositories | Dashboard |
| `GET /api/issues/:owner/:name` | Issues for a repo | Dashboard |
| `GET /api/pulls/:owner/:name` | PRs for a repo | Dashboard |
| `GET /api/codexes/:owner/:name` | Codex with viewer state | CodexHome |
| `GET /api/codexes/:owner/:name/quests` | Quests list | CodexHome |
| `GET /api/codexes/:owner/:name/offerings` | Offerings list | CodexHome |
| `GET /api/codexes/:owner/:name/paths` | Paths list | CodexHome |
| `GET /api/codexes/:owner/:name/releases` | Releases list | CodexHome |
| `GET /api/codexes/:owner/:name/collaborators` | Collaborators | CodexHome |
| `GET /api/codexes/:owner/:name/quests/:number` | Quest + comments | QuestDetail |
| `GET /api/codexes/:owner/:name/offerings/:number` | Offering + comments | OfferingDetail |
| `GET /api/users/:username` | User profile + repos | ProfilePage |
| `GET /api/auth/me` | Current user | AuthContext |

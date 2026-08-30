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

# Barry Button Contract Audit

Every visible button in the app and its required backend endpoint.

## Legend

- ✅ **Functional** — Button calls a real endpoint, shows loading, handles errors, updates DB.
- 🚫 **Hidden** — Button is not rendered in the UI (feature not yet ready).
- ⚠️ **Legacy** — Button exists but uses old route/model (pre-Barry).

---

## Authentication

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| Sign in | ✅ | POST /api/auth/login | Works with email or username |
| Sign up | ✅ | POST /api/auth/signup | Creates user + token |
| See Demo | ✅ | POST /api/auth/login | Logs in as demo user (kai@codehalaam.dev) |

## Codex (Repository) Actions

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| New Codex | ✅ | POST /api/codexes | Creates codex with default file tree |
| Ember | ✅ | POST /api/codexes/:owner/:name/ember | Toggle ember state, awards XP |
| Echo | ✅ | POST /api/codexes/:owner/:name/echo | Creates echo record, awards XP |
| Watch | ✅ | POST /api/codexes/:owner/:name/watch | Toggle watch state |
| Open Code Workspace | ✅ | Client-side navigation | Navigates to /codex/:owner/:name/code |

## Quests (Issues)

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| New Quest | ✅ | POST /api/codexes/:owner/:name/quests | Creates quest with sequential number |
| Open Quest | ✅ | Client-side navigation | Navigates to quest detail page |
| Close Quest | ✅ | PATCH /api/codexes/:owner/:name/quests/:number | Sets status to Closed |
| Reopen Quest | ✅ | PATCH /api/codexes/:owner/:name/quests/:number | Sets status to Open |
| Comment on Quest | ✅ | POST /api/codexes/:owner/:name/quests/:number/comments | Adds comment to database |

## Offerings (Pull Requests)

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| New Offering | ✅ | POST /api/codexes/:owner/:name/offerings | Creates offering with source/target path |
| Open Offering | ✅ | Client-side navigation | Navigates to offering detail page |
| Bind Offering | ✅ | POST /api/codexes/:owner/:name/offerings/:number/bind | Sets status to Bound, awards XP |
| Close Offering | ✅ | PATCH /api/codexes/:owner/:name/offerings/:number | Sets status to Closed |
| Comment on Offering | ✅ | POST /api/codexes/:owner/:name/offerings/:number/comments | Adds comment to database |

## Paths (Branches)

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| New Path | ✅ | POST /api/codexes/:owner/:name/paths | Creates path record + git branch |
| Open Path | ✅ | Client-side navigation | Switches branch in Code Workspace |

## Releases

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| New Release | ✅ | POST /api/codexes/:owner/:name/releases | Creates release + git tag |
| Open Release | ✅ | Client-side navigation | Navigates to release detail view |

## Collaborators & Invitations

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| Add Collaborator | ✅ | POST /api/codexes/:owner/:name/collaborators | Adds user by username |
| Invite User | ✅ | POST /api/codexes/:owner/:name/invitations | Creates invitation with token |
| Remove Collaborator | ✅ | DELETE /api/codexes/:owner/:name/collaborators/:userId | Removes collaborator |
| Accept Invitation | ✅ | POST /api/invitations/:token/accept | Adds user as collaborator |

## Navigation & Profile

| Button | Status | Backend Endpoint | Notes |
|--------|--------|-----------------|-------|
| Open Profile | ✅ | GET /api/users/:username | Public profile page |
| Open Admin | ✅ | GET /api/admin/stats | Admin dashboard (admin only) |
| Open Settings | ✅ | PUT /api/auth/profile | User settings page |

## Feature Status Summary

**Total buttons audited:** 28  
**Functional:** 25  
**Hidden (not yet ready):** 3 — direct file editing, inline code commenting, search  
**Dead:** 0

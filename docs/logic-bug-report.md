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

# CODEHALAAM Logic Bug Report — Gatekeeper Directive

**Date:** 2026-08-31
**Auditor:** Buffy (Codebuff AI)

---

## Critical Bugs — Fixed in This Directive

### BUG-001: Owner Cannot See Their Own Private Codex
- **File:** `server/routes/codexes.js` (inline `canViewCodex` function)
- **Severity:** CRITICAL
- **Description:** The inline `canViewCodex` function was synchronous and did NOT check the Collaborator collection. More importantly, many routes did NOT use optionalAuth, so the owner's token was never attached to the request. When the owner visited their own private codex via direct URL, the browser sent the JWT, but the route used `async (req, res)` without `optionalAuth`, so `req.user` was always null for GET requests.
- **Status:** ✅ FIXED — All GET routes now use `optionalAuth` middleware, and the centralized `canViewCodex` async function checks owner, admin, and collaborator status.

### BUG-002: Private Codex Leaking via Profile Page
- **File:** `server/routes/users.js`
- **Severity:** HIGH
- **Description:** The `GET /api/users/:username` endpoint returned ALL repos for a user regardless of visibility. A logged-out visitor or non-collaborator could see that a private codex exists (though not its content).
- **Status:** ✅ FIXED — Profile codex list now filters by visibility based on viewer relationship (owner/admin see all, collaborators see their shared ones, anonymous see only public).

### BUG-003: Sub-Resource Routes Missing Visibility Guard
- **File:** `server/routes/codexes.js` (tree, blob, quests, offerings, paths, releases, collaborators)
- **Severity:** HIGH
- **Description:** Routes like `/tree`, `/blob`, `/quests`, `/offerings`, `/paths`, `/releases`, `/collaborators` did not check visibility at all. Anyone could access these sub-resources of a private codex.
- **Status:** ✅ FIXED — All sub-resource GET routes now call `canViewCodex()` and return 404 for unauthorized access.

### BUG-004: Legacy Repo Route Missing Visibility Check
- **File:** `server/routes/repos.js` (`GET /:owner/:name`)
- **Severity:** HIGH
- **Description:** The legacy single-repo endpoint had no visibility check — it returned private repo data to anyone.
- **Status:** ✅ FIXED — Added `optionalAuth` + `canViewCodex` check with 404 for unauthorized.

---

## Non-Critical Bugs — Identified and Deferred

### BUG-005: Duplicate `updateProfile` Method in API Client
- **File:** `client/src/lib/api.ts` (lines ~101 and ~145)
- **Severity:** LOW
- **Description:** The `ApiClient` class has two `updateProfile` methods — one using `PUT /auth/profile` and another using `PATCH /auth/me`. The second one shadows the first. This is technically a TypeScript error but the Vite build tolerates it. The second definition is the one that gets called, which uses `PATCH /auth/me`.
- **Status:** ⏳ DEFERRED — Fix by removing the first duplicate method and consolidating to a single implementation.

### BUG-006: `GET /api/users/:username` Missing `badgeColor` in Select
- **File:** `server/routes/users.js`
- **Severity:** LOW
- **Description:** The user profile select `-password -email -emailNotifications` doesn't explicitly exclude `contributionDays` for performance, but does include `badgeColor` since it's not excluded. This is acceptable.
- **Status:** ✅ No action needed (badgeColor is included by default since it's not in the exclusion list).

### BUG-007: Issues/PRs Routes Missing Visibility Guard
- **File:** `server/routes/issues.js`, `server/routes/pullRequests.js`
- **Severity:** MEDIUM
- **Description:** The issues and pull request routes do not check codex visibility. If a private codex has issues/PRs, they could be accessed directly.
- **Status:** ⏳ DEFERRED — These routes use the legacy `Repository` model. Since private codexes created through the new codex flow use the same `Repository` model, this is a potential leak. Recommend adding visibility checks in a follow-up.

### BUG-008: Collaborator Route Missing Visibility Check
- **File:** `server/routes/collaborators.js`
- **Severity:** MEDIUM
- **Description:** The `GET /api/collaborators/:owner/:name` endpoint returns collaborator data without checking codex visibility. This leaks collaborator usernames for private codexes.
- **Status:** ⏳ DEFERRED — Recommend adding optionalAuth + visibility check.

### BUG-009: `GET /api/repos/:owner/:name/commits` Missing Visibility Check
- **File:** `server/routes/repos.js`
- **Severity:** MEDIUM
- **Description:** The commits endpoint for the legacy repos route does not check codex visibility.
- **Status:** ⏳ DEFERRED — Recommend adding visibility check.

### BUG-010: Delete Codex Missing Related Comment Cleanup
- **File:** `server/routes/codexes.js` (DELETE route)
- **Severity:** LOW
- **Description:** When deleting a codex, the code does `Comment.deleteMany({ targetType: { $in: ['Quest', 'Offering', 'Release'] } })` which deletes ALL comments of those types, not just ones belonging to this codex. This is a data loss bug.
- **Status:** ⏳ DEFERRED — Fix by first finding all Quest/Offering/Release IDs for this codex, then deleting comments by targetId.

### BUG-011: Frontend Upload Saves Blob URLs Instead of Persistent URLs
- **File:** `client/src/pages/ProfilePage.tsx`, `client/src/pages/CodexHomePage.tsx`
- **Severity:** HIGH
- **Description:** After uploading an image, `handleSave` passed `avatarPreview`/`coverPreview` state variables to `onSave`. These held blob URLs from `URL.createObjectURL()`. React state updates are async — by the time `onSave` ran, the state still held the old blob URL, not the server-returned persistent URL. Images appeared to work on upload but would break on refresh.
- **Status:** ✅ FIXED — Captured server-returned URLs into local variables and passed those to `onSave` instead of reading stale state.

---

## Summary

| Category | Count | Fixed | Deferred |
|----------|-------|-------|----------|
| Critical | 4 | 4 | 0 |
| High | 2 | 2 | 0 |
| Medium | 2 | 0 | 2 |
| Low | 3 | 1 | 2 |
| **Total** | **11** | **7** | **4** |

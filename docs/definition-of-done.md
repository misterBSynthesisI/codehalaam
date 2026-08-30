---
name: Definition of Done
description: Quality checklist that must pass before any feature is considered complete.
type: reference
---

# Definition of Done

Every feature, fix, or change must satisfy ALL of the following before it is considered done.

---

## 1. Build

- [ ] `npm run check` passes in `client/` — zero TypeScript errors
- [ ] `npm run check` passes in `server/` — all tests pass
- [ ] `npm run build` succeeds in `client/` — Vite production build completes
- [ ] No console errors in the browser (check DevTools)

## 2. Tests

- [ ] New/modified code has test coverage for critical paths
- [ ] All existing tests still pass (`npm test`)
- [ ] Auth flows tested (register, login, JWT)
- [ ] Visibility/permission tests pass if access control was touched
- [ ] No test data leaks between test runs (proper cleanup in `afterAll`)

## 3. Real Data

- [ ] No mock, hard-coded, or placeholder data renders in the UI
- [ ] All displayed data comes from a real API endpoint backed by MongoDB
- [ ] Empty states show a clean message with a real CTA, not fake filler

## 4. Permissions

- [ ] Private codexes return 404 (not 403) to unauthorized viewers
- [ ] Owner can always view their own codex (public or private)
- [ ] Mutating actions require authentication
- [ ] Edit/delete restricted to owner or admin

## 5. Code Quality

- [ ] Every new or modified file has the CODEHALAAM copyright header from `docs/agent.md`
- [ ] No `console.log` statements left in production code (debugging logs removed)
- [ ] Centralized permission logic used (`server/utils/permissions.js`) — no inline scattered checks
- [ ] Upload URLs are persistent (server-returned `/uploads/` path, not `blob:` URLs)

## 6. UX

- [ ] No dead buttons or broken links
- [ ] Error states are clean and on-brand (not blank pages)
- [ ] Loading states shown during async operations
- [ ] Responsive — works on mobile viewports
- [ ] Verified badges visible where user names appear

## 7. Documentation

- [ ] `docs/agent.md` updated if new routes, models, or rules were added
- [ ] `docs/design.md` updated if new components or tokens were added
- [ ] `docs/logic-bug-report.md` updated with any new findings
- [ ] README.md reflects new features or changes

---

## Quick Check

Run before every commit:

```bash
# Client
cd client && npm run check && npm run build

# Server
cd server && npm run check

# Full
npm run check  # (from root, if configured)
```

If any step fails, the feature is NOT done.

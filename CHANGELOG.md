# Changelog

All notable changes to CODEHALAAM are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🔜 Coming Soon

### v2.0 — "Forge" (Q4 2026)

#### Planned
- Email integration — transactional emails via Resend
- Codex analytics dashboard — view counts, visitor stats
- API rate limiting — protect endpoints from abuse
- Webhook system — trigger external services on events
- Advanced search — full-text search across all content
- Mobile app — React Native companion

## 🔨 In Progress

### v1.6 — "Forge" (September 2026)

#### Building
- Developer documentation site — browsable docs with code examples
- Codex insights — view counts, popular files, contributor stats
- Forum search and tag filtering
- Admin dashboard charts — visual XP distribution
- Batch operations — bulk manage from admin
- Improved mobile navigation

#### Added (v1.6)
- **Admin Frames Tab**: Full CRUD management for avatar frames — create, edit, delete, upload frame images, and assign frames to users from the Control Room.
- **Admin Achievements Tab**: Manage user achievements — view, add (with presets or custom), and remove achievements per user.
- **Frame Image Upload**: `POST /api/admin/frames/upload` and `POST /api/admin/frames/:frameId/upload` — upload frame overlay images with Vercel Blob / disk fallback.
- **Achievement API**: `POST /api/admin/achievements` and `DELETE /api/admin/achievements` — assign/remove achievements from users.
- **AvatarWithFrame fix**: Image-based frames now render as a proper overlay ring extending 40% beyond the avatar, with responsive `object-fit: contain`, no overflow clipping, and `onError` fallback. Frame image is always fully visible.
- **Profile page SEO**: Dynamic `<title>`, `og:title`, `og:description`, `og:image`, and Twitter Card meta tags — profile pages now show the username/display name in browser tab and social previews.
- **Codex page SEO**: Dynamic `<title>`, `og:title`, `og:description`, `og:image` — codex pages show the codex name and owner in browser tab and social shares.
- **useSEO hook**: Reusable hook for any page to set document title and Open Graph meta tags dynamically.
- **Mobile Code Workspace**: 3-pane code workspace is now responsive — file tree becomes a slide-out drawer on mobile with backdrop overlay. Hamburger toggle in top bar. Auto-closes on file select.
- **Admin Codex CRUD**: Admins can now edit any codex (description, visibility, language, tagline) and delete any codex with full cascade cleanup from the Control Room. Edit drawer and delete confirmation modal added to the Codexes tab.
- **Admin Codex Endpoints**: `PATCH /api/admin/repos/:repoId` and `DELETE /api/admin/repos/:repoId` — admin bypass for owner permission checks.
- **Dashboard Welcome Card**: Enhanced dashboard header with user avatar, verified badge overlay, character class pill, animated XP progress bar, streak/contributions/XP quick stats.

### v1.5 — "Ascend" (September 2026)

#### Building
- Developer documentation site — browsable docs with code examples
- Codex insights — view counts, popular files, contributor stats
- Forum search and tag filtering
- Admin dashboard charts — visual XP distribution
- Batch operations — bulk manage from admin
- Improved mobile navigation

---

## ✅ Released

### v1.4.0 — "Admin, Demo Mode & Mobile" (2026-09-01)

#### Added
- **Demo Mode**: Read-only browsing for unregistered users. Demo users see a yellow banner and cannot create, edit, or delete any data. Server-side enforcement via `requireDemoFree` middleware.
- **Forum Management in Admin**: Admins can now browse, pin/unpin, close/reopen, and delete forum posts from the Control Room.
- **Forum Admin API**: `GET /api/admin/forum`, `PATCH /api/admin/forum/:postId/pin`, `PATCH /api/admin/forum/:postId/close`, `DELETE /api/admin/forum/:postId`.
- **Codex File Tree Preview**: Expandable file tree on the Codex homepage, fetched via `api.getCodexTree()`.
- **Demo Mode Banner**: Dismissible yellow banner shown when logged in as demo user.

#### Changed
- **Mobile-responsive Codex hero**: Profile picture centered, cover photo behind, project name and action buttons stacked vertically. Buttons use `flex-wrap` to prevent overlap.
- **Stronger cover gradient**: Cover image gradient now starts with `rgba(0,0,0,0.5)` at the top for better text readability.
- **Admin terminology**: "Repositories" → "Codexes", "Stars" → "Embers", "Forks" → "Echoes" in admin panel.
- **Admin Overview stats**: "Issues" → "Quests", "Pull Requests" → "Offerings" in stats cards.
- **Footer added**: Site-wide footer with Product, Community, Resources, and Legal sections.
- **DB performance**: Added `.lean()` to user profile and codex queries, connection pooling (`maxPoolSize: 10`), additional MongoDB indexes.
- **404 pages**: Profile page now shows proper 404 page for invalid usernames instead of plain text.
- **Demo button text**: "Try Demo Account" → "Browse as Demo (read-only)".

#### Fixed
- Profile page shows proper 404 error page for invalid usernames.
- Database query performance improved with lean queries and connection pooling.

---

---

### v1.3.3 — "Auth & UX Fixes" (2026-09-01)

#### Fixed
- **Critical**: "Try Demo Account" button now correctly logs in and navigates to dashboard. Previously, `api.demoLogin()` set the JWT token but `refreshUser()` was never called, so `ProtectedRoute` saw `user === null` and bounced back to `/auth`.
- **Critical**: Login state no longer flickers on page refresh. Previously, `refreshUser()` removed the JWT token on ANY server error (network failure, 503 DB unavailable, etc.), logging the user out. Now only removes the token on 401/403 auth errors.
- Added `status` property to API client errors so the auth layer can distinguish auth failures from transient server errors.

#### Changed
- Profile cover photo height increased from 200px to 280px for better visibility.
- Profile cover gradient overlay made more transparent so the full image is visible.
- Navbar user avatar now shows the user's profile picture instead of just the first letter.
- Navbar user dropdown now shows the user's avatar next to their name.

#### Added
- Verified badge now appears on the Dashboard welcome header.
- Verified badge now appears next to collaborator names in the Codex Home "The Crew" sidebar.
- Collaborator avatars now show profile pictures in the Codex Home "The Crew" section.

---

## ✅ Released

### v1.3.2 — "Vercel Setup Fix" (2026-09-01)

#### Fixed
- **Critical**: Health endpoint (`/api/health`) now actively calls `ensureConnected()` before reporting DB status. Previously it only read `mongoose.readyState`, which was always `0` on Vercel cold starts — causing the setup page to permanently show "Database Not Connected" even when MongoDB Atlas was configured and reachable.
- **Critical**: Setup routes (`/api/setup/status`, `/api/setup/admin`) now call `ensureConnected()` before querying the DB, and are no longer exempt from the DB guard middleware. Previously they were exempt, which meant `User.countDocuments()` ran against a disconnected Mongoose instance on cold starts.
- **Critical**: Fixed race condition in `SetupPage` — `login()` is now awaited before navigating to `/dashboard`, so `ProtectedRoute` sees the authenticated user instead of bouncing back to `/auth`.
- Fixed `install:all` script to use `npm install --include=dev` so TypeScript is available during Vercel build (fixes "tsc: command not found" build error).

### v1.3.1 — "Vercel Fix" (2026-09-01)

- **Forum**: StackOverflow-style Q&A forum for developers (posts, answers, votes, accepted answers)
- **Developer documentation page**: in-app guide for uploading projects and git pushing
- **Changelog page**: in-app changelog viewer at `/changelog`
- **Email service**: optional transactional email via Resend (signup verification, password reset, invitations)

---

## ✅ Released

### v1.3.1 — "Vercel Fix" (2026-09-01)

#### Fixed
- **Critical**: Fixed serverless function crash on Vercel — `uploadService.js` was calling `fs.mkdirSync()` at module load time on Vercel's read-only `/var/task/` filesystem, causing every API endpoint to return 500 (ENOENT). Now wrapped in try/catch and skipped when Vercel Blob is active.
- **Critical**: Fixed top-level `await import('@vercel/blob')` in `uploadService.js` which could crash cold starts. Now loaded lazily.
- Removed the manual "First-time setup" button from the sign-in page — setup now triggers fully automatically based on database state.

### v1.3.0 — "Error Pages, SEO & Branding" (2026-09-01)

#### Added
- GitHub-style error pages for 400, 401, 403, 404, 500, 503 with animated ghost illustration
- Client-side catch-all route (`*` → 404 page)
- SEO/AEO optimization: OpenGraph, Twitter Cards, canonical URL, JSON-LD structured data (`SoftwareApplication` + `FAQPage` schema)
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.svg` in `client/public/`
- Admin site settings: `SiteSetting` model + `/api/settings` route for logo, favicon, site name, tagline, meta description, feature flags
- `AdminSettingsPage` at `/admin/settings` with logo/favicon upload
- `useSiteSettings()` hook — applies favicon, document title, meta description dynamically on app load

#### Changed
- Updated `docs/agent.md` with setup flow, site settings, error pages, SEO/AEO, email system docs, Vercel deployment architecture, admin capabilities
- Updated `README.md` with live deployment URL, setup flow, new env vars, new features

### v1.2.0 — "Setup, Security & Uploads" (2026-09-01)

#### Added
- **First-run setup flow**: `GET /api/setup/status` + `POST /api/setup/admin` — creates the first admin account only when the database has zero users, then permanently disables (410 Gone)
- `SetupPage` component — auto-redirects to `/setup` when DB is empty, shows database connection instructions when DB is unreachable
- **30 MB project file uploads** via Vercel Blob (free 1 GB tier) with disk fallback for local dev
- `POST /api/codexes/:owner/:name/upload` endpoint for project file uploads
- Vercel agent-skills installed (9 skills) for Vercel best practices
- 6 new tests (setup status, 410 gate, admin security) — 22/22 passing

#### Changed
- Rewrote `api/index.js` to build Express app with correct middleware order: CORS → JSON body parser (32 MB) → DB guard → routes → 404 → error handler
- Mirrored middleware structure in `server/app.js` for local dev consistency
- `generateToken()` now accepts `{ isAdmin }` — admin tokens expire in 2 days vs 30 days for regular users

#### Fixed
- **Critical**: Fixed "/auth/login invalid response" — DB guard was registered after routes in `api/index.js`, causing malformed responses on cold starts
- Every API response is now valid JSON (never HTML or empty)

### v1.1.0 — "Barry" (2026-08-31)

#### Added
- Replaced Cyberpunk theme with Apple Fluid design system
- Introduced CODEHALAAM terminology map (Codex, Quest, Offering, Path, Ember, Echo)
- Split Codex Home and Code Workspace into two separate experiences
- Functional requirements for Quests, Offerings, Paths, Releases, Comments, Collaborators, Invitations
- Rule: no dead buttons — every visible button must call a real backend endpoint
- GitHub-equivalent relational data model using CODEHALAAM naming

### v1.0.0 — "Genesis" (2026-08-30)

#### Added
- Initial release of CODEHALAAM
- Gamified code hosting platform with XP, levels, achievements, streaks
- Repositories (codexes), issues (quests), pull requests (offerings), collaborators
- JWT authentication with bcrypt password hashing
- MongoDB + Mongoose + Express backend
- React 18 + TypeScript + Vite + Tailwind CSS frontend
- Socket.io for real-time notifications (local dev)
- Vercel one-tap deploy via single serverless function

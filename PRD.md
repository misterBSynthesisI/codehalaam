\# Product Requirements Document (PRD): TheGitHub

\*\*Version:\*\* 1.0.0 (MERN Stack 2026)

\*\*Status:\*\* Phase 1 MVP



\## 1. Product Vision

\*\*TheGitHub\*\* is a fully-featured, gamified, and immersive code hosting and collaboration platform. It is a complete alternative to GitHub where the interface feels like a high-end RPG/Cyberpunk terminal. All "Pro" collaboration features are unlocked for free, and every coding action yields tangible in-game rewards (XP, levels, classes).



\## 2. Target Audience

\- \*\*Gen Z \& Alpha Developers:\*\* Expect high-fidelity, interactive UIs.

\- \*\*Game Developers:\*\* Appreciate immersive, dark-themed environments.

\- \*\*Open Source Contributors:\*\* Looking for community and gamified recognition.

\- \*\*Students:\*\* Want a more engaging, less intimidating learning tool.



\## 3. Core Problem

Traditional code hosting platforms are utilitarian, dry, and intimidating. They lack the dopamine loops, instant gratification, and identity-building mechanics that keep users engaged. Coding feels like a chore rather than a progression.



\## 4. Technical Architecture (MERN Stack 2026)

\- \*\*Frontend:\*\* React 19 (via Vite 6), React Router v7, Tailwind CSS, Framer Motion (animations), Zustand (state management), React Query (data fetching).

\- \*\*Backend:\*\* Node.js 22, Express.js, JWT (Authentication), Socket.io (for real-time XP/collaboration updates).

\- \*\*Database:\*\* MongoDB (via Mongoose ODM).

\- \*\*Git Engine:\*\* `isomorphic-git` (Node.js implementation) to handle actual `.git` file operations without relying on external binaries.



\## 5. MVP Scope (Phase 1)

1\. \*\*Authentication:\*\* JWT-based signup/login. User selects a "Class" on signup.

2\. \*\*Gamification Engine:\*\* XP calculation, level-up logic, and real-time UI feedback.

3\. \*\*Repository Management:\*\* Create, view, and manage repos (mocked Git operations for V1 UI, real Git in V2).

4\. \*\*The Dashboard (Guild Hall):\*\* View personal stats, XP bars, and repository grid.

5\. \*\*Quest Board (Issues):\*\* Create and view issues styled as bounties/quests.



\## 6. Data Models (Mongoose Schemas)

\- \*\*User:\*\* `username`, `email`, `passwordHash`, `class` (Enum: Mage, Tank, Rogue), `level`, `xp`, `avatarUrl`, `createdAt`.

\- \*\*Repository:\*\* `name`, `description`, `owner` (Ref: User), `isPrivate`, `stars`, `forks`, `createdAt`.

\- \*\*Commit:\*\* `repo` (Ref: Repo), `author` (Ref: User), `message`, `hash`, `timestamp`, `xpAwarded`.

\- \*\*Quest (Issue):\*\* `repo` (Ref: Repo), `title`, `body`, `status` (Enum: Open, In Progress, Closed), `bountyXp`, `author` (Ref: User).



\## 7. API Endpoints (Express)

\- `POST /api/auth/register` - Create user, hash password, assign class.

\- `POST /api/auth/login` - Verify credentials, return JWT.

\- `GET /api/users/me` - Get current user profile and XP.

\- `GET /api/repos` - Get all repos for the authenticated user.

\- `POST /api/repos` - Create a new repository.

\- `POST /api/repos/:id/commits` - Mock a commit, calculate XP, update user level.

\- `GET /api/repos/:id/quests` - Get issues for a repo.



## 8. UI/UX Guidelines
- **Theme:** "Apple Fluid / GitHub Primer". Clean, minimalist, and highly performant.
- **Aesthetics:** Translucent materials (glassmorphism via `backdrop-filter`), optical typography, and constraint-based layouts.
- **Motion:** Framer Motion springs (critically damped for UI, momentum-driven for gestures).
- **Accessibility:** WCAG 2.1 AA compliant by default. Support for reduced-motion and high-contrast.
- **Gamification Integration:** RPG elements integrated cleanly into the minimalist UI using subtle, fluid animations.

---
**CHANGELOG & APPROVAL**
- **Date:** August 30, 2026
- **Action:** Replaced "Cyberpunk/RPG Terminal" aesthetic with "Apple Fluid / GitHub Primer" design system.
- **Reasoning:** To ensure professional adoption, reduce UI clutter, and align with the finalized `design.md` specifications.
- **Signed:** *Qwen3.8 | Senior Product Manager & CTO Partner*
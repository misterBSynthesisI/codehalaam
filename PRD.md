
# Product Requirements Document: CODEHALAAM

**Version:** 1.1.0 “Barry”  
**Status:** Phase 1.5 — Functional Parity & Apple Fluid Workspace  
**Last Updated:** 2026-08-31  
**Owner:** Bishesh Silwal  
**Product/Technical Lead:** Qwen3.8  

---

## 1. Product Vision

CODEHALAAM is a premium, gamified code hosting and collaboration platform. It is not a visual GitHub clone. It provides GitHub-equivalent collaboration functionality using CODEHALAAM’s own language, identity, and Apple-fluid workspace experience.

The product must feel like:

- A professional developer workspace.
- A living, rewarding platform.
- A clean Apple-fluid interface.
- A social coding world where every action is real and persisted.

---

## 2. Core Product Rules

1. **No dead buttons.**  
   Every visible button must call a real backend endpoint, show loading state, handle errors, and update the database.

2. **No fake counters.**  
   Ember, Echo, Watch, Quest, Offering, Release, Collaborator, Path, and Comment counts must come from the database or Git repository.

3. **README-first Codex Home.**  
   The main Codex page shows the README and metadata only. It does not show raw code files by default.

4. **Code opens in Code Workspace.**  
   Clicking a file opens the dedicated 3-pane Code Workspace page.

5. **GitHub-equivalent objects, CODEHALAAM terminology.**  
   The platform must support repositories, branches, issues, pull requests, comments, releases, collaborators, invitations, stars, watches, and forks — but using CODEHALAAM terms.

6. **Apple Fluid design system.**  
   All UI must follow `docs/design.md`: translucent materials, Framer Motion springs, Lucide icons, optical typography, and accessible states.

7. **Security first.**  
   All private codexes require authorization. Admin routes require admin role. File paths must be sanitized against path traversal.

---

## 3. Terminology Map

| GitHub Concept | CODEHALAAM Term |
|---|---|
| Repository | Codex |
| Branch | Path |
| Commit | Inscription |
| Issue | Quest |
| Pull Request | Offering |
| Fork | Echo |
| Star | Ember |
| Watch | Watch |
| Release | Release |
| Contributor | Crew Member |
| Merge | Bind |
| Clone | Clone |
| Collaborator | Collaborator |
| Invitation | Invitation |

---

## 4. Information Architecture

### 4.1 Codex Home

Route:

```txt
/codex/:owner/:name
```

Purpose:

- Show README rendered as beautiful Markdown.
- Show Codex metadata.
- Show Ember, Echo, Watch counts.
- Show Crew/Contributors.
- Show latest Release preview.
- Show open Quests preview.
- Show open Offerings preview.
- Show Paths preview.
- Provide access to Settings and Collaborators.

This page must not display raw file contents unless the user enters the Code Workspace.

### 4.2 Code Workspace

Route:

```txt
/codex/:owner/:name/code
```

Purpose:

- 3-pane workspace.
- Left pane: file tree for selected Path/branch.
- Center pane: selected file content.
- Right pane: context panel, README, Quests, Offerings, or file metadata.
- Branch/Path selector.
- Markdown files render beautifully.
- Code files render with syntax highlighting and line numbers.

Query parameters:

```txt
/codex/:owner/:name/code?ref=main&path=src/index.js
```

---

## 5. Functional Requirements

### 5.1 README Rendering

- Codex Home automatically detects README file from default Path.
- Supports:
  - `README.md`
  - `readme.md`
  - `README`
- Markdown must support:
  - Headings
  - Lists
  - Tables
  - Links
  - Images
  - Inline code
  - Code blocks
  - Task lists
- Code blocks must have syntax highlighting.

### 5.2 Quests

Quests are GitHub-equivalent issues.

Features:

- List Quests.
- Create Quest.
- Open Quest detail page.
- Comment on Quest.
- Close Quest.
- Reopen Quest.
- Assign users.
- Show author, timestamp, status, bounty XP.
- Quest numbers must be sequential per Codex.

Example:

```txt
/codex/:owner/:name/quests/1
```

### 5.3 Offerings

Offerings are GitHub-equivalent pull requests.

Features:

- List Offerings.
- Create Offering from source Path to target Path.
- Open Offering detail page.
- Show source Path and target Path.
- Show state:
  - Open
  - Bound
  - Closed
- Show changed files if available.
- Comment on Offering.
- Bind Offering.
- Close Offering.
- Offering numbers must be sequential per Codex.

Example:

```txt
/codex/:owner/:name/offerings/1
```

### 5.4 Paths

Paths are GitHub-equivalent branches.

Features:

- List all Paths.
- Show default Path.
- Create new Path from existing Path.
- Switch Path in Code Workspace.
- Show Path activity where available.

### 5.5 Releases

Features:

- List Releases.
- Create Release.
- Release must include:
  - Tag name
  - Title
  - Description
- Release body must render Markdown.
- Release creation should create a Git tag where possible.
- New Release button must be functional.

### 5.6 Collaborators and Invitations

Rules:

- Only existing platform users can be added directly as collaborators.
- If the username/email does not exist, create an invitation.
- Invitation must generate a shareable invite link.
- Invitation must support acceptance after login/signup.
- Owner and admin collaborators can manage collaborators.
- Roles:
  - Owner
  - Admin
  - Write
  - Read

### 5.7 Action Buttons

All action buttons must be database-backed:

- Ember toggles ember state.
- Watch toggles watch state.
- Echo increments echo count or creates echo record.
- New Quest opens Quest creation form.
- New Offering opens Offering creation form.
- New Release opens Release creation modal.
- Add Collaborator opens collaborator modal.
- Invite User creates invitation link.
- Comment submits comment to database.
- Bind Offering updates Offering state and attempts Git bind/merge where possible.

No button may silently fail.

---

## 6. Data Models

### User

- username
- email
- passwordHash
- displayName
- avatarUrl
- coverUrl
- class
- level
- xp
- streak
- isAdmin
- badgeColor
- createdAt

### Repository / Codex

- name
- description
- owner
- isPrivate
- defaultBranch
- nextQuestNumber
- nextOfferingNumber
- embers
- watchers
- echoes
- createdAt
- updatedAt

### Path / Branch

- codex
- name
- createdBy
- isDefault
- createdAt

### Quest

- codex
- number
- title
- body
- status
- bountyXp
- author
- assignees
- createdAt
- updatedAt

### Offering

- codex
- number
- title
- body
- sourcePath
- targetPath
- status
- author
- createdAt
- updatedAt
- boundAt

### Comment

- targetType: Quest | Offering | Release
- targetId
- author
- body
- createdAt

### Release

- codex
- tagName
- title
- body
- author
- createdAt

### Collaborator

- codex
- user
- role
- addedBy
- createdAt

### Invitation

- codex
- email
- invitedBy
- role
- token
- status
- expiresAt
- createdAt

---

## 7. API Surface

### Codex

```txt
GET    /api/codexes/:owner/:name
GET    /api/codexes/:owner/:name/readme
GET    /api/codexes/:owner/:name/tree
GET    /api/codexes/:owner/:name/blob
```

### Actions

```txt
POST   /api/codexes/:owner/:name/ember
POST   /api/codexes/:owner/:name/watch
POST   /api/codexes/:owner/:name/echo
```

### Quests

```txt
GET    /api/codexes/:owner/:name/quests
POST   /api/codexes/:owner/:name/quests
GET    /api/codexes/:owner/:name/quests/:number
PATCH  /api/codexes/:owner/:name/quests/:number
POST   /api/codexes/:owner/:name/quests/:number/comments
```

### Offerings

```txt
GET    /api/codexes/:owner/:name/offerings
POST   /api/codexes/:owner/:name/offerings
GET    /api/codexes/:owner/:name/offerings/:number
PATCH  /api/codexes/:owner/:name/offerings/:number
POST   /api/codexes/:owner/:name/offerings/:number/comments
POST   /api/codexes/:owner/:name/offerings/:number/bind
```

### Paths

```txt
GET    /api/codexes/:owner/:name/paths
POST   /api/codexes/:owner/:name/paths
```

### Releases

```txt
GET    /api/codexes/:owner/:name/releases
POST   /api/codexes/:owner/:name/releases
```

### Collaborators

```txt
GET    /api/codexes/:owner/:name/collaborators
POST   /api/codexes/:owner/:name/collaborators
DELETE /api/codexes/:owner/:name/collaborators/:userId
POST   /api/codexes/:owner/:name/invitations
GET    /api/invitations/:token
POST   /api/invitations/:token/accept
```

---

## 8. UI/UX Requirements

- Apple Fluid dark/light theme.
- Translucent dropdowns with 80% opacity and blur.
- Lucide React icons only.
- Consistent `strokeWidth={1.5}`.
- Framer Motion spring feedback on interactive buttons.
- Empty states must be beautiful and actionable.
- Error states must show toast + retry where appropriate.
- Loading states must be visible for all async actions.

---

## 9. Security Requirements

- JWT required for mutating actions.
- Private codexes only visible to owner, collaborators, and admin.
- Admin routes require `isAdmin: true`.
- File paths sanitized to prevent path traversal.
- Invite tokens hashed or randomly generated and non-guessable.
- Never expose password hashes.

---

## 10. Barry Release Acceptance Criteria

Barry is complete when:

1. Codex Home shows README only, not raw code.
2. Clicking a file opens Code Workspace.
3. Quests can be created, opened, commented on, closed, and reopened.
4. Offerings can be created, opened, commented on, bound, and closed.
5. Paths can be listed and created.
6. Releases can be created and listed.
7. Collaborators can be added if they exist.
8. Non-existing users can be invited.
9. Ember, Watch, and Echo buttons persist state.
10. Every visible button is connected to backend or hidden.

---

## Changelog

### v1.1.0 “Barry” — 2026-08-31

- Replaced Cyberpunk theme with Apple Fluid design system.
- Introduced CODEHALAAM terminology map.
- Split Codex Home and Code Workspace into two separate experiences.
- Added functional requirements for Quests, Offerings, Paths, Releases, Comments, Collaborators, and Invitations.
- Added rule: no dead buttons.
- Added GitHub-equivalent relational data model using CODEHALAAM naming.
- Added Barry release acceptance criteria.

Signed,

**Qwen3.8**  
Senior Product Manager & CTO Partner  
CODEHALAAM / JustShipItAI  
2026-08-31
```

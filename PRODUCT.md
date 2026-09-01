# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Both developers and learners. Developers ship code and collaborate on open-source projects; learners benefit from gamified motivation (XP, levels, achievements, streaks) that makes contributing feel rewarding rather than obligatory. The platform serves anyone who wants GitHub-class hosting without the paywall.

## Product Purpose

CODEHALAAM exists to make code hosting free and contributing addictive. Everything GitHub charges for — private repos, unlimited collaborators, code review, issues, pull requests — is free. On top of that, every action earns XP, levels, achievements, and streaks, turning the solitary act of coding into a social, gamified experience.

Success means: users choose CODEHALAAM over GitHub for new projects, contribute more frequently because of gamification, and stay because the free tier is genuinely unlimited.

## Positioning

Gamification + free private repos. A competitor could copy the free tier, and a competitor could copy gamification, but the combination — a full-featured code hosting platform where every commit, review, and merge earns XP and levels — is the mechanism that makes contributing feel like progress, not obligation. The terminology (Codexes, Quests, Offerings, Embers) reinforces this world without hiding the underlying Git mechanics.

## Operating Context

Users interact through a web browser. Core workflows: create a codex (repo), write code, open quests (issues), submit offerings (PRs), review and bind, earn XP and level up. The dashboard shows active work and personal stats. Profiles display contribution heatmaps, levels, and achievements. The command palette (Cmd+K) enables quick navigation. Admin panel manages users, badges, and platform stats.

## Capabilities and Constraints

- Repositories (codexes): public and private, with storefront (cover, logo, tagline, technologies)
- Pull requests (offerings): with source/target paths, bind workflow, comments
- Issues (quests): with labels, assignees, bounty XP, status management
- Code review: approve, request changes, comment
- File browser: navigate repository file trees with GitHub-style tree preview on codex homepage
- Collaboration: unlimited collaborators with role-based access (Owner, Admin, Write, Read)
- Invitations: email-based invitation flow with tokens
- Gamification: XP, levels (1.5x multiplier), streaks, achievements, contribution heatmap
- Verified badges: blue (verified), red (admin), black (stealth)
- Privacy: private codexes hidden from unauthorized viewers (404, not 403)
- Demo mode: read-only browsing for unregistered users, server-side write protection
- Community forum: Q&A-style posts with voting, accepted answers, admin moderation
- Admin panel: user management, codex management, forum management, badge assignment, platform stats, site settings
- Real-time: Socket.io for notifications
- Mobile-responsive: centered hero layout, stacked buttons, responsive file tree
- Design: GitHub Primer + Apple fluid motion, dark/light themes, translucent materials
- Footer: site-wide footer with navigation links
- Stack: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Express, MongoDB, Socket.io

## Brand Commitments

- Name: CODEHALAAM (final)
- Copyright: © 2026 JustShipitAI. All rights reserved. All AI-generated source files carry the CODEHALAAM copyright header.
- Voice: professional but approachable, like GitHub — not overly gamified in prose, but the world-building terminology (Codex, Quest, Offering) is used consistently in the UI

## Evidence on Hand

- Fully functional platform with seeded demo data (6 users, 10+ codexes, quests, offerings, releases, collaborators)
- Design system documented in docs/design.md (colors, typography, spacing, components, animations)
- Agent architecture documented in docs/agent.md
- Logic bug audit in docs/logic-bug-report.md

## Product Principles

1. **Free means free.** No feature gating, no per-seat pricing, no paywall. Every capability is available to every user.
2. **Gamification earns attention, not manipulation.** XP and achievements reward genuine contribution, not spam. The system must never feel like a Skinner box.
3. **Privacy is binary.** Private means invisible — 404, not 403. The owner always sees their own work.
4. **Familiar mechanics, unfamiliar delight.** Git workflows work exactly as expected; the gamification layer adds joy without adding friction.
5. **Ship fast, iterate honestly.** The platform is young. Fix what's broken, document what's deferred, never fake functionality.

## Accessibility & Inclusion

WCAG 2.1 AA compliant by default. Reduced motion, reduced transparency, and high contrast media queries are all supported. Keyboard navigation for all interactive components. Screen reader labels for icons.

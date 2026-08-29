# Contributing to CODEHALAAM

Thank you for your interest in contributing to CODEHALAAM! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Gamification](#gamification)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/codehalaam.git
   cd codehalaam
   ```
3. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codehalaam
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5174
```

### Running Development

```bash
# Terminal 1: Client
cd client
npm run dev

# Terminal 2: Server
cd server
npm run dev
```

### Seed Database

```bash
cd server
npm run seed
```

Login with: `neo@codehalaam.dev` / `password123`

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update the changelog**
5. **Request review** from maintainers

### PR Title Format
```
type(scope): description

# Examples:
feat(auth): add OAuth login
fix(ui): resolve button alignment issue
docs(readme): update installation guide
```

### Branch Naming
```
feature/description
bugfix/description
hotfix/description
```

## Coding Standards

### TypeScript
- Use strict TypeScript
- Prefer interfaces over types for object shapes
- Use `unknown` over `any`

### React
- Functional components only
- Use hooks for state management
- Keep components small and focused
- Use proper TypeScript props

### CSS
- Use Tailwind CSS utility classes
- Follow the design system tokens
- Avoid custom CSS when possible

### Git
- Write clear commit messages
- Keep commits atomic
- Reference issues in commits

## Gamification

Contributing earns you XP! Here's how:

| Action | XP Earned |
|--------|-----------|
| Commit | +10 |
| Pull Request | +10 |
| PR Merged | +50 |
| Code Review | +25 |
| Issue Closed | +15 |
| Bug Report | +5 |
| Documentation | +10 |

### Achievements

Unlock special achievements by reaching milestones:
- 🎯 **First Commit**: Made your first commit
- 🔥 **7-Day Streak**: Committed 7 days in a row
- 👥 **Team Player**: Reviewed 10 pull requests
- 🚀 **Ship It**: Merged 50 pull requests
- 💯 **Centurion**: Reached 100 contributions
- 🎓 **Mentor**: Helped 5 newcomers
- 🐛 **Bug Hunter**: Closed 25 issues

## Questions?

Open a discussion or reach out on Discord. We're happy to help!

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

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'
import Repository from './models/Repository.js'
import Issue from './models/Issue.js'
import PullRequest from './models/PullRequest.js'
import Collaborator from './models/Collaborator.js'
import Commit from './models/Commit.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehalaam'

// Generate contribution heatmap
function generateContributions() {
  const days = []
  for (let i = 364; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const rand = Math.random()
    let count = 0
    if (rand > 0.3) count = Math.floor(Math.random() * 3) + 1
    if (rand > 0.5) count = Math.floor(Math.random() * 5) + 3
    if (rand > 0.7) count = Math.floor(Math.random() * 8) + 5
    if (rand > 0.85) count = Math.floor(Math.random() * 12) + 8
    days.push({ date, count })
  }
  return days
}

const seedUsers = [
  {
    username: 'neo-coder',
    email: 'neo@codehalaam.dev',
    password: 'password123',
    displayName: 'Neo Coder',
    bio: 'Full-stack developer. Building the future of collaborative coding.',
    level: 14,
    xp: 3420,
    xpToNext: 5000,
    stats: { commits: 1284, pullRequests: 347, reviews: 892, issues: 156, contributions: 3120 },
    streak: 23,
    longestStreak: 47,
    achievements: [
      { id: 'first-commit', name: 'First Commit', unlockedAt: new Date('2024-01-15') },
      { id: 'streak-7', name: '7-Day Streak', unlockedAt: new Date('2024-02-01') },
      { id: 'team-player', name: 'Team Player', unlockedAt: new Date('2024-03-10') },
      { id: 'ship-it', name: 'Ship It', unlockedAt: new Date('2024-04-05') },
    ],
  },
  {
    username: 'sarah-dev',
    email: 'sarah@codehalaam.dev',
    password: 'password123',
    displayName: 'Sarah Chen',
    bio: 'Design systems enthusiast. React & TypeScript.',
    level: 11,
    xp: 2100,
    xpToNext: 3000,
    stats: { commits: 892, pullRequests: 234, reviews: 567, issues: 89, contributions: 2100 },
    streak: 15,
    longestStreak: 32,
  },
  {
    username: 'mike-reviewer',
    email: 'mike@codehalaam.dev',
    password: 'password123',
    displayName: 'Mike Ross',
    bio: 'Backend engineer. Go, Rust, distributed systems.',
    level: 9,
    xp: 1500,
    xpToNext: 2500,
    stats: { commits: 654, pullRequests: 178, reviews: 892, issues: 67, contributions: 1500 },
    streak: 8,
    longestStreak: 21,
  },
  {
    username: 'contributor-99',
    email: 'alex@codehalaam.dev',
    password: 'password123',
    displayName: 'Alex Kim',
    bio: 'Open source contributor. Documentation & testing.',
    level: 7,
    xp: 890,
    xpToNext: 1500,
    stats: { commits: 345, pullRequests: 89, reviews: 234, issues: 45, contributions: 890 },
    streak: 5,
    longestStreak: 14,
  },
]

const seedRepos = [
  {
    name: 'neural-link-ui',
    description: 'A component library for building accessible web interfaces with React',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 2847,
    forksCount: 423,
    hasIssues: true,
    topics: ['react', 'components', 'accessibility', 'ui'],
    license: 'MIT',
  },
  {
    name: 'quantum-state-engine',
    description: 'High-performance state management with predictable updates',
    language: 'Rust',
    visibility: 'public',
    starsCount: 1923,
    forksCount: 267,
    topics: ['state-management', 'rust', 'performance'],
    license: 'Apache-2.0',
  },
  {
    name: 'darknet-api',
    description: 'Encrypted API gateway with zero-knowledge proof authentication',
    language: 'Go',
    visibility: 'private',
    starsCount: 4512,
    forksCount: 789,
    topics: ['api', 'security', 'encryption'],
    license: 'MIT',
  },
  {
    name: 'hologram-css',
    description: 'CSS framework that generates responsive layouts with minimal markup',
    language: 'CSS',
    visibility: 'public',
    starsCount: 891,
    forksCount: 134,
    topics: ['css', 'framework', 'responsive'],
    license: 'MIT',
  },
  {
    name: 'cipher-compiler',
    description: 'An esoteric programming language that compiles to optimized bytecode',
    language: 'Python',
    visibility: 'private',
    starsCount: 634,
    forksCount: 89,
    topics: ['compiler', 'python', 'esoteric'],
    license: 'GPL-3.0',
  },
  {
    name: 'synth-wave-cli',
    description: 'Terminal interface with gesture recognition and accessibility features',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 1567,
    forksCount: 201,
    topics: ['cli', 'terminal', 'accessibility'],
    license: 'MIT',
  },
]

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('[SEED] Connected to MongoDB')

    // Clear existing data
    console.log('[SEED] Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Repository.deleteMany({}),
      Issue.deleteMany({}),
      PullRequest.deleteMany({}),
      Collaborator.deleteMany({}),
      Commit.deleteMany({}),
    ])

    // Create users
    console.log('[SEED] Creating users...')
    const users = []
    for (const userData of seedUsers) {
      const user = await User.create({
        ...userData,
        contributionDays: generateContributions(),
        website: `https://${userData.username}.dev`,
      })
      users.push(user)
      console.log(`  Created user: ${user.username}`)
    }

    const neo = users[0]
    const sarah = users[1]
    const mike = users[2]
    const alex = users[3]

    // Create repositories
    console.log('[SEED] Creating repositories...')
    const repos = []
    for (const repoData of seedRepos) {
      const repo = await Repository.create({
        ...repoData,
        owner: neo._id,
        branches: [{ name: 'main', isDefault: true }, { name: 'develop' }],
        fileTree: [
          {
            name: 'README.md',
            type: 'file',
            content: `# ${repoData.name}\n\n${repoData.description}\n\n## Installation\n\n\`\`\`bash\nnpm install ${repoData.name}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\nimport { Component } from '${repoData.name}'\n\nfunction App() {\n  return <Component />\n}\n\`\`\`\n\n## Contributing\n\nContributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).\n\n## License\n\n${repoData.license || 'MIT'}`,
            size: '1.2 KB',
            language: 'Markdown',
          },
          { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n.DS_Store\ndist/', size: '0.1 KB' },
          { name: 'package.json', type: 'file', content: `{"name":"${repoData.name}","version":"1.0.0"}`, size: '0.4 KB', language: 'JSON' },
          {
            name: 'src',
            type: 'folder',
            children: [
              { name: 'index.ts', type: 'file', content: `export * from './${repoData.name}'`, size: '0.2 KB', language: 'TypeScript' },
              { name: `${repoData.name}.ts`, type: 'file', content: `// Main implementation\nexport function init() {\n  console.log('${repoData.name} initialized')\n}`, size: '0.8 KB', language: 'TypeScript' },
            ],
          },
        ],
        defaultReadme: `# ${repoData.name}\n\n${repoData.description}`,
      })
      repos.push(repo)
      console.log(`  Created repo: ${repo.name}`)
    }

    // Create collaborators
    console.log('[SEED] Creating collaborators...')
    await Collaborator.create({ user: sarah._id, repository: repos[0]._id, role: 'write', invitedBy: neo._id, pending: false, acceptedAt: new Date() })
    await Collaborator.create({ user: mike._id, repository: repos[0]._id, role: 'write', invitedBy: neo._id, pending: false, acceptedAt: new Date() })
    await Collaborator.create({ user: alex._id, repository: repos[0]._id, role: 'read', invitedBy: neo._id, pending: false, acceptedAt: new Date() })
    console.log('  Created collaborators')

    // Create issues
    console.log('[SEED] Creating issues...')
    const issueData = [
      { number: 42, title: 'Button component does not respect disabled state styling', state: 'open', author: sarah._id, labels: [{ name: 'bug', color: 'red' }, { name: 'good first issue', color: 'green' }], assignees: [neo._id], bountyXp: 50, body: 'The Button component ignores the `disabled` prop when determining hover styles.' },
      { number: 41, title: 'Add dark mode toggle to user settings', state: 'open', author: neo._id, labels: [{ name: 'enhancement', color: 'blue' }], bountyXp: 100 },
      { number: 40, title: 'Update README with installation instructions', state: 'open', author: alex._id, labels: [{ name: 'documentation', color: 'blue' }], assignees: [alex._id] },
      { number: 39, title: 'Memory leak in WebSocket connection handler', state: 'closed', author: neo._id, labels: [{ name: 'bug', color: 'red' }, { name: 'priority: high', color: 'red' }], assignees: [neo._id], closedAt: new Date(Date.now() - 3 * 86400000) },
      { number: 38, title: 'Migrate from class components to hooks', state: 'closed', author: mike._id, labels: [{ name: 'enhancement', color: 'blue' }], closedAt: new Date(Date.now() - 7 * 86400000) },
    ]

    for (const issue of issueData) {
      await Issue.create({ ...issue, repository: repos[0]._id })
    }
    console.log('  Created issues')

    // Create pull requests
    console.log('[SEED] Creating pull requests...')
    const prData = [
      { number: 89, title: 'Fix button disabled state and add loading variant', state: 'merged', author: neo._id, base: 'main', head: 'fix/button-states', additions: 124, deletions: 38, changedFiles: 5, labels: [{ name: 'bug', color: 'red' }], mergedAt: new Date(Date.now() - 12 * 3600000), mergedBy: neo._id },
      { number: 88, title: 'Add dark mode toggle to settings page', state: 'open', author: neo._id, base: 'main', head: 'feat/dark-mode-toggle', additions: 342, deletions: 12, changedFiles: 8, labels: [{ name: 'enhancement', color: 'blue' }], requestedReviewers: [sarah._id] },
      { number: 87, title: 'Upgrade React to v18 and fix concurrent mode issues', state: 'open', author: neo._id, base: 'main', head: 'chore/react-18', additions: 89, deletions: 67, changedFiles: 12, labels: [{ name: 'dependencies', color: 'purple' }], requestedReviewers: [mike._id] },
      { number: 86, title: 'Refactor authentication middleware', state: 'merged', author: neo._id, base: 'main', head: 'refactor/auth-middleware', additions: 201, deletions: 156, changedFiles: 4, labels: [{ name: 'refactor', color: 'purple' }], mergedAt: new Date(Date.now() - 5 * 86400000), mergedBy: neo._id },
      { number: 85, title: 'Add API rate limiting', state: 'closed', author: neo._id, base: 'main', head: 'feat/rate-limiting', additions: 567, deletions: 0, changedFiles: 6, labels: [{ name: 'enhancement', color: 'blue' }], closedAt: new Date(Date.now() - 14 * 86400000) },
    ]

    for (const pr of prData) {
      await PullRequest.create({ ...pr, repository: repos[0]._id })
    }
    console.log('  Created pull requests')

    // Create commits
    console.log('[SEED] Creating commits...')
    const commitMessages = [
      'Initial commit', 'Add component library structure', 'Implement Button component',
      'Add accessibility features', 'Fix TypeScript types', 'Update documentation',
      'Add dark mode support', 'Performance improvements', 'Fix memory leak',
      'Add test coverage', 'Refactor auth middleware', 'Update dependencies',
    ]

    for (let i = 0; i < commitMessages.length; i++) {
      const sha = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      await Commit.create({
        sha,
        message: commitMessages[i],
        author: i % 3 === 0 ? neo._id : i % 3 === 1 ? sarah._id : mike._id,
        repository: repos[0]._id,
        branch: 'main',
        additions: Math.floor(Math.random() * 200) + 10,
        deletions: Math.floor(Math.random() * 50),
        filesChanged: Math.floor(Math.random() * 8) + 1,
      })
    }
    console.log('  Created commits')

    console.log('\n[SEED] Seed completed successfully!')
    console.log('[SEED] Login with: neo@codehalaam.dev / password123')
    console.log('[SEED] Other users: sarah@, mike@, alex@ (all password123)')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('[SEED] Error:', err)
    process.exit(1)
  }
}

seed()

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

import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import AvatarFrame from '../models/AvatarFrame.js'
import Repository from '../models/Repository.js'
import { generateToken, protect, requireDemoFree } from '../middleware/auth.js'
import { uploadAvatar, resolveUploadUrl } from '../services/uploadService.js'

const router = express.Router()

// Middleware: reject requests if database is not connected
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable' })
  }
  next()
}

// POST /api/auth/signup
router.post('/signup', requireDB, async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(422).json({ error: 'Username or email already taken' })
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      displayName: username,
    })

    // Generate contribution heatmap (empty for new user)
    const contributionDays = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      contributionDays.push({ date, count: 0 })
    }
    user.contributionDays = contributionDays
    await user.save()

    const token = generateToken(user._id, { isAdmin: !!user.isAdmin })

    res.status(201).json({
      message: `Welcome to CODEHALAAM, ${username}`,
      user,
      token,
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Unable to create account' })
  }
})

// POST /api/auth/login
router.post('/login', requireDB, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Support login by email OR username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Admin sessions are short-lived (2d); regular users get 30d.
    const token = generateToken(user._id, { isAdmin: !!user.isAdmin })

    res.json({
      message: `Signed in as ${user.username}`,
      user,
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Unable to sign in' })
  }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('avatarFrameRef')
      .lean()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PUT /api/auth/profile
router.put('/profile', protect, requireDemoFree, async (req, res) => {
  try {
    const allowedUpdates = [
      'displayName', 'bio', 'company', 'location', 'website', 'twitter',
      'avatarUrl', 'emailNotifications', 'theme'
    ]

    const updates = {}
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// PUT /api/auth/password
router.put('/password', protect, requireDemoFree, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' })
  }
})

// POST /api/auth/avatar — Upload user avatar
router.post('/avatar', protect, requireDemoFree, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const avatarUrl = await resolveUploadUrl(req.file, 'avatars', `/uploads/avatars/${req.file.filename}`)
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select('-password')

    res.json({ avatarUrl, user })
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
})

// PATCH /api/auth/me — Update profile fields
router.patch('/me', protect, requireDemoFree, async (req, res) => {
  try {
    const { displayName, bio, location, websiteUrl, company, twitter } = req.body
    // Block founder fields from self-service mutation
    if (req.body.isFounder !== undefined || req.body.title !== undefined) {
      return res.status(403).json({ error: 'Founder fields cannot be modified.' })
    }
    const updates = {}
    if (displayName !== undefined) updates.displayName = displayName
    if (bio !== undefined) updates.bio = bio
    if (location !== undefined) updates.location = location
    if (websiteUrl !== undefined) updates.website = websiteUrl
    if (company !== undefined) updates.company = company
    if (twitter !== undefined) updates.twitter = twitter

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ user })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// POST /api/auth/cover — Upload profile cover/banner
router.post('/cover', protect, requireDemoFree, uploadAvatar.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const coverUrl = await resolveUploadUrl(req.file, 'avatars', `/uploads/avatars/${req.file.filename}`)
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverUrl },
      { new: true }
    ).select('-password')

    res.json({ coverUrl, user })
  } catch (err) {
    console.error('Cover upload error:', err)
    res.status(500).json({ error: 'Failed to upload cover' })
  }
})

// POST /api/auth/demo — Auto-create demo user and log in
// This endpoint ensures a demo user always exists, even on fresh deployments
// where the seed script was never run.
router.post('/demo', requireDB, async (req, res) => {
  try {
    const DEMO_EMAIL = 'kai@codehalaam.dev'
    const DEMO_USERNAME = 'kai-nakamura'
    const DEMO_PASSWORD = 'password123'

    // Try to find existing demo user
    let user = await User.findOne({ email: DEMO_EMAIL })

    if (!user) {
      // Auto-create the demo user with rich profile data
      user = await User.create({
        username: DEMO_USERNAME,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        displayName: 'Kai Nakamura',
        bio: 'Full-stack developer. I build things with TypeScript, React, and Node. Open source enthusiast.',
        level: 12,
        xp: 2340,
        xpToNext: 3000,
        stats: { commits: 780, pullRequests: 190, reviews: 420, issues: 78, contributions: 2340 },
        streak: 14,
        longestStreak: 47,
        isAdmin: false,
        badgeColor: 'blue',
        characterClass: 'Rogue',
        website: 'https://kai-nakamura.dev',
        demoMode: true,
      })

      // Generate contribution heatmap
      const contributionDays = []
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
        contributionDays.push({ date, count })
      }
      user.contributionDays = contributionDays
      await user.save()

      // Also create a demo repo so the dashboard isn't empty
      try {
        const Repository = (await import('../models/Repository.js')).default
        await Repository.create({
          name: 'aurora-ui',
          description: 'A sleek, accessible React component library built with Tailwind CSS and Radix primitives. Ship beautiful interfaces in minutes.',
          owner: user._id,
          language: 'TypeScript',
          visibility: 'public',
          starsCount: 3421,
          forksCount: 587,
          hasIssues: true,
          topics: ['react', 'components', 'tailwindcss', 'radix', 'accessibility', 'design-system'],
          license: 'MIT',
          openIssuesCount: 14,
          openPullRequestsCount: 3,
          branches: [{ name: 'main', isDefault: true }, { name: 'develop' }],
          fileTree: [
            { name: 'README.md', type: 'file', content: '# ✨ Aurora UI\n\nA sleek, accessible React component library built with Tailwind CSS and Radix primitives.', size: '1.8 KB', language: 'Markdown' },
            { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n.DS_Store\ndist/', size: '0.1 KB' },
          ],
          tagline: 'A blazing-fast React component library',
          technologies: ['React', 'TypeScript', 'Tailwind', 'Framer Motion'],
          websiteUrl: 'https://aurora-ui.dev',
          accentColor: '#6366f1',
        })
      } catch (repoErr) {
        console.warn('Demo repo creation skipped:', repoErr.message)
      }

      console.log('[DEMO] Created demo user: kai-nakamura')
    }

    // Log in as the demo user
    const token = generateToken(user._id, { isAdmin: !!user.isAdmin })

    res.json({
      message: `Signed in as demo user: ${user.username}`,
      user,
      token,
    })
  } catch (err) {
    console.error('Demo login error:', err)
    res.status(500).json({ error: 'Demo login failed' })
  }
})

// POST /api/auth/founder-setup — Create founder account (one-time only)
// Guards:
// 1. If ANY user with isFounder:true exists → 403
// 2. Caller must be authenticated as first admin, OR unauthenticated genesis if zero users
router.post('/founder-setup', async (req, res) => {
  try {
    // Idempotent: if a founder already exists, block
    const existingFounder = await User.findOne({ isFounder: true })
    if (existingFounder) {
      return res.status(403).json({ error: 'Founder already exists.' })
    }

    const userCount = await User.countDocuments()
    if (userCount > 0) {
      // Users exist — only the first admin can call this
      const { authorization } = req.headers
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required when users exist.' })
      }
      const { default: jwt } = await import('jsonwebtoken')
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
      let decoded
      try {
        decoded = jwt.verify(authorization.split(' ')[1], JWT_SECRET)
      } catch {
        return res.status(401).json({ error: 'Invalid token.' })
      }
      const caller = await User.findById(decoded.id)
      if (!caller || !caller.isAdmin) {
        return res.status(403).json({ error: 'Only admin accounts can create a founder.' })
      }
      // Must be the FIRST admin (earliest createdAt among admins)
      const firstAdmin = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 })
      if (!firstAdmin || firstAdmin._id.toString() !== caller._id.toString()) {
        return res.status(403).json({ error: 'Only the first admin can claim founder status.' })
      }
    }

    const FOUNDER_EMAIL = 'justshipitai@techadda.com.np'
    const FOUNDER_USERNAME = 'JustShipItAI'
    const FOUNDER_PASSWORD = 'Codehalaam@Founder2026'

    // If founder user already exists by email/username but isn't marked isFounder, convert
    let founder = await User.findOne({ $or: [{ email: FOUNDER_EMAIL }, { username: FOUNDER_USERNAME }] })
    if (!founder) {
      founder = await User.create({
        username: FOUNDER_USERNAME,
        email: FOUNDER_EMAIL,
        password: FOUNDER_PASSWORD,
        displayName: 'Just Ship It AI',
        bio: 'Founder & Creator of CODEHALAAM. Building the future of gamified code hosting. 🚀',
        level: 50,
        xp: 50000,
        xpToNext: 100000,
        stats: { commits: 2500, pullRequests: 800, reviews: 1200, issues: 350, contributions: 5000 },
        streak: 60,
        longestStreak: 60,
        isAdmin: true,
        badgeColor: 'red',
        characterClass: 'Mage',
        avatarFrame: 'Mythic Flame',
        isFounder: true,
        title: 'Grandmaster Founder',
        demoMode: false,
      })
    } else {
      // Convert existing user to founder
      founder.isFounder = true
      founder.title = 'Grandmaster Founder'
      founder.isAdmin = true
      founder.badgeColor = 'red'
      founder.level = 50
      founder.xp = 50000
      founder.avatarFrame = 'Mythic Flame'
    }

    // Generate contribution heatmap if not present
    if (!founder.contributionDays || founder.contributionDays.length === 0) {
      const contributionDays = []
      for (let i = 364; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const rand = Math.random()
        let count = 0
        if (rand > 0.15) count = Math.floor(Math.random() * 5) + 2
        if (rand > 0.4) count = Math.floor(Math.random() * 10) + 5
        if (rand > 0.6) count = Math.floor(Math.random() * 15) + 8
        if (rand > 0.8) count = Math.floor(Math.random() * 20) + 12
        contributionDays.push({ date, count })
      }
      founder.contributionDays = contributionDays
    }

    // Seed founder-exclusive achievements into the user's achievements array
    const founderAchievementIds = ['genesis', 'world-builder', 'mythic-flame']
    const existingAch = (founder.achievements || []).map(a => a.id)
    for (const achId of founderAchievementIds) {
      if (!existingAch.includes(achId)) {
        founder.achievements = founder.achievements || []
        founder.achievements.push({
          id: achId,
          name: achId === 'genesis' ? 'Genesis' : achId === 'world-builder' ? 'World Builder' : 'Mythic Flame',
          unlockedAt: new Date('2026-01-01'),
        })
      }
    }

    await founder.save()

    // Seed default avatar frames (idempotent)
    const defaultFrames = [
      { name: 'None', borderStyle: 'none', rarity: 'common', isDefault: true, description: 'No frame' },
      { name: 'Iron Circle', borderStyle: 'solid', borderColor: '#8b949e', borderWidth: 3, rarity: 'common', requiredLevel: 1, description: 'A simple iron ring' },
      { name: 'Silver Ring', borderStyle: 'solid', borderColor: '#c0c0c0', borderWidth: 3, rarity: 'common', requiredLevel: 5, description: 'Polished silver frame' },
      { name: 'Gold Crown', borderStyle: 'gradient', borderColor: '#ffd700', borderWidth: 4, gradientColors: ['#ffd700', '#ffaa00', '#ffd700'], rarity: 'rare', requiredLevel: 10, description: 'Golden crown of achievement' },
      { name: 'Emerald Guardian', borderStyle: 'glow', borderColor: '#3fb950', borderWidth: 4, gradientColors: ['#3fb950', '#238636'], rarity: 'rare', requiredLevel: 15, description: 'Pulsing emerald energy' },
      { name: 'Sapphire Storm', borderStyle: 'glow', borderColor: '#58a6ff', borderWidth: 4, gradientColors: ['#58a6ff', '#1f6feb'], rarity: 'epic', requiredLevel: 25, description: 'Crackling sapphire lightning' },
      { name: 'Crimson Blade', borderStyle: 'flame', borderColor: '#f85149', borderWidth: 4, gradientColors: ['#f85149', '#da3633', '#f97316'], rarity: 'epic', requiredLevel: 30, description: 'Wreathed in crimson flames' },
      { name: 'Void Emperor', borderStyle: 'glow', borderColor: '#a371f7', borderWidth: 5, gradientColors: ['#a371f7', '#8957e5', '#a371f7'], rarity: 'legendary', requiredLevel: 40, description: 'Dark purple void energy' },
      { name: 'Mythic Flame', borderStyle: 'flame', borderColor: '#f97316', borderWidth: 5, gradientColors: ['#f97316', '#ffd700', '#f85149', '#f97316'], rarity: 'mythic', requiredLevel: 50, description: 'Legendary flames of creation', overlaySvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="url(#flame-grad)" stroke-width="4"/><defs><linearGradient id="flame-grad"><stop offset="0%" stop-color="#f97316"/><stop offset="50%" stop-color="#ffd700"/><stop offset="100%" stop-color="#f85149"/></linearGradient></defs></svg>', imageUrl: '/frames/mythic-founder.png', blend: 'screen', animation: 'pulse' },
      { name: 'Dragon Heart', borderStyle: 'gradient', borderColor: '#da3633', borderWidth: 5, gradientColors: ['#da3633', '#f97316', '#ffd700', '#f97316', '#da3633'], rarity: 'mythic', requiredLevel: 50, description: 'Forged in dragon fire' },
    ]

    for (const frame of defaultFrames) {
      await AvatarFrame.findOneAndUpdate({ name: frame.name }, frame, { upsert: true, new: true })
    }

    // Link the Mythic Flame frame ref to the founder user
    const mythicFrame = await AvatarFrame.findOne({ name: 'Mythic Flame' })
    if (mythicFrame && !founder.avatarFrameRef) {
      founder.avatarFrameRef = mythicFrame._id
      await founder.save()
    }

    // Create CODEHALAAM source codex under founder's profile (idempotent)
    const existingCodex = await Repository.findOne({ name: 'codehalaam', owner: founder._id })
    if (!existingCodex) {
      await Repository.create({
        name: 'codehalaam',
        description: 'The gamified code hosting platform — free private repos, unlimited collaborators, XP rewards. Built with React, Node.js, and MongoDB.',
        owner: founder._id,
        language: 'TypeScript',
        visibility: 'public',
        starsCount: 4512,
        forksCount: 789,
        hasIssues: true,
        topics: ['code-hosting', 'gamification', 'react', 'node', 'mongodb', 'open-source'],
        license: 'MIT',
        openIssuesCount: 32,
        openPullRequestsCount: 7,
        tagline: 'A gamified, immersive alternative to GitHub',
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind', 'Framer Motion'],
        websiteUrl: 'https://codehalaam.vercel.app',
        accentColor: '#58a6ff',
        branches: [{ name: 'main', isDefault: true }, { name: 'develop' }],
        fileTree: [
          { name: 'README.md', type: 'file', content: '# CODEHALAAM\n\n> A gamified, immersive code hosting platform — free private repos, unlimited collaborators, XP rewards.\n\n## Quick Start\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Architecture\n\n- **Client:** React + TypeScript + Tailwind CSS + Framer Motion\n- **Server:** Node.js + Express + MongoDB\n- **Deployment:** Vercel (serverless)\n\n## Features\n\n- Gamified code hosting with XP, levels, streaks\n- Quests & Offerings (gamified issues & PRs)\n- Avatar frames with game-style prestige\n- Real-time notifications\n- Admin panel with user/repo management', size: '1.4 KB', language: 'Markdown' },
          { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'codehalaam', version: '1.6.0', description: 'Gamified code hosting platform', scripts: { dev: 'concurrently "npm run server" "npm run client"', server: 'cd server && node index.js', client: 'cd client && npm run dev', build: 'cd client && npm run build', test: 'cd server && npm test', check: 'cd client && npx tsc --noEmit' }, license: 'MIT' }, null, 2), size: '0.5 KB', language: 'JSON' },
          { name: 'vercel.json', type: 'file', content: JSON.stringify({ rewrites: [{ source: '/api/(.*)', destination: '/api' }] }, null, 2), size: '0.1 KB', language: 'JSON' },
          { name: 'server', type: 'folder', children: [
            { name: 'app.js', type: 'file', content: '// Express app configuration\nimport express from \'express\'\nimport cors from \'cors\'\nimport routes from \'./routes/index.js\'\n\nconst app = express()\napp.use(cors())\napp.use(express.json())\napp.use(\'/api\', routes)\nexport default app', size: '0.3 KB', language: 'JavaScript' },
            { name: 'seed.js', type: 'file', content: '// Database seed script — creates demo users, repos, quests, offerings\n// Run: node seed.js\n// Creates: founder account, 5 demo users, repos, issues, PRs, quests', size: '0.2 KB', language: 'JavaScript' },
            { name: 'models', type: 'folder', children: [
              { name: 'User.js', type: 'file', content: '// User model — username, email, password, level, xp, achievements, isFounder\n// Fields: isFounder, title, avatarFrameRef for founder prestige', size: '0.2 KB', language: 'JavaScript' },
              { name: 'Repository.js', type: 'file', content: '// Repository model — name, description, fileTree, branches, stars, forks\n// Supports: public/private visibility, cover/logo images', size: '0.2 KB', language: 'JavaScript' },
              { name: 'AvatarFrame.js', type: 'file', content: '// AvatarFrame model — borderStyle, imageUrl, blend mode, animation\n// Rarities: common, rare, epic, legendary, mythic', size: '0.2 KB', language: 'JavaScript' },
              { name: 'Quest.js', type: 'file', content: '// Quest model — gamified issues with XP bounties', size: '0.1 KB', language: 'JavaScript' },
              { name: 'Offering.js', type: 'file', content: '// Offering model — gamified code contributions (bound = merged)', size: '0.1 KB', language: 'JavaScript' },
            ]},
            { name: 'routes', type: 'folder', children: [
              { name: 'auth.js', type: 'file', content: '// Auth routes — signup, login, founder-setup, profile update\n// Founder-setup: strict guards, first-admin-only, one-time genesis', size: '0.2 KB', language: 'JavaScript' },
              { name: 'users.js', type: 'file', content: '// User routes — public profiles, leaderboard, contributions\n// Case-insensitive username lookup', size: '0.1 KB', language: 'JavaScript' },
              { name: 'admin.js', type: 'file', content: '// Admin routes — user/repo management, frame CRUD, forum moderation\n// Founder protection: cannot delete, demote, or modify founder', size: '0.2 KB', language: 'JavaScript' },
              { name: 'codexes.js', type: 'file', content: '// Codex routes — quests, offerings, releases, paths, collaborators', size: '0.1 KB', language: 'JavaScript' },
            ]},
            { name: 'middleware', type: 'folder', children: [
              { name: 'auth.js', type: 'file', content: '// JWT auth middleware — protect, optionalAuth, requireAdmin, requireDemoFree', size: '0.1 KB', language: 'JavaScript' },
            ]},
            { name: 'services', type: 'folder', children: [
              { name: 'uploadService.js', type: 'file', content: '// Upload service — Vercel Blob (prod) or disk storage (dev)', size: '0.1 KB', language: 'JavaScript' },
            ]},
          ]},
          { name: 'client', type: 'folder', children: [
            { name: 'src', type: 'folder', children: [
              { name: 'App.tsx', type: 'file', content: '// Main app — React Router with protected routes', size: '0.2 KB', language: 'TypeScript' },
              { name: 'pages', type: 'folder', children: [
                { name: 'ProfilePage.tsx', type: 'file', content: '// Profile page — founder prestige layer with FOUNDER chip, mythic level card\n// AvatarWithFrame component for game-style avatar rendering', size: '0.2 KB', language: 'TypeScript' },
                { name: 'DashboardPage.tsx', type: 'file', content: '// Dashboard — welcome card, quests, offerings, activity feed', size: '0.1 KB', language: 'TypeScript' },
                { name: 'AdminPage.tsx', type: 'file', content: '// Admin panel — user/repo management with avatar frames', size: '0.1 KB', language: 'TypeScript' },
              ]},
              { name: 'components', type: 'folder', children: [
                { name: 'AvatarWithFrame.tsx', type: 'file', content: '// Core frame rendering — image overlays, CSS frames, pulse glow animation\n// Sizes: sm(32), md(48), lg(96), xl(160)\n// Respects prefers-reduced-motion', size: '0.2 KB', language: 'TypeScript' },
                { name: 'VerifiedBadge.tsx', type: 'file', content: '// Verified badge — blue/red/black badge colors', size: '0.1 KB', language: 'TypeScript' },
                { name: 'Navbar.tsx', type: 'file', content: '// Navbar — search, notifications, avatar with frame, user menu', size: '0.1 KB', language: 'TypeScript' },
                { name: 'Footer.tsx', type: 'file', content: '// Footer — product links, download source → founder profile', size: '0.1 KB', language: 'TypeScript' },
              ]},
              { name: 'contexts', type: 'folder', children: [
                { name: 'AuthContext.tsx', type: 'file', content: '// Auth context — user state, login/logout, refreshUser on focus', size: '0.1 KB', language: 'TypeScript' },
              ]},
              { name: 'lib', type: 'folder', children: [
                { name: 'api.ts', type: 'file', content: '// API client — typed fetch wrapper for all backend endpoints', size: '0.1 KB', language: 'TypeScript' },
              ]},
            ]},
          ]},
          { name: 'docs', type: 'folder', children: [
            { name: 'design.md', type: 'file', content: '# Design System — GitHub Primer + Apple Fluid Motion\n\n## Palette\n- Canvas: #0d1117\n- Accent: #58a6ff\n- Success: #3fb950\n- Danger: #f85149\n\n## Motion\n- Framer Motion springs\n- prefers-reduced-motion respected', size: '0.3 KB', language: 'Markdown' },
            { name: 'agent.md', type: 'file', content: '# Agent Documentation — permission system, API endpoints, deployment\n\n## Verified Badges\n- blue = Verified\n- red = Admin\n- black = Stealth\n\n## Founder\n- isFounder flag, locked to first admin\n- Mythic Flame avatar frame', size: '0.2 KB', language: 'Markdown' },
          ]},
        ],
        defaultReadme: '# CODEHALAAM\n\n> A gamified, immersive code hosting platform.\n\n## Quick Start\n\n```bash\nnpm install\nnpm run dev\n```',
      })
      console.log('[FOUNDER] Created CODEHALAAM source codex')
    }

    console.log('[FOUNDER] Created/converged founder account: JustShipItAI')

    res.json({
      message: 'Founder account created',
      user: { username: founder.username, email: founder.email },
    })
  } catch (err) {
    console.error('Founder setup error:', err)
    res.status(500).json({ error: 'Failed to create founder account' })
  }
})

export default router

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

export default router

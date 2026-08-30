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
import User from '../models/User.js'
import Repository from '../models/Repository.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/users/:username - Public profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -emailNotifications')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's public repos
    const repos = await Repository.find({ owner: user._id, visibility: 'public' })
      .sort({ starsCount: -1 })
      .limit(6)
      .select('name description language starsCount forksCount updatedAt')

    // Get pinned repos (most starred)
    const pinnedRepos = await Repository.find({ owner: user._id })
      .sort({ starsCount: -1 })
      .limit(6)
      .select('name description language starsCount forksCount visibility')

    res.json({
      user,
      repos,
      pinnedRepos,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// PUT /api/users/me - Update own profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowedUpdates = [
      'displayName', 'bio', 'company', 'location', 'website', 'twitter', 'avatarUrl'
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

// POST /api/users/xp - Award XP
router.post('/xp', protect, async (req, res) => {
  try {
    const { amount, reason } = req.body
    const user = await User.findById(req.user._id)

    const result = await user.awardXP(amount, reason)

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.user._id}`).emit('xp_update', {
        amount,
        reason,
        level: result.level,
        xp: result.xp,
        xpToNext: result.xpToNext,
      })
    }

    res.json({
      user,
      xpGained: amount,
      reason,
      ...result,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to award XP' })
  }
})

// GET /api/users/leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('username displayName level xp avatarUrl streak longestStreak stats.contributions')
      .sort({ level: -1, xp: -1 })
      .limit(50)

    res.json({ leaderboard: users })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// GET /api/users/:username/contributions
router.get('/:username/contributions', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('contributionDays stats.contributions')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      contributions: user.contributionDays,
      total: user.stats.contributions,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions' })
  }
})

export default router

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

// GET /api/users/stats — public platform stats (MUST be before /:username)
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRepos] = await Promise.all([
      User.countDocuments(),
      Repository.countDocuments(),
    ])
    res.json({ totalUsers, totalRepos })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/users/leaderboard (MUST be before /:username)
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

// GET /api/users/:username - Public profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -emailNotifications')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const repos = await Repository.find({ owner: user._id })
      .sort({ starsCount: -1 })
      .limit(20)

    res.json({ user, repos })
  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
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

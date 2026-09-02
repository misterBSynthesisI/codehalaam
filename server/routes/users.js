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
import Collaborator from '../models/Collaborator.js'
import { protect, optionalAuth } from '../middleware/auth.js'

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
      .select('username displayName level xp avatarUrl badgeUrl streak longestStreak stats.contributions badgeColor isAdmin isFounder title avatarFrame avatarFrameRef')
      .sort({ level: -1, xp: -1 })
      .limit(50)

    res.json({ leaderboard: users })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// GET /api/users/me — Get current user (requires auth)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('avatarFrameRef')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// GET /api/users/:username - Public profile (viewer-aware)
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -emailNotifications')
      .populate('avatarFrameRef')
      .lean()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Determine if the viewer can see private codexes for this user
    const isOwner = req.user && req.user._id.toString() === user._id.toString()
    const isAdmin = req.user && req.user.isAdmin

    // If viewer is the owner or admin, show all codexes (public + private)
    // If viewer is a logged-in user, show public + private codexes where viewer is collaborator
    // If viewer is anonymous, show only public codexes
    let codexQuery = { owner: user._id }

    if (isOwner || isAdmin) {
      // Show all codexes — no filter needed
    } else if (req.user) {
      // Show public codexes + private codexes where this user is a collaborator
      const collabRepoIds = await Collaborator.find({ user: req.user._id }).distinct('codex')
      const collabCodexIds = await Collaborator.find({ user: user._id }).distinct('codex')
      
      // Get repo IDs where the viewer is a collaborator
      const viewablePrivateRepoIds = collabRepoIds.filter(id => 
        collabCodexIds.some(cid => cid.toString() === id.toString())
      )

      codexQuery = {
        $or: [
          { owner: user._id, visibility: 'public' },
          { _id: { $in: viewablePrivateRepoIds } },
        ],
      }
    } else {
      // Anonymous — only public
      codexQuery = { owner: user._id, visibility: 'public' }
    }

    const repos = await Repository.find(codexQuery)
      .sort({ starsCount: -1 })
      .limit(20)
      .populate('owner', 'username displayName avatarUrl')
      .lean()

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

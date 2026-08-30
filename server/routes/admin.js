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
import Issue from '../models/Issue.js'
import PullRequest from '../models/PullRequest.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Admin middleware — check if user is admin
const adminOnly = async (req, res, next) => {
  // For now, any authenticated user can access admin
  // In production, add an `isAdmin` field to User model
  next()
}

// GET /api/admin/stats — platform-wide stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalRepos, totalIssues, totalPRs, publicRepos, privateRepos] = await Promise.all([
      User.countDocuments(),
      Repository.countDocuments(),
      Issue.countDocuments(),
      PullRequest.countDocuments(),
      Repository.countDocuments({ visibility: 'public' }),
      Repository.countDocuments({ visibility: 'private' }),
    ])

    const openIssues = await Issue.countDocuments({ state: 'open' })
    const closedIssues = await Issue.countDocuments({ state: 'closed' })
    const openPRs = await PullRequest.countDocuments({ state: 'open' })
    const mergedPRs = await PullRequest.countDocuments({ state: 'merged' })

    // Total stars across all repos
    const starAggregate = await Repository.aggregate([
      { $group: { _id: null, total: { $sum: '$starsCount' } } }
    ])
    const totalStars = starAggregate[0]?.total || 0

    // Total contributions
    const userAggregate = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.contributions' } } }
    ])
    const totalContributions = userAggregate[0]?.total || 0

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const recentRepos = await Repository.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })

    // Top languages
    const langAggregate = await Repository.aggregate([
      { $match: { language: { $ne: '' } } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // XP distribution
    const xpDistribution = await User.aggregate([
      {
        $bucket: {
          groupBy: '$level',
          boundaries: [1, 5, 10, 15, 20, 25, 30, 50, 100],
          default: '50+',
          output: { count: { $sum: 1 } }
        }
      }
    ])

    res.json({
      users: { total: totalUsers, recent: recentUsers },
      repos: { total: totalRepos, public: publicRepos, private: privateRepos, recent: recentRepos },
      issues: { total: totalIssues, open: openIssues, closed: closedIssues },
      pullRequests: { total: totalPRs, open: openPRs, merged: mergedPRs },
      stars: totalStars,
      contributions: totalContributions,
      topLanguages: langAggregate.map(l => ({ name: l._id, count: l.count })),
      xpDistribution,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' })
  }
})

// GET /api/admin/users — list all users with pagination
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search = '' } = req.query

    const query = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-contributionDays')

    const total = await User.countDocuments(query)

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /api/admin/repos — list all repos with pagination
router.get('/repos', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search = '', visibility = '' } = req.query

    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    if (visibility) query.visibility = visibility

    const repos = await Repository.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('owner', 'username displayName avatarUrl')

    const total = await Repository.countDocuments(query)

    res.json({ repos, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// GET /api/admin/activity — recent activity feed
router.get('/activity', protect, adminOnly, async (req, res) => {
  try {
    const [recentUsers, recentRepos, recentIssues, recentPRs] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(10).select('username displayName createdAt'),
      Repository.find().sort({ createdAt: -1 }).limit(10).select('name visibility createdAt owner').populate('owner', 'username'),
      Issue.find().sort({ createdAt: -1 }).limit(10).select('number title state createdAt').populate('author', 'username'),
      PullRequest.find().sort({ createdAt: -1 }).limit(10).select('number title state createdAt').populate('author', 'username'),
    ])

    // Merge and sort by date
    const activity = [
      ...recentUsers.map(u => ({ type: 'user_joined', data: u, date: u.createdAt })),
      ...recentRepos.map(r => ({ type: 'repo_created', data: r, date: r.createdAt })),
      ...recentIssues.map(i => ({ type: 'issue_created', data: i, date: i.createdAt })),
      ...recentPRs.map(p => ({ type: 'pr_created', data: p, date: p.createdAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30)

    res.json({ activity })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

// PATCH /api/admin/users/:userId/badge — update user badge
router.patch('/users/:userId/badge', protect, async (req, res) => {
  try {
    // Only super admin can assign badges
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Only administrators can assign badges' })
    }

    const { badgeColor } = req.body
    const validBadges = ['none', 'blue', 'black', 'red']
    if (!validBadges.includes(badgeColor)) {
      return res.status(400).json({ error: 'Invalid badge color' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { badgeColor },
      { new: true }
    ).select('-password -contributionDays')

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ user })
  } catch (err) {
    console.error('Badge update error:', err)
    res.status(500).json({ error: 'Failed to update badge' })
  }
})

export default router

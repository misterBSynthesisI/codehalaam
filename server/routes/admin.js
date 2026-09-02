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
import ForumPost from '../models/ForumPost.js'
import AvatarFrame from '../models/AvatarFrame.js'
import { protect, requireAdmin } from '../middleware/auth.js'
import { uploadAvatar, resolveUploadUrl } from '../services/uploadService.js'

const router = express.Router()

// All admin routes require authentication + admin role
router.use(protect, requireAdmin)

// GET /api/admin/stats — platform-wide stats
router.get('/stats', async (req, res) => {
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
router.get('/users', async (req, res) => {
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
      .select('-contributionDays -password')

    const total = await User.countDocuments(query)

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /api/admin/repos — list all repos with pagination
router.get('/repos', async (req, res) => {
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
      .populate('owner', 'username displayName avatarUrl badgeColor')

    const total = await Repository.countDocuments(query)

    res.json({ repos, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// GET /api/admin/activity — recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const [recentUsers, recentRepos, recentIssues, recentPRs] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(10).select('username displayName badgeColor createdAt'),
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

// PATCH /api/admin/users/:userId — update user (class, level, xp, badgeColor)
router.patch('/users/:userId', async (req, res) => {
  try {
    const { level, xp, badgeColor, characterClass } = req.body

    // Block founder field mutation
    if (req.body.isFounder !== undefined || req.body.title !== undefined) {
      return res.status(403).json({ error: 'Founder fields cannot be modified.' })
    }

    const update = {}

    if (level !== undefined) update.level = level
    if (xp !== undefined) update.xp = xp
    if (badgeColor !== undefined) {
      const validBadges = ['none', 'blue', 'black', 'red']
      if (!validBadges.includes(badgeColor)) {
        return res.status(400).json({ error: 'Invalid badge color' })
      }
      update.badgeColor = badgeColor
    }
    if (characterClass !== undefined) {
      const validClasses = ['Mage', 'Tank', 'Rogue']
      if (!validClasses.includes(characterClass)) {
        return res.status(400).json({ error: 'Invalid character class' })
      }
      update.characterClass = characterClass
    }

    // Prevent demoting founder's isAdmin
    const targetUser = await User.findById(req.params.userId)
    if (!targetUser) return res.status(404).json({ error: 'User not found' })
    if (targetUser.isFounder && req.body.isAdmin === false) {
      return res.status(403).json({ error: 'Cannot demote the founder.' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      update,
      { new: true }
    ).select('-password -contributionDays')

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ user })
  } catch (err) {
    console.error('User update error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// PATCH /api/admin/users/:userId/badge — update user badge (backward compat)
router.patch('/users/:userId/badge', async (req, res) => {
  try {
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

// DELETE /api/admin/users/:userId — delete user permanently
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' })
    }

    // Prevent deleting the founder
    if (user.isFounder) {
      return res.status(403).json({ error: 'Cannot delete the founder account.' })
    }

    await User.findByIdAndDelete(req.params.userId)

    res.json({ message: `User ${user.username} has been banished`, user: { _id: user._id, username: user.username } })
  } catch (err) {
    console.error('User delete error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// ============================================================
//  CODEX (REPOSITORY) MANAGEMENT
// ============================================================

// PATCH /api/admin/repos/:repoId — update any codex (admin bypass)
router.patch('/repos/:repoId', async (req, res) => {
  try {
    const { description, visibility, language, tagline, websiteUrl, technologies, accentColor } = req.body
    const update = {}

    if (description !== undefined) update.description = description
    if (visibility !== undefined) {
      const validVis = ['public', 'private']
      if (!validVis.includes(visibility)) {
        return res.status(400).json({ error: 'Invalid visibility value' })
      }
      update.visibility = visibility
    }
    if (language !== undefined) update.language = language
    if (tagline !== undefined) update.tagline = tagline
    if (websiteUrl !== undefined) update.websiteUrl = websiteUrl
    if (technologies !== undefined) update.technologies = technologies
    if (accentColor !== undefined) update.accentColor = accentColor

    const repo = await Repository.findByIdAndUpdate(
      req.params.repoId,
      update,
      { new: true }
    ).populate('owner', 'username displayName avatarUrl badgeColor')

    if (!repo) return res.status(404).json({ error: 'Codex not found' })

    res.json({ repo })
  } catch (err) {
    console.error('Admin repo update error:', err)
    res.status(500).json({ error: 'Failed to update codex' })
  }
})

// DELETE /api/admin/repos/:repoId — delete any codex (admin bypass)
router.delete('/repos/:repoId', async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId)
    if (!repo) return res.status(404).json({ error: 'Codex not found' })

    // Import models for cascade delete
    const Quest = (await import('../models/Quest.js')).default
    const Offering = (await import('../models/Offering.js')).default
    const Release = (await import('../models/Release.js')).default
    const Path = (await import('../models/Path.js')).default
    const Collaborator = (await import('../models/Collaborator.js')).default
    const Invitation = (await import('../models/Invitation.js')).default
    const Comment = (await import('../models/Comment.js')).default

    // Cascade delete related data
    const [questIds, offeringIds, releaseIds] = await Promise.all([
      Quest.find({ codex: repo._id }).distinct('_id'),
      Offering.find({ codex: repo._id }).distinct('_id'),
      Release.find({ codex: repo._id }).distinct('_id'),
    ])
    await Promise.all([
      Quest.deleteMany({ codex: repo._id }),
      Offering.deleteMany({ codex: repo._id }),
      Path.deleteMany({ codex: repo._id }),
      Release.deleteMany({ codex: repo._id }),
      Collaborator.deleteMany({ codex: repo._id }),
      Invitation.deleteMany({ codex: repo._id }),
    ])
    if (questIds.length || offeringIds.length || releaseIds.length) {
      await Comment.deleteMany({
        $or: [
          { targetType: 'Quest', targetId: { $in: questIds } },
          { targetType: 'Offering', targetId: { $in: offeringIds } },
          { targetType: 'Release', targetId: { $in: releaseIds } },
        ],
      })
    }
    await repo.deleteOne()

    res.json({ message: `Codex ${repo.name} has been deleted`, repo: { _id: repo._id, name: repo.name } })
  } catch (err) {
    console.error('Admin repo delete error:', err)
    res.status(500).json({ error: 'Failed to delete codex' })
  }
})

// ============================================================
//  FORUM MANAGEMENT
// ============================================================

// GET /api/admin/forum — list all forum posts with pagination
router.get('/forum', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search = '' } = req.query
    const query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ]
    }

    const posts = await ForumPost.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username displayName avatarUrl badgeColor')

    const total = await ForumPost.countDocuments(query)

    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Admin forum list error:', err)
    res.status(500).json({ error: 'Failed to fetch forum posts' })
  }
})

// DELETE /api/admin/forum/:postId — delete any forum post
router.delete('/forum/:postId', async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error('Admin forum delete error:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// PATCH /api/admin/forum/:postId/pin — toggle pin on a forum post
router.patch('/forum/:postId/pin', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    post.isPinned = !post.isPinned
    await post.save()
    const populated = await post.populate('author', 'username displayName avatarUrl badgeColor')
    res.json({ post: populated })
  } catch (err) {
    console.error('Admin forum pin error:', err)
    res.status(500).json({ error: 'Failed to toggle pin' })
  }
})

// PATCH /api/admin/forum/:postId/close — toggle close on a forum post
router.patch('/forum/:postId/close', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    post.isClosed = !post.isClosed
    await post.save()
    const populated = await post.populate('author', 'username displayName avatarUrl badgeColor')
    res.json({ post: populated })
  } catch (err) {
    console.error('Admin forum close error:', err)
    res.status(500).json({ error: 'Failed to toggle close' })
  }
})

// ============================================================
//  AVATAR FRAMES
// ============================================================

// GET /api/admin/frames — list all avatar frames
router.get('/frames', async (req, res) => {
  try {
    const frames = await AvatarFrame.find({ isActive: true }).sort({ requiredLevel: 1, rarity: 1 })
    res.json({ frames })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch frames' })
  }
})

// POST /api/admin/frames — create a new avatar frame
router.post('/frames', async (req, res) => {
  try {
    const { name, description, borderStyle, borderColor, borderWidth, gradientColors, overlaySvg, requiredLevel, requiredAchievement, rarity, imageUrl, blend, animation } = req.body
    if (!name) return res.status(400).json({ error: 'Frame name is required' })

    const existing = await AvatarFrame.findOne({ name })
    if (existing) return res.status(422).json({ error: 'Frame name already exists' })

    const frame = await AvatarFrame.create({
      name, description, borderStyle, borderColor, borderWidth,
      gradientColors, overlaySvg, requiredLevel, requiredAchievement, rarity,
      imageUrl, blend, animation,
    })

    res.status(201).json({ frame })
  } catch (err) {
    console.error('Create frame error:', err)
    res.status(500).json({ error: 'Failed to create frame' })
  }
})

// POST /api/admin/frames/upload — upload a frame image
router.post('/frames/upload', uploadAvatar.single('frame'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const imageUrl = await resolveUploadUrl(req.file, 'frames', `/uploads/frames/${req.file.filename}`)
    res.json({ imageUrl })
  } catch (err) {
    console.error('Frame upload error:', err)
    res.status(500).json({ error: 'Failed to upload frame image' })
  }
})

// POST /api/admin/frames/:frameId/upload — upload/update frame image
router.post('/frames/:frameId/upload', uploadAvatar.single('frame'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const imageUrl = await resolveUploadUrl(req.file, 'frames', `/uploads/frames/${req.file.filename}`)
    const frame = await AvatarFrame.findByIdAndUpdate(req.params.frameId, { imageUrl }, { new: true })
    if (!frame) return res.status(404).json({ error: 'Frame not found' })
    res.json({ imageUrl, frame })
  } catch (err) {
    console.error('Frame image upload error:', err)
    res.status(500).json({ error: 'Failed to upload frame image' })
  }
})

// PATCH /api/admin/frames/:frameId — update a frame
router.patch('/frames/:frameId', async (req, res) => {
  try {
    const frame = await AvatarFrame.findByIdAndUpdate(req.params.frameId, req.body, { new: true })
    if (!frame) return res.status(404).json({ error: 'Frame not found' })
    res.json({ frame })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update frame' })
  }
})

// DELETE /api/admin/frames/:frameId — delete a frame
router.delete('/frames/:frameId', async (req, res) => {
  try {
    const frame = await AvatarFrame.findByIdAndDelete(req.params.frameId)
    if (!frame) return res.status(404).json({ error: 'Frame not found' })
    res.json({ message: 'Frame deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete frame' })
  }
})

// POST /api/admin/frames/:frameId/assign/:userId — assign frame to user
router.post('/frames/:frameId/assign/:userId', async (req, res) => {
  try {
    const frame = await AvatarFrame.findById(req.params.frameId)
    if (!frame) return res.status(404).json({ error: 'Frame not found' })
    const user = await User.findByIdAndUpdate(req.params.userId, { avatarFrame: frame.name, avatarFrameRef: frame._id }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user, frame })
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign frame' })
  }
})

// POST /api/admin/achievements — create/assign achievement to user
router.post('/achievements', async (req, res) => {
  try {
    const { userId, id, name } = req.body
    if (!userId || !id || !name) return res.status(400).json({ error: 'userId, id, and name are required' })
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const existing = (user.achievements || []).find(a => a.id === id)
    if (existing) return res.status(422).json({ error: 'Achievement already unlocked' })
    user.achievements = [...(user.achievements || []), { id, name, unlockedAt: new Date() }]
    await user.save()
    res.json({ user: user.toJSON() })
  } catch (err) {
    console.error('Add achievement error:', err)
    res.status(500).json({ error: 'Failed to add achievement' })
  }
})

// DELETE /api/admin/achievements — remove achievement from user
router.delete('/achievements', async (req, res) => {
  try {
    const { userId, achievementId } = req.body
    if (!userId || !achievementId) return res.status(400).json({ error: 'userId and achievementId are required' })
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.achievements = (user.achievements || []).filter(a => a.id !== achievementId)
    await user.save()
    res.json({ user: user.toJSON() })
  } catch (err) {
    console.error('Remove achievement error:', err)
    res.status(500).json({ error: 'Failed to remove achievement' })
  }
})

// PATCH /api/admin/founder/reseed — re-seed founder frame + codex (idempotent, admin only)
router.patch('/founder/reseed', async (req, res) => {
  try {
    const founder = await User.findOne({ isFounder: true })
    if (!founder) return res.status(404).json({ error: 'No founder account found.' })

    // Ensure AvatarFrame model is imported
    // Link Mythic Flame frame if missing
    if (!founder.avatarFrameRef) {
      const mythicFrame = await AvatarFrame.findOne({ name: 'Mythic Flame' })
      if (mythicFrame) {
        founder.avatarFrameRef = mythicFrame._id
        founder.avatarFrame = 'Mythic Flame'
        await founder.save()
      }
    }

    // Create CODEHALAAM codex if missing
    const Repository = (await import('../models/Repository.js')).default
    const existingCodex = await Repository.findOne({ name: 'codehalaam', owner: founder._id })
    if (!existingCodex) {
      await Repository.create({
        name: 'codehalaam',
        description: 'The gamified code hosting platform — free private repos, unlimited collaborators, XP rewards.',
        owner: founder._id,
        language: 'TypeScript',
        visibility: 'public',
        starsCount: 4512,
        forksCount: 789,
        hasIssues: true,
        topics: ['code-hosting', 'gamification', 'react', 'node', 'mongodb'],
        license: 'MIT',
        openIssuesCount: 32,
        tagline: 'A gamified, immersive alternative to GitHub',
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind', 'Framer Motion'],
        websiteUrl: 'https://codehalaam.vercel.app',
        accentColor: '#58a6ff',
        branches: [{ name: 'main', isDefault: true }, { name: 'develop' }],
        fileTree: [
          { name: 'README.md', type: 'file', content: '# CODEHALAAM\n\n> A gamified, immersive code hosting platform — free private repos, unlimited collaborators, XP rewards.\n\n## Quick Start\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Architecture\n\n- **Client:** React + TypeScript + Tailwind CSS + Framer Motion\n- **Server:** Node.js + Express + MongoDB\n- **Deployment:** Vercel (serverless)', size: '1.2 KB', language: 'Markdown' },
          { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'codehalaam', version: '1.6.0', scripts: { dev: 'concurrently "npm run server" "npm run client"', build: 'cd client && npm run build' } }, null, 2), size: '0.4 KB', language: 'JSON' },
          { name: 'server', type: 'folder', children: [
            { name: 'app.js', type: 'file', content: '// Express app — cors, JSON, routes', size: '0.2 KB', language: 'JavaScript' },
            { name: 'seed.js', type: 'file', content: '// Seed script — demo users, repos, quests, offerings', size: '0.1 KB', language: 'JavaScript' },
            { name: 'models', type: 'folder', children: [
              { name: 'User.js', type: 'file', content: '// User model — isFounder, title, avatarFrameRef', size: '0.1 KB', language: 'JavaScript' },
              { name: 'Repository.js', type: 'file', content: '// Repository model — fileTree, branches, stars, forks', size: '0.1 KB', language: 'JavaScript' },
              { name: 'AvatarFrame.js', type: 'file', content: '// AvatarFrame model — imageUrl, blend, animation', size: '0.1 KB', language: 'JavaScript' },
            ]},
            { name: 'routes', type: 'folder', children: [
              { name: 'auth.js', type: 'file', content: '// Auth — founder-setup with strict guards', size: '0.1 KB', language: 'JavaScript' },
              { name: 'admin.js', type: 'file', content: '// Admin — founder protection, frame CRUD', size: '0.1 KB', language: 'JavaScript' },
            ]},
          ]},
          { name: 'client', type: 'folder', children: [
            { name: 'src', type: 'folder', children: [
              { name: 'components', type: 'folder', children: [
                { name: 'AvatarWithFrame.tsx', type: 'file', content: '// Frame rendering — image overlay, CSS frames, pulse glow', size: '0.1 KB', language: 'TypeScript' },
                { name: 'Navbar.tsx', type: 'file', content: '// Navbar with AvatarWithFrame', size: '0.1 KB', language: 'TypeScript' },
              ]},
              { name: 'pages', type: 'folder', children: [
                { name: 'ProfilePage.tsx', type: 'file', content: '// Founder profile layer — FOUNDER chip, mythic card, achievements', size: '0.1 KB', language: 'TypeScript' },
              ]},
            ]},
          ]},
          { name: 'docs', type: 'folder', children: [
            { name: 'design.md', type: 'file', content: '# Design System — GitHub Primer + Apple Fluid Motion', size: '0.2 KB', language: 'Markdown' },
            { name: 'agent.md', type: 'file', content: '# Agent Docs — permissions, founder system, verified badges', size: '0.1 KB', language: 'Markdown' },
          ]},
        ],
      })
    }

    res.json({ message: 'Founder data reseeded.', founder: { username: founder.username, avatarFrameRef: founder.avatarFrameRef } })
  } catch (err) {
    console.error('Founder reseed error:', err)
    res.status(500).json({ error: 'Failed to reseed founder data' })
  }
})

export default router

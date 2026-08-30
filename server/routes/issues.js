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
import Issue from '../models/Issue.js'
import Repository from '../models/Repository.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { canViewCodex } from '../utils/permissions.js'

const router = express.Router()

// GET /api/issues/:owner/:name - List issues for a repo
router.get('/:owner/:name', optionalAuth, async (req, res) => {
  try {
    const { state = 'all', labels, assignee, sort = 'created', direction = 'desc' } = req.query

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    if (!(await canViewCodex(req.user, repo))) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const query = { repository: repo._id }
    if (state !== 'all') query.state = state
    if (labels) query['labels.name'] = { $in: labels.split(',') }
    if (assignee) query.assignees = owner._id

    const sortObj = {}
    sortObj[sort === 'comments' ? 'commentsCount' : 'createdAt'] = direction === 'asc' ? 1 : -1

    const issues = await Issue.find(query)
      .sort(sortObj)
      .populate('author', 'username avatarUrl badgeColor')
      .populate('assignees', 'username avatarUrl badgeColor')

    const openCount = await Issue.countDocuments({ repository: repo._id, state: 'open' })
    const closedCount = await Issue.countDocuments({ repository: repo._id, state: 'closed' })

    res.json({ issues, openCount, closedCount })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' })
  }
})

// GET /api/issues/:owner/:name/:number - Get single issue
router.get('/:owner/:name/:number', optionalAuth, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    if (!(await canViewCodex(req.user, repo))) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const issue = await Issue.findOne({ repository: repo._id, number: req.params.number })
      .populate('author', 'username displayName avatarUrl badgeColor')
      .populate('assignees', 'username displayName avatarUrl badgeColor')
      .populate('comments.author', 'username displayName avatarUrl badgeColor')
      .populate('closedBy', 'username avatarUrl badgeColor')

    if (!issue) return res.status(404).json({ error: 'Issue not found' })

    res.json({ issue })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issue' })
  }
})

// POST /api/issues/:owner/:name - Create issue
router.post('/:owner/:name', protect, async (req, res) => {
  try {
    const { title, body, labels, assignees, bountyXp } = req.body

    if (!title) return res.status(400).json({ error: 'Title is required' })

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    // Get next issue number
    const lastIssue = await Issue.findOne({ repository: repo._id }).sort({ number: -1 })
    const number = lastIssue ? lastIssue.number + 1 : 1

    const issue = await Issue.create({
      number,
      title,
      body,
      author: req.user._id,
      repository: repo._id,
      labels: labels || [],
      assignees: assignees || [],
      bountyXp: bountyXp || 0,
    })

    repo.openIssuesCount += 1
    await repo.save()

    await req.user.awardXP(5, `Opened issue #${number}`)

    const populated = await issue.populate('author', 'username avatarUrl badgeColor')

    res.status(201).json({ issue: populated })
  } catch (err) {
    console.error('Create issue error:', err)
    res.status(500).json({ error: 'Failed to create issue' })
  }
})

// PATCH /api/issues/:owner/:name/:number - Update issue
router.patch('/:owner/:name/:number', protect, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const issue = await Issue.findOne({ repository: repo._id, number: req.params.number })
    if (!issue) return res.status(404).json({ error: 'Issue not found' })

    const { state, labels, assignees, title, body } = req.body

    if (state !== undefined) {
      issue.state = state
      if (state === 'closed') {
        issue.closedAt = new Date()
        issue.closedBy = req.user._id
        repo.openIssuesCount = Math.max(0, repo.openIssuesCount - 1)
        await repo.save()

        // Award XP for closing
        await req.user.awardXP(15, `Closed issue #${issue.number}`)
      }
    }

    if (labels !== undefined) issue.labels = labels
    if (assignees !== undefined) issue.assignees = assignees
    if (title !== undefined) issue.title = title
    if (body !== undefined) issue.body = body

    await issue.save()

    res.json({ issue })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update issue' })
  }
})

// POST /api/issues/:owner/:name/:number/comment - Add comment
router.post('/:owner/:name/:number/comment', protect, async (req, res) => {
  try {
    const { body } = req.body
    if (!body) return res.status(400).json({ error: 'Comment body is required' })

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const issue = await Issue.findOne({ repository: repo._id, number: req.params.number })
    if (!issue) return res.status(404).json({ error: 'Issue not found' })

    issue.comments.push({ author: req.user._id, body })
    issue.commentsCount = issue.comments.length
    await issue.save()

    await req.user.awardXP(2, 'Commented on issue')

    res.status(201).json({ comment: issue.comments[issue.comments.length - 1] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

export default router

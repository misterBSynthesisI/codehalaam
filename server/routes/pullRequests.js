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
import PullRequest from '../models/PullRequest.js'
import Repository from '../models/Repository.js'
import Issue from '../models/Issue.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { canViewCodex } from '../utils/permissions.js'

const router = express.Router()

// GET /api/pulls/:owner/:name - List PRs
router.get('/:owner/:name', optionalAuth, async (req, res) => {
  try {
    const { state = 'all', sort = 'created', direction = 'desc' } = req.query

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    if (!(await canViewCodex(req.user, repo))) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const query = { repository: repo._id }
    if (state !== 'all') query.state = state

    const sortObj = {}
    sortObj[sort === 'comments' ? 'commentsCount' : 'createdAt'] = direction === 'asc' ? 1 : -1

    const pulls = await PullRequest.find(query)
      .sort(sortObj)
      .populate('author', 'username avatarUrl badgeColor')
      .populate('requestedReviewers', 'username avatarUrl badgeColor')
      .populate('mergedBy', 'username avatarUrl badgeColor')

    const openCount = await PullRequest.countDocuments({ repository: repo._id, state: 'open' })
    const closedCount = await PullRequest.countDocuments({ repository: repo._id, state: 'closed' })
    const mergedCount = await PullRequest.countDocuments({ repository: repo._id, state: 'merged' })

    res.json({ pulls, openCount, closedCount, mergedCount })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pull requests' })
  }
})

// GET /api/pulls/:owner/:name/:number - Get single PR
router.get('/:owner/:name/:number', optionalAuth, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    if (!(await canViewCodex(req.user, repo))) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const pull = await PullRequest.findOne({ repository: repo._id, number: req.params.number })
      .populate('author', 'username displayName avatarUrl badgeColor')
      .populate('requestedReviewers', 'username displayName avatarUrl badgeColor')
      .populate('reviews.reviewer', 'username displayName avatarUrl badgeColor')
      .populate('comments.author', 'username displayName avatarUrl badgeColor')
      .populate('mergedBy', 'username displayName avatarUrl badgeColor')
      .populate('closesIssues', 'number title state')

    if (!pull) return res.status(404).json({ error: 'Pull request not found' })

    res.json({ pull })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pull request' })
  }
})

// POST /api/pulls/:owner/:name - Create PR
router.post('/:owner/:name', protect, async (req, res) => {
  try {
    const { title, body, base, head, labels, assignees, requestedReviewers, closesIssues } = req.body

    if (!title || !head) {
      return res.status(400).json({ error: 'Title and head branch are required' })
    }

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    // Get next PR number
    const lastPR = await PullRequest.findOne({ repository: repo._id }).sort({ number: -1 })
    const number = lastPR ? lastPR.number + 1 : 1

    // Generate mock diff stats
    const additions = Math.floor(Math.random() * 200) + 10
    const deletions = Math.floor(Math.random() * 100)
    const changedFiles = Math.floor(Math.random() * 10) + 1

    const pull = await PullRequest.create({
      number,
      title,
      body,
      author: req.user._id,
      repository: repo._id,
      base: base || 'main',
      head,
      labels: labels || [],
      assignees: assignees || [],
      requestedReviewers: requestedReviewers || [],
      additions,
      deletions,
      changedFiles,
      closesIssues: closesIssues || [],
    })

    repo.openPullRequestsCount += 1
    await repo.save()

    // Link to issues
    if (closesIssues?.length) {
      await Issue.updateMany(
        { _id: { $in: closesIssues } },
        { $push: { linkedPullRequests: pull._id } }
      )
    }

    await req.user.awardXP(10, `Opened pull request #${number}`)

    const populated = await pull.populate('author', 'username avatarUrl badgeColor')

    res.status(201).json({ pull: populated })
  } catch (err) {
    console.error('Create PR error:', err)
    res.status(500).json({ error: 'Failed to create pull request' })
  }
})

// PATCH /api/pulls/:owner/:name/:number - Update PR
router.patch('/:owner/:name/:number', protect, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const pull = await PullRequest.findOne({ repository: repo._id, number: req.params.number })
    if (!pull) return res.status(404).json({ error: 'Pull request not found' })

    const { state, title, body, labels, assignees } = req.body

    if (state !== undefined) {
      pull.state = state
      if (state === 'closed') {
        pull.closedAt = new Date()
        pull.closedBy = req.user._id
        repo.openPullRequestsCount = Math.max(0, repo.openPullRequestsCount - 1)
        await repo.save()
      }
    }

    if (title !== undefined) pull.title = title
    if (body !== undefined) pull.body = body
    if (labels !== undefined) pull.labels = labels
    if (assignees !== undefined) pull.assignees = assignees

    await pull.save()

    res.json({ pull })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pull request' })
  }
})

// POST /api/pulls/:owner/:name/:number/merge - Merge PR
router.post('/:owner/:name/:number/merge', protect, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const pull = await PullRequest.findOne({ repository: repo._id, number: req.params.number })
    if (!pull) return res.status(404).json({ error: 'Pull request not found' })

    if (pull.state !== 'open') {
      return res.status(405).json({ error: 'Pull request is not open' })
    }

    pull.state = 'merged'
    pull.merged = true
    pull.mergedAt = new Date()
    pull.mergedBy = req.user._id
    pull.mergeCommitSha = Math.random().toString(36).substring(2, 15)

    repo.openPullRequestsCount = Math.max(0, repo.openPullRequestsCount - 1)
    await repo.save()
    await pull.save()

    // Close linked issues
    if (pull.closesIssues?.length) {
      await Issue.updateMany(
        { _id: { $in: pull.closesIssues } },
        { state: 'closed', closedAt: new Date(), closedBy: req.user._id }
      )
    }

    await req.user.awardXP(50, `Merged pull request #${pull.number}`)

    res.json({ pull, message: 'Pull request merged' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to merge pull request' })
  }
})

// POST /api/pulls/:owner/:name/:number/review - Submit review
router.post('/:owner/:name/:number/review', protect, async (req, res) => {
  try {
    const { state, body } = req.body

    if (!state) return res.status(400).json({ error: 'Review state is required' })

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const pull = await PullRequest.findOne({ repository: repo._id, number: req.params.number })
    if (!pull) return res.status(404).json({ error: 'Pull request not found' })

    pull.reviews.push({
      reviewer: req.user._id,
      state,
      body,
    })

    await pull.save()

    const xpReason = state === 'approved' ? 'Approved a pull request' : 'Reviewed a pull request'
    await req.user.awardXP(25, xpReason)

    res.status(201).json({ review: pull.reviews[pull.reviews.length - 1] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' })
  }
})

// POST /api/pulls/:owner/:name/:number/comment - Add comment
router.post('/:owner/:name/:number/comment', protect, async (req, res) => {
  try {
    const { body, path, line } = req.body
    if (!body) return res.status(400).json({ error: 'Comment body is required' })

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const pull = await PullRequest.findOne({ repository: repo._id, number: req.params.number })
    if (!pull) return res.status(404).json({ error: 'Pull request not found' })

    const comment = {
      author: req.user._id,
      body,
      path,
      line,
    }

    pull.comments.push(comment)
    pull.commentsCount = pull.comments.length
    await pull.save()

    await req.user.awardXP(2, 'Commented on pull request')

    res.status(201).json({ comment: pull.comments[pull.comments.length - 1] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

export default router

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
import Quest from '../models/Quest.js'
import Offering from '../models/Offering.js'
import Path from '../models/Path.js'
import Comment from '../models/Comment.js'
import Release from '../models/Release.js'
import Collaborator from '../models/Collaborator.js'
import Invitation from '../models/Invitation.js'
import Commit from '../models/Commit.js'
import { protect } from '../middleware/auth.js'
import * as gitService from '../services/gitService.js'

const router = express.Router()

// --- Helper: find owner + repo by params ---
async function findCodex(ownerUsername, codexName) {
  const owner = await User.findOne({ username: ownerUsername })
  if (!owner) return { error: 'User not found', status: 404 }
  const repo = await Repository.findOne({ owner: owner._id, name: codexName })
    .populate('owner', 'username displayName avatarUrl')
  if (!repo) return { error: 'Codex not found', status: 404 }
  return { owner, repo }
}

// --- Helper: check authorization for private codexes ---
function canViewCodex(repo, user) {
  if (repo.visibility === 'public') return true
  if (!user) return false
  if (repo.owner._id.toString() === user._id.toString()) return true
  if (user.isAdmin) return true
  return false // simplified — full check would query Collaborator
}

// ============================================================
//  CODEX (Repository) ENDPOINTS
// ============================================================

// GET /api/codexes/:owner/:name — Get single codex
router.get('/:owner/:name', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    if (!canViewCodex(repo, req.user)) {
      return res.status(404).json({ error: 'Codex not found' })
    }

    // Compute user-specific states
    let isEmbered = false, isWatching = false, hasEchoed = false
    if (req.user) {
      isEmbered = repo.embers.some(u => u.toString() === req.user._id.toString())
      isWatching = repo.watchers.some(u => u.toString() === req.user._id.toString())
      hasEchoed = repo.echoes.some(u => u.toString() === req.user._id.toString())
    }

    // Count quests and offerings
    const openQuests = await Quest.countDocuments({ codex: repo._id, status: { $ne: 'Closed' } })
    const openOfferings = await Offering.countDocuments({ codex: repo._id, status: 'Open' })
    const releasesCount = await Release.countDocuments({ codex: repo._id })
    const pathsCount = await Path.countDocuments({ codex: repo._id })
    const collaboratorsCount = await Collaborator.countDocuments({ codex: repo._id }) + 1 // +1 for owner

    res.json({
      repo,
      isEmbered,
      isWatching,
      hasEchoed,
      counts: {
        embers: repo.embers.length,
        watchers: repo.watchers.length,
        echoes: repo.echoes.length,
        openQuests,
        openOfferings,
        releases: releasesCount,
        paths: pathsCount,
        collaborators: collaboratorsCount,
      },
    })
  } catch (err) {
    console.error('Get codex error:', err)
    res.status(500).json({ error: 'Failed to fetch codex' })
  }
})

// GET /api/codexes/:owner/:name/readme — Get README content
router.get('/:owner/:name/readme', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    if (!canViewCodex(repo, req.user)) {
      return res.status(404).json({ error: 'Codex not found' })
    }

    // Try to find README in fileTree
    const findReadme = (files) => {
      for (const f of files) {
        if (f.name === 'README.md' || f.name === 'readme.md') return f
        if (f.children) { const found = findReadme(f.children); if (found) return found }
      }
      return null
    }

    const readmeFile = findReadme(repo.fileTree || [])
    if (readmeFile && readmeFile.content) {
      return res.json({ readme: readmeFile.content, filename: readmeFile.name })
    }

    // Fallback: use git service if available
    try {
      if (gitService.repoExists(req.params.owner, req.params.name)) {
        const result = await gitService.getReadme(req.params.owner, req.params.name)
        if (result.content) {
          return res.json({ readme: result.content, filename: result.filename })
        }
      }
    } catch { /* git service unavailable */ }

    res.json({ readme: null, filename: null })
  } catch (err) {
    console.error('Get README error:', err)
    res.status(500).json({ error: 'Failed to fetch README' })
  }
})

// GET /api/codexes/:owner/:name/tree — Get file tree
router.get('/:owner/:name/tree', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    res.json({ tree: repo.fileTree || [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file tree' })
  }
})

// GET /api/codexes/:owner/:name/blob — Get file content
router.get('/:owner/:name/blob', async (req, res) => {
  try {
    const { path: filePath } = req.query
    if (!filePath) return res.status(400).json({ error: 'Path is required' })

    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    // Navigate file tree
    const parts = filePath.split('/')
    let current = repo.fileTree || []

    for (let i = 0; i < parts.length; i++) {
      const found = current.find(f => f.name === parts[i])
      if (!found) return res.status(404).json({ error: 'File not found' })
      if (i === parts.length - 1) {
        return res.json({ file: found, path: filePath })
      }
      if (found.children) {
        current = found.children
      } else {
        return res.status(404).json({ error: 'File not found' })
      }
    }

    res.status(404).json({ error: 'File not found' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file' })
  }
})

// ============================================================
//  EMBER / WATCH / ECHO
// ============================================================

// POST /api/codexes/:owner/:name/ember — Toggle ember
router.post('/:owner/:name/ember', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const isEmbered = repo.embers.some(u => u.toString() === req.user._id.toString())
    if (isEmbered) {
      repo.embers.pull(req.user._id)
    } else {
      repo.embers.push(req.user._id)
      await req.user.awardXP(2, 'Gave an Ember')
    }
    await repo.save()

    res.json({ isEmbered: !isEmbered, embersCount: repo.embers.length })
  } catch (err) {
    console.error('Ember toggle error:', err)
    res.status(500).json({ error: 'Failed to toggle ember' })
  }
})

// POST /api/codexes/:owner/:name/watch — Toggle watch
router.post('/:owner/:name/watch', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const isWatching = repo.watchers.some(u => u.toString() === req.user._id.toString())
    if (isWatching) {
      repo.watchers.pull(req.user._id)
    } else {
      repo.watchers.push(req.user._id)
    }
    await repo.save()

    res.json({ isWatching: !isWatching, watchersCount: repo.watchers.length })
  } catch (err) {
    console.error('Watch toggle error:', err)
    res.status(500).json({ error: 'Failed to toggle watch' })
  }
})

// POST /api/codexes/:owner/:name/echo — Toggle echo
router.post('/:owner/:name/echo', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const hasEchoed = repo.echoes.some(u => u.toString() === req.user._id.toString())
    if (hasEchoed) {
      repo.echoes.pull(req.user._id)
    } else {
      repo.echoes.push(req.user._id)
      await req.user.awardXP(15, 'Echoed a codex')
    }
    await repo.save()

    res.json({ hasEchoed: !hasEchoed, echoesCount: repo.echoes.length })
  } catch (err) {
    console.error('Echo error:', err)
    res.status(500).json({ error: 'Failed to echo' })
  }
})

// ============================================================
//  QUESTS
// ============================================================

// GET /api/codexes/:owner/:name/quests — List quests
router.get('/:owner/:name/quests', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { state } = req.query
    const query = { codex: repo._id }
    if (state === 'open') query.status = { $ne: 'Closed' }
    if (state === 'closed') query.status = 'Closed'

    const quests = await Quest.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatarUrl')
      .populate('assignees', 'username displayName avatarUrl')

    const openCount = await Quest.countDocuments({ codex: repo._id, status: { $ne: 'Closed' } })
    const closedCount = await Quest.countDocuments({ codex: repo._id, status: 'Closed' })

    res.json({ quests, openCount, closedCount })
  } catch (err) {
    console.error('List quests error:', err)
    res.status(500).json({ error: 'Failed to fetch quests' })
  }
})

// POST /api/codexes/:owner/:name/quests — Create quest
router.post('/:owner/:name/quests', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { title, body, bountyXp, assignees, labels } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })

    // Get next quest number
    const number = repo.nextQuestNumber || 1
    repo.nextQuestNumber = number + 1
    await repo.save()

    const quest = await Quest.create({
      codex: repo._id,
      number,
      title,
      body: body || '',
      bountyXp: bountyXp || 15,
      author: req.user._id,
      assignees: assignees || [],
      labels: labels || [],
    })

    await req.user.awardXP(5, `Opened quest #${number}`)

    const populated = await quest.populate('author', 'username displayName avatarUrl')
    res.status(201).json({ quest: populated })
  } catch (err) {
    console.error('Create quest error:', err)
    res.status(500).json({ error: 'Failed to create quest' })
  }
})

// GET /api/codexes/:owner/:name/quests/:number — Get quest by number
router.get('/:owner/:name/quests/:number', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const quest = await Quest.findOne({ codex: repo._id, number: parseInt(req.params.number) })
      .populate('author', 'username displayName avatarUrl')
      .populate('assignees', 'username displayName avatarUrl')
      .populate('closedBy', 'username avatarUrl')

    if (!quest) return res.status(404).json({ error: 'Quest not found' })

    // Get comments
    const comments = await Comment.find({ targetType: 'Quest', targetId: quest._id })
      .sort({ createdAt: 1 })
      .populate('author', 'username displayName avatarUrl')

    res.json({ quest, comments })
  } catch (err) {
    console.error('Get quest error:', err)
    res.status(500).json({ error: 'Failed to fetch quest' })
  }
})

// PATCH /api/codexes/:owner/:name/quests/:number — Update quest status
router.patch('/:owner/:name/quests/:number', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const quest = await Quest.findOne({ codex: repo._id, number: parseInt(req.params.number) })
    if (!quest) return res.status(404).json({ error: 'Quest not found' })

    const { status: newStatus, title, body, assignees, labels, bountyXp } = req.body

    if (newStatus !== undefined) {
      quest.status = newStatus
      if (newStatus === 'Closed') {
        quest.closedAt = new Date()
        quest.closedBy = req.user._id
        await req.user.awardXP(15, `Closed quest #${quest.number}`)
      }
    }
    if (title !== undefined) quest.title = title
    if (body !== undefined) quest.body = body
    if (assignees !== undefined) quest.assignees = assignees
    if (labels !== undefined) quest.labels = labels
    if (bountyXp !== undefined) quest.bountyXp = bountyXp

    await quest.save()

    res.json({ quest })
  } catch (err) {
    console.error('Update quest error:', err)
    res.status(500).json({ error: 'Failed to update quest' })
  }
})

// POST /api/codexes/:owner/:name/quests/:number/comments — Add comment to quest
router.post('/:owner/:name/quests/:number/comments', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const quest = await Quest.findOne({ codex: repo._id, number: parseInt(req.params.number) })
    if (!quest) return res.status(404).json({ error: 'Quest not found' })

    const { body } = req.body
    if (!body) return res.status(400).json({ error: 'Comment body is required' })

    const comment = await Comment.create({
      targetType: 'Quest',
      targetId: quest._id,
      author: req.user._id,
      body,
    })

    await req.user.awardXP(2, 'Commented on quest')

    const populated = await comment.populate('author', 'username displayName avatarUrl')
    res.status(201).json({ comment: populated })
  } catch (err) {
    console.error('Add quest comment error:', err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// ============================================================
//  OFFERINGS
// ============================================================

// GET /api/codexes/:owner/:name/offerings — List offerings
router.get('/:owner/:name/offerings', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { state } = req.query
    const query = { codex: repo._id }
    if (state === 'open') query.status = 'Open'
    if (state === 'closed') query.status = 'Closed'
    if (state === 'bound') query.status = 'Bound'

    const offerings = await Offering.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatarUrl')

    const openCount = await Offering.countDocuments({ codex: repo._id, status: 'Open' })
    const boundCount = await Offering.countDocuments({ codex: repo._id, status: 'Bound' })
    const closedCount = await Offering.countDocuments({ codex: repo._id, status: 'Closed' })

    res.json({ offerings, openCount, boundCount, closedCount })
  } catch (err) {
    console.error('List offerings error:', err)
    res.status(500).json({ error: 'Failed to fetch offerings' })
  }
})

// POST /api/codexes/:owner/:name/offerings — Create offering
router.post('/:owner/:name/offerings', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { title, body, sourcePath, targetPath } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    if (!sourcePath) return res.status(400).json({ error: 'Source path is required' })

    const number = repo.nextOfferingNumber || 1
    repo.nextOfferingNumber = number + 1
    await repo.save()

    const offering = await Offering.create({
      codex: repo._id,
      number,
      title,
      body: body || '',
      sourcePath,
      targetPath: targetPath || repo.defaultBranch || 'main',
      author: req.user._id,
    })

    await req.user.awardXP(10, `Opened offering #${number}`)

    const populated = await offering.populate('author', 'username displayName avatarUrl')
    res.status(201).json({ offering: populated })
  } catch (err) {
    console.error('Create offering error:', err)
    res.status(500).json({ error: 'Failed to create offering' })
  }
})

// GET /api/codexes/:owner/:name/offerings/:number — Get offering by number
router.get('/:owner/:name/offerings/:number', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const offering = await Offering.findOne({ codex: repo._id, number: parseInt(req.params.number) })
      .populate('author', 'username displayName avatarUrl')
      .populate('closedBy', 'username avatarUrl')

    if (!offering) return res.status(404).json({ error: 'Offering not found' })

    const comments = await Comment.find({ targetType: 'Offering', targetId: offering._id })
      .sort({ createdAt: 1 })
      .populate('author', 'username displayName avatarUrl')

    res.json({ offering, comments })
  } catch (err) {
    console.error('Get offering error:', err)
    res.status(500).json({ error: 'Failed to fetch offering' })
  }
})

// PATCH /api/codexes/:owner/:name/offerings/:number — Update offering status
router.patch('/:owner/:name/offerings/:number', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const offering = await Offering.findOne({ codex: repo._id, number: parseInt(req.params.number) })
    if (!offering) return res.status(404).json({ error: 'Offering not found' })

    const { status: newStatus, title, body } = req.body
    if (newStatus !== undefined) {
      offering.status = newStatus
      if (newStatus === 'Closed') {
        offering.closedAt = new Date()
        offering.closedBy = req.user._id
      }
    }
    if (title !== undefined) offering.title = title
    if (body !== undefined) offering.body = body

    await offering.save()

    res.json({ offering })
  } catch (err) {
    console.error('Update offering error:', err)
    res.status(500).json({ error: 'Failed to update offering' })
  }
})

// POST /api/codexes/:owner/:name/offerings/:number/comments — Add comment to offering
router.post('/:owner/:name/offerings/:number/comments', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const offering = await Offering.findOne({ codex: repo._id, number: parseInt(req.params.number) })
    if (!offering) return res.status(404).json({ error: 'Offering not found' })

    const { body } = req.body
    if (!body) return res.status(400).json({ error: 'Comment body is required' })

    const comment = await Comment.create({
      targetType: 'Offering',
      targetId: offering._id,
      author: req.user._id,
      body,
    })

    await req.user.awardXP(2, 'Commented on offering')

    const populated = await comment.populate('author', 'username displayName avatarUrl')
    res.status(201).json({ comment: populated })
  } catch (err) {
    console.error('Add offering comment error:', err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// POST /api/codexes/:owner/:name/offerings/:number/bind — Bind offering
router.post('/:owner/:name/offerings/:number/bind', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const offering = await Offering.findOne({ codex: repo._id, number: parseInt(req.params.number) })
    if (!offering) return res.status(404).json({ error: 'Offering not found' })
    if (offering.status !== 'Open') {
      return res.status(400).json({ error: 'Only open offerings can be bound' })
    }

    // Attempt git bind if service is available
    let gitBound = false
    try {
      if (gitService.repoExists(req.params.owner, req.params.name)) {
        const result = await gitService.bindBranch(
          req.params.owner, req.params.name,
          offering.sourcePath, offering.targetPath
        )
        gitBound = result.success
      }
    } catch { /* git service unavailable, fall back to DB-only */ }

    offering.status = 'Bound'
    offering.boundAt = new Date()
    await offering.save()

    // Award XP to author
    const author = await User.findById(offering.author)
    if (author) await author.awardXP(50, `Offering #${offering.number} bound`)

    res.json({ offering, gitBound })
  } catch (err) {
    console.error('Bind offering error:', err)
    res.status(500).json({ error: 'Failed to bind offering' })
  }
})

// ============================================================
//  PATHS
// ============================================================

// GET /api/codexes/:owner/:name/paths — List paths
router.get('/:owner/:name/paths', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const paths = await Path.find({ codex: repo._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .populate('createdBy', 'username displayName avatarUrl')

    res.json({ paths })
  } catch (err) {
    console.error('List paths error:', err)
    res.status(500).json({ error: 'Failed to fetch paths' })
  }
})

// POST /api/codexes/:owner/:name/paths — Create path
router.post('/:owner/:name/paths', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { name, from } = req.body
    if (!name) return res.status(400).json({ error: 'Path name is required' })

    // Check for duplicate
    const existing = await Path.findOne({ codex: repo._id, name })
    if (existing) return res.status(422).json({ error: 'Path already exists' })

    const path = await Path.create({
      codex: repo._id,
      name,
      createdBy: req.user._id,
    })

    // Also add to repo.branches for backward compat
    repo.branches = repo.branches || []
    repo.branches.push({ name, isDefault: false })
    await repo.save()

    // Try to create git branch
    try {
      if (gitService.repoExists(req.params.owner, req.params.name)) {
        await gitService.createBranch(req.params.owner, req.params.name, name, from || 'main')
      }
    } catch { /* git service unavailable */ }

    const populated = await path.populate('createdBy', 'username displayName avatarUrl')
    res.status(201).json({ path: populated })
  } catch (err) {
    console.error('Create path error:', err)
    res.status(500).json({ error: 'Failed to create path' })
  }
})

// ============================================================
//  RELEASES
// ============================================================

// GET /api/codexes/:owner/:name/releases — List releases
router.get('/:owner/:name/releases', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const releases = await Release.find({ codex: repo._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatarUrl')

    // Get comments for each release
    const releasesWithComments = await Promise.all(
      releases.map(async (r) => {
        const comments = await Comment.find({ targetType: 'Release', targetId: r._id })
          .sort({ createdAt: 1 })
          .populate('author', 'username displayName avatarUrl')
        return { ...r.toObject(), comments }
      })
    )

    res.json({ releases: releasesWithComments })
  } catch (err) {
    console.error('List releases error:', err)
    res.status(500).json({ error: 'Failed to fetch releases' })
  }
})

// POST /api/codexes/:owner/:name/releases — Create release
router.post('/:owner/:name/releases', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const { tagName, title, body } = req.body
    if (!tagName) return res.status(400).json({ error: 'Tag name is required' })
    if (!title) return res.status(400).json({ error: 'Title is required' })

    // Check for duplicate tag
    const existing = await Release.findOne({ codex: repo._id, tagName })
    if (existing) return res.status(422).json({ error: 'Tag already exists' })

    const release = await Release.create({
      codex: repo._id,
      tagName,
      title,
      body: body || '',
      author: req.user._id,
    })

    // Try to create git tag
    try {
      if (gitService.repoExists(req.params.owner, req.params.name)) {
        await gitService.createTag(req.params.owner, req.params.name, tagName, body || `Release ${tagName}`)
      }
    } catch { /* git service unavailable */ }

    await req.user.awardXP(10, `Created release ${tagName}`)

    const populated = await release.populate('author', 'username displayName avatarUrl')
    res.status(201).json({ release: populated })
  } catch (err) {
    console.error('Create release error:', err)
    res.status(500).json({ error: 'Failed to create release' })
  }
})

// ============================================================
//  COLLABORATORS
// ============================================================

// GET /api/codexes/:owner/:name/collaborators — List collaborators
router.get('/:owner/:name/collaborators', async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    const collaborators = await Collaborator.find({ codex: repo._id })
      .populate('user', 'username displayName avatarUrl')
      .populate('addedBy', 'username avatarUrl')

    // Add owner as first collaborator
    const allCollabs = [
      {
        user: owner,
        role: 'Owner',
        addedBy: owner,
        isOwner: true,
      },
      ...collaborators,
    ]

    res.json({ collaborators: allCollabs })
  } catch (err) {
    console.error('List collaborators error:', err)
    res.status(500).json({ error: 'Failed to fetch collaborators' })
  }
})

// POST /api/codexes/:owner/:name/collaborators — Add collaborator
router.post('/:owner/:name/collaborators', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    // Only owner or admin can add
    if (owner._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the owner can manage collaborators' })
    }

    const { username, email, role } = req.body
    const identifier = username || email
    if (!identifier) return res.status(400).json({ error: 'Username or email is required' })

    // Try to find the user
    const userQuery = username ? { username } : { email }
    const invitee = await User.findOne(userQuery)

    if (invitee) {
      // User exists — add directly
      if (invitee._id.toString() === owner._id.toString()) {
        return res.status(422).json({ error: 'Cannot add the owner as a collaborator' })
      }

      const existing = await Collaborator.findOne({ codex: repo._id, user: invitee._id })
      if (existing) {
        return res.status(422).json({ error: `${invitee.username} is already a collaborator` })
      }

      const collaborator = await Collaborator.create({
        codex: repo._id,
        repository: repo._id,
        user: invitee._id,
        role: role || 'Write',
        addedBy: req.user._id,
        invitedBy: req.user._id,
        pending: false,
        acceptedAt: new Date(),
      })

      const populated = await collaborator.populate('user', 'username displayName avatarUrl')
      return res.status(201).json({ collaborator: populated, invited: false })
    } else {
      // User not found — create invitation
      const emailAddr = email || `${username}@placeholder.codehalaam.dev`
      const invitation = await Invitation.create({
        codex: repo._id,
        email: emailAddr,
        invitedBy: req.user._id,
        role: role || 'Write',
      })

      return res.status(201).json({
        invited: true,
        invitation,
        inviteLink: `/invitations/${invitation.token}`,
      })
    }
  } catch (err) {
    console.error('Add collaborator error:', err)
    res.status(500).json({ error: 'Failed to add collaborator' })
  }
})

// DELETE /api/codexes/:owner/:name/collaborators/:userId — Remove collaborator
router.delete('/:owner/:name/collaborators/:userId', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    if (owner._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the owner can remove collaborators' })
    }

    const result = await Collaborator.findOneAndDelete({
      codex: repo._id,
      user: req.params.userId,
    })

    if (!result) return res.status(404).json({ error: 'Collaborator not found' })

    res.json({ message: 'Collaborator removed' })
  } catch (err) {
    console.error('Remove collaborator error:', err)
    res.status(500).json({ error: 'Failed to remove collaborator' })
  }
})

// ============================================================
//  INVITATIONS
// ============================================================

// POST /api/codexes/:owner/:name/invitations — Create invitation
router.post('/:owner/:name/invitations', protect, async (req, res) => {
  try {
    const { owner, repo, error, status } = await findCodex(req.params.owner, req.params.name)
    if (error) return res.status(status).json({ error })

    if (owner._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the owner can send invitations' })
    }

    const { email, role } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const invitation = await Invitation.create({
      codex: repo._id,
      email: email.toLowerCase(),
      invitedBy: req.user._id,
      role: role || 'Write',
    })

    res.status(201).json({
      invitation,
      inviteLink: `/invitations/${invitation.token}`,
    })
  } catch (err) {
    console.error('Create invitation error:', err)
    res.status(500).json({ error: 'Failed to create invitation' })
  }
})

// GET /api/invitations/:token — Get invitation by token
router.get('/invitations/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('codex', 'name')
      .populate('invitedBy', 'username displayName')

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' })
    if (invitation.status !== 'Pending') {
      return res.status(410).json({ error: 'Invitation is no longer valid' })
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'Expired'
      await invitation.save()
      return res.status(410).json({ error: 'Invitation has expired' })
    }

    res.json({ invitation })
  } catch (err) {
    console.error('Get invitation error:', err)
    res.status(500).json({ error: 'Failed to fetch invitation' })
  }
})

// POST /api/invitations/:token/accept — Accept invitation
router.post('/invitations/:token/accept', protect, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' })
    if (invitation.status !== 'Pending') {
      return res.status(410).json({ error: 'Invitation is no longer valid' })
    }

    // Check if user's email matches
    if (req.user.email !== invitation.email && !req.user.isAdmin) {
      return res.status(403).json({ error: 'This invitation is for a different email address' })
    }

    // Add as collaborator
    const existing = await Collaborator.findOne({ codex: invitation.codex, user: req.user._id })
    if (!existing) {
      await Collaborator.create({
        codex: invitation.codex,
        repository: invitation.codex,
        user: req.user._id,
        role: invitation.role,
        addedBy: invitation.invitedBy,
        invitedBy: invitation.invitedBy,
        pending: false,
        acceptedAt: new Date(),
      })
    }

    invitation.status = 'Accepted'
    await invitation.save()

    res.json({ message: 'Invitation accepted', codexId: invitation.codex })
  } catch (err) {
    console.error('Accept invitation error:', err)
    res.status(500).json({ error: 'Failed to accept invitation' })
  }
})

export default router

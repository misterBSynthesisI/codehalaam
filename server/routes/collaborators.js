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
import Collaborator from '../models/Collaborator.js'
import Repository from '../models/Repository.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/collaborators/:owner/:name - List collaborators
router.get('/:owner/:name', async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const collaborators = await Collaborator.find({ repository: repo._id })
      .populate('user', 'username displayName avatarUrl')
      .populate('invitedBy', 'username avatarUrl')

    // Add repo owner as admin
    const allCollabs = [
      {
        user: owner,
        role: 'admin',
        invitedBy: owner,
        acceptedAt: owner.createdAt,
        pending: false,
        isOwner: true,
      },
      ...collaborators,
    ]

    res.json({ collaborators: allCollabs })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collaborators' })
  }
})

// POST /api/collaborators/:owner/:name - Invite collaborator
router.post('/:owner/:name', protect, async (req, res) => {
  try {
    const { username, role } = req.body

    if (!username) return res.status(400).json({ error: 'Username is required' })

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner || owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the repository owner can add collaborators' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const invitee = await User.findOne({ username })
    if (!invitee) return res.status(404).json({ error: `User "${username}" not found` })

    // Check if already a collaborator
    const existing = await Collaborator.findOne({ user: invitee._id, repository: repo._id })
    if (existing) {
      return res.status(422).json({ error: `${username} is already a collaborator` })
    }

    const collaborator = await Collaborator.create({
      user: invitee._id,
      repository: repo._id,
      role: role || 'write',
      invitedBy: req.user._id,
      pending: false,
      acceptedAt: new Date(),
    })

    const populated = await collaborator.populate('user', 'username displayName avatarUrl')

    res.status(201).json({ collaborator: populated })
  } catch (err) {
    console.error('Add collaborator error:', err)
    res.status(500).json({ error: 'Failed to add collaborator' })
  }
})

// PATCH /api/collaborators/:owner/:name/:userId - Update role
router.patch('/:owner/:name/:userId', protect, async (req, res) => {
  try {
    const { role } = req.body

    const owner = await User.findOne({ username: req.params.owner })
    if (!owner || owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the repository owner can change roles' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const collaborator = await Collaborator.findOne({
      user: req.params.userId,
      repository: repo._id,
    })

    if (!collaborator) return res.status(404).json({ error: 'Collaborator not found' })

    collaborator.role = role
    await collaborator.save()

    res.json({ collaborator })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update collaborator' })
  }
})

// DELETE /api/collaborators/:owner/:name/:userId - Remove collaborator
router.delete('/:owner/:name/:userId', protect, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.owner })
    if (!owner || owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the repository owner can remove collaborators' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const result = await Collaborator.findOneAndDelete({
      user: req.params.userId,
      repository: repo._id,
    })

    if (!result) return res.status(404).json({ error: 'Collaborator not found' })

    res.json({ message: 'Collaborator removed' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove collaborator' })
  }
})

export default router

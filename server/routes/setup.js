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
import { generateToken } from '../middleware/auth.js'
import { ensureConnected } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/setup/status
 *
 * Returns whether first-run setup is needed.
 * Setup is needed when the database has zero users.
 * This endpoint is exempt from the DB guard (see api/index.js / app.js)
 * so it works on a fresh deployment before any data exists.
 */
router.get('/status', async (req, res) => {
  try {
    await ensureConnected()
    const userCount = await User.countDocuments()
    const needsSetup = userCount === 0
    res.json({
      needsSetup,
      userCount,
      message: needsSetup
        ? 'No users found. Create an admin account to get started.'
        : 'Setup already complete.',
    })
  } catch (err) {
    console.error('Setup status error:', err)
    // If the User collection doesn't exist yet (fresh DB), setup is needed.
    res.json({
      needsSetup: true,
      userCount: 0,
      message: 'Database reachable but no users found. Create an admin account to get started.',
      dbError: err.message,
    })
  }
})

/**
 * POST /api/setup/admin
 *
 * Creates the first admin user. Only works when no users exist in the DB.
 * Once the first user is created, this endpoint is permanently disabled
 * (returns 410 Gone) so it cannot be used to inject admin accounts later.
 *
 * Body: { username, email, password }
 */
router.post('/admin', async (req, res) => {
  try {
    // Ensure DB is connected before any write
    await ensureConnected()

    // ─── Security gate: only allow when DB is empty ──────────────────
    const existingCount = await User.countDocuments()
    if (existingCount > 0) {
      return res.status(410).json({
        error: 'Setup is already complete. This endpoint is disabled.',
      })
    }

    // ─── Validate input ───────────────────────────────────────────────
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    if (username.length < 3 || username.length > 39) {
      return res.status(400).json({ error: 'Username must be 3–39 characters' })
    }

    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and hyphens' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // ─── Create the first admin ──────────────────────────────────────
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      displayName: username,
      isAdmin: true,
      badgeColor: 'red',
      characterClass: 'Mage',
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

    // First admin gets a short-lived admin token.
    const token = generateToken(user._id, { isAdmin: true })

    res.status(201).json({
      message: `Admin account created. Welcome to CODEHALAAM, ${username}!`,
      user,
      token,
    })
  } catch (err) {
    console.error('Setup admin creation error:', err)

    // Handle duplicate key (shouldn't happen on empty DB, but be safe)
    if (err.code === 11000) {
      return res.status(422).json({ error: 'Username or email already exists' })
    }

    res.status(500).json({ error: 'Failed to create admin account', detail: err.message })
  }
})

export default router

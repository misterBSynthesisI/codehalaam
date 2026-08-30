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

import { Router } from 'express'
import Notification from '../models/Notification.js'
import auth from '../middleware/auth.js'

const router = Router()

// GET /api/notifications — latest 20 for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('actor', 'username avatarUrl')
      .lean()

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    })

    res.json({ notifications, unreadCount })
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// PATCH /api/notifications/read — mark all as read
router.patch('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    )
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to mark notifications read:', err)
    res.status(500).json({ error: 'Failed to mark notifications read' })
  }
})

export default router

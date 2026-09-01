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

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized — no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized — user not found' })
    }

    // Block disabled / deactivated accounts
    if (req.user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated' })
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized — token invalid' })
  }
}

export const generateToken = (userId, options = {}) => {
  const expiresIn = options.isAdmin ? '2d' : '30d'
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn })
}

// Optional auth — populates req.user if token present, but does NOT require it
export const optionalAuth = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch { /* invalid token, continue without user */ }
  }
  next()
}

/**
 * requireAdmin — checks that the authenticated user is an admin.
 * Also enforces a short-lived admin session by re-verifying the token
 * has not exceeded the admin max-age. MUST run after protect.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }

  // Enforce admin token freshness: admin tokens expire in 2d.
  // We re-verify the token's decoded iat to ensure it was issued recently.
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const ageMs = Date.now() - (decoded.iat * 1000)
    const maxAgeMs = 2 * 24 * 60 * 60 * 1000 // 2 days
    if (ageMs > maxAgeMs) {
      return res.status(401).json({ error: 'Admin session expired. Please sign in again.' })
    }
  } catch {
    return res.status(401).json({ error: 'Admin token invalid' })
  }

  next()
}

/**
 * requireDemoFree — blocks demo mode users from making any data changes.
 * MUST run after protect.
 */
export const requireDemoFree = (req, res, next) => {
  if (req.user?.demoMode) {
    return res.status(403).json({ error: 'This action is not available in demo mode. Create a real account to get started.' })
  }
  next()
}

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

/**
 * Vercel serverless entry.
 *
 * Vercel scans /api/*.js and turns each file into a serverless function.
 * This file is mapped to the catch-all route via vercel.json so that the
 * entire Express API (mounted at /api/*) runs inside ONE function — meaning
 * only one server is ever needed on Vercel, even on the free tier.
 *
 * Usage of a single function is what makes this "one tap deploy":
 *   - The frontend is built as static assets (served by Vercel's CDN).
 *   - All /api/* requests are rewritten here and handled by Express.
 *   - MongoDB Atlas is reached over the network; no local DB process needed.
 *
 * Socket.io cannot hold WebSocket connections on Vercel serverless, so the
 * realtime layer is intentionally NOT started here. The Express app still
 * attaches `io` as undefined-safe so routes that reference app.get('io')
 * do not crash. Local development keeps full Socket.io via server/index.js.
 */

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { ensureConnected } from '../server/config/db.js'

// Route handlers
import authRoutes from '../server/routes/auth.js'
import userRoutes from '../server/routes/users.js'
import repoRoutes from '../server/routes/repos.js'
import issueRoutes from '../server/routes/issues.js'
import prRoutes from '../server/routes/pullRequests.js'
import collaboratorRoutes from '../server/routes/collaborators.js'
import adminRoutes from '../server/routes/admin.js'
import gitRoutes from '../server/routes/git.js'
import notificationRoutes from '../server/routes/notifications.js'
import codexRoutes from '../server/routes/codexes.js'
import setupRoutes from '../server/routes/setup.js'
import settingsRoutes from '../server/routes/settings.js'

dotenv.config()

const app = express()

// ─── MIDDLEWARE (order matters — must come BEFORE routes) ───────────────
// CORS must be first so preflight OPTIONS requests succeed.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}))

// JSON body parser — increased limit to 30MB for project file uploads.
// On Vercel, large file uploads go through Vercel Blob (see uploadService),
// but JSON API payloads (codex file trees, etc.) may still be large.
app.use(express.json({ limit: '32mb' }))
app.use(express.urlencoded({ limit: '32mb', extended: true }))

/**
 * Database guard.
 *
 * Ensures the Mongoose connection is established BEFORE any route handler
 * runs. On Vercel, invocations are reused across warm requests, so this is
 * a cheap no-op once connected. On cold starts it performs the initial
 * handshake.
 *
 * CRITICAL: This must run after body parsing but BEFORE routes, so that
 * route handlers never see a disconnected DB and always return valid JSON.
 *
 * The /api/setup and /api/health endpoints are EXEMPT from the guard so
 * first-run setup works on a fresh (possibly schema-less) database.
 */
async function ensureDb(req, res, next) {
  // Exempt health + setup so first-run flows work before DB is ready.
  if (req.path === '/api/health' || req.path.startsWith('/api/setup')) {
    return next()
  }
  try {
    await ensureConnected()
    next()
  } catch (err) {
    console.error('❌ DB unavailable on serverless:', err.message)
    res.status(503).json({
      error: 'Database is not reachable. Check MONGODB_URI.',
      status: 'degraded',
      database: 'disconnected',
    })
  }
}

app.use(ensureDb)

// ─── ROUTES ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/repos', repoRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/pulls', prRoutes)
app.use('/api/collaborators', collaboratorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/codexes', codexRoutes)
app.use('/api/setup', setupRoutes)
app.use('/api/settings', settingsRoutes)

// Git Smart HTTP routes
app.all(/^\/([^/]+)\/([^/]+)\.git\/(.*)$/, gitRoutes)

// Health check
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1
  const status = dbConnected ? 'ok' : 'degraded'
  const httpStatus = dbConnected ? 200 : 503
  res.status(httpStatus).json({
    status,
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// 404 catch-all — always returns JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method })
})

// Global error handler — always returns JSON, never HTML or empty
app.use((err, req, res, _next) => {
  const status = err.status || 500
  console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}:`, err.message || err)
  if (status >= 500) console.error(err.stack)
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    method: req.method,
  })
})

// Make io undefined-safe for routes that reference app.get('io')
app.set('io', undefined)

export default app

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
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import repoRoutes from './routes/repos.js'
import issueRoutes from './routes/issues.js'
import prRoutes from './routes/pullRequests.js'
import collaboratorRoutes from './routes/collaborators.js'
import adminRoutes from './routes/admin.js'
import gitRoutes from './routes/git.js'
import notificationRoutes from './routes/notifications.js'
import codexRoutes from './routes/codexes.js'
import mongoose from 'mongoose'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/repos', repoRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/pulls', prRoutes)
app.use('/api/collaborators', collaboratorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/codexes', codexRoutes)

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

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method })
})

// Global error handler
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

export default app

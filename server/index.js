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
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
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

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const PORT = parseInt(process.env.PORT, 10) || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Make io accessible to routes
app.set('io', io)

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

// Git Smart HTTP routes (must come after API routes, before health check)
// Match any URL containing .git/ and delegate to git handler
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

// 404 catch-all — must come AFTER all route registrations, BEFORE error handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  })
})

// Global error handler — last middleware, catches everything unhandled
app.use((err, req, res, _next) => {
  console.error('❌ Unhandled error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    method: req.method,
  })
})

// Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('join', (userId) => {
    socket.join(`user:${userId}`)
  })

  socket.on('xp_gain', (data) => {
    io.to(`user:${data.userId}`).emit('xp_update', data)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Start: connect to DB first, then start HTTP server
const start = async () => {
  // Fail-fast: if MongoDB is unavailable, process exits inside connectDB
  await connectDB()

  // Only start HTTP server after DB is connected
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
  })
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

start()

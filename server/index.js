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
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import repoRoutes from './routes/repos.js'
import issueRoutes from './routes/issues.js'
import prRoutes from './routes/pullRequests.js'
import collaboratorRoutes from './routes/collaborators.js'
import adminRoutes from './routes/admin.js'

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

const PORT = 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehalaam'

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'CODEHALAAM',
    version: '1.0.0',
    timestamp: Date.now(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

// Connect to MongoDB and start server
const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log(`[CODEHALAAM] MongoDB connected: ${MONGODB_URI}`)

    httpServer.listen(PORT, () => {
      console.log(`[CODEHALAAM] Server running on port ${PORT}`)
      console.log(`[CODEHALAAM] API: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error(`[CODEHALAAM] MongoDB connection failed: ${err.message}`)
    console.log('[CODEHALAAM] Starting without database...')

    httpServer.listen(PORT, () => {
      console.log(`[CODEHALAAM] Server running on port ${PORT} (no DB)`)
    })
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

start()

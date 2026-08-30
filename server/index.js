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

import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import app from './app.js'
import connectDB from './config/db.js'

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const PORT = parseInt(process.env.PORT, 10) || 5000

// Make io accessible to routes
app.set('io', io)

// Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('join', (userId) => { socket.join(`user:${userId}`) })
  socket.on('xp_gain', (data) => { io.to(`user:${data.userId}`).emit('xp_update', data) })
  socket.on('disconnect', () => { console.log(`Client disconnected: ${socket.id}`) })
})

// Start: connect to DB first, then start HTTP server
const start = async () => {
  await connectDB()
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
  })
}

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

start()

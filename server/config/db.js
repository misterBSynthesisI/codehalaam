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

import mongoose from 'mongoose'

let connecting = null

/**
 * Connect to MongoDB using the URI from environment variables.
 * Fail-fast: exits the process if connection fails.
 *
 * Used by the long-running local dev server (server/index.js).
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // --- Step 1: Validate environment ---
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in .env')
    console.error('   Copy .env.example to .env and set your MongoDB connection string.')
    process.exit(1)
  }

  // --- Step 2: Attempt connection ---
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })

    const dbName = conn.connection.db.databaseName
    console.log(`✅ MongoDB connected: ${dbName}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    console.error(`   URI: ${process.env.MONGODB_URI}`)
    console.error('   Ensure MongoDB is running and the URI is correct.')
    process.exit(1)
  }
}

/**
 * Ensure a Mongoose connection exists, connecting lazily if needed.
 *
 * Designed for serverless platforms (Vercel) where each request may run
 * in a fresh or reused invocation. Never calls process.exit — returns a
 * resolved/rejected promise instead so request handlers can surface errors.
 *
 * @returns {Promise<typeof mongoose>}
 */
export const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return mongoose

  // If a connection attempt is already in flight, await it rather than racing.
  if (connecting) return connecting

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  connecting = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      autoIndex: true,
    })
    .then((conn) => {
      console.log(`✅ MongoDB connected: ${conn.connection.db?.databaseName}`)
      connecting = null
      return mongoose
    })
    .catch((err) => {
      connecting = null
      // Provide a clear, actionable error so the Vercel logs tell you
      // exactly what to fix.
      let hint = ''
      if (err.name === 'MongoServerSelectionError') {
        hint = ' — Cannot reach MongoDB. Check: (1) MONGODB_URI is set in Vercel env vars, (2) your Atlas IP allowlist includes 0.0.0.0/0, (3) the password in the URI is correct.'
      } else if (err.name === 'MongoServerError' && err.code === 18) {
        hint = ' — Authentication failed. Check the username and password in your MONGODB_URI.'
      } else if (err.message?.includes('Invalid schema')) {
        hint = ' — The MONGODB_URI format is wrong. It should start with mongodb:// or mongodb+srv://'
      }
      console.error(`❌ MongoDB connection failed: ${err.message}${hint}`)
      throw new Error(`Database connection failed: ${err.message}${hint}`)
    })

  return connecting
}

export default connectDB

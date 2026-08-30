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

/**
 * Connect to MongoDB using the URI from environment variables.
 * Fail-fast: exits the process if connection fails.
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

export default connectDB

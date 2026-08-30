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
import dotenv from 'dotenv'
import User from '../models/User.js'
import Repository from '../models/Repository.js'
import Commit from '../models/Commit.js'
import Quest from '../models/Quest.js'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

async function initDB() {
  // --- Validate environment ---
  if (!MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in .env')
    console.error('   Copy .env.example to .env and set your MongoDB connection string.')
    process.exit(1)
  }

  // --- Connect ---
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    const dbName = conn.connection.db.databaseName
    console.log(`✅ Connected to database: ${dbName}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    console.error(`   URI: ${MONGODB_URI}`)
    process.exit(1)
  }

  // --- Log collection counts ---
  try {
    const [userCount, repoCount, commitCount, questCount] = await Promise.all([
      User.countDocuments(),
      Repository.countDocuments(),
      Commit.countDocuments(),
      Quest.countDocuments(),
    ])

    console.log('\n📊 Collection counts:')
    console.log(`   Users:       ${userCount}`)
    console.log(`   Repositories: ${repoCount}`)
    console.log(`   Commits:     ${commitCount}`)
    console.log(`   Quests:      ${questCount}`)

    // --- Create demo user if no users exist ---
    if (userCount === 0) {
      console.log('\n🔧 No users found. Creating demo user...')

      // Password is hashed automatically by the User model pre-save hook
      const demoUser = await User.create({
        username: 'demo',
        email: 'demo@codehalaam.local',
        password: '12345678',
        displayName: 'Demo User',
        bio: 'Demo account for CODEHALAAM',
        class: 'Mage',
        level: 1,
        xp: 0,
      })

      console.log(`   ✅ Demo user created: ${demoUser.username}`)
      console.log(`      Email:    demo@codehalaam.local`)
      console.log(`      Password: 12345678`)
      console.log(`      Class:    ${demoUser.class}`)
    } else {
      console.log('\nℹ️  Users already exist. Skipping demo user creation.')
    }

    console.log('\n✅ Database initialization complete.')
  } catch (err) {
    console.error(`❌ Initialization error: ${err.message}`)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Connection closed.')
    process.exit(0)
  }
}

initDB()

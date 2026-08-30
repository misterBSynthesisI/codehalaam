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

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import User from '../models/User.js'
import Repository from '../models/Repository.js'
import Notification from '../models/Notification.js'

async function seedNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('✅ Connected to database:', mongoose.connection.db.databaseName)

    const demoUser = await User.findOne({ username: 'demo' })
    if (!demoUser) {
      console.error('❌ Demo user not found. Run: npm run db:init')
      process.exit(1)
    }

    // Create a fake actor user
    let actor = await User.findOne({ username: 'neo-coder' })
    if (!actor) {
      actor = await User.create({
        username: 'neo-coder',
        email: 'neo@codehalaam.dev',
        password: 'password123',
        role: 'Mage',
      })
      console.log('🔧 Created actor user: neo-coder')
    }

    // Find or create a test repo
    let repo = await Repository.findOne({ owner: demoUser._id })
    if (!repo) {
      repo = await Repository.create({
        name: 'test-codex',
        description: 'A test codex for notifications',
        owner: demoUser._id,
        visibility: 'public',
      })
      console.log('🔧 Created test codex: test-codex')
    }

    // Create test notifications
    const notifications = [
      {
        recipient: demoUser._id,
        actor: actor._id,
        type: 'EMBER_RECEIVED',
        targetId: repo._id,
        targetModel: 'Codex',
      },
      {
        recipient: demoUser._id,
        actor: actor._id,
        type: 'OFFERING_MADE',
        targetId: repo._id,
        targetModel: 'Offering',
      },
      {
        recipient: demoUser._id,
        actor: actor._id,
        type: 'QUEST_COMPLETED',
        targetId: repo._id,
        targetModel: 'Quest',
      },
      {
        recipient: demoUser._id,
        actor: actor._id,
        type: 'ECHO_CREATED',
        targetId: repo._id,
        targetModel: 'Codex',
      },
    ]

    // Clear old test notifications first
    await Notification.deleteMany({ recipient: demoUser._id })

    await Notification.insertMany(notifications)
    console.log(`✅ Created ${notifications.length} test notifications for demo user`)
    console.log('   Check the 🔔 bell icon in the navbar')

    await mongoose.disconnect()
    console.log('✅ Done')
  } catch (err) {
    console.error('❌ Error:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedNotifications()

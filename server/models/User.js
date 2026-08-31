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
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 39,
    match: [/^[a-zA-Z0-9-]+$/, 'Username can only contain letters, numbers, and hyphens'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 80,
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  twitter: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverUrl: { type: String, default: null },

  // Gamification
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNext: { type: Number, default: 100 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },

  stats: {
    commits: { type: Number, default: 0 },
    pullRequests: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    issues: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
  },

  // Achievements
  achievements: [{
    id: String,
    name: String,
    unlockedAt: Date,
  }],

  // Contribution heatmap data (52 weeks x 7 days)
  contributionDays: [{
    date: Date,
    count: Number,
  }],

  // Settings
  emailNotifications: { type: Boolean, default: true },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'light' },

  // Admin & badges
  isAdmin: { type: Boolean, default: false },
  badgeColor: { type: String, enum: ['none', 'blue', 'black', 'red'], default: 'none' },
  characterClass: { type: String, enum: ['Mage', 'Tank', 'Rogue'], required: false },

  // Account status
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Indexes (username and email already indexed via unique: true on fields)
userSchema.index({ level: -1, xp: -1 })

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Award XP with level-up logic
userSchema.methods.awardXP = async function (amount, reason) {
  this.xp += amount
  this.stats.contributions += 1

  // Level up check
  while (this.xp >= this.xpToNext) {
    this.xp -= this.xpToNext
    this.level += 1
    this.xpToNext = Math.floor(this.xpToNext * 1.5)
  }

  // Update streak
  const today = new Date().toDateString()
  const lastActive = this.lastActiveDate?.toDateString()

  if (lastActive !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastActive === yesterday.toDateString()) {
      this.streak += 1
    } else {
      this.streak = 1
    }

    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak
    }

    this.lastActiveDate = new Date()
  }

  await this.save()

  return { level: this.level, xp: this.xp, xpToNext: this.xpToNext, levelUp: true }
}

// Remove sensitive data from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)
export default User

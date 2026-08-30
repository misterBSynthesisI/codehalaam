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

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder'], required: true },
  content: { type: String, default: '' },
  size: { type: String, default: '' },
  language: { type: String, default: '' },
  sha: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  children: [{ type: mongoose.Schema.Types.Mixed }],
  lastCommitMessage: { type: String, default: '' },
  lastCommitDate: { type: Date, default: Date.now },
}, { _id: false })

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  lastCommit: {
    message: String,
    author: String,
    date: Date,
    sha: String,
  },
  ahead: { type: Number, default: 0 },
  behind: { type: Number, default: 0 },
}, { _id: false })

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]+$/, 'Repository name can only contain letters, numbers, dots, hyphens, and underscores'],
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    maxlength: 350,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  homepage: { type: String, default: '' },

  // Language stats
  language: { type: String, default: '' },
  languages: [{
    name: String,
    percentage: Number,
    color: String,
  }],

  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },

  // Features
  hasIssues: { type: Boolean, default: true },
  hasWiki: { type: Boolean, default: false },
  hasPages: { type: Boolean, default: false },
  defaultBranch: { type: String, default: 'main' },

  // Git data
  branches: [branchSchema],
  fileTree: [fileSchema],
  defaultReadme: { type: String, default: '' },

  // Stats
  starsCount: { type: Number, default: 0 },
  forksCount: { type: Number, default: 0 },
  openIssuesCount: { type: Number, default: 0 },
  openPullRequestsCount: { type: Number, default: 0 },

  // Barry fields
  nextQuestNumber: { type: Number, default: 1 },
  nextOfferingNumber: { type: Number, default: 1 },

  // Stargazers, watchers, embers, echoes
  stargazers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  embers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  echoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Topics/tags
  topics: [String],

  // License
  license: { type: String, default: '' },

  // XP reward for contributing
  xpReward: { type: Number, default: 10 },

  // Archived
  archived: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes
repositorySchema.index({ owner: 1, name: 1 }, { unique: true })
repositorySchema.index({ slug: 1 })
repositorySchema.index({ visibility: 1, starsCount: -1 })
repositorySchema.index({ owner: 1, updatedAt: -1 })

// Pre-save: generate slug
repositorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = `${this.owner.toString()}-${this.name}`.toLowerCase()
  }
  next()
})

// Virtual for full path
repositorySchema.virtual('fullName').get(function () {
  return `${this.owner}/${this.name}`
})

const Repository = mongoose.model('Repository', repositorySchema)
export default Repository

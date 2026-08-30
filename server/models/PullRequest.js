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

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  state: {
    type: String,
    enum: ['approved', 'changes_requested', 'commented', 'pending'],
    required: true,
  },
  body: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
}, { _id: true })

const diffSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  status: { type: String, enum: ['added', 'removed', 'modified', 'renamed'], required: true },
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
  patch: { type: String, default: '' },
}, { _id: false })

const prSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true, maxlength: 256 },
  body: { type: String, default: '' },
  state: { type: String, enum: ['open', 'closed', 'merged'], default: 'open' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },

  // Branches
  base: { type: String, required: true, default: 'main' },
  head: { type: String, required: true },

  // Labels
  labels: [{
    name: String,
    color: String,
  }],

  // Assignees
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Reviewers
  requestedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviews: [reviewSchema],

  // Merge status
  mergeable: { type: Boolean, default: true },
  merged: { type: Boolean, default: false },
  mergedAt: Date,
  mergedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mergeCommitSha: String,

  // Stats
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
  changedFiles: { type: Number, default: 0 },

  // Diffs
  diffs: [diffSchema],

  // Comments
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: String,
    path: String,
    line: Number,
    createdAt: { type: Date, default: Date.now },
  }],
  commentsCount: { type: Number, default: 0 },

  // Review comments
  reviewComments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: String,
    path: String,
    line: Number,
    diffHunk: String,
    createdAt: { type: Date, default: Date.now },
  }],

  // Closing issues
  closesIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],

  // Timestamps
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Indexes
prSchema.index({ repository: 1, number: 1 }, { unique: true })
prSchema.index({ repository: 1, state: 1 })
prSchema.index({ author: 1 })
prSchema.index({ requestedReviewers: 1 })
prSchema.index({ createdAt: -1 })

const PullRequest = mongoose.model('PullRequest', prSchema)
export default PullRequest

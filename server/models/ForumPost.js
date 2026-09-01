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

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 300,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 10000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30,
  }],
  // Vote system
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  score: {
    type: Number,
    default: 0,
  },
  // Answer system
  answers: [{
    body: { type: String, required: true, maxlength: 10000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  views: {
    type: Number,
    default: 0,
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  // Status
  isPinned: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes
forumPostSchema.index({ score: -1, createdAt: -1 })
forumPostSchema.index({ tags: 1 })
forumPostSchema.index({ title: 'text', body: 'text' })

// Pre-save: recompute score
forumPostSchema.pre('save', function (next) {
  this.score = this.upvotes.length - this.downvotes.length
  this.isAnswered = this.answers.some(a => a.isAccepted)
  next()
})

const ForumPost = mongoose.model('ForumPost', forumPostSchema)
export default ForumPost

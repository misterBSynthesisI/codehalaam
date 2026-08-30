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
import crypto from 'crypto'

const invitationSchema = new mongoose.Schema({
  codex: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Write', 'Read'],
    default: 'Write',
  },
  token: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Revoked', 'Expired'],
    default: 'Pending',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
}, { timestamps: true })

// Pre-save: generate secure token if not set
invitationSchema.pre('save', function (next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString('hex')
  }
  next()
})

// Indexes
invitationSchema.index({ codex: 1, email: 1 })
invitationSchema.index({ token: 1 }, { unique: true })
invitationSchema.index({ codex: 1, status: 1 })

const Invitation = mongoose.model('Invitation', invitationSchema)
export default Invitation

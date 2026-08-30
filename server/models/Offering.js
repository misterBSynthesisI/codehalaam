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

const offeringSchema = new mongoose.Schema({
  codex: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 256,
  },
  body: {
    type: String,
    default: '',
  },
  sourcePath: {
    type: String,
    required: true,
  },
  targetPath: {
    type: String,
    required: true,
    default: 'main',
  },
  status: {
    type: String,
    enum: ['Open', 'Bound', 'Closed'],
    default: 'Open',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  boundAt: Date,
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Indexes
offeringSchema.index({ codex: 1, number: 1 }, { unique: true })
offeringSchema.index({ codex: 1, status: 1 })
offeringSchema.index({ codex: 1, createdAt: -1 })
offeringSchema.index({ author: 1 })

const Offering = mongoose.model('Offering', offeringSchema)
export default Offering

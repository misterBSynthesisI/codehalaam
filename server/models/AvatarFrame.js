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

const avatarFrameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  // CSS border/image properties
  borderStyle: {
    type: String,
    enum: ['solid', 'dashed', 'dotted', 'double', 'gradient', 'glow', 'flame', 'electric', 'crystal', 'none'],
    default: 'solid',
  },
  borderColor: {
    type: String,
    default: '#58a6ff',
  },
  borderWidth: {
    type: Number,
    default: 3,
  },
  // For gradient/glow styles
  gradientColors: [{
    type: String,
  }],
  // SVG overlay (for special frames like flames, crystals)
  overlaySvg: {
    type: String,
    default: '',
  },
  // Requirements to unlock
  requiredLevel: {
    type: Number,
    default: 0,
  },
  requiredAchievement: {
    type: String,
    default: '',
  },
  // Rarity
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common',
  },
  // Whether this frame is available to all users or admin-only
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

const AvatarFrame = mongoose.model('AvatarFrame', avatarFrameSchema)
export default AvatarFrame

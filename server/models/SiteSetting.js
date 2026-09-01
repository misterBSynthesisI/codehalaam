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
 * Site settings — a singleton document that holds platform-wide
 * branding and configuration. There should be exactly one document
 * in this collection; the frontend reads it on load to set the
 * favicon, logo, and site name dynamically.
 */
const siteSettingSchema = new mongoose.Schema({
  // Singleton key — always 'default'
  key: {
    type: String,
    default: 'default',
    unique: true,
  },
  siteName: {
    type: String,
    default: 'CODEHALAAM',
    maxlength: 100,
  },
  tagline: {
    type: String,
    default: 'The gamified code hosting platform',
    maxlength: 200,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  faviconUrl: {
    type: String,
    default: '',
  },
  // Social/meta
  ogImageUrl: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: 'CODEHALAAM is a gamified code hosting platform. Free private repos, unlimited collaborators, and XP rewards.',
    maxlength: 500,
  },
  // Footer
  footerText: {
    type: String,
    default: 'Built with ❤️ by the CODEHALAAM community',
    maxlength: 200,
  },
  // Feature flags
  signupEnabled: {
    type: Boolean,
    default: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true })

// Ensure only one document exists (upsert — safe for concurrent cold starts)
siteSettingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ key: 'default' })
  if (!settings) {
    // Use upsert to avoid E11000 duplicate key on concurrent requests
    settings = await this.findOneAndUpdate(
      { key: 'default' },
      { $setOnInsert: { key: 'default' } },
      { upsert: true, new: true, runValidators: true }
    )
  }
  return settings
}

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema)
export default SiteSetting

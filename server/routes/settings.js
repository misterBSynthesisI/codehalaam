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

import express from 'express'
import SiteSetting from '../models/SiteSetting.js'
import { protect, requireAdmin } from '../middleware/auth.js'
import { uploadAvatar, resolveUploadUrl } from '../services/uploadService.js'

const router = express.Router()

/**
 * GET /api/settings — Public endpoint.
 * Returns the site settings (logo, favicon, site name, etc.)
 * so the frontend can apply branding on load.
 */
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSetting.getSingleton()
    res.json({ settings })
  } catch (err) {
    console.error('Get settings error:', err)
    res.status(500).json({ error: 'Failed to fetch site settings' })
  }
})

// All subsequent routes require admin
router.use(protect, requireAdmin)

/**
 * PUT /api/settings — Update site branding (admin only)
 */
router.put('/', async (req, res) => {
  try {
    const settings = await SiteSetting.getSingleton()
    const { siteName, tagline, logoUrl, faviconUrl, ogImageUrl, description, footerText, signupEnabled, maintenanceMode } = req.body

    if (siteName !== undefined) settings.siteName = siteName
    if (tagline !== undefined) settings.tagline = tagline
    if (logoUrl !== undefined) settings.logoUrl = logoUrl
    if (faviconUrl !== undefined) settings.faviconUrl = faviconUrl
    if (ogImageUrl !== undefined) settings.ogImageUrl = ogImageUrl
    if (description !== undefined) settings.description = description
    if (footerText !== undefined) settings.footerText = footerText
    if (signupEnabled !== undefined) settings.signupEnabled = signupEnabled
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode

    settings.updatedAt = new Date()
    await settings.save()

    res.json({ settings })
  } catch (err) {
    console.error('Update settings error:', err)
    res.status(500).json({ error: 'Failed to update site settings' })
  }
})

/**
 * POST /api/settings/logo — Upload logo image (admin only)
 */
router.post('/logo', uploadAvatar.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const logoUrl = await resolveUploadUrl(req.file, 'site', `/uploads/site/${req.file.filename}`)
    const settings = await SiteSetting.getSingleton()
    settings.logoUrl = logoUrl
    settings.updatedAt = new Date()
    await settings.save()

    res.json({ logoUrl, settings })
  } catch (err) {
    console.error('Logo upload error:', err)
    res.status(500).json({ error: 'Failed to upload logo' })
  }
})

/**
 * POST /api/settings/favicon — Upload favicon (admin only)
 */
router.post('/favicon', uploadAvatar.single('favicon'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const faviconUrl = await resolveUploadUrl(req.file, 'site', `/uploads/site/${req.file.filename}`)
    const settings = await SiteSetting.getSingleton()
    settings.faviconUrl = faviconUrl
    settings.updatedAt = new Date()
    await settings.save()

    res.json({ faviconUrl, settings })
  } catch (err) {
    console.error('Favicon upload error:', err)
    res.status(500).json({ error: 'Failed to upload favicon' })
  }
})

export default router

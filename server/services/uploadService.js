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

import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure upload directories exist
const uploadsBase = path.resolve(__dirname, '../uploads')
const avatarDir = path.join(uploadsBase, 'avatars')
const codexDir = path.join(uploadsBase, 'codexes')
fs.mkdirSync(avatarDir, { recursive: true })
fs.mkdirSync(codexDir, { recursive: true })

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

function sanitizeFilename(filename) {
  const ext = path.extname(filename).toLowerCase()
  const base = crypto.randomBytes(8).toString('hex')
  return `${Date.now()}-${base}${ext}`
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WebP, GIF, and SVG images are allowed'))
  }
  cb(null, true)
}

// Codex cover/logo uploads
const codexStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, codexDir),
  filename: (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
})

export const uploadCodexMedia = multer({
  storage: codexStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// User avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
})

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})

export default { uploadCodexMedia, uploadAvatar }

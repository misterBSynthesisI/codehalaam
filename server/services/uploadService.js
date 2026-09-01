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

// ─── Upload limits ───────────────────────────────────────────────────────
// 30 MB per file. Generous enough for project bundles, agent configs,
// and media — well within Vercel Blob's free-tier per-upload limit (5 GB).
export const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30 MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB (avatars stay small)
export const MAX_CODEX_MEDIA_SIZE = 5 * 1024 * 1024 // 5 MB (covers/logos)

// ─── Allowed file types ──────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

// For project file uploads we accept a broad set of archive + code file types.
const ALLOWED_PROJECT_EXTS = [
  '.zip', '.tar', '.gz', '.tgz', '.bz2', '.7z', '.rar',
  '.json', '.yaml', '.yml', '.xml', '.csv', '.txt', '.md',
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.rs',
  '.java', '.kt', '.swift', '.c', '.cpp', '.h', '.hpp', '.cs',
  '.php', '.rb', '.sh', '.bat', '.ps1',
  '.env', '.gitignore', '.dockerignore',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.pdf', '.doc', '.docx',
]

function hasAllowedExt(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  return ALLOWED_PROJECT_EXTS.includes(ext)
}

function imageFileFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WebP, GIF, and SVG images are allowed'))
  }
  cb(null, true)
}

function projectFileFilter(req, file, cb) {
  // Accept images by mimetype OR files with a known extension.
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true)
  if (hasAllowedExt(file.originalname)) return cb(null, true)
  // Archives often have application/octet-stream mimetype — accept by extension.
  if (file.mimetype === 'application/octet-stream' && hasAllowedExt(file.originalname)) {
    return cb(null, true)
  }
  cb(new Error(`File type not allowed: ${file.originalname}`))
}

function sanitizeFilename(filename) {
  const ext = path.extname(filename).toLowerCase()
  const base = crypto.randomBytes(8).toString('hex')
  return `${Date.now()}-${base}${ext}`
}

// ─── Vercel Blob (production) vs disk (local dev) ───────────────────────
//
// On Vercel, BLOB_READ_WRITE_TOKEN must be set in the environment. When it
// is, uploads go to Vercel Blob (persistent, served from the CDN). When it
// is NOT set (local dev), we fall back to disk storage under server/uploads.
//
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN

let blob = null
if (USE_BLOB) {
  try {
    blob = (await import('@vercel/blob')).put
  } catch {
    console.warn('⚠️  @vercel/blob not installed but BLOB_READ_WRITE_TOKEN is set. Falling back to disk.')
  }
}

// Ensure local upload directories exist (used in dev fallback + avatars)
const uploadsBase = path.resolve(__dirname, '../uploads')
const avatarDir = path.join(uploadsBase, 'avatars')
const codexDir = path.join(uploadsBase, 'codexes')
const projectsDir = path.join(uploadsBase, 'projects')
fs.mkdirSync(avatarDir, { recursive: true })
fs.mkdirSync(codexDir, { recursive: true })
fs.mkdirSync(projectsDir, { recursive: true })

// ─── Memory storage for Blob uploads; disk for local dev ────────────────
// Memory storage is used when Blob is active so we can stream the buffer
// to Vercel Blob. Disk storage is used in local dev so files persist.
const avatarStorage = USE_BLOB
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, avatarDir),
      filename: (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
    })

const codexStorage = USE_BLOB
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, codexDir),
      filename: (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
    })

const projectStorage = USE_BLOB
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, projectsDir),
      filename: (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
    })

// ─── Multer instances ────────────────────────────────────────────────────
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_AVATAR_SIZE },
})

export const uploadCodexMedia = multer({
  storage: codexStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_CODEX_MEDIA_SIZE },
})

export const uploadProjectFile = multer({
  storage: projectStorage,
  fileFilter: projectFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})

// ─── Blob upload helper ──────────────────────────────────────────────────
/**
 * Upload a multer file to Vercel Blob and return the public URL.
 * @param {import('multer').File} file
 * @param {string} folder - e.g. 'avatars', 'codexes', 'projects'
 * @returns {Promise<string>} public URL
 */
export async function uploadToBlob(file, folder = 'uploads') {
  if (!blob) throw new Error('Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN missing)')
  if (!file.buffer) throw new Error('File buffer is empty — memory storage required for Blob uploads')

  const ext = path.extname(file.originalname).toLowerCase()
  const pathname = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`

  const result = await blob(pathname, file.buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: file.mimetype || 'application/octet-stream',
  })

  return result.url
}

/**
 * Resolve the final public URL for an uploaded file.
 * - If Vercel Blob is active, upload the buffer and return the Blob URL.
 * - If using disk storage (local dev), return the local /uploads/... path.
 *
 * @param {import('multer').File} file
 * @param {string} folder
 * @param {string} [diskPathFallback] - the /uploads/... path when on disk
 * @returns {Promise<string>}
 */
export async function resolveUploadUrl(file, folder, diskPathFallback) {
  if (USE_BLOB && file.buffer) {
    return uploadToBlob(file, folder)
  }
  // Disk fallback (local dev): req.file.filename is set by diskStorage
  return diskPathFallback || `/uploads/${folder}/${file.filename}`
}

export default { uploadCodexMedia, uploadAvatar, uploadProjectFile, uploadToBlob, resolveUploadUrl, MAX_FILE_SIZE }

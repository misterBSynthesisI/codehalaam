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

import simpleGit from 'simple-git'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Storage root for bare repos
const CODEx_STORAGE = path.resolve(__dirname, '../../codex_storage')

/**
 * Git Service — manages bare Git repositories on disk.
 * Uses simple-git for all operations.
 * 
 * SECURITY:
 *   - Branch names and file paths are sanitized.
 *   - Path traversal is prevented.
 *   - .git internals are never exposed.
 */

// --- Helpers ---

function getRepoPath(owner, name) {
  return path.join(CODEx_STORAGE, owner, name)
}

function sanitizeBranchName(name) {
  // Only allow alphanumeric, hyphens, underscores, slashes, dots
  return name.replace(/[^a-zA-Z0-9._/\-]/g, '').substring(0, 255)
}

function sanitizeFilePath(filePath) {
  // Prevent path traversal
  const cleaned = filePath.replace(/\.\./g, '').replace(/^\/+/, '')
  if (cleaned.includes('..')) throw new Error('Invalid file path')
  return cleaned
}

function getGit(owner, name) {
  const repoPath = getRepoPath(owner, name)
  if (!fs.existsSync(repoPath)) {
    throw new Error('Repository not found on disk')
  }
  return simpleGit(repoPath)
}

function ensureStorageDir(owner) {
  const dir = path.join(CODEx_STORAGE, owner)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// --- Public API ---

/**
 * Initialize a new bare repository.
 */
export async function initRepo(owner, name) {
  const ownerDir = ensureStorageDir(owner)
  const repoPath = path.join(ownerDir, name)
  
  if (fs.existsSync(repoPath)) return repoPath
  
  await simpleGit().init(true, repoPath) // bare repo
  return repoPath
}

/**
 * Check if a bare repo exists on disk.
 */
export function repoExists(owner, name) {
  const repoPath = getRepoPath(owner, name)
  return fs.existsSync(repoPath)
}

/**
 * Get the default branch name from HEAD.
 */
export async function getDefaultBranch(owner, name) {
  try {
    const git = getGit(owner, name)
    const result = await git.raw(['symbolic-ref', 'HEAD'])
    return result.trim().replace('refs/heads/', '')
  } catch {
    return 'main'
  }
}

/**
 * List all branches.
 */
export async function listBranches(owner, name) {
  try {
    const git = getGit(owner, name)
    const result = await git.branchLocal()
    return result.all || ['main']
  } catch {
    return ['main']
  }
}

/**
 * Create a new branch from a source branch.
 */
export async function createBranch(owner, name, branchName, sourceBranch = 'main') {
  const safe = sanitizeBranchName(branchName)
  const safeSource = sanitizeBranchName(sourceBranch)
  const git = getGit(owner, name)
  
  // For bare repos, we use symbolic-ref to create refs
  await git.raw(['update-ref', `refs/heads/${safe}`, `refs/heads/${safeSource}`])
  return safe
}

/**
 * Get file tree for a branch.
 */
export async function getFileTree(owner, name, branch = 'main') {
  const safe = sanitizeBranchName(branch)
  const git = getGit(owner, name)
  
  try {
    const result = await git.raw(['ls-tree', '-r', '--name-only', safe])
    return result.split('\n').filter(Boolean).map(filePath => ({
      name: filePath.split('/').pop(),
      path: filePath,
      type: 'file',
    }))
  } catch {
    return []
  }
}

/**
 * Get file contents for a branch/path.
 */
export async function getFileContent(owner, name, branch, filePath) {
  const safe = sanitizeBranchName(branch)
  const safePath = sanitizeFilePath(filePath)
  const git = getGit(owner, name)
  
  try {
    const content = await git.raw(['show', `${safe}:${safePath}`])
    return { content, path: safePath, found: true }
  } catch {
    return { content: null, path: safePath, found: false }
  }
}

/**
 * Get README from default branch.
 */
export async function getReadme(owner, name) {
  const defaultBranch = await getDefaultBranch(owner, name)
  
  // Try common README filenames
  const candidates = ['README.md', 'readme.md', 'README.rst', 'README']
  
  for (const candidate of candidates) {
    const result = await getFileContent(owner, name, defaultBranch, candidate)
    if (result.found) {
      return { content: result.content, filename: candidate }
    }
  }
  
  return { content: null, filename: null }
}

/**
 * Create an annotated tag for a release.
 */
export async function createTag(owner, name, tagName, message) {
  const git = getGit(owner, name)
  
  try {
    await git.raw(['tag', '-a', tagName, '-m', message || `Release ${tagName}`])
    return { success: true, tagName }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Get changed files between two branches (best effort).
 */
export async function getChangedFiles(owner, name, baseBranch, headBranch) {
  const safeBase = sanitizeBranchName(baseBranch)
  const safeHead = sanitizeBranchName(headBranch)
  const git = getGit(owner, name)
  
  try {
    const result = await git.raw(['diff', '--name-status', `${safeBase}...${safeHead}`])
    const files = result.split('\n').filter(Boolean).map(line => {
      const [status, ...fileParts] = line.split('\t')
      return { status: status.trim(), path: fileParts.join('\t') }
    })
    return files
  } catch {
    return []
  }
}

/**
 * Attempt to merge/bind source branch into target branch.
 * Returns success/failure with details.
 */
export async function bindBranch(owner, name, sourceBranch, targetBranch) {
  const safeSource = sanitizeBranchName(sourceBranch)
  const safeTarget = sanitizeBranchName(targetBranch)
  const git = getGit(owner, name)
  
  try {
    // For bare repos, we use update-ref to fast-forward merge
    // This is a simplified merge strategy
    const sourceRef = `refs/heads/${safeSource}`
    const targetRef = `refs/heads/${safeTarget}`
    
    // Get commits from source that aren't in target
    let ahead
    try {
      ahead = await git.raw(['rev-list', `${safeTarget}..${safeSource}`])
    } catch {
      // Target ref might not exist, treat as no commits
      ahead = ''
    }
    
    if (!ahead.trim()) {
      return { success: false, reason: 'Source is already up to date with target' }
    }
    
    // Fast-forward: point target to source HEAD
    const sourceHead = await git.raw(['rev-parse', sourceRef])
    await git.raw(['update-ref', targetRef, sourceHead.trim()])
    
    return { success: true }
  } catch (err) {
    return { success: false, reason: err.message }
  }
}

export default {
  initRepo,
  repoExists,
  getDefaultBranch,
  listBranches,
  createBranch,
  getFileTree,
  getFileContent,
  getReadme,
  createTag,
  getChangedFiles,
  bindBranch,
}

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
import User from '../models/User.js'
import Repository from '../models/Repository.js'

const router = express.Router()

/**
 * Git Smart HTTP Protocol Handler
 *
 * URL pattern: /:owner/:repo.git/*
 * Regex captures: [0]=owner, [1]=repo, [2]=subpath
 *
 * Supported endpoints:
 *   GET  info/refs?service=git-upload-pack   (discovery for clone/pull)
 *   POST git-upload-pack                     (clone/pull data)
 *   GET  info/refs?service=git-receive-pack  (discovery for push)
 *   POST git-receive-pack                    (push data)
 *   GET  HEAD                                (head reference)
 */

// --- Basic Auth middleware for Git Smart HTTP ---
async function gitAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="CODEHALAAM"')
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString()
    const [username, token] = decoded.split(':')

    if (!username || !token) {
      res.setHeader('WWW-Authenticate', 'Basic realm="CODEHALAAM"')
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Look up user by username
    const user = await User.findOne({ username }).select('+password')
    if (!user) {
      res.setHeader('WWW-Authenticate', 'Basic realm="CODEHALAAM"')
      return res.status(401).json({ error: 'User not found' })
    }

    // Verify the token/password using bcrypt
    const bcrypt = await import('bcryptjs')
    const isMatch = await bcrypt.default.compare(token, user.password)
    if (!isMatch) {
      res.setHeader('WWW-Authenticate', 'Basic realm="CODEHALAAM"')
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    req.gitUser = user
    next()
  } catch (err) {
    console.error('[GIT] Auth error:', err.message)
    res.setHeader('WWW-Authenticate', 'Basic realm="CODEHALAAM"')
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

// --- Verify repository exists middleware ---
async function verifyRepo(req, res, next) {
  // Regex captures: [0]=owner, [1]=repo, [2]=subpath
  const owner = req.params[0]
  const repo = req.params[1]
  const subpath = req.params[2] || ''

  req.gitOwner = owner
  req.gitRepo = repo
  req.gitSubpath = subpath

  const ownerUser = await User.findOne({ username: owner })
  if (!ownerUser) {
    return res.status(404).json({ error: 'Repository not found' })
  }

  const repoDoc = await Repository.findOne({ owner: ownerUser._id, name: repo })
  if (!repoDoc) {
    return res.status(404).json({ error: 'Repository not found' })
  }

  req.gitOwnerUser = ownerUser
  req.gitRepoDoc = repoDoc
  next()
}

// --- Main Git Smart HTTP handler ---
router.all(/^([^/]+)\/([^/]+)\.git\/(.*)$/, gitAuth, verifyRepo, async (req, res) => {
  const { gitOwner: owner, gitRepo: repo, gitSubpath: subpath, gitUser: user } = req

  // Parse the subpath to determine the endpoint
  const url = new URL(req.originalUrl, `http://${req.headers.host}`)
  const service = url.searchParams.get('service')

  // --- GET info/refs (service discovery) ---
  if (req.method === 'GET' && subpath === 'info/refs' && service) {
    if (service !== 'git-upload-pack' && service !== 'git-receive-pack') {
      return res.status(400).json({ error: 'Invalid service' })
    }

    // Check push permission
    if (service === 'git-receive-pack') {
      if (req.gitOwnerUser._id.toString() !== user._id.toString()) {
        // TODO: Check collaborator write access
        return res.status(403).json({ error: 'Permission denied' })
      }
    }

    console.log(`[GIT] ${service} discovery for ${owner}/${repo} by ${user.username}`)

    // Set Smart HTTP discovery response headers
    res.setHeader('Content-Type', `application/x-${service}-advertisement`)
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Cache-Control', 'no-cache')

    // TODO: Pipe request to native git binary or node-git-server library
    // For now, return pkt-line service announcement + flush
    const serviceLine = `# service=${service}\n`
    const serviceLinePkt = `${(serviceLine.length + 4).toString(16).padStart(4, '0')}${serviceLine}`
    return res.send(serviceLinePkt + '0000' + '0000')
  }

  // --- POST git-upload-pack (clone/pull) ---
  if (req.method === 'POST' && subpath === 'git-upload-pack') {
    console.log(`[GIT] git-upload-pack POST for ${owner}/${repo} by ${user.username}`)

    res.setHeader('Content-Type', 'application/x-git-upload-pack-result')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Cache-Control', 'no-cache')

    // TODO: Pipe request to native git binary or node-git-server library
    // The request body contains the client's want/have list in pkt-line format
    return res.send('0000')
  }

  // --- POST git-receive-pack (push) ---
  if (req.method === 'POST' && subpath === 'git-receive-pack') {
    // Verify push permission
    if (req.gitOwnerUser._id.toString() !== user._id.toString()) {
      // TODO: Check collaborator write access
      return res.status(403).json({ error: 'Permission denied' })
    }

    console.log(`[GIT] git-receive-pack POST for ${owner}/${repo} by ${user.username}`)

    res.setHeader('Content-Type', 'application/x-git-receive-pack-result')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Cache-Control', 'no-cache')

    // TODO: Pipe request to native git binary or node-git-server library
    // The request body contains update commands + packfile data
    // After processing, award XP for the push
    return res.send('0000')
  }

  // --- GET HEAD ---
  if (req.method === 'GET' && subpath === 'HEAD') {
    const defaultBranch = req.gitRepoDoc.defaultBranch || 'main'
    res.setHeader('Content-Type', 'text/plain')
    return res.send(`ref: refs/heads/${defaultBranch}\n`)
  }

  // --- Fallback: unknown subpath ---
  return res.status(404).json({ error: 'Not found' })
})

export default router

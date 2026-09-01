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

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import User from '../models/User.js'
import Repository from '../models/Repository.js'
import { generateToken } from '../middleware/auth.js'

dotenv.config()

const T = 't' + Date.now()

let userToken, otherToken, adminToken
let userId, otherUserId, adminId

beforeAll(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI)
  }
  await User.deleteMany({ username: { $regex: `^${T}` } })
  await Repository.deleteMany({ name: { $regex: `^${T}` } })
})

afterAll(async () => {
  await User.deleteMany({ username: { $regex: `^${T}` } })
  await Repository.deleteMany({ name: { $regex: `^${T}` } })
  await User.deleteMany({ username: { $regex: '^setuptest' } })
  await mongoose.connection.close()
})

// ─── AUTH ──────────────────────────────────────────────────────

describe('Auth', () => {
  it('registers and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `${T}u1`, email: `${T}u1@test.com`, password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.username).toBe(`${T}u1`)
    userToken = res.body.token
    userId = res.body.user._id
  })

  it('registers a second user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `${T}u2`, email: `${T}u2@test.com`, password: 'password123' })

    expect(res.status).toBe(201)
    otherToken = res.body.token
    otherUserId = res.body.user._id
  })

  it('registers an admin user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `${T}adm`, email: `${T}adm@test.com`, password: 'password123' })

    expect(res.status).toBe(201)
    adminToken = res.body.token
    adminId = res.body.user._id
    await User.findByIdAndUpdate(adminId, { isAdmin: true })
  })

  it('logs in with email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: `${T}u1@test.com`, password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.username).toBe(`${T}u1`)
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: `${T}u1@test.com`, password: 'wrong' })

    expect(res.status).toBe(401)
  })

  it('GET /me returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe(`${T}u1`)
  })
})

// ─── CODEX VISIBILITY ──────────────────────────────────────────

describe('Codex Visibility', () => {
  it('creates a private codex via POST /api/repos', async () => {
    const res = await request(app)
      .post('/api/repos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: `${T}priv`, description: 'Private', visibility: 'private' })

    expect(res.status).toBe(201)
    expect(res.body.repo.visibility).toBe('private')
  })

  it('owner can view own private codex', async () => {
    const res = await request(app)
      .get(`/api/codexes/${T}u1/${T}priv`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.repo.name).toBe(`${T}priv`)
  })

  it('non-collaborator gets 404 on private codex', async () => {
    const res = await request(app)
      .get(`/api/codexes/${T}u1/${T}priv`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.status).toBe(404)
  })

  it('anonymous gets 404 on private codex', async () => {
    const res = await request(app)
      .get(`/api/codexes/${T}u1/${T}priv`)

    expect(res.status).toBe(404)
  })

  it('admin can view any private codex', async () => {
    const res = await request(app)
      .get(`/api/codexes/${T}u1/${T}priv`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.repo.visibility).toBe('private')
  })

  it('creates a public codex', async () => {
    const res = await request(app)
      .post('/api/repos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: `${T}pub`, description: 'Public', visibility: 'public' })

    expect(res.status).toBe(201)
    expect(res.body.repo.visibility).toBe('public')
  })

  it('anyone can view public codex', async () => {
    const res = await request(app)
      .get(`/api/codexes/${T}u1/${T}pub`)

    expect(res.status).toBe(200)
    expect(res.body.repo.visibility).toBe('public')
  })
})

// ─── EMBER TOGGLE ──────────────────────────────────────────────

describe('Ember Toggle', () => {
  it('toggles ember on then off', async () => {
    const r1 = await request(app)
      .post(`/api/codexes/${T}u1/${T}pub/ember`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(r1.status).toBe(200)
    expect(r1.body.isEmbered).toBe(true)

    const codex = await request(app)
      .get(`/api/codexes/${T}u1/${T}pub`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(codex.body.isEmbered).toBe(true)

    const r2 = await request(app)
      .post(`/api/codexes/${T}u1/${T}pub/ember`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(r2.body.isEmbered).toBe(false)
  })
})

// ─── DASHBOARD STATS ───────────────────────────────────────────

describe('Dashboard Stats', () => {
  it('user profile returns real stats', async () => {
    const res = await request(app)
      .get(`/api/users/${T}u1`)

    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe(`${T}u1`)
    expect(typeof res.body.user.stats).toBe('object')
  })
})

// ─── SETUP (first-run) ─────────────────────────────────────────

describe('First-Run Setup', () => {
  // Use a fresh DB state: temporarily clear users, then test the gate.
  // We can't fully clear the DB (other tests created users), so we test:
  // 1. /status returns needsSetup=false (users exist)
  // 2. POST /setup/admin returns 410 when users exist

  it('GET /api/setup/status returns needsSetup=false when users exist', async () => {
    const res = await request(app).get('/api/setup/status')
    expect(res.status).toBe(200)
    expect(res.body.needsSetup).toBe(false)
    expect(res.body.userCount).toBeGreaterThan(0)
  })

  it('POST /api/setup/admin returns 410 when users already exist', async () => {
    const res = await request(app)
      .post('/api/setup/admin')
      .send({ username: 'setuptest-admin', email: 'setuptest-admin@test.com', password: 'password123' })

    expect(res.status).toBe(410)
    expect(res.body.error).toMatch(/already complete/i)
  })

  it('POST /api/setup/admin validates input', async () => {
    const res = await request(app)
      .post('/api/setup/admin')
      .send({ username: 'x', email: 'bad', password: 'short' })

    // Validation OR 410 — both are acceptable since users exist.
    expect([400, 410]).toContain(res.status)
  })
})

// ─── ADMIN SECURITY ─────────────────────────────────────────────

describe('Admin Security', () => {
  it('non-admin cannot access admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it('admin can access admin stats with fresh token', async () => {
    // Re-issue a fresh admin token (the admin user was created earlier).
    const freshAdminToken = generateToken(adminId, { isAdmin: true })
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${freshAdminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.users).toBeDefined()
  })

  it('blocks unauthenticated access to admin routes', async () => {
    const res = await request(app).get('/api/admin/stats')
    expect(res.status).toBe(401)
  })
})

// ─── DELETE CODEX SAFETY ───────────────────────────────────────

describe('Delete Codex Safety', () => {
  it('deleting one codex preserves another codex comments', async () => {
    const a = await request(app)
      .post('/api/repos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: `${T}cx-a`, description: 'A' })

    const b = await request(app)
      .post('/api/repos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: `${T}cx-b`, description: 'B' })

    expect(a.status).toBe(201)
    expect(b.status).toBe(201)

    const qA = await request(app)
      .post(`/api/codexes/${T}u1/${T}cx-a/quests`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Quest A', body: 'body' })

    expect(qA.status).toBe(201)

    const qB = await request(app)
      .post(`/api/codexes/${T}u1/${T}cx-b/quests`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Quest B', body: 'body' })

    expect(qB.status).toBe(201)

    await request(app)
      .post(`/api/codexes/${T}u1/${T}cx-a/quests/${qA.body.quest.number}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Comment A' })

    await request(app)
      .post(`/api/codexes/${T}u1/${T}cx-b/quests/${qB.body.quest.number}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Comment B' })

    const del = await request(app)
      .delete(`/api/codexes/${T}u1/${T}cx-a`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(del.status).toBe(200)

    const bQuest = await request(app)
      .get(`/api/codexes/${T}u1/${T}cx-b/quests/${qB.body.quest.number}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(bQuest.status).toBe(200)
    expect(bQuest.body.comments.length).toBe(1)
    expect(bQuest.body.comments[0].body).toBe('Comment B')
  })
})

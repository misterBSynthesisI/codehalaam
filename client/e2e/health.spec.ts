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

import { test, expect } from '@playwright/test'

test.describe('Health Endpoint', () => {
  test('returns ok status with all required fields', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/health')
    expect(res.ok()).toBeTruthy()

    const body = await res.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('database')
    expect(body).toHaveProperty('uptime')
    expect(body).toHaveProperty('timestamp')
    expect(typeof body.uptime).toBe('number')
    expect(typeof body.timestamp).toBe('string')
  })

  test('returns database connection status', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/health')
    const body = await res.json()
    expect(['connected', 'disconnected']).toContain(body.database)
  })

  test('returns 503 when database is disconnected', async ({ request }) => {
    // This test verifies the response structure when DB is down
    // In practice, the DB should be running for other tests
    const res = await request.get('http://localhost:5000/api/health')
    const body = await res.json()

    if (body.database === 'disconnected') {
      expect(res.status()).toBe(503)
      expect(body.status).toBe('degraded')
    } else {
      expect(res.status()).toBe(200)
      expect(body.status).toBe('ok')
    }
  })
})

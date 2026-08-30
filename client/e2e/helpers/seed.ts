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

const API_BASE = 'http://localhost:5000'

/**
 * Seed a test repository for the authenticated user.
 * Returns the created repo object.
 */
export async function seedRepo(token: string, name: string) {
  const res = await fetch(`${API_BASE}/api/repos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      description: `Test repo: ${name}`,
      visibility: 'public',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`seedRepo failed: ${res.status} ${err.error || res.statusText}`)
  }

  return res.json()
}

/**
 * Delete a test repository (cleanup).
 */
export async function cleanupRepo(token: string, owner: string, name: string) {
  await fetch(`${API_BASE}/api/repos/${owner}/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

/**
 * Register a test user and return the token.
 * Skips if user already exists (returns null).
 */
export async function seedUser(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  if (res.status === 422) return null // user already exists
  if (!res.ok) throw new Error(`seedUser failed: ${res.status}`)

  const data = await res.json()
  return data.token
}

/**
 * Login and return the JWT token.
 */
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error(`loginUser failed: ${res.status}`)
  const data = await res.json()
  return data.token
}

/**
 * Check if the backend is reachable.
 */
export async function isBackendUp() {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    return res.ok
  } catch {
    return false
  }
}

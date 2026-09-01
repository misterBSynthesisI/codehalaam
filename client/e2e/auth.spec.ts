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

test.describe('Authentication', () => {
  test.describe('Landing → Sign Up → Dashboard', () => {
    test('navigates from landing to signup form', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /get started/i }).click()
      await expect(page).toHaveURL(/\/auth/)
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible()
    })

    test('shows username, email, password fields in signup mode', async ({ page }) => {
      await page.goto('/auth')
      await expect(page.getByLabel(/username/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('signup form submits and redirects to dashboard', async ({ page }) => {
      const uniqueId = Date.now()
      await page.goto('/auth')
      await page.getByLabel(/username/i).fill(`testuser_${uniqueId}`)
      await page.getByLabel(/email/i).fill(`test_${uniqueId}@test.com`)
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /create account/i }).click()
      await page.waitForURL('**/dashboard', { timeout: 10000 })
      await expect(page.getByText(/repositories/i)).toBeVisible()
    })
  })

  test.describe('Sign In', () => {
    test('navigates to login mode via URL param', async ({ page }) => {
      await page.goto('/auth?mode=login')
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
      await expect(page.getByLabel(/username or email/i)).toBeVisible()
    })

    test('login with valid credentials redirects to dashboard', async ({ page }) => {
      // First ensure the demo user exists via the demo endpoint
      const demoRes = await page.request.post('/api/auth/demo')
      expect(demoRes.ok()).toBeTruthy()

      await page.goto('/auth?mode=login')
      await page.getByLabel(/username or email/i).fill('kai@codehalaam.dev')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL('**/dashboard', { timeout: 10000 })
    })

    test('login with wrong password shows error', async ({ page }) => {
      await page.goto('/auth?mode=login')
      await page.getByLabel(/username or email/i).fill('kai@codehalaam.dev')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 })
    })

    test('login with nonexistent user shows error', async ({ page }) => {
      await page.goto('/auth?mode=login')
      await page.getByLabel(/username or email/i).fill('nonexistent@test.com')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 })
    })

    test('server does not crash on bad login', async ({ page }) => {
      await page.goto('/auth?mode=login')
      await page.getByLabel(/username or email/i).fill('bad@test.com')
      await page.getByLabel(/password/i).fill('wrong')
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 })

      // Verify server is still alive
      const health = await page.request.get('/api/health')
      expect(health.ok()).toBeTruthy()
    })
  })

  test.describe('Mode switching', () => {
    test('can switch between signup and login modes', async ({ page }) => {
      await page.goto('/auth')
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible()

      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      await page.getByRole('button', { name: /create an account/i }).click()
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible()
    })
  })
})

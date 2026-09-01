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

import { test as base, type Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

/**
 * Test fixture that provides a pre-authenticated page.
 * Logs in once per test using the demo account, then
 * injects the JWT token into localStorage so subsequent
 * navigation skips the login form entirely.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Use the demo login API to create/get demo user and obtain a token
    const response = await page.request.post('/api/auth/demo')
    const { token } = await response.json()

    // Navigate to the app and inject the token
    await page.goto('/')
    await page.evaluate((t: string) => {
      localStorage.setItem('codehalaam_token', t)
    }, token)

    // Navigate to dashboard — the token is now in localStorage
    await page.goto('/dashboard')
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    await use(page)
  },
})

export { expect } from '@playwright/test'

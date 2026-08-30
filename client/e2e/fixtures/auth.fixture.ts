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
    // Navigate to the auth page
    await page.goto('/auth')

    // Fill and submit the login form
    await page.getByLabel(/username or email/i).fill('demo@codehalaam.local')
    await page.getByLabel(/password/i).fill('12345678')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // The token is now in localStorage — reuse for all subsequent navigations
    await use(page)
  },
})

export { expect } from '@playwright/test'

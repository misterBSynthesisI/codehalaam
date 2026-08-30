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

test.describe('Theme Toggle', () => {
  test('defaults to dark theme', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  test('toggles to light theme on button click', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')

    // Find and click the theme toggle button
    await page.getByRole('button', { name: /switch to/i }).click()
    await expect(html).toHaveClass(/light/)
  })

  test('toggles back to dark theme', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')

    // Toggle to light
    await page.getByRole('button', { name: /switch to/i }).click()
    await expect(html).toHaveClass(/light/)

    // Toggle back to dark
    await page.getByRole('button', { name: /switch to/i }).click()
    await expect(html).toHaveClass(/dark/)
  })

  test('theme persists across page reload', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')

    // Toggle to light
    await page.getByRole('button', { name: /switch to/i }).click()
    await expect(html).toHaveClass(/light/)

    // Reload and verify
    await page.reload()
    await expect(html).toHaveClass(/light/)
  })
})

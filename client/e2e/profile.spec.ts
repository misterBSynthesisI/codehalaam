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

import { test, expect } from './fixtures/auth.fixture'

test.describe('Profile Page', () => {
  test('shows user stats and level', async ({ authenticatedPage: page }) => {
    await page.goto('/demo')
    await expect(page.getByText(/level/i).first()).toBeVisible()
    await expect(page.getByText(/contributions/i).first()).toBeVisible()
  })

  test('shows contribution heatmap on overview tab', async ({ authenticatedPage: page }) => {
    await page.goto('/demo')
    await expect(page.getByText(/contributions in the last year/i)).toBeVisible()
  })

  test('can switch to repositories tab', async ({ authenticatedPage: page }) => {
    await page.goto('/demo')
    await page.getByRole('button', { name: /repositories/i }).click()
    // Should show either repos or "no repositories yet"
    const content = page.getByText(/no repositories yet/i).or(page.locator('[data-testid="repo-list"]'))
    await expect(content).toBeVisible()
  })

  test('can switch to achievements tab', async ({ authenticatedPage: page }) => {
    await page.goto('/demo')
    await page.getByRole('button', { name: /achievements/i }).click()
    // Should show either achievements or "no achievements yet"
    const content = page.getByText(/no achievements yet/i).or(page.locator('[data-testid="achievement-list"]'))
    await expect(content).toBeVisible()
  })

  test('shows 404 for nonexistent user', async ({ page }) => {
    await page.goto('/this-user-does-not-exist-xyz')
    await expect(page.getByText(/user not found/i)).toBeVisible()
  })
})

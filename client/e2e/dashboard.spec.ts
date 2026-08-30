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

test.describe('Dashboard', () => {
  test('shows user profile sidebar with XP bar', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/level/i).first()).toBeVisible()
    await expect(page.getByText(/xp/i).first()).toBeVisible()
  })

  test('shows repository list or empty state', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    const repos = page.locator('.Box-row').or(page.getByText(/no repositories yet/i))
    await expect(repos).toBeVisible()
  })

  test('search filters repositories', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    const searchInput = page.getByPlaceholder(/find a repository/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('nonexistent-repo-xyz')
    await expect(page.getByText(/no repositories match/i)).toBeVisible()
  })

  test('new repo button navigates to create page', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /new/i }).first().click()
    await expect(page).toHaveURL(/\/new/)
  })

  test('shows contribution heatmap', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/contributions in the last year/i)).toBeVisible()
  })

  test('redirects unauthenticated users to auth', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth/)
  })
})

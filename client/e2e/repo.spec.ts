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
import { seedRepo, cleanupRepo } from './helpers/seed'

test.describe('Repository Management', () => {
  test.describe('Create Repository', () => {
    test('navigates to create repo page from navbar', async ({ authenticatedPage: page }) => {
      await page.goto('/dashboard')
      await page.getByRole('link', { name: /new/i }).first().click()
      await expect(page).toHaveURL(/\/new/)
      await expect(page.getByRole('heading', { name: /create a new repository/i })).toBeVisible()
    })

    test('shows name, description, and visibility fields', async ({ authenticatedPage: page }) => {
      await page.goto('/new')
      await expect(page.getByLabel(/repository name/i)).toBeVisible()
      await expect(page.getByLabel(/description/i)).toBeVisible()
      await expect(page.getByText(/public/i)).toBeVisible()
      await expect(page.getByText(/private/i)).toBeVisible()
    })

    test('creates repo and redirects to repo page', async ({ authenticatedPage: page }) => {
      const repoName = `test-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByLabel(/description/i).fill('A test repository')
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })
      await expect(page.getByText(repoName)).toBeVisible()
    })

    test('shows error for duplicate repo name', async ({ authenticatedPage: page }) => {
      const repoName = `dup-repo-${Date.now()}`
      // Create first repo
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      // Try to create again
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 5000 })
    })

    test('cancel button goes back', async ({ authenticatedPage: page }) => {
      await page.goto('/new')
      await page.getByRole('button', { name: /cancel/i }).click()
      await expect(page).not.toHaveURL(/\/new/)
    })
  })

  test.describe('Browse Repository', () => {
    test('shows repo header with name and visibility', async ({ authenticatedPage: page }) => {
      const repoName = `browse-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await expect(page.getByText(repoName)).toBeVisible()
      await expect(page.getByText(/public/i)).toBeVisible()
    })

    test('shows code tab with file tree by default', async ({ authenticatedPage: page }) => {
      const repoName = `code-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      // Code tab should be active by default
      await expect(page.getByRole('button', { name: /code/i }).first()).toBeVisible()
      await expect(page.getByText(/readme/i).first()).toBeVisible()
    })

    test('can switch to issues tab', async ({ authenticatedPage: page }) => {
      const repoName = `issues-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await page.getByRole('button', { name: /issues/i }).click()
      await expect(page.getByText(/no issues yet/i)).toBeVisible()
    })

    test('can switch to pull requests tab', async ({ authenticatedPage: page }) => {
      const repoName = `pr-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await page.getByRole('button', { name: /pull requests/i }).click()
      await expect(page.getByText(/no pull requests yet/i)).toBeVisible()
    })

    test('can switch to collaborators tab', async ({ authenticatedPage: page }) => {
      const repoName = `collab-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await page.getByRole('button', { name: /collaborators/i }).click()
      await expect(page.getByText(/invite a collaborator/i)).toBeVisible()
    })

    test('can switch to settings tab', async ({ authenticatedPage: page }) => {
      const repoName = `settings-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await page.getByRole('button', { name: /settings/i }).click()
      await expect(page.getByText(/description/i).first()).toBeVisible()
      await expect(page.getByText(/visibility/i).first()).toBeVisible()
    })

    test('shows sidebar with about, stars, forks', async ({ authenticatedPage: page }) => {
      const repoName = `sidebar-repo-${Date.now()}`
      await page.goto('/new')
      await page.getByLabel(/repository name/i).fill(repoName)
      await page.getByRole('button', { name: /create repository/i }).click()
      await page.waitForURL(`**/${repoName}`, { timeout: 10000 })

      await expect(page.getByText(/about/i).first()).toBeVisible()
      await expect(page.getByText(/stars/i).first()).toBeVisible()
      await expect(page.getByText(/forks/i).first()).toBeVisible()
    })
  })
})

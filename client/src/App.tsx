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

import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { XPProvider } from '@/components/gamification/XPToast'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CommandPalette } from '@/components/command/CommandPalette'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CodexHomePage } from '@/pages/CodexHomePage'
import { CodeWorkspacePage } from '@/pages/CodeWorkspacePage'
import { QuestDetailPage } from '@/pages/QuestDetailPage'
import { OfferingDetailPage } from '@/pages/OfferingDetailPage'
import { ReleaseListPage } from '@/pages/ReleaseListPage'
import { CodexSettingsPage } from '@/pages/CodexSettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CreateRepoPage } from '@/pages/CreateRepoPage'
import { AdminPage } from '@/pages/AdminPage'
import { AdminBadgesPage } from '@/pages/AdminBadgesPage'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { SetupPage } from '@/pages/SetupPage'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
import { NotFoundPage, ServerErrorPage } from '@/pages/ErrorPage'
import { ForumPage, ForumPostPage } from '@/pages/ForumPage'
import { DocsPage } from '@/pages/DocsPage'
import { ChangelogPage } from '@/pages/ChangelogPage'
import { useSiteSettings } from '@/hooks/useSiteSettings'

function RepoRedirect() {
  const { username, repoName } = useParams()
  return <Navigate to={`/codex/${username}/${repoName}`} replace />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-fg-muted text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/forum/:id" element={<ForumPostPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/new" element={
        <ProtectedRoute>
          <CreateRepoPage />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/badges" element={
        <ProtectedRoute>
          <AdminRoute>
            <AdminBadgesPage />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        </ProtectedRoute>
      } />

      {/* Barry routes — must come BEFORE /:username catch-all */}
      <Route path="/codex/:owner/:name/code" element={<CodeWorkspacePage />} />
      <Route path="/codex/:owner/:name/quests/:number" element={<QuestDetailPage />} />
      <Route path="/codex/:owner/:name/offerings/:number" element={<OfferingDetailPage />} />
      <Route path="/codex/:owner/:name/releases" element={<ReleaseListPage />} />
      <Route path="/codex/:owner/:name/settings" element={<CodexSettingsPage />} />
      <Route path="/codex/:owner/:name" element={<CodexHomePage />} />

      {/* Profile route */}
      <Route path="/:username/:repoName" element={<RepoRedirect />} />
      <Route path="/:username/:repoName/*" element={<RepoRedirect />} />
      <Route path="/:username" element={<ProfilePage />} />

      {/* Error pages */}
      <Route path="/error" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* 404 catch-all — must be LAST */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  // Apply site branding (favicon, title, meta) on load — admin-configurable
  useSiteSettings()

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <XPProvider>
          <div className="flex flex-col min-h-screen" style={{backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)'}}>
            <CommandPalette />
            <Navbar />
            <div className="flex-1">
              <AppRoutes />
            </div>
            <Footer />
            <Toaster position="top-right" richColors closeButton />
          </div>
        </XPProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

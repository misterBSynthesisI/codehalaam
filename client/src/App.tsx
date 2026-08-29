import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { XPProvider } from '@/components/gamification/XPToast'
import { Navbar } from '@/components/layout/Navbar'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RepoPage } from '@/pages/RepoPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CreateRepoPage } from '@/pages/CreateRepoPage'
import { AdminPage } from '@/pages/AdminPage'

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
          <AdminPage />
        </ProtectedRoute>
      } />

      <Route path="/:username" element={<ProfilePage />} />

      <Route path="/:username/:repoName" element={<RepoPage />} />
      <Route path="/:username/:repoName/*" element={<RepoPage />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <XPProvider>
          <div className="min-h-screen" style={{backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)'}}>
            <Navbar />
            <AppRoutes />
          </div>
        </XPProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

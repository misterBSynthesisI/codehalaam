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

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  username: string
  displayName: string
  email: string
  bio: string
  company: string
  location: string
  website: string
  twitter: string
  avatarUrl: string
  coverUrl: string | null
  level: number
  xp: number
  xpToNext: number
  streak: number
  longestStreak: number
  isAdmin: boolean
  badgeColor: string
  characterClass?: string
  stats: {
    commits: number
    pullRequests: number
    reviews: number
    issues: number
    contributions: number
  }
  achievements: { id: string; name: string; unlockedAt: string }[]
  contributionDays: { date: string; count: number }[]
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('codehalaam_token')
      if (!token) {
        setLoading(false)
        return
      }

      const { user } = await api.getMe()
      setUser(user)
    } catch (err) {
      localStorage.removeItem('codehalaam_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // First-run detection: if no token AND the DB has no users, redirect to /setup.
  // This only runs once on mount.
  useEffect(() => {
    const token = localStorage.getItem('codehalaam_token')
    if (token) return // logged in — no setup needed

    let cancelled = false
    api.getSetupStatus().then(({ needsSetup }) => {
      if (cancelled) return
      if (needsSetup && window.location.pathname !== '/setup') {
        window.location.href = '/setup'
      }
    }).catch(() => {
      // API unreachable — let normal auth flow handle it
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    refreshUser()

    // Re-fetch user on window focus to sync admin/badge changes
    const handleFocus = () => refreshUser()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password)
    setUser(user)
  }

  const signup = async (username: string, email: string, password: string) => {
    const { user } = await api.signup(username, email, password)
    setUser(user)
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } as User : null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

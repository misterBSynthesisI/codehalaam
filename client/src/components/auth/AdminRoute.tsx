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

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldAlert } from 'lucide-react'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}>
        <div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!user.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function AdminAccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}>
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-danger-fg)' }} />
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Access Denied</h2>
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Admin access required.</p>
      </div>
    </div>
  )
}

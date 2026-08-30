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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'

const BADGE_OPTIONS = [
  { value: 'none', label: 'No Badge', color: 'var(--color-fg-muted)' },
  { value: 'blue', label: 'Blue (Verified)', color: '#58a6ff' },
  { value: 'black', label: 'Black (Stealth)', color: '#1f2328' },
  { value: 'red', label: 'Red (Admin)', color: '#f85149' },
]

export function AdminBadgesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.isAdmin) return
    api.request<any>('/admin/users').then(data => setUsers(data.users || [])).finally(() => setLoading(false))
  }, [user])

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}>
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-fg-subtle)' }} />
          <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Access denied. Admin only.</p>
        </div>
      </div>
    )
  }

  const handleBadgeChange = async (userId: string, badgeColor: string) => {
    setUpdating(userId)
    try {
      const { user: updated } = await api.request<any>(`/admin/users/${userId}/badge`, {
        method: 'PATCH',
        body: JSON.stringify({ badgeColor }),
      })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, badgeColor: updated.badgeColor } : u))
    } catch (err: any) {
      alert(err.message || 'Failed to update badge')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="p-1.5 rounded" style={{ color: 'var(--color-fg-muted)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Shield className="w-5 h-5" style={{ color: 'var(--color-accent-fg)' }} />
          <h1 className="text-lg font-semibold">Badge Management</h1>
        </div>

        <div className="Box">
          {loading ? (
            <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading users...</div>
          ) : (
            users.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="Box-row flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-counter-bg)', color: 'var(--color-fg-default)' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{u.displayName || u.username}</span>
                      <VerifiedBadge badgeColor={u.badgeColor} />
                      {u.isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>Admin</span>}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{u.username} · {u.email}</span>
                  </div>
                </div>
                <select
                  value={u.badgeColor || 'none'}
                  onChange={(e) => handleBadgeChange(u._id, e.target.value)}
                  disabled={updating === u._id}
                  className="form-control text-sm"
                  style={{ width: 160 }}
                >
                  {BADGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

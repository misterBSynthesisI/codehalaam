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

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Pencil, Trash2, X, ShieldAlert, Users, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2
} from 'lucide-react'
import { api } from '@/lib/api'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'

/* ── Toast system ── */
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let toastId = 0

/* ── Types ── */
interface AdminUser {
  _id: string
  username: string
  displayName?: string
  email: string
  avatarUrl?: string
  level: number
  xp: number
  xpToNext: number
  badgeColor: string
  characterClass?: string
  isAdmin: boolean
  createdAt: string
}

const CLASS_OPTIONS = ['Mage', 'Tank', 'Rogue'] as const
const BADGE_OPTIONS = [
  { value: 'none', label: 'No Badge' },
  { value: 'blue', label: 'Blue (Verified)' },
  { value: 'black', label: 'Black (Stealth)' },
  { value: 'red', label: 'Red (Admin)' },
] as const

const CLASS_COLORS: Record<string, string> = {
  Mage: 'var(--color-done-fg)',
  Tank: 'var(--color-success-fg)',
  Rogue: 'var(--color-attention-fg)',
}

/* ── Main Component ── */
export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [stats, setStats] = useState<any>(null)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null)
  const [editLevel, setEditLevel] = useState(1)
  const [editXp, setEditXp] = useState(0)
  const [editBadge, setEditBadge] = useState('none')
  const [editClass, setEditClass] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  /* ── Toast helpers ── */
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true)
    try {
      const data = await api.adminGetUsers({ page: p, limit: 15, search: q })
      setUsers(data.users || [])
      setTotal(data.total)
      setPages(data.pages)
      setPage(p)
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const fetchStats = useCallback(async () => {
    try {
      const s = await api.request<any>('/admin/stats')
      setStats(s)
    } catch { /* silent */ }
  }, [])

  /* ── Debounced search ── */
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchQuery])

  useEffect(() => {
    fetchUsers(1, debouncedSearch)
  }, [debouncedSearch, fetchUsers])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /* ── Client-side filter for instant feedback ── */
  const filteredUsers = searchQuery
    ? users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  /* ── Open edit drawer ── */
  const openDrawer = (user: AdminUser) => {
    setDrawerUser(user)
    setEditLevel(user.level)
    setEditXp(user.xp)
    setEditBadge(user.badgeColor || 'none')
    setEditClass(user.characterClass || '')
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setDrawerUser(null), 300)
  }

  /* ── Save edit ── */
  const handleSave = async () => {
    if (!drawerUser) return
    setSaving(true)
    try {
      const { user: updated } = await api.adminUpdateUser(drawerUser._id, {
        level: editLevel,
        xp: editXp,
        badgeColor: editBadge,
        characterClass: editClass || undefined,
      })
      setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u))
      closeDrawer()

      const badgeLabel = BADGE_OPTIONS.find(b => b.value === editBadge)?.label || 'None'
      if (editBadge !== drawerUser.badgeColor) {
        showToast(`✨ ${badgeLabel} badge granted to ${updated.username}`)
      } else {
        showToast(`✅ ${updated.username}'s profile updated`)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete user ── */
  const openDeleteModal = (user: AdminUser) => {
    setDeleteTarget(user)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setTimeout(() => setDeleteTarget(null), 300)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { user: deleted } = await api.adminDeleteUser(deleteTarget._id)
      setUsers(prev => prev.filter(u => u._id !== deleted._id))
      setTotal(prev => prev - 1)
      closeDeleteModal()
      showToast(`🗑️ ${deleted.username} has been banished`)
      // Refresh stats
      fetchStats()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      {/* ── Toast container ── */}
      <div className="fixed top-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto px-4 py-3 rounded-lg flex items-center gap-2.5 text-sm font-medium material-toolbar"
              style={{
                border: `1px solid ${toast.type === 'error' ? 'var(--color-danger-fg)' : 'var(--color-success-fg)'}`,
                boxShadow: 'var(--color-shadow-large)',
                color: toast.type === 'error' ? 'var(--color-danger-fg)' : 'var(--color-success-fg)',
              }}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="container-lg py-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-6 h-6" style={{ color: 'var(--color-danger-fg)' }} />
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.01em' }}>Control Room</h1>
          {stats && (
            <span className="text-sm ml-auto" style={{ color: 'var(--color-fg-muted)' }}>
              {stats.users.total} users · {stats.repos.total} codexes · {stats.stars} embers
            </span>
          )}
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="form-control pl-9"
            />
          </div>
          <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{total} users</span>
        </div>

        {/* ── Data Table ── */}
        <div className="Box overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-canvas-subtle)', borderBottom: '1px solid var(--color-border-default)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Badge</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--color-border-default)' }}
                      className="hover:transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Avatar + Username */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              backgroundColor: u.avatarUrl ? 'transparent' : 'var(--color-accent-muted)',
                              color: 'var(--color-accent-fg)',
                            }}
                          >
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              u.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                                {u.displayName || u.username}
                              </span>
                              <VerifiedBadge badgeColor={u.badgeColor} />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-fg-muted)' }}>{u.email}</td>
                      {/* Class */}
                      <td className="px-4 py-3">
                        {u.characterClass ? (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-canvas-subtle)',
                              color: CLASS_COLORS[u.characterClass] || 'var(--color-fg-muted)',
                              border: `1px solid ${CLASS_COLORS[u.characterClass] || 'var(--color-border-default)'}`,
                            }}
                          >
                            {u.characterClass}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>—</span>
                        )}
                      </td>
                      {/* Level */}
                      <td className="px-4 py-3">
                        <span className="Label Label-green">Lv.{u.level}</span>
                      </td>
                      {/* Badge */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                          {BADGE_OPTIONS.find(b => b.value === u.badgeColor)?.label || 'None'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDrawer(u)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--color-fg-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-fg)'; e.currentTarget.style.backgroundColor = 'var(--color-accent-muted)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(u)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--color-fg-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger-fg)'; e.currentTarget.style.backgroundColor = 'var(--color-danger-muted)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchUsers(page - 1, debouncedSearch)}
                className="btn btn-default btn-sm"
                style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              <button
                disabled={page >= pages}
                onClick={() => fetchUsers(page + 1, debouncedSearch)}
                className="btn btn-default btn-sm"
                style={{ opacity: page >= pages ? 0.4 : 1, cursor: page >= pages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Drawer (Right slide-out) ── */}
      <AnimatePresence>
        {drawerOpen && drawerUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={closeDrawer}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md material-toolbar overflow-y-auto"
              style={{
                borderLeft: '1px solid var(--color-border-default)',
                boxShadow: 'var(--color-shadow-extra-large)',
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                <h2 className="text-base font-semibold">Edit User</h2>
                <button
                  onClick={closeDrawer}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--color-fg-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="px-5 py-5 space-y-6">
                {/* User preview */}
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent-fg)' }}
                  >
                    {drawerUser.avatarUrl ? (
                      <img src={drawerUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      drawerUser.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-semibold">{drawerUser.displayName || drawerUser.username}</span>
                      <VerifiedBadge badgeColor={editBadge} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>@{drawerUser.username}</span>
                  </div>
                </div>

                {/* Character Class */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg-default)' }}>Character Class</label>
                  <div className="flex gap-2">
                    {CLASS_OPTIONS.map(cls => (
                      <button
                        key={cls}
                        onClick={() => setEditClass(cls === editClass ? '' : cls)}
                        className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
                        style={{
                          backgroundColor: editClass === cls ? 'var(--color-accent-muted)' : 'var(--color-canvas-subtle)',
                          color: editClass === cls ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)',
                          border: `1px solid ${editClass === cls ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}`,
                        }}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg-default)' }}>
                    Level <span style={{ color: 'var(--color-fg-muted)' }}>({editLevel})</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={editLevel}
                    onChange={(e) => setEditLevel(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-accent-fg)]"
                  />
                </div>

                {/* XP */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg-default)' }}>
                    XP <span style={{ color: 'var(--color-fg-muted)' }}>({editXp.toLocaleString()})</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    value={editXp}
                    onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                    className="form-control"
                  />
                </div>

                {/* Badge Color */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg-default)' }}>Badge Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BADGE_OPTIONS.map(badge => (
                      <button
                        key={badge.value}
                        onClick={() => setEditBadge(badge.value)}
                        className="py-2 px-3 rounded-md text-sm font-medium transition-all text-left flex items-center gap-2"
                        style={{
                          backgroundColor: editBadge === badge.value ? 'var(--color-accent-muted)' : 'var(--color-canvas-subtle)',
                          color: editBadge === badge.value ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)',
                          border: `1px solid ${editBadge === badge.value ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}`,
                        }}
                      >
                        {badge.value !== 'none' && <VerifiedBadge badgeColor={badge.value} />}
                        {badge.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live badge preview */}
                <div className="p-3 rounded-md flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Preview:</span>
                  <span className="text-sm font-medium">{drawerUser.displayName || drawerUser.username}</span>
                  <VerifiedBadge badgeColor={editBadge} />
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border-default)' }}>
                <button onClick={closeDrawer} className="btn btn-default flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteModalOpen && deleteTarget && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={closeDeleteModal}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md material-toolbar rounded-lg"
              style={{
                border: '1px solid var(--color-border-default)',
                boxShadow: 'var(--color-shadow-extra-large)',
              }}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Banish User</h3>
                    <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm mt-4" style={{ color: 'var(--color-fg-muted)' }}>
                  Are you sure you want to banish <strong style={{ color: 'var(--color-fg-default)' }}>{deleteTarget.displayName || deleteTarget.username}</strong>?
                  This will permanently remove their account and all associated data from the database.
                </p>
              </div>
              <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border-default)' }}>
                <button onClick={closeDeleteModal} className="btn btn-default flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger flex-1"
                >
                  {deleting ? 'Banishing...' : 'Yes, Banish'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

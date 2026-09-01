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
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,  Pencil, Trash2, X, ShieldAlert, Users, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, BarChart3, GitBranch, Settings, Activity,
  Eye, EyeOff, Star, Flame, Radio, Lock, Globe, ExternalLink, MessageSquare, Pin
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
type TabId = 'overview' | 'users' | 'repos' | 'forum' | 'settings'

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
  stats?: { commits: number; pullRequests: number; reviews: number; issues: number; contributions: number }
}

interface AdminRepo {
  _id: string
  name: string
  description?: string
  language?: string
  visibility: string
  starsCount: number
  forksCount: number
  owner: { username: string; displayName?: string; avatarUrl?: string; badgeColor?: string }
  createdAt: string
}

interface PlatformStats {
  users: { total: number; recent: number }
  repos: { total: number; public: number; private: number; recent: number }
  issues: { total: number; open: number; closed: number }
  pullRequests: { total: number; open: number; merged: number }
  stars: number
  contributions: number
  topLanguages: { name: string; count: number }[]
}

interface ActivityItem {
  type: 'user_joined' | 'repo_created' | 'issue_created' | 'pr_created'
  data: any
  date: string
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

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Rust: '#dea584',
  Go: '#00add8', Python: '#3572a5', CSS: '#563d7c', Shell: '#89e051',
}

/* ── Main Component ── */
export function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [toasts, setToasts] = useState<Toast[]>([])

  /* ── Toast helpers ── */
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'repos', label: 'Codexes', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'forum', label: 'Forum', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

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
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-6 h-6" style={{ color: 'var(--color-danger-fg)' }} />
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.01em' }}>Control Room</h1>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center gap-1 mb-6 mt-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'settings') navigate('/admin/settings')
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={{
                color: activeTab === tab.id ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
                borderColor: activeTab === tab.id ? 'var(--color-accent-fg)' : 'transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" showToast={showToast} />}
          {activeTab === 'users' && <UsersTab key="users" showToast={showToast} />}
          {activeTab === 'repos' && <ReposTab key="repos" showToast={showToast} />}
          {activeTab === 'forum' && <ForumTab key="forum" showToast={showToast} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB — Stats cards + Activity feed
   ═══════════════════════════════════════════════════════════════════════════ */
function OverviewTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.adminGetStats().catch(() => null),
      api.adminGetActivity().catch(() => ({ activity: [] })),
    ]).then(([s, a]) => {
      setStats(s)
      setActivity(a?.activity || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex items-center justify-center py-20">
        <span style={{ color: 'var(--color-fg-muted)' }}>Loading dashboard...</span>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Users" value={stats.users.total} sub={`${stats.users.recent} new (30d)`} color="var(--color-accent-fg)" />
          <StatCard label="Codexes" value={stats.repos.total} sub={`${stats.repos.public} public · ${stats.repos.private} private`} color="var(--color-success-fg)" />
          <StatCard label="Quests" value={stats.issues.total} sub={`${stats.issues.open} open · ${stats.issues.closed} closed`} color="var(--color-attention-fg)" />
          <StatCard label="Offerings" value={stats.pullRequests.total} sub={`${stats.pullRequests.open} open · ${stats.pullRequests.merged} merged`} color="var(--color-done-fg)" />
        </div>
      )}

      {/* ── Secondary Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Embers" value={stats.stars} color="var(--color-attention-fg)" icon={<Star className="w-4 h-4" />} />
          <StatCard label="Contributions" value={stats.contributions.toLocaleString()} color="var(--color-success-fg)" />
          <StatCard label="Top Language" value={stats.topLanguages[0]?.name || '—'} sub={stats.topLanguages[0] ? `${stats.topLanguages[0].count} codexes` : ''} color="var(--color-accent-fg)" />
        </div>
      )}

      {/* ── Language Distribution ── */}
      {stats && stats.topLanguages.length > 0 && (
        <div className="Box mb-6">
          <div className="Box-header">
            <h2 className="Box-title text-sm">Top Languages</h2>
          </div>
          <div className="Box-body">
            <div className="space-y-3">
              {stats.topLanguages.slice(0, 5).map((lang, i) => {
                const maxCount = stats.topLanguages[0]?.count || 1
                const pct = Math.round((lang.count / maxCount) * 100)
                return (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-sm w-24 shrink-0" style={{ color: 'var(--color-fg-default)' }}>{lang.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: LANG_COLORS[lang.name] || 'var(--color-accent-fg)' }} />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--color-fg-muted)' }}>{lang.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Feed ── */}
      <div className="Box">
        <div className="Box-header flex items-center justify-between">
          <h2 className="Box-title flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" /> Recent Activity
          </h2>
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{activity.length} events</span>
        </div>
        <div className="Box-body" style={{ padding: 0 }}>
          {activity.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No activity yet.</div>
          ) : (
            activity.slice(0, 15).map((item, i) => (
              <motion.div
                key={`${item.type}-${item.data._id}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < 14 ? '1px solid var(--color-border-default)' : 'none' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs"
                  style={{ backgroundColor: getActivityColor(item.type, true), color: getActivityColor(item.type, false) }}>
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm" style={{ color: 'var(--color-fg-default)' }}>
                    {getActivityText(item)}
                  </span>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--color-fg-muted)' }}>
                  {formatRelativeTime(item.date)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: any; sub?: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="Box p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-fg-default)' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{sub}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   USERS TAB — Search, list, edit, delete
   ═══════════════════════════════════════════════════════════════════════════ */
function UsersTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null)
  const [editLevel, setEditLevel] = useState(1)
  const [editXp, setEditXp] = useState(0)
  const [editBadge, setEditBadge] = useState('none')
  const [editClass, setEditClass] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

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

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchQuery])

  useEffect(() => { fetchUsers(1, debouncedSearch) }, [debouncedSearch, fetchUsers])

  const filteredUsers = searchQuery
    ? users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  const openDrawer = (user: AdminUser) => {
    setDrawerUser(user)
    setEditLevel(user.level)
    setEditXp(user.xp)
    setEditBadge(user.badgeColor || 'none')
    setEditClass(user.characterClass || '')
    setDrawerOpen(true)
  }

  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => setDrawerUser(null), 300) }

  const handleSave = async () => {
    if (!drawerUser) return
    setSaving(true)
    try {
      const { user: updated } = await api.adminUpdateUser(drawerUser._id, {
        level: editLevel, xp: editXp, badgeColor: editBadge, characterClass: editClass || undefined,
      })
      setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u))
      closeDrawer()
      showToast(`✅ ${updated.username}'s profile updated`)
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { user: deleted } = await api.adminDeleteUser(deleteTarget._id)
      setUsers(prev => prev.filter(u => u._id !== deleted._id))
      setTotal(prev => prev - 1)
      setDeleteModalOpen(false)
      setTimeout(() => setDeleteTarget(null), 300)
      showToast(`🗑️ ${deleted.username} has been banished`)
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
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

      {/* ── Users Table ── */}
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
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>{searchQuery ? 'No users match your search.' : 'No users found.'}</td></tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid var(--color-border-default)' }}
                    className="hover:transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: u.avatarUrl ? 'transparent' : 'var(--color-accent-muted)', color: 'var(--color-accent-fg)' }}>
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{u.displayName || u.username}</span>
                            <VerifiedBadge badgeColor={u.badgeColor} />
                            {u.isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>Admin</span>}
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-fg-muted)' }}>{u.email}</td>
                    <td className="px-4 py-3">
                      {u.characterClass ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-canvas-subtle)', color: CLASS_COLORS[u.characterClass] || 'var(--color-fg-muted)', border: `1px solid ${CLASS_COLORS[u.characterClass] || 'var(--color-border-default)'}` }}>
                          {u.characterClass}
                        </span>
                      ) : <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3"><span className="Label Label-green">Lv.{u.level}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{BADGE_OPTIONS.find(b => b.value === u.badgeColor)?.label || 'None'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDrawer(u)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-fg-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-fg)'; e.currentTarget.style.backgroundColor = 'var(--color-accent-muted)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                          title="Edit user"><Pencil className="w-4 h-4" /></button>
                        {!u.isAdmin && (
                          <button onClick={() => { setDeleteTarget(u); setDeleteModalOpen(true) }} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-fg-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger-fg)'; e.currentTarget.style.backgroundColor = 'var(--color-danger-muted)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Delete user"><Trash2 className="w-4 h-4" /></button>
                        )}
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
            <button disabled={page <= 1} onClick={() => fetchUsers(page - 1, debouncedSearch)} className="btn btn-default btn-sm"
              style={{ opacity: page <= 1 ? 0.4 : 1 }}><ChevronLeft className="w-3 h-3" /> Previous</button>
            <button disabled={page >= pages} onClick={() => fetchUsers(page + 1, debouncedSearch)} className="btn btn-default btn-sm"
              style={{ opacity: page >= pages ? 0.4 : 1 }}>Next <ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {/* ── Edit Drawer ── */}
      <AnimatePresence>
        {drawerOpen && drawerUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={closeDrawer} />
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md material-toolbar overflow-y-auto"
              style={{ borderLeft: '1px solid var(--color-border-default)', boxShadow: 'var(--color-shadow-extra-large)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                <h2 className="text-base font-semibold">Edit User</h2>
                <button onClick={closeDrawer} className="p-1 rounded-md" style={{ color: 'var(--color-fg-muted)' }}><X className="w-4 h-4" /></button>
              </div>
              <div className="px-5 py-5 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent-fg)' }}>
                    {drawerUser.avatarUrl ? <img src={drawerUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" /> : drawerUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-semibold">{drawerUser.displayName || drawerUser.username}</span>
                      <VerifiedBadge badgeColor={editBadge} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>@{drawerUser.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Character Class</label>
                  <div className="flex gap-2">
                    {CLASS_OPTIONS.map(cls => (
                      <button key={cls} onClick={() => setEditClass(cls === editClass ? '' : cls)}
                        className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
                        style={{ backgroundColor: editClass === cls ? 'var(--color-accent-muted)' : 'var(--color-canvas-subtle)', color: editClass === cls ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)', border: `1px solid ${editClass === cls ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}` }}>
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Level <span style={{ color: 'var(--color-fg-muted)' }}>({editLevel})</span></label>
                  <input type="range" min={1} max={100} value={editLevel} onChange={(e) => setEditLevel(parseInt(e.target.value))} className="w-full accent-[var(--color-accent-fg)]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">XP <span style={{ color: 'var(--color-fg-muted)' }}>({editXp.toLocaleString()})</span></label>
                  <input type="number" min={0} max={999999} value={editXp} onChange={(e) => setEditXp(parseInt(e.target.value) || 0)} className="form-control" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Badge Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BADGE_OPTIONS.map(badge => (
                      <button key={badge.value} onClick={() => setEditBadge(badge.value)}
                        className="py-2 px-3 rounded-md text-sm font-medium transition-all text-left flex items-center gap-2"
                        style={{ backgroundColor: editBadge === badge.value ? 'var(--color-accent-muted)' : 'var(--color-canvas-subtle)', color: editBadge === badge.value ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)', border: `1px solid ${editBadge === badge.value ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}` }}>
                        {badge.value !== 'none' && <VerifiedBadge badgeColor={badge.value} />}
                        {badge.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border-default)' }}>
                <button onClick={closeDrawer} className="btn btn-default flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteModalOpen && deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => { setDeleteModalOpen(false); setTimeout(() => setDeleteTarget(null), 300) }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md material-toolbar rounded-lg"
              style={{ border: '1px solid var(--color-border-default)', boxShadow: 'var(--color-shadow-extra-large)' }}>
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Banish User</h3>
                    <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm mt-4" style={{ color: 'var(--color-fg-muted)' }}>
                  Are you sure you want to banish <strong style={{ color: 'var(--color-fg-default)' }}>{deleteTarget.displayName || deleteTarget.username}</strong>?
                </p>
              </div>
              <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border-default)' }}>
                <button onClick={() => { setDeleteModalOpen(false); setTimeout(() => setDeleteTarget(null), 300) }} className="btn btn-default flex-1">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="btn btn-danger flex-1">{deleting ? 'Banishing...' : 'Yes, Banish'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPOS TAB — Repository list with search
   ═══════════════════════════════════════════════════════════════════════════ */
function ReposTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [repos, setRepos] = useState<AdminRepo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchRepos = useCallback(async (p: number, q: string, vis: string) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit: 15 }
      if (q) params.search = q
      if (vis) params.visibility = vis
      const data = await api.adminGetRepos(params)
      setRepos(data.repos || [])
      setTotal(data.total)
      setPages(data.pages)
      setPage(p)
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch repositories', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchQuery])

  useEffect(() => { fetchRepos(1, debouncedSearch, visibilityFilter) }, [debouncedSearch, visibilityFilter, fetchRepos])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search codexes..." className="form-control pl-9" />
        </div>
        <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className="form-control" style={{ width: 150 }}>
          <option value="">All visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{total} codexes</span>
      </div>

      {/* ── Repos Table ── */}
      <div className="Box overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 700 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-canvas-subtle)', borderBottom: '1px solid var(--color-border-default)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Codex</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Visibility</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Embers</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Echoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading codexes...</td></tr>
              ) : repos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No codexes found.</td></tr>
              ) : (
                repos.map((repo, i) => (
                  <motion.tr key={repo._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid var(--color-border-default)' }}
                    className="hover:transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 shrink-0" style={{ color: 'var(--color-fg-muted)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-fg)' }}>{repo.name}</span>
                      </div>
                      {repo.description && (
                        <p className="text-xs mt-0.5 ml-6 truncate max-w-xs" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent-fg)' }}>
                          {repo.owner?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{repo.owner?.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {repo.language ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: LANG_COLORS[repo.language] || '#999' }} />
                          {repo.language}
                        </span>
                      ) : <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                        {repo.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {repo.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                        <Flame className="w-3 h-3" /> {repo.starsCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                        <Radio className="w-3 h-3" /> {repo.forksCount.toLocaleString()}
                      </span>
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
            <button disabled={page <= 1} onClick={() => fetchRepos(page - 1, debouncedSearch, visibilityFilter)} className="btn btn-default btn-sm"
              style={{ opacity: page <= 1 ? 0.4 : 1 }}><ChevronLeft className="w-3 h-3" /> Previous</button>
            <button disabled={page >= pages} onClick={() => fetchRepos(page + 1, debouncedSearch, visibilityFilter)} className="btn btn-default btn-sm"
              style={{ opacity: page >= pages ? 0.4 : 1 }}>Next <ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORUM TAB — Manage forum posts (pin, close, delete)
   ═══════════════════════════════════════════════════════════════════════════ */
function ForumTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchPosts = useCallback(async (p: number, q: string) => {
    setLoading(true)
    try {
      const data = await api.adminGetForumPosts({ page: p, limit: 15, search: q })
      setPosts(data.posts || [])
      setTotal(data.total)
      setPages(data.pages)
      setPage(p)
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch forum posts', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchQuery])

  useEffect(() => { fetchPosts(1, debouncedSearch) }, [debouncedSearch, fetchPosts])

  const handleTogglePin = async (post: any) => {
    try {
      const { post: updated } = await api.adminTogglePinForumPost(post._id)
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p))
      showToast(updated.isPinned ? '📌 Post pinned' : 'Post unpinned')
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle pin', 'error')
    }
  }

  const handleToggleClose = async (post: any) => {
    try {
      const { post: updated } = await api.adminToggleCloseForumPost(post._id)
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p))
      showToast(updated.isClosed ? '🔒 Thread closed' : 'Thread reopened')
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle close', 'error')
    }
  }

  const handleDelete = async (post: any) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    try {
      await api.adminDeleteForumPost(post._id)
      setPosts(prev => prev.filter(p => p._id !== post._id))
      setTotal(prev => prev - 1)
      showToast('🗑️ Post deleted')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post', 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forum posts..." className="form-control pl-9" />
        </div>
        <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{total} posts</span>
      </div>

      <div className="Box overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading forum posts...</div>
        ) : posts.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No forum posts found.</div>
        ) : (
          <div>
            {posts.map((post, i) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < posts.length - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.isPinned && <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--color-attention-fg)' }} />}
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-fg-default)' }}>{post.title}</span>
                    {post.isClosed && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>Closed</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>by {post.author?.displayName || post.author?.username || 'Unknown'}</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{post.answers?.length || 0} answers</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleTogglePin(post)} className="p-1.5 rounded-md transition-colors" title={post.isPinned ? 'Unpin' : 'Pin'}
                    style={{ color: post.isPinned ? 'var(--color-attention-fg)' : 'var(--color-fg-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleClose(post)} className="p-1.5 rounded-md transition-colors" title={post.isClosed ? 'Reopen' : 'Close'}
                    style={{ color: post.isClosed ? 'var(--color-danger-fg)' : 'var(--color-fg-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <EyeOff className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post)} className="p-1.5 rounded-md transition-colors" title="Delete post"
                    style={{ color: 'var(--color-fg-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger-fg)'; e.currentTarget.style.backgroundColor = 'var(--color-danger-muted)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => fetchPosts(page - 1, debouncedSearch)} className="btn btn-default btn-sm"
              style={{ opacity: page <= 1 ? 0.4 : 1 }}><ChevronLeft className="w-3 h-3" /> Previous</button>
            <button disabled={page >= pages} onClick={() => fetchPosts(page + 1, debouncedSearch)} className="btn btn-default btn-sm"
              style={{ opacity: page >= pages ? 0.4 : 1 }}>Next <ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ── Helpers ── */
function getActivityColor(type: string, bg: boolean): string {
  const colors: Record<string, [string, string]> = {
    user_joined: ['var(--color-accent-muted)', 'var(--color-accent-fg)'],
    repo_created: ['var(--color-success-subtle)', 'var(--color-success-fg)'],
    issue_created: ['var(--color-attention-subtle)', 'var(--color-attention-fg)'],
    pr_created: ['var(--color-done-subtle)', 'var(--color-done-fg)'],
  }
  const pair = colors[type] || ['var(--color-canvas-subtle)', 'var(--color-fg-muted)']
  return bg ? pair[0] : pair[1]
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = { user_joined: '👤', repo_created: '📦', issue_created: '🐛', pr_created: '🔀' }
  return icons[type] || '•'
}

function getActivityText(item: ActivityItem): React.ReactNode {
  const d = item.data
  switch (item.type) {
    case 'user_joined':
      return <><strong>{d.displayName || d.username}</strong> joined the platform</>
    case 'repo_created':
      return <><strong>{d.owner?.username}</strong> created <strong>{d.name}</strong></>
    case 'issue_created':
      return <>Issue <strong>#{d.number}</strong> opened: {d.title}</>
    case 'pr_created':
      return <>PR <strong>#{d.number}</strong> opened: {d.title}</>
    default:
      return <>{item.type}</>
  }
}

function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

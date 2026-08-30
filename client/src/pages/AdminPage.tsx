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
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, GitBranch, AlertCircle, GitPullRequest, Star,
  TrendingUp, Activity, BarChart3, Search, ChevronLeft, ChevronRight
} from 'lucide-react'
import { api } from '@/lib/api'

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="Box p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{backgroundColor: color, color: 'inherit'}}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold" style={{color:'var(--color-fg-default)'}}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
          <div className="text-xs" style={{color:'var(--color-fg-muted)'}}>{label}</div>
          {sub && <div className="text-xs" style={{color:'var(--color-fg-subtle)'}}>{sub}</div>}
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'repos' | 'activity'>('overview')
  const [loading, setLoading] = useState(true)

  // Pagination
  const [userPage, setUserPage] = useState(1)
  const [repoPage, setRepoPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [repoTotal, setRepoTotal] = useState(0)

  // Search
  const [userSearch, setUserSearch] = useState('')
  const [repoSearch, setRepoSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.request<any>('/admin/stats'),
      api.request<any>('/admin/users?limit=20'),
      api.request<any>('/admin/repos?limit=20'),
      api.request<any>('/admin/activity'),
    ]).then(([s, u, r, a]) => {
      setStats(s)
      setUsers(u.users)
      setUserTotal(u.total)
      setRepos(r.repos)
      setRepoTotal(r.total)
      setActivity(a.activity)
    }).finally(() => setLoading(false))
  }, [])

  const fetchUsers = async (page: number, search: string = '') => {
    const data = await api.request<any>(`/admin/users?limit=20&page=${page}&search=${encodeURIComponent(search)}`)
    setUsers(data.users)
    setUserTotal(data.total)
    setUserPage(page)
  }

  const fetchRepos = async (page: number, search: string = '') => {
    const data = await api.request<any>(`/admin/repos?limit=20&page=${page}&search=${encodeURIComponent(search)}`)
    setRepos(data.repos)
    setRepoTotal(data.total)
    setRepoPage(page)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{backgroundColor:'var(--color-canvas-default)'}}><div style={{color:'var(--color-fg-muted)'}}>Loading admin dashboard...</div></div>
  }

  return (
    <div style={{backgroundColor:'var(--color-canvas-default)',color:'var(--color-fg-default)',minHeight:'100vh'}}>
      <div className="container-lg py-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-fg" />
          <h1 className="text-2xl font-semibold text-fg">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="UnderlineNav mb-6">
          {(['overview', 'users', 'repos', 'activity'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="UnderlineNav-item capitalize" aria-selected={activeTab === tab}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Users className="w-5 h-5" style={{color:'var(--color-accent-fg)'}} />} label="Total Users" value={stats.users.total} sub={`${stats.users.recent} new (30d)`} color="var(--color-accent-muted)" />
              <StatCard icon={<GitBranch className="w-5 h-5" style={{color:'var(--color-success-fg)'}} />} label="Codexes" value={stats.repos.total} sub={`${stats.repos.public} public, ${stats.repos.private} private`} color="var(--color-success-muted)" />
              <StatCard icon={<AlertCircle className="w-5 h-5" style={{color:'var(--color-danger-fg)'}} />} label="Quests" value={stats.issues.total} sub={`${stats.issues.open} open, ${stats.issues.closed} closed`} color="var(--color-danger-muted)" />
              <StatCard icon={<GitPullRequest className="w-5 h-5" style={{color:'var(--color-done-fg)'}} />} label="Offerings" value={stats.pullRequests.total} sub={`${stats.pullRequests.open} open, ${stats.pullRequests.merged} merged`} color="var(--color-done-muted)" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon={<Star className="w-5 h-5" style={{color:'var(--color-attention-fg)'}} />} label="Total Embers" value={stats.stars} color="var(--color-attention-muted)" />
              <StatCard icon={<TrendingUp className="w-5 h-5" style={{color:'var(--color-success-fg)'}} />} label="Total Contributions" value={stats.contributions} color="var(--color-success-muted)" />
              <StatCard icon={<Activity className="w-5 h-5" style={{color:'var(--color-fg-muted)'}} />} label="Recent Codexes (30d)" value={stats.repos.recent} color="var(--color-canvas-subtle)" />
            </div>

            {/* Top Languages */}
            {stats.topLanguages.length > 0 && (
              <div className="border border-border rounded-md">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-fg">Top Languages</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {stats.topLanguages.map((lang: any) => (
                      <div key={lang.name} className="flex items-center gap-3">
                        <span className="text-sm text-fg w-24">{lang.name}</span>
                        <div className="flex-1 h-2 bg-canvas-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(lang.count / stats.repos.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-fg-muted w-8 text-right">{lang.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(1, userSearch) }}
                  placeholder="Search users..."
                  className="form-control pl-9"
                />
              </div>
              <span className="text-sm text-fg-muted">{userTotal} users total</span>
            </div>

            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-canvas-subtle border-b border-border">
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">User</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Email</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Level</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">XP</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Contributions</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Streak</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-border last:border-b-0 hover:bg-canvas-subtle">
                      <td className="px-4 py-2">
                        <Link to={`/${user.username}`} className="text-sm font-medium text-accent no-underline hover:underline">
                          {user.displayName || user.username}
                        </Link>
                        <div className="text-xs text-fg-muted">@{user.username}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-fg-muted">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className="Label Label-green">Lv.{user.level}</span>
                      </td>
                      <td className="px-4 py-2 text-sm text-fg">{user.xp.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-fg">{user.stats?.contributions?.toLocaleString() || 0}</td>
                      <td className="px-4 py-2 text-sm text-fg">{user.streak || 0}d</td>
                      <td className="px-4 py-2 text-xs text-fg-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-fg-muted">Page {userPage} of {Math.ceil(userTotal / 20)}</span>
              <div className="flex gap-2">
                <button disabled={userPage <= 1} onClick={() => fetchUsers(userPage - 1, userSearch)} className="btn-default btn-sm disabled:opacity-30">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
                <button disabled={userPage >= Math.ceil(userTotal / 20)} onClick={() => fetchUsers(userPage + 1, userSearch)} className="btn-default btn-sm disabled:opacity-30">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Repos */}
        {activeTab === 'repos' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchRepos(1, repoSearch) }}
                  placeholder="Search codexes..."
                  className="form-control pl-9"
                />
              </div>
              <span className="text-sm text-fg-muted">{repoTotal} codexes total</span>
            </div>

            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-canvas-subtle border-b border-border">
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Codex</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Owner</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Visibility</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Language</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Stars</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Echoes</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {repos.map(repo => (
                    <tr key={repo._id} className="border-b border-border last:border-b-0 hover:bg-canvas-subtle">
                      <td className="px-4 py-2">
                        <Link to={`/${repo.owner?.username}/${repo.name}`} className="text-sm font-medium text-accent no-underline hover:underline">
                          {repo.name}
                        </Link>
                        {repo.description && <div className="text-xs text-fg-muted truncate max-w-xs">{repo.description}</div>}
                      </td>
                      <td className="px-4 py-2 text-sm text-fg-muted">{repo.owner?.username}</td>
                      <td className="px-4 py-2">
                        <span className={`Label ${repo.visibility === 'private' ? 'Label-yellow' : 'Label-green'}`}>
                          {repo.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-fg">{repo.language || '—'}</td>
                      <td className="px-4 py-2 text-sm text-fg">{repo.starsCount || 0}</td>
                      <td className="px-4 py-2 text-sm text-fg">{repo.forksCount || 0}</td>
                      <td className="px-4 py-2 text-xs text-fg-muted">{new Date(repo.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-fg-muted">Page {repoPage} of {Math.ceil(repoTotal / 20)}</span>
              <div className="flex gap-2">
                <button disabled={repoPage <= 1} onClick={() => fetchRepos(repoPage - 1, repoSearch)} className="btn-default btn-sm disabled:opacity-30">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
                <button disabled={repoPage >= Math.ceil(repoTotal / 20)} onClick={() => fetchRepos(repoPage + 1, repoSearch)} className="btn-default btn-sm disabled:opacity-30">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity */}
        {activeTab === 'activity' && (
          <div className="border border-border rounded-md">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-fg">Recent Platform Activity</h3>
            </div>
            <div>
              {activity.map((item, i) => (
                <div key={i} className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-canvas-subtle flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    item.type === 'user_joined' ? 'bg-accent-muted text-accent' :
                    item.type === 'repo_created' ? 'bg-success-muted text-success' :
                    item.type === 'issue_created' ? 'bg-danger-muted text-danger' :
                    'bg-done-muted text-done'
                  }`}>
                    {item.type === 'user_joined' && <Users className="w-4 h-4" />}
                    {item.type === 'repo_created' && <GitBranch className="w-4 h-4" />}
                    {item.type === 'issue_created' && <AlertCircle className="w-4 h-4" />}
                    {item.type === 'pr_created' && <GitPullRequest className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-fg">
                      {item.type === 'user_joined' && <><span className="font-medium">{item.data.username}</span> joined CODEHALAAM</>}
                      {item.type === 'repo_created' && <><span className="font-medium">{item.data.owner?.username}</span> created <span className="text-accent">{item.data.name}</span></>}
                      {item.type === 'issue_created' && <><span className="font-medium">{item.data.author?.username}</span> opened issue #{item.data.number} <span className="text-accent">{item.data.title}</span></>}
                      {item.type === 'pr_created' && <><span className="font-medium">{item.data.author?.username}</span> opened PR #{item.data.number} <span className="text-accent">{item.data.title}</span></>}
                    </p>
                    <p className="text-xs text-fg-muted">{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

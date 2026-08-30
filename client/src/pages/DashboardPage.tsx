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
  Star, GitFork, Clock, Plus, Search, Lock
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { ContributionHeatmap } from '@/components/dashboard/ContributionHeatmap'

export function DashboardPage() {
  const { user } = useAuth()
  const [repos, setRepos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRepos().then(data => setRepos(data.repos)).finally(() => setLoading(false))
  }, [])

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const xpPercent = user ? Math.round((user.xp / user.xpToNext) * 100) : 0

  const contributionHeatmap = user?.contributionDays?.reduce((acc: number[][], day: any) => {
    if (acc.length === 0 || acc[acc.length - 1].length === 7) acc.push([day.count])
    else acc[acc.length - 1].push(day.count)
    return acc
  }, []) || []

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
          {/* Main content */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a repository…"
                  className="form-control pl-9"
                />
              </div>
              <Link to="/new" className="btn btn-primary no-underline">
                <Plus className="w-4 h-4" /> New
              </Link>
            </div>

            {loading ? (
              <div className="Box"><div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading repositories...</div></div>
            ) : (
              <div className="Box">
                {filteredRepos.map((repo, i) => (
                  <motion.div key={repo._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3, delay: i * 0.03 }}>
                    <Link to={`/${user?.username}/${repo.name}`} className="Box-row flex items-start justify-between gap-4 no-underline" style={{ textDecoration: 'none' }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-base font-semibold" style={{ color: 'var(--color-accent-fg)' }}>{user?.username}/{repo.name}</h3>
                          <span className="Label" style={{
                            backgroundColor: repo.visibility === 'private' ? 'var(--color-counter-bg)' : 'var(--color-success-muted)',
                            color: repo.visibility === 'private' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)',
                            borderColor: repo.visibility === 'private' ? 'var(--color-border-default)' : 'rgba(46,160,67,0.4)',
                          }}>
                            {repo.visibility === 'private' ? <><Lock className="w-3 h-3 inline mr-1" />Private</> : 'Public'}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                          {repo.language && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.languageColor || '#8b8b8b' }} />{repo.language}</span>}
                          {repo.starsCount > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.starsCount.toLocaleString()}</span>}
                          {repo.forksCount > 0 && <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forksCount}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline shrink-0" onClick={(e) => { e.preventDefault(); api.toggleStar(user!.username, repo.name) }}>
                        <Star className="w-3 h-3" /> Star
                        {repo.starsCount > 0 && <span style={{ color: 'var(--color-fg-muted)' }}>{repo.starsCount}</span>}
                      </button>
                    </Link>
                  </motion.div>
                ))}
                {filteredRepos.length === 0 && (
                  <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    {searchQuery ? 'No repositories match your search' : 'No repositories yet. Create your first one!'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {user && (
              <div className="Box">
                <div className="Box-body">
                  <div className="flex items-center gap-3 mb-3">
                    <Link to={`/${user.username}`}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold no-underline" style={{ backgroundColor: 'var(--color-counter-bg)', color: 'var(--color-fg-default)' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    <div>
                      <Link to={`/${user.username}`} className="text-base font-semibold no-underline hover:underline" style={{ color: 'var(--color-fg-default)' }}>{user.displayName || user.username}</Link>
                      <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{user.username}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--color-fg-muted)' }}>
                      <span>Level {user.level}</span>
                      <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-counter-bg)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                        className="h-full rounded-full" style={{ backgroundColor: 'var(--color-success-fg)' }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    <span>{user.stats?.commits?.toLocaleString() || 0} commits</span>
                    <span>{user.stats?.pullRequests || 0} PRs</span>
                    <span>{user.streak || 0} day streak</span>
                  </div>
                </div>
              </div>
            )}

            <div className="Box">
              <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Recent activity</h3>
              </div>
              <div className="Box-body text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                <p>Your recent activity will appear here.</p>
              </div>
            </div>
          </div>
        </div>

        {user && contributionHeatmap.length > 0 && (
          <div className="Box mt-6">
            <ContributionHeatmap contributions={contributionHeatmap} totalContributions={user.stats?.contributions || 0} />
          </div>
        )}
      </div>
    </div>
  )
}

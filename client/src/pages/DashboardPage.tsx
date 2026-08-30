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
  GitPullRequest, AlertCircle, Check, Clock, ArrowUpRight, Plus, Zap
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  const [myIssues, setMyIssues] = useState<any[]>([])
  const [myPRs, setMyPRs] = useState<any[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.getRepos().then(d => {
        setRepos(d.repos || [])
        // Fetch issues and PRs for user's repos
        const allIssues: any[] = []
        const allPRs: any[] = []
        return Promise.all(
          (d.repos || []).map(async (r: any) => {
            try {
              const ownerName = r.owner?.username || user.username
              const [issueData, prData] = await Promise.all([
                api.getIssues(ownerName, r.name),
                api.getPulls(ownerName, r.name),
              ])
              allIssues.push(...(issueData.issues || []).map((i: any) => ({ ...i, _repoName: r.name, _repoOwner: ownerName })))
              allPRs.push(...(prData.pulls || []).map((p: any) => ({ ...p, _repoName: r.name, _repoOwner: ownerName })))
            } catch { /* skip */ }
          })
        ).then(() => {
          // Filter to relevant items
          setMyIssues(allIssues.filter(i => i.state === 'open').slice(0, 8))
          setMyPRs(allPRs.slice(0, 8))
        })
      }),
    ]).finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <div className="flex-1" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)' }}>
      <div className="px-6 py-5" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-fg-default)' }}>
              Welcome back, {user.displayName || user.username}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
              Here's your workspace at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/new" className="btn btn-primary btn-sm no-underline flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Codex
            </Link>
          </div>
        </div>

        {/* 2-Column Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* ═══ LEFT: My Work ═══ */}
          <div className="space-y-5">

            {/* Active Quests */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-success-fg)' }} />
                  Active Quests
                  {myIssues.length > 0 && <span className="text-xs font-normal" style={{ color: 'var(--color-fg-muted)' }}>({myIssues.length})</span>}
                </h2>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
                ) : myIssues.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    No active quests. You're all caught up.
                  </div>
                ) : (
                  myIssues.map((issue, i) => (
                    <motion.div key={issue._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                    >
                      <Link
                        to={`/${issue._repoOwner}/${issue._repoName}`}
                        className="flex items-center gap-3 px-4 py-3 no-underline transition-colors"
                        style={{ borderBottom: i < myIssues.length - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-success-fg)' }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{issue.title}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-fg-muted)' }}>
                            <span>#{issue.number}</span>
                            <span>·</span>
                            <span>{issue._repoOwner}/{issue._repoName}</span>
                            {issue.bountyXp > 0 && <><span>·</span><span style={{ color: 'var(--color-attention-fg)' }}>⚡{issue.bountyXp}</span></>}
                          </div>
                        </div>
                        {(issue.labels || []).slice(0, 2).map((l: any) => (
                          <span key={l.name} className="text-[11px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-muted)', border: '1px solid var(--color-border-default)' }}>{l.name}</span>
                        ))}
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-fg-subtle)' }} />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Pending Offerings */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                  <GitPullRequest className="w-4 h-4" style={{ color: 'var(--color-done-fg)' }} />
                  Pending Offerings
                  {myPRs.length > 0 && <span className="text-xs font-normal" style={{ color: 'var(--color-fg-muted)' }}>({myPRs.length})</span>}
                </h2>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
                ) : myPRs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    No pending offerings.
                  </div>
                ) : (
                  myPRs.map((pr, i) => (
                    <motion.div key={pr._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                    >
                      <Link
                        to={`/${pr._repoOwner}/${pr._repoName}`}
                        className="flex items-center gap-3 px-4 py-3 no-underline transition-colors"
                        style={{ borderBottom: i < myPRs.length - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <GitPullRequest className="w-4 h-4 shrink-0" style={{
                          color: pr.state === 'merged' ? 'var(--color-done-fg)' : pr.state === 'open' ? 'var(--color-success-fg)' : 'var(--color-fg-muted)'
                        }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{pr.title}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-fg-muted)' }}>
                            <span>#{pr.number}</span>
                            <span>·</span>
                            <span>{pr._repoOwner}/{pr._repoName}</span>
                            <span>·</span>
                            <span style={{ color: 'var(--color-success-fg)' }}>+{pr.additions}</span>
                            <span style={{ color: 'var(--color-danger-fg)' }}>-{pr.deletions}</span>
                          </div>
                        </div>
                        {pr.state === 'merged' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--color-done-subtle)', color: 'var(--color-done-fg)' }}>Bound</span>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-fg-subtle)' }} />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ═══ RIGHT: Activity Feed ═══ */}
          <div>
            {/* Codexes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                  <Zap className="w-4 h-4" style={{ color: 'var(--color-attention-fg)' }} />
                  Your Codexes
                </h2>
                <Link to="/new" className="text-xs no-underline" style={{ color: 'var(--color-accent-fg)' }}>New</Link>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                {repos.slice(0, 6).map((repo, i) => (
                  <motion.div key={repo._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link
                      to={`/codex/${user.username}/${repo.name}`}
                      className="flex items-center justify-between px-4 py-2.5 no-underline transition-colors"
                      style={{ borderBottom: i < Math.min(repos.length, 6) - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--color-accent-fg)' }}>{repo.name}</div>
                        {repo.description && (
                          <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0 ml-3" style={{ color: 'var(--color-fg-muted)' }}>
                        {repo.language && <span>{repo.language}</span>}
                        {repo.starsCount > 0 && <span>★{repo.starsCount}</span>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {repos.length === 6 && (
                  <div className="px-4 py-2 text-center text-xs" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    <span style={{ color: 'var(--color-fg-muted)' }}>{repos.length} codexes total</span>
                  </div>
                )}
              </div>
            </section>

            {/* Activity summary */}
            <section className="mt-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
                Activity
              </h2>
              <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-border-default)' }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Inscriptions', value: user.stats?.commits || 0 },
                    { label: 'Offerings', value: user.stats?.pullRequests || 0 },
                    { label: 'Reviews', value: user.stats?.reviews || 0 },
                    { label: 'Streak', value: `${user.streak || 0}d` },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center py-2 rounded" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                      <div className="text-lg font-semibold" style={{ color: 'var(--color-fg-default)' }}>{stat.value}</div>
                      <div className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

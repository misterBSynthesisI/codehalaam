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
  GitPullRequest, AlertCircle, Check, Clock, ArrowUpRight, Plus, Zap, Lock, Swords, Gift
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { VerificationBadge } from '@/components/ui/UserBadge'

export function DashboardPage() {
  const { user } = useAuth()
  const [myQuests, setMyQuests] = useState<any[]>([])
  const [myOfferings, setMyOfferings] = useState<any[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.getRepos().then(d => {
        setRepos(d.repos || [])
        // Fetch quests and offerings for user's repos
        const allQuests: any[] = []
        const allOfferings: any[] = []
        return Promise.all(
          (d.repos || []).map(async (r: any) => {
            try {
              const ownerName = r.owner?.username || user.username
              const [questData, offeringData] = await Promise.all([
                api.getQuests(ownerName, r.name),
                api.getOfferings(ownerName, r.name),
              ])
              allQuests.push(...(questData.quests || []).map((q: any) => ({ ...q, _repoName: r.name, _repoOwner: ownerName })))
              allOfferings.push(...(offeringData.offerings || []).map((o: any) => ({ ...o, _repoName: r.name, _repoOwner: ownerName })))
            } catch { /* skip */ }
          })
        ).then(() => {
          setMyQuests(allQuests.filter(q => q.status !== 'Closed').slice(0, 8))
          setMyOfferings(allOfferings.slice(0, 8))
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
            <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
              Welcome back, {user.displayName || user.username}
              <VerificationBadge badgeColor={user.badgeColor} size={20} />
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
                  <Swords className="w-4 h-4" style={{ color: 'var(--color-success-fg)' }} />
                  Active Quests
                  {myQuests.length > 0 && <span className="text-xs font-normal" style={{ color: 'var(--color-fg-muted)' }}>({myQuests.length})</span>}
                </h2>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
                ) : myQuests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    No active quests. You're all caught up.
                  </div>
                ) : (
                  myQuests.map((quest, i) => (
                    <motion.div key={quest._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                    >
                      <Link
                        to={`/codex/${quest._repoOwner}/${quest._repoName}/quests/${quest.number}`}
                        className="hover-row flex items-center gap-3 px-4 py-3 no-underline"
                        style={{ borderBottom: i < myQuests.length - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: quest.status === 'In Progress' ? 'var(--color-attention-fg)' : 'var(--color-success-fg)' }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{quest.title}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-fg-muted)' }}>
                            <span>#{quest.number}</span>
                            <span>·</span>
                            <span>{quest._repoOwner}/{quest._repoName}</span>
                            {quest.bountyXp > 0 && <><span>·</span><span style={{ color: 'var(--color-attention-fg)' }}>⚡{quest.bountyXp}</span></>}
                          </div>
                        </div>
                        <span className="text-[11px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: quest.status === 'In Progress' ? 'rgba(210, 153, 34, 0.15)' : 'rgba(63, 185, 80, 0.15)', color: quest.status === 'In Progress' ? 'var(--color-attention-fg)' : 'var(--color-success-fg)' }}>{quest.status}</span>
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
                  <Gift className="w-4 h-4" style={{ color: 'var(--color-done-fg)' }} />
                  Pending Offerings
                  {myOfferings.length > 0 && <span className="text-xs font-normal" style={{ color: 'var(--color-fg-muted)' }}>({myOfferings.length})</span>}
                </h2>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
                ) : myOfferings.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    No pending offerings.
                  </div>
                ) : (
                  myOfferings.map((offering, i) => (
                    <motion.div key={offering._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                    >
                      <Link
                        to={`/codex/${offering._repoOwner}/${offering._repoName}/offerings/${offering.number}`}
                        className="hover-row flex items-center gap-3 px-4 py-3 no-underline"
                        style={{ borderBottom: i < myOfferings.length - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                      >
                        <GitPullRequest className="w-4 h-4 shrink-0" style={{
                          color: offering.status === 'Bound' ? 'var(--color-done-fg)' : 'var(--color-success-fg)'
                        }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{offering.title}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-fg-muted)' }}>
                            <span>#{offering.number}</span>
                            <span>·</span>
                            <span>{offering._repoOwner}/{offering._repoName}</span>
                          </div>
                        </div>
                        <span className="text-[11px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: offering.status === 'Bound' ? 'var(--color-done-subtle)' : 'rgba(63, 185, 80, 0.15)', color: offering.status === 'Bound' ? 'var(--color-done-fg)' : 'var(--color-success-fg)' }}>{offering.status}</span>
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
                      className="hover-row flex items-center justify-between px-4 py-2.5 no-underline"
                      style={{ borderBottom: i < Math.min(repos.length, 6) - 1 ? '1px solid var(--color-border-default)' : undefined, color: 'var(--color-fg-default)' }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-1.5" style={{ color: 'var(--color-accent-fg)' }}>
                          {repo.visibility === 'private' && <Lock className="w-3 h-3 shrink-0" strokeWidth={2} style={{ color: 'var(--color-fg-muted)' }} />}
                          {repo.name}
                        </div>
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

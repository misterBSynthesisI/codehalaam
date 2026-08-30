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
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Building, LinkIcon, Calendar, TrendingUp, Flame, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { StarMap } from '@/components/dashboard/StarMap'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'

export function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'achievements'>('overview')

  useEffect(() => {
    api.getUser(username!).then(data => { setProfile(data.user); setRepos(data.repos) }).finally(() => setLoading(false))
  }, [username])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading profile...</div></div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div className="text-center"><h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>User not found</h2></div></div>

  const contributionHeatmap = profile.contributionDays?.reduce((acc: number[][], day: any) => {
    if (acc.length === 0 || acc[acc.length - 1].length === 7) acc.push([day.count])
    else acc[acc.length - 1].push(day.count)
    return acc
  }, []) || []

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      {/* Power Photo — Cover Image Banner */}
      <div className="relative" style={{ height: 200 }}>
        {/* Galaxy/space gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a3e 25%, #0d1117 50%, #1a0a2e 75%, #0a1a2e 100%)',
        }} />
        {/* Subtle star dots on the cover */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.2), transparent), radial-gradient(1.5px 1.5px at 15% 80%, rgba(251,191,36,0.4), transparent), radial-gradient(1.5px 1.5px at 70% 40%, rgba(251,191,36,0.3), transparent), radial-gradient(1px 1px at 90% 15%, rgba(255,255,255,0.3), transparent)',
        }} />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{
          background: 'linear-gradient(to top, var(--color-canvas-default), transparent)',
        }} />
      </div>

      <div className="container-lg" style={{ marginTop: -60, position: 'relative', zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[296px_1fr] gap-6">
          {/* Sidebar */}
          <div>
            <div className="sticky top-24">
              {/* Avatar — overlaps the cover image */}
              <div className="w-[180px] h-[180px] rounded-full flex items-center justify-center text-6xl font-semibold mb-4 overflow-hidden" style={{
                backgroundColor: 'var(--color-canvas-subtle)',
                border: '4px solid var(--color-canvas-default)',
                color: 'var(--color-fg-default)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : profile.username.charAt(0).toUpperCase()}
              </div>

              <div className="mb-4">
                <h1 className="text-2xl font-semibold leading-tight flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                  {profile.displayName || profile.username}
                  <VerifiedBadge badgeColor={profile.badgeColor} />
                </h1>
                <p className="text-xl" style={{ color: 'var(--color-fg-muted)' }}>{profile.username}</p>
                {profile.bio && <p className="text-sm mt-2" style={{ color: 'var(--color-fg-default)' }}>{profile.bio}</p>}
                {profile.characterClass && (
                  <span className="Label Label-purple mt-2" style={{ fontSize: 11 }}>
                    ⚔️ {profile.characterClass}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4" style={{ color: 'var(--color-fg-muted)' }}>
                {profile.company && <div className="flex items-center gap-2"><Building className="w-4 h-4" />{profile.company}</div>}
                {profile.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{profile.location}</div>}
                {profile.website && <a href={profile.website} className="flex items-center gap-2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-fg)' }}><LinkIcon className="w-4 h-4" />{profile.website.replace(/^https?:\/\//, '')}</a>}
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              </div>

              <div className="Box p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>Level {profile.level}</span>
                  <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-counter-bg)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((profile.xp / profile.xpToNext) * 100)}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: 'var(--color-success-fg)' }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" style={{ color: 'var(--color-success-fg)' }} />{profile.stats?.contributions?.toLocaleString() || 0} contributions</div>
                  <div className="flex items-center gap-1">🔥 {profile.streak || 0} day streak</div>
                </div>
              </div>

              <div className="Box p-4">
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>Stats</h3>
                <div className="space-y-1 text-sm">
                  {[
                    ['Public codexes', repos.length],
                    ['Embers received', repos.reduce((s, r) => s + (r.starsCount || 0), 0).toLocaleString()],
                    ['Inscriptions', profile.stats?.commits?.toLocaleString() || 0],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span style={{ color: 'var(--color-fg-muted)' }}>{label}</span>
                      <span style={{ color: 'var(--color-fg-default)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div>
            <div className="UnderlineNav mb-4">
              {(['overview', 'repositories', 'achievements'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="UnderlineNav-item capitalize" aria-selected={activeTab === tab}>{tab}</button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Star Map — replaces the old green squares */}
                {contributionHeatmap.length > 0 && (
                  <StarMap contributions={contributionHeatmap} totalContributions={profile.stats?.contributions || 0} />
                )}

                {/* Pinned Codexes */}
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-fg-default)' }}>Pinned</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {repos.slice(0, 6).map(repo => (
                      <Link key={repo._id} to={`/codex/${profile.username}/${repo.name}`} className="Box p-4 no-underline" style={{ textDecoration: 'none' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-fg)' }}>{repo.name}</span>
                          <span className="Label" style={{ fontSize: 10, padding: '0 6px', backgroundColor: repo.visibility === 'private' ? 'var(--color-counter-bg)' : 'var(--color-success-muted)', color: repo.visibility === 'private' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)' }}>{repo.visibility}</span>
                        </div>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                          {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-fg)' }} />{repo.language}</span>}
                          {repo.starsCount > 0 && <span>🔥 {repo.starsCount.toLocaleString()}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="Box" data-testid="repo-list">
                {repos.map(repo => (
                  <div key={repo._id} className="Box-row">
                    <Link to={`/codex/${profile.username}/${repo.name}`} className="flex items-center gap-2 text-sm font-semibold no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>
                      <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                      {repo.name}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                  </div>
                ))}
                {repos.length === 0 && <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No codexes yet</div>}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="achievement-list">
                {(profile.achievements || []).map((a: any) => (
                  <div key={a.id} className="Box p-4 flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)' }}>
                      {a.id === 'first-commit' && '🎯'}{a.id === 'streak-7' && '🔥'}{a.id === 'team-player' && '👥'}{a.id === 'ship-it' && '🚀'}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{a.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{new Date(a.unlockedAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {(!profile.achievements || profile.achievements.length === 0) && <div className="col-span-full Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No achievements yet</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

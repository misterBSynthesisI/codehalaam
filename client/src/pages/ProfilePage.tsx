import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Building, LinkIcon, Calendar, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { ContributionHeatmap } from '@/components/dashboard/ContributionHeatmap'

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
      <div className="container-lg py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[296px_1fr] gap-6">
          {/* Sidebar */}
          <div>
            <div className="sticky top-24">
              <div className="w-[296px] h-[296px] rounded-full flex items-center justify-center text-8xl font-semibold mb-4 overflow-hidden" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : profile.username.charAt(0).toUpperCase()}
              </div>

              <div className="mb-4">
                <h1 className="text-2xl font-semibold leading-tight" style={{ color: 'var(--color-fg-default)' }}>{profile.displayName || profile.username}</h1>
                <p className="text-xl" style={{ color: 'var(--color-fg-muted)' }}>{profile.username}</p>
                {profile.bio && <p className="text-sm mt-2" style={{ color: 'var(--color-fg-default)' }}>{profile.bio}</p>}
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
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((profile.xp / profile.xpToNext) * 100)}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: 'var(--color-success-fg)' }} />
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
                    ['Public repos', repos.length],
                    ['Stars received', repos.reduce((s, r) => s + (r.starsCount || 0), 0).toLocaleString()],
                    ['Commits', profile.stats?.commits?.toLocaleString() || 0],
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
                {contributionHeatmap.length > 0 && (
                  <div className="Box"><ContributionHeatmap contributions={contributionHeatmap} totalContributions={profile.stats?.contributions || 0} /></div>
                )}
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-fg-default)' }}>Pinned</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {repos.slice(0, 6).map(repo => (
                      <Link key={repo._id} to={`/${profile.username}/${repo.name}`} className="Box p-4 no-underline" style={{ textDecoration: 'none' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-fg)' }}>{repo.name}</span>
                          <span className="Label" style={{ fontSize: 10, padding: '0 6px', backgroundColor: repo.visibility === 'private' ? 'var(--color-counter-bg)' : 'var(--color-success-muted)', color: repo.visibility === 'private' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)' }}>{repo.visibility}</span>
                        </div>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                          {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-fg)' }} />{repo.language}</span>}
                          {repo.starsCount > 0 && <span>★ {repo.starsCount.toLocaleString()}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="Box">
                {repos.map(repo => (
                  <div key={repo._id} className="Box-row">
                    <Link to={`/${profile.username}/${repo.name}`} className="text-sm font-semibold no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{repo.name}</Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                  </div>
                ))}
                {repos.length === 0 && <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No repositories yet</div>}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

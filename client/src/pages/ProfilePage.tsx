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

import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Building, LinkIcon, Calendar, TrendingUp, Flame, BookOpen, Settings, Upload, X, Crown } from 'lucide-react'
import { api } from '@/lib/api'
import { StarMap } from '@/components/dashboard/StarMap'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { VerificationBadge } from '@/components/ui/UserBadge'
import { AvatarWithFrame } from '@/components/ui/AvatarWithFrame'
import { Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { NotFoundPage } from '@/pages/ErrorPage'

export function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser, refreshUser } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'achievements'>('overview')
  const [showCustomize, setShowCustomize] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getUser(username!).then(data => { setProfile(data.user); setRepos(data.repos) }).finally(() => setLoading(false))
  }, [username])

  const isOwnProfile = currentUser && profile && currentUser.username === profile.username

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading profile...</div></div>
  if (!profile) return <NotFoundPage />

  const contributionHeatmap = profile.contributionDays?.reduce((acc: number[][], day: any) => {
    if (acc.length === 0 || acc[acc.length - 1].length === 7) acc.push([day.count])
    else acc[acc.length - 1].push(day.count)
    return acc
  }, []) || []

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      {/* Cover Image Banner */}
      <div className="relative" style={{ height: 280 }}>
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Profile banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a3e 25%, #0d1117 50%, #1a0a2e 75%, #0a1a2e 100%)',
          }} />
        )}
        {/* Subtle star dots on the cover */}
        {!profile.coverUrl && (
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.2), transparent), radial-gradient(1.5px 1.5px at 15% 80%, rgba(251,191,36,0.4), transparent), radial-gradient(1.5px 1.5px at 70% 40%, rgba(251,191,36,0.3), transparent), radial-gradient(1px 1px at 90% 15%, rgba(255,255,255,0.3), transparent)',
          }} />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{
          background: 'linear-gradient(to top, var(--color-canvas-default) 10%, rgba(255,255,255,0) 100%)',
        }} />
      </div>

      <div className="container-lg" style={{ marginTop: -60, position: 'relative', zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[296px_1fr] gap-6">
          {/* Sidebar */}
          <div>
            <div className="sticky top-24" style={{ backgroundColor: 'var(--color-surface-default)', zIndex: 2 }}>
              {/* Avatar with frame */}
              <div className="flex justify-center mb-4">
                <AvatarWithFrame user={profile} size="xl" />
              </div>

              <div className="mb-4">
                <h1 className="text-2xl font-semibold leading-tight flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-fg-default)' }}>
                  {profile.displayName || profile.username}
                  <VerificationBadge badgeColor={profile.badgeColor} size={22} />
                  {profile.isFounder && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ffd700)',
                        color: '#0d1117',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <Crown className="w-3 h-3" strokeWidth={1.5} />
                      FOUNDER
                    </span>
                  )}
                </h1>
                <p className="text-xl" style={{ color: 'var(--color-fg-muted)' }}>@{profile.username}</p>
                {profile.isFounder && profile.title && (
                  <p className="text-sm mt-1 font-medium" style={{ color: '#ffd700' }}>{profile.title}</p>
                )}
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

              {isOwnProfile && (
                <button
                  onClick={() => setShowCustomize(true)}
                  className="btn btn-sm w-full mb-4"
                  style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}
                >
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                  Customize Profile
                </button>
              )}

              {/* Level card — mythic skin for founder */}
              <div
                className="Box p-4 mb-4"
                style={profile.isFounder ? {
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(var(--color-canvas-default), var(--color-canvas-default)), linear-gradient(135deg, #f97316, #ffd700, #f85149, #f97316)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-fg-default)' }}>
                    Level {profile.level}
                    {profile.isFounder && <Flame className="w-3.5 h-3.5" style={{ color: '#f97316' }} strokeWidth={1.5} />}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-counter-bg)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((profile.xp / profile.xpToNext) * 100)}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.8 }} className="h-full rounded-full" style={{ background: profile.isFounder ? 'linear-gradient(90deg, #f97316, #ffd700)' : 'var(--color-success-fg)' }} />
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
                    ['Embers received', repos.reduce((s: number, r: any) => s + (r.starsCount || r.embers?.length || 0), 0).toLocaleString()],
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
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="UnderlineNav mb-4">
              {([['overview', 'Overview'], ['repositories', 'Codexes'], ['achievements', 'Achievements']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} className="UnderlineNav-item" aria-selected={activeTab === key}>{label}</button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {contributionHeatmap.length > 0 && (
                  <StarMap contributions={contributionHeatmap} totalContributions={profile.stats?.contributions || 0} />
                )}

                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-fg-default)' }}>Pinned</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {repos.slice(0, 6).map((repo: any) => (
                      <Link key={repo._id} to={`/codex/${profile.username}/${repo.name}`} className="Box p-4 no-underline" style={{ textDecoration: 'none' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />
                          <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-accent-fg)' }}>
                            {repo.visibility === 'private' && <Lock className="w-3 h-3 shrink-0" strokeWidth={2} style={{ color: 'var(--color-fg-muted)' }} />}
                            {repo.name}
                          </span>
                          <span className="Label" style={{ fontSize: 10, padding: '0 6px', backgroundColor: repo.visibility === 'private' ? 'var(--color-counter-bg)' : 'var(--color-success-muted)', color: repo.visibility === 'private' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)' }}>{repo.visibility}</span>
                        </div>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-fg-muted)' }}>{repo.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                          {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-fg)' }} />{repo.language}</span>}
                          {(repo.starsCount > 0 || repo.embers?.length > 0) && <span>🔥 {repo.starsCount || repo.embers?.length || 0}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="Box" data-testid="repo-list">
                {repos.map((repo: any) => (
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
                {/* Founder-exclusive achievements (seeded from DB) */}
                {profile.isFounder && (
                  [
                    { id: 'genesis', name: 'Genesis', desc: 'Account created at platform birth', icon: '🌟' },
                    { id: 'world-builder', name: 'World Builder', desc: 'Founded CODEHALAAM', icon: '🏗️' },
                    { id: 'mythic-flame', name: 'Mythic Flame', desc: 'Reached Level 50', icon: '🔥' },
                  ].map((ach) => {
                    const unlocked = (profile.achievements || []).find((a: any) => a.id === ach.id)
                    return (
                      <div key={ach.id} className="Box p-4 flex flex-col items-center gap-2 text-center" style={{ borderImage: 'linear-gradient(135deg, #f97316, #ffd700) 1', borderWidth: 1, borderStyle: 'solid' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #f97316, #ffd700)', color: '#0d1117' }}>
                          {ach.icon}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{ach.name}</span>
                        <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{ach.desc}</span>
                        {unlocked && <span className="text-[10px]" style={{ color: '#ffd700' }}>Unlocked {new Date(unlocked.unlockedAt).toLocaleDateString()}</span>}
                      </div>
                    )
                  })
                )}
                {/* Regular achievements */}
                {(profile.achievements || []).filter((a: any) => !profile.isFounder || !['genesis', 'world-builder', 'mythic-flame'].includes(a.id)).map((a: any) => (
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

      {/* Customize Profile Modal */}
      <AnimatePresence>
        {showCustomize && (
          <CustomizeProfileModal
            profile={profile}
            onClose={() => setShowCustomize(false)}
            onSave={(updated) => { setProfile(updated); refreshUser() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CustomizeProfileModal({ profile, onClose, onSave }: { profile: any; onClose: () => void; onSave: (u: any) => void }) {
  const [displayName, setDisplayName] = useState(profile.displayName || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [location, setLocation] = useState(profile.location || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile.website || '')
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || '')
  const [coverPreview, setCoverPreview] = useState(profile.coverUrl || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upload avatar if new file selected — capture real URL from server
      let savedAvatarUrl = profile.avatarUrl
      if (avatarFile) {
        const res = await api.uploadAvatar(avatarFile)
        savedAvatarUrl = res.avatarUrl
        setAvatarPreview(res.avatarUrl)
      }
      // Upload cover if new file selected — capture real URL from server
      let savedCoverUrl = profile.coverUrl
      if (coverFile) {
        const res = await api.uploadCover(coverFile)
        savedCoverUrl = res.coverUrl
        setCoverPreview(res.coverUrl)
      }
      // Update profile fields
      const res = await api.updateProfile({ displayName, bio, location, websiteUrl })
      onSave({ ...profile, ...res.user, avatarUrl: savedAvatarUrl, coverUrl: savedCoverUrl })
      toast.success('Profile updated!')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        className="w-full max-w-lg rounded-xl p-6 overflow-y-auto max-h-[85vh]"
        style={{ backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-fg-default)' }}>Customize Profile</h2>
          <button onClick={onClose} className="btn btn-sm" style={{ color: 'var(--color-fg-muted)' }}><X className="w-4 h-4" /></button>
        </div>

        {/* Cover preview */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-fg-default)' }}>Banner</label>
          <div
            className="relative rounded-lg overflow-hidden cursor-pointer group"
            style={{ height: 120, backgroundColor: 'var(--color-canvas-subtle)' }}
            onClick={() => coverInput.current?.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-fg-muted)' }}>
                <Upload className="w-6 h-6" strokeWidth={1.5} /> <span className="ml-2 text-sm">Click to upload banner</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]
            if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
          }} />
        </div>

        {/* Avatar preview */}
        <div className="mb-4 flex items-center gap-4">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group flex-shrink-0"
            style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '3px solid var(--color-border-default)' }}
            onClick={() => avatarInput.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--color-fg-muted)' }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
              <Upload className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]
            if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
          }} />
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>Profile Photo</div>
            <div className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Click image to upload</div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-fg-default)' }}>Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" className="form-control w-full" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)', padding: '8px 12px', borderRadius: 6 }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-fg-default)' }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself" rows={3} maxLength={160} className="form-control w-full" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)', padding: '8px 12px', borderRadius: 6, resize: 'none' }} />
            <div className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>{bio.length}/160</div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-fg-default)' }}>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className="form-control w-full" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)', padding: '8px 12px', borderRadius: 6 }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-fg-default)' }}>Website</label>
            <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." className="form-control w-full" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)', padding: '8px 12px', borderRadius: 6 }} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn btn-sm" style={{ border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

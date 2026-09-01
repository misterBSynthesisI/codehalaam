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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, Sparkles, CheckCircle2, Wrench, Zap, Rocket, Clock, Code2, ArrowRight, Package } from 'lucide-react'

type TabId = 'coming-soon' | 'in-progress' | 'current'

interface ChangeItem {
  text: string
  type: 'added' | 'fixed' | 'changed'
}

interface VersionData {
  version: string
  date: string
  codename: string
  changes: ChangeItem[]
}

const COMING_SOON: VersionData = {
  version: 'v2.0',
  date: 'Q4 2026',
  codename: 'Forge',
  changes: [
    { text: 'Email integration — transactional emails via Resend (signup verification, password reset, notifications)', type: 'added' },
    { text: 'Codex analytics dashboard — view counts, visitor stats, contribution graphs', type: 'added' },
    { text: 'API rate limiting — protect endpoints from abuse with tiered rate limits', type: 'added' },
    { text: 'Webhook system — trigger external services on events (push, PR, quest)', type: 'added' },
    { text: 'Advanced search — full-text search across codexes, users, forum posts', type: 'added' },
    { text: 'Mobile app — React Native companion for notifications and quick actions', type: 'added' },
  ],
}

const IN_PROGRESS: VersionData = {
  version: 'v1.5',
  date: 'September 2026',
  codename: 'Ascend',
  changes: [
    { text: 'Developer documentation site — browsable docs with code examples and API reference', type: 'added' },
    { text: 'Codex insights — view counts, popular files, contributor stats', type: 'added' },
    { text: 'Forum search and tag filtering — find topics faster', type: 'added' },
    { text: 'Admin dashboard charts — visual XP distribution and activity graphs', type: 'added' },
    { text: 'Batch operations — bulk manage users, codexes, and forum posts from admin', type: 'added' },
    { text: 'Improved mobile navigation — bottom tab bar for key actions', type: 'changed' },
  ],
}

const CURRENT_VERSION: VersionData = {
  version: 'v1.4.0',
  date: 'September 1, 2026',
  codename: 'Rise',
  changes: [
    { text: 'Demo mode — read-only browsing for unregistered users with server-side enforcement', type: 'added' },
    { text: 'Admin forum management — pin, close, and delete forum posts from Control Room', type: 'added' },
    { text: 'Codex file tree preview — expandable file tree on codex homepage', type: 'added' },
    { text: 'Site-wide footer — navigation links and branding, editable from admin', type: 'added' },
    { text: 'Admin logo — uploaded logo now displays in navbar and footer', type: 'fixed' },
    { text: 'Mobile codex hero — centered layout with contrast-aware text over cover images', type: 'fixed' },
    { text: 'Profile 404 page — invalid usernames show proper error page', type: 'fixed' },
    { text: 'Database performance — lean queries, connection pooling, composite indexes', type: 'changed' },
    { text: 'Admin terminology — Repositories → Codexes, Stars → Embers, Forks → Echoes', type: 'changed' },
  ],
}

const PREVIOUS_VERSIONS: VersionData[] = [
  {
    version: 'v1.3.3',
    date: 'September 1, 2026',
    codename: 'Shield',
    changes: [
      { text: 'Auth persistence — login state no longer flickers on page refresh', type: 'fixed' },
      { text: 'Demo login — quick login button now works correctly', type: 'fixed' },
      { text: 'Verified badges — appear on dashboard, crew sidebar, and profile', type: 'added' },
      { text: 'Navbar avatars — show profile pictures instead of initials', type: 'changed' },
    ],
  },
  {
    version: 'v1.3.2',
    date: 'September 1, 2026',
    codename: 'Anchor',
    changes: [
      { text: 'Vercel setup — health endpoint now probes DB connection on cold starts', type: 'fixed' },
      { text: 'Setup page — no longer stuck on "Database Not Connected"', type: 'fixed' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'August 31, 2026',
    codename: 'Beacon',
    changes: [
      { text: 'Full admin dashboard — user management, badge assignment, platform stats', type: 'added' },
      { text: 'Demo login endpoint — auto-creates demo user on fresh deployments', type: 'added' },
      { text: 'Vercel Blob uploads — persistent file storage up to 30MB', type: 'added' },
      { text: 'Site settings — admin can customize logo, favicon, site name, and meta tags', type: 'added' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'August 31, 2026',
    codename: 'Foundation',
    changes: [
      { text: 'Error pages — GitHub-style 400/401/403/404/500/503 pages', type: 'added' },
      { text: 'SEO & AEO — OpenGraph, Twitter Cards, JSON-LD structured data', type: 'added' },
      { text: 'Forum — community Q&A with voting, accepted answers, tags', type: 'added' },
      { text: 'Codex storefront — cover photos, logos, taglines, technology badges', type: 'added' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'August 30, 2026',
    codename: 'Spark',
    changes: [
      { text: 'Version Barry — gamified codex home, code workspace, quests & offerings', type: 'added' },
      { text: 'Centralized permissions — canViewCodex, canEditCodex, canDeleteCodex', type: 'added' },
      { text: 'Private codexes — return 404 (not 403) to prevent existence leaks', type: 'added' },
      { text: 'Verified badges — blue/red/black badge system with admin management', type: 'added' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'August 30, 2026',
    codename: 'Genesis',
    changes: [
      { text: 'Initial launch — codexes, quests, offerings, paths, releases, collaborators', type: 'added' },
      { text: 'Gamification — XP system, levels, achievements, streaks, contribution heatmap', type: 'added' },
      { text: 'Design system — GitHub Primer + Apple fluid motion, dark/light themes', type: 'added' },
      { text: 'Command palette — Cmd+K global search and navigation', type: 'added' },
      { text: 'Notification system — real-time bell with in-app notifications', type: 'added' },
    ],
  },
]

const sectionConfig: Record<string, { icon: any; color: string }> = {
  added: { icon: Sparkles, color: 'var(--color-success-fg)' },
  fixed: { icon: Wrench, color: 'var(--color-accent-fg)' },
  changed: { icon: Zap, color: 'var(--color-attention-fg)' },
}

const typeLabels: Record<string, string> = {
  added: 'New',
  fixed: 'Fixed',
  changed: 'Changed',
}

export function ChangelogPage() {
  const [activeTab, setActiveTab] = useState<TabId>('current')

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'coming-soon', label: 'Coming Soon', icon: <Rocket className="w-4 h-4" /> },
    { id: 'in-progress', label: 'In Progress', icon: <Clock className="w-4 h-4" /> },
    { id: 'current', label: 'Current Release', icon: <Package className="w-4 h-4" /> },
  ]

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-8 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ScrollText className="w-7 h-7" style={{ color: 'var(--color-accent-fg)' }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>Changelog</h1>
          </div>
          <p className="text-sm ml-10" style={{ color: 'var(--color-fg-muted)' }}>
            Track every update, fix, and improvement to CODEHALAAM.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'coming-soon' && (
            <motion.div key="coming-soon" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <VersionCard data={COMING_SOON} accent="var(--color-done-fg)" badge="ROADMAP" />
            </motion.div>
          )}
          {activeTab === 'in-progress' && (
            <motion.div key="in-progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <VersionCard data={IN_PROGRESS} accent="var(--color-attention-fg)" badge="BUILDING" />
            </motion.div>
          )}
          {activeTab === 'current' && (
            <motion.div key="current" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <VersionCard data={CURRENT_VERSION} accent="var(--color-success-fg)" badge="LATEST" />
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                  <Code2 className="w-5 h-5" style={{ color: 'var(--color-fg-muted)' }} />
                  Previous Releases
                </h2>
                <div className="space-y-4">
                  {PREVIOUS_VERSIONS.map((v, i) => (
                    <motion.div key={v.version} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <VersionCard data={v} compact />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function VersionCard({ data, accent, badge, compact }: { data: VersionData; accent?: string; badge?: string; compact?: boolean }) {
  // Group changes by type
  const grouped = data.changes.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = []
    acc[c.type].push(c.text)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="Box" style={{ borderColor: accent ? `${accent}33` : undefined }}>
      <div className="flex items-center justify-between" style={{ padding: compact ? '12px 16px' : '16px 20px', borderBottom: compact ? 'none' : '1px solid var(--color-border-default)' }}>
        <div className="flex items-center gap-3">
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
              {badge}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold`} style={{ color: 'var(--color-fg-default)' }}>
                {data.version}
              </h3>
              <span className={`text-xs italic`} style={{ color: 'var(--color-fg-subtle)' }}>"{data.codename}"</span>
            </div>
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{data.date}</span>
      </div>
      <div style={{ padding: compact ? '12px 16px' : '16px 20px' }}>
        <div className="space-y-3">
          {Object.entries(grouped).map(([type, items]) => {
            const cfg = sectionConfig[type] || sectionConfig.changed
            const Icon = cfg.icon
            return (
              <div key={type}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{typeLabels[type] || type}</span>
                </div>
                <div className="space-y-1 ml-5">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fg-muted)' }} />
                      <span className={`${compact ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--color-fg-default)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

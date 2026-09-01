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
import { motion } from 'framer-motion'
import { ScrollText, Sparkles, CheckCircle2, Wrench, Zap } from 'lucide-react'
import { api } from '@/lib/api'

interface ChangelogVersion {
  version: string
  date: string
  status: 'upcoming' | 'released'
  sections: { type: string; items: string[] }[]
}

export function ChangelogPage() {
  const [versions, setVersions] = useState<ChangelogVersion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the raw CHANGELOG.md from the repo
    fetch('https://raw.githubusercontent.com/misterBSynthesisI/codehalaam/main/CHANGELOG.md')
      .then(res => res.text())
      .then(text => {
        setVersions(parseChangelog(text))
        setLoading(false)
      })
      .catch(() => {
        // Fallback: try API
        api.request<any>('/changelog').catch(() => {})
        setLoading(false)
      })
  }, [])

  function parseChangelog(md: string): ChangelogVersion[] {
    const versions: ChangelogVersion[] = []
    const sections = md.split(/^## /m).slice(1)

    for (const section of sections) {
      const lines = section.trim().split('\n')
      const header = lines[0].trim()
      const isUpcoming = header.includes('Upcoming') || header.includes('in progress')
      const versionMatch = header.match(/v?([\d.]+)/)
      const dateMatch = header.match(/\((\d{4}-\d{2}-\d{2})\)/)

      const subsections: { type: string; items: string[] }[] = []
      let currentType = ''
      let currentItems: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('### ')) {
          if (currentType) subsections.push({ type: currentType, items: currentItems })
          currentType = line.slice(4).trim()
          currentItems = []
        } else if (line.startsWith('- ')) {
          currentItems.push(line.slice(2))
        }
      }
      if (currentType) subsections.push({ type: currentType, items: currentItems })

      versions.push({
        version: versionMatch ? `v${versionMatch[1]}` : header,
        date: dateMatch ? dateMatch[1] : isUpcoming ? 'Upcoming' : '',
        status: isUpcoming ? 'upcoming' : 'released',
        sections: subsections,
      })
    }

    return versions
  }

  const sectionIcon: Record<string, any> = {
    Added: Sparkles,
    Fixed: Wrench,
    Changed: Zap,
    '': CheckCircle2,
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <ScrollText className="w-6 h-6" style={{ color: 'var(--color-accent-fg)' }} />
          <h1 className="text-2xl font-semibold">Changelog</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading changelog...</div>
        ) : (
          <div className="space-y-6">
            {versions.map((version, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="Box"
              >
                <div className="Box-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {version.status === 'upcoming' ? (
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'var(--color-attention-subtle)', color: 'var(--color-attention-fg)' }}>
                      🔜 UPCOMING
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'var(--color-success-subtle)', color: 'var(--color-success-fg)' }}>
                      ✅ RELEASED
                    </span>
                  )}
                  <h2 className="Box-title text-base">{version.version}</h2>
                  {version.date && version.date !== 'Upcoming' && (
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{version.date}</span>
                  )}
                </div>
                <div className="Box-body space-y-4">
                  {version.sections.map((section, si) => {
                    const Icon = sectionIcon[section.type] || CheckCircle2
                    return (
                      <div key={si}>
                        {section.type && (
                          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-fg-muted)' }}>
                            <Icon className="w-3.5 h-3.5" /> {section.type}
                          </h3>
                        )}
                        <ul className="space-y-1">
                          {section.items.map((item, ii) => (
                            <li key={ii} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-fg-default)' }}>
                              <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-fg-muted)' }} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

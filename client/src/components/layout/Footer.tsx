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

import { Link } from 'react-router-dom'
import { useSiteSettingsContext } from '@/contexts/SiteSettingsContext'
import { Download } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  const settings = useSiteSettingsContext()

  return (
    <footer
      className="border-t"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-canvas-subtle)',
      }}
    >
      <div
        className="mx-auto px-4 py-8"
        style={{ maxWidth: 1400 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-fg-default)' }}>
              Product
            </h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Dashboard</Link></li>
              <li><Link to="/new" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>New Codex</Link></li>
              <li><Link to="/getting-started" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Getting Started</Link></li>
              <li><Link to="/changelog" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Changelog</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-fg-default)' }}>
              Community
            </h4>
            <ul className="space-y-2">
              <li><Link to="/forum" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Forum</Link></li>
              <li><Link to="/docs" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Documentation</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-fg-default)' }}>
              Resources
            </h4>
            <ul className="space-y-2">
              <li><Link to="/getting-started" className="text-xs no-underline hover:underline" style={{ color: 'var(--color-fg-muted)' }}>Quick Start</Link></li>
              <li>
                <Link
                  to="/JustShipItAI"
                  className="text-xs no-underline hover:underline inline-flex items-center gap-1"
                  style={{ color: 'var(--color-fg-muted)' }}
                >
                  <Download className="w-3 h-3" /> Download Source
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-fg-default)' }}>
              Legal
            </h4>
            <ul className="space-y-2">
              <li><span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>© {year} {settings?.siteName || 'CODEHALAAM'}</span></li>
              <li><span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>All rights reserved</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-4 w-auto object-contain" />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: 'var(--color-fg-muted)' }}>
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            )}
            <span className="text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>{settings?.siteName || 'CODEHALAAM'}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>
            {settings?.footerText || 'A gamified, immersive alternative to GitHub'}
          </p>
        </div>
      </div>
    </footer>
  )
}

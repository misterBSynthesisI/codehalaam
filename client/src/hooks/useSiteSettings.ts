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

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface SiteSettings {
  siteName: string
  tagline: string
  logoUrl: string
  faviconUrl: string
  ogImageUrl: string
  description: string
  footerText: string
  signupEnabled: boolean
  maintenanceMode: boolean
}

/**
 * Fetches site settings on mount and applies branding dynamically:
 * - Sets the document title
 * - Sets the favicon (overrides the <link id="favicon-link"> in index.html)
 * - Sets the meta description tag
 * - Sets the og:image tag
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    let cancelled = false

    api.getSettings().then(({ settings }) => {
      if (cancelled) return
      setSettings(settings)

      // Apply favicon dynamically
      if (settings.faviconUrl) {
        const link = document.getElementById('favicon-link') as HTMLLinkElement
        if (link) link.href = settings.faviconUrl
      }

      // Apply document title
      if (settings.siteName) {
        document.title = `${settings.siteName} — ${settings.tagline || 'Code Hosting'}`
      }

      // Apply meta description
      if (settings.description) {
        const meta = document.getElementById('meta-description') as HTMLMetaElement
        if (meta) meta.content = settings.description
      }

      // Apply og:image
      if (settings.ogImageUrl) {
        const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
        if (ogImage) ogImage.content = settings.ogImageUrl
      }
    }).catch(() => {
      // Settings API unreachable — fall back to defaults in index.html
    })

    return () => { cancelled = true }
  }, [])

  return settings
}

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

import { createContext, useContext, useState, useEffect } from 'react'
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

const SiteSettingsContext = createContext<SiteSettings | null>(null)

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    api.getSettings().then(({ settings }) => {
      setSettings(settings)

      // Apply favicon
      if (settings.faviconUrl) {
        const link = document.getElementById('favicon-link') as HTMLLinkElement
        if (link) link.href = settings.faviconUrl
      }
      // Apply title
      if (settings.siteName) {
        document.title = `${settings.siteName} — ${settings.tagline || 'Code Hosting'}`
      }
      // Apply meta
      if (settings.description) {
        const meta = document.getElementById('meta-description') as HTMLMetaElement
        if (meta) meta.content = settings.description
      }
      if (settings.ogImageUrl) {
        const og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
        if (og) og.content = settings.ogImageUrl
      }
    }).catch(() => {})
  }, [])

  // Expose a refresh function
  const refreshSettings = () => {
    api.getSettings().then(({ settings }) => setSettings(settings)).catch(() => {})
  }

  return (
    <SiteSettingsContext.Provider value={settings ? { ...settings, refreshSettings } as any : null}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext)
}

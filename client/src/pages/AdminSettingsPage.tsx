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
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Upload, Save, ArrowLeft, Check, Image as ImageIcon } from 'lucide-react'
import { api } from '@/lib/api'

export function AdminSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { settings } = await api.getSettings()
      setSettings(settings)
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { settings: updated } = await api.updateSettings({
        siteName: settings.siteName,
        tagline: settings.tagline,
        description: settings.description,
        footerText: settings.footerText,
        signupEnabled: settings.signupEnabled,
        maintenanceMode: settings.maintenanceMode,
      })
      setSettings(updated)
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const { settings: updated } = await api.uploadLogo(file)
      setSettings(updated)
      setSuccess('Logo updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const { settings: updated } = await api.uploadFavicon(file)
      setSettings(updated)
      setSuccess('Favicon updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload favicon')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}>
        <span style={{ color: 'var(--color-fg-muted)' }}>Loading…</span>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="p-1.5 rounded" style={{ color: 'var(--color-fg-muted)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Settings className="w-5 h-5" style={{ color: 'var(--color-accent-fg)' }} />
          <h1 className="text-lg font-semibold">Site Settings</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-md text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--color-success-subtle)', color: 'var(--color-success-fg)' }}>
            <Check className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Branding section */}
        <div className="Box mb-4">
          <div className="Box-header">
            <h2 className="Box-title flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4" /> Branding</h2>
          </div>
          <div className="Box-body space-y-6">
            {/* Logo upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)' }}>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" style={{ color: 'var(--color-accent-fg)' }}>
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                )}
              </div>
              <div>
                <button onClick={() => logoInputRef.current?.click()} className="btn btn-default btn-sm inline-flex items-center gap-1.5">
                  <Upload className="w-3 h-3" /> Upload Logo
                </button>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" />
                <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>PNG, JPG, SVG, or WebP. Max 2MB.</p>
              </div>
            </div>

            {/* Favicon upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)' }}>
                {settings.faviconUrl ? (
                  <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ color: 'var(--color-accent-fg)' }}>
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                )}
              </div>
              <div>
                <button onClick={() => faviconInputRef.current?.click()} className="btn btn-default btn-sm inline-flex items-center gap-1.5">
                  <Upload className="w-3 h-3" /> Upload Favicon
                </button>
                <input ref={faviconInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/x-icon" onChange={handleFaviconUpload} className="hidden" />
                <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>PNG, JPG, SVG, or ICO. Max 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* General settings */}
        <div className="Box mb-4">
          <div className="Box-header">
            <h2 className="Box-title text-sm">General</h2>
          </div>
          <div className="Box-body space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input type="text" value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="form-control" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input type="text" value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="form-control" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description (SEO)</label>
              <textarea value={settings.description || ''} onChange={(e) => setSettings({ ...settings, description: e.target.value })} className="form-control" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Footer Text</label>
              <input type="text" value={settings.footerText || ''} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="form-control" />
            </div>
          </div>
        </div>

        {/* Feature flags */}
        <div className="Box mb-4">
          <div className="Box-header">
            <h2 className="Box-title text-sm">Platform</h2>
          </div>
          <div className="Box-body space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium">Allow new signups</span>
                <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>When disabled, the signup form is hidden.</p>
              </div>
              <input type="checkbox" checked={settings.signupEnabled ?? true} onChange={(e) => setSettings({ ...settings, signupEnabled: e.target.checked })} className="form-checkbox" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium">Maintenance mode</span>
                <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>When enabled, non-admin users see a 503 page.</p>
              </div>
              <input type="checkbox" checked={settings.maintenanceMode ?? false} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} className="form-checkbox" />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

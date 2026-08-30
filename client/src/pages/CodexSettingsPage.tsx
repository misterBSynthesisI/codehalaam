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
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, ChevronRight, Save, Trash2, Globe, Palette, Lock, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function CodexSettingsPage() {
  const { owner: ownerParam, name } = useParams()
  const owner = ownerParam || ''
  const navigate = useNavigate()
  const { user } = useAuth()

  const [repo, setRepo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // General fields
  const [description, setDescription] = useState('')
  const [tagline, setTagline] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#58a6ff')
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')

  // Visibility
  const [isPrivate, setIsPrivate] = useState(false)

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!owner || !name) return
    api.getCodex(owner, name).then(data => {
      setRepo(data.repo)
      setDescription(data.repo.description || '')
      setTagline(data.repo.tagline || '')
      setWebsiteUrl(data.repo.websiteUrl || '')
      setAccentColor(data.repo.accentColor || '#58a6ff')
      setTechnologies(data.repo.technologies || [])
      setIsPrivate(data.repo.visibility === 'private')
    }).finally(() => setLoading(false))
  }, [owner, name])

  const isOwner = user?.username === owner

  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      await api.updateCodex(owner, name, { description, tagline, websiteUrl, accentColor, technologies })
      toast.success('Settings saved!')
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleSaveVisibility = async () => {
    setSaving(true)
    try {
      await api.updateRepo(owner, name, { visibility: isPrivate ? 'private' : 'public' })
      toast.success('Visibility updated!')
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (deleteConfirmName !== name) return
    setDeleting(true)
    try {
      await api.deleteRepo(owner, name)
      navigate('/dashboard')
    } catch (err: any) { toast.error(err.message); setDeleting(false) }
  }

  const addTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput('')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div></div>
  if (!repo) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Codex not found</div></div>
  if (!isOwner) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Only the owner can access settings</div></div>

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      <div className="container-lg py-4">
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{owner}/{name}</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <span style={{ color: 'var(--color-fg-muted)' }}>Settings</span>
        </div>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
          <Settings className="w-5 h-5" strokeWidth={1.5} /> Codex Settings
        </h1>

        <div className="max-w-2xl space-y-6">
          {/* General */}
          <div className="Box">
            <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
              <Globe className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-fg-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>General</span>
            </div>
            <div className="Box-body space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-control text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Tagline</label>
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="A short tagline" className="form-control text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Website URL</label>
                <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." className="form-control text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Technologies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {technologies.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
                      {t}
                      <button onClick={() => setTechnologies(technologies.filter(x => x !== t))} className="hover:text-danger-fg cursor-pointer" style={{ color: 'var(--color-fg-muted)' }}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="Add technology..." className="form-control text-sm flex-1" />
                  <button onClick={addTech} className="btn btn-sm btn-default">Add</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" style={{ border: '1px solid var(--color-border-default)' }} />
                  <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="form-control text-sm flex-1" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveGeneral} disabled={saving} className="btn btn-sm btn-primary">
                  <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="Box">
            <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
              <Lock className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-fg-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Visibility</span>
            </div>
            <div className="Box-body space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-fg-default)' }}>
                  <input type="radio" checked={!isPrivate} onChange={() => setIsPrivate(false)} /> Public
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-fg-default)' }}>
                  <input type="radio" checked={isPrivate} onChange={() => setIsPrivate(true)} /> Private
                </label>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {isPrivate ? 'Only you and collaborators can see this codex.' : 'Anyone can see this codex.'}
              </p>
              <div className="flex justify-end">
                <button onClick={handleSaveVisibility} disabled={saving} className="btn btn-sm btn-primary">
                  <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="Box" style={{ borderColor: 'var(--color-danger-fg)' }}>
            <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-danger-muted)' }}>
              <AlertTriangle className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-danger-fg)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-danger-fg)' }}>Danger Zone</span>
            </div>
            <div className="Box-body space-y-3">
              <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Once you delete this codex, there is no going back. Please be certain.</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-sm" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)', border: '1px solid var(--color-danger-fg)' }}>
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Delete this codex
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Type <strong>{name}</strong> to confirm deletion:</p>
                  <input type="text" value={deleteConfirmName} onChange={e => setDeleteConfirmName(e.target.value)} className="form-control text-sm" placeholder={name} />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmName('') }} className="btn btn-sm btn-default">Cancel</button>
                    <button onClick={handleDelete} disabled={deleteConfirmName !== name || deleting} className="btn btn-sm" style={{ backgroundColor: 'var(--color-danger-fg)', color: '#fff', opacity: deleteConfirmName !== name ? 0.5 : 1 }}>
                      {deleting ? 'Deleting...' : 'Delete forever'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

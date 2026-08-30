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

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tag, ChevronRight, Plus, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function ReleaseListPage() {
  const { owner: ownerParam, name } = useParams()
  const owner = ownerParam || ''
  const { user } = useAuth()

  const [releases, setReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tagName, setTagName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!owner || !name) return
    api.getReleases(owner, name).then(d => setReleases(d.releases || [])).finally(() => setLoading(false))
  }, [owner, name])

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }
  }, [toast])

  const handleCreate = useCallback(async () => {
    if (!tagName.trim() || !title.trim() || creating) return
    setCreating(true)
    try {
      const { release } = await api.createRelease(owner, name, { tagName, title, body })
      setReleases(prev => [release, ...prev])
      setShowCreate(false)
      setTagName(''); setTitle(''); setBody('')
      setToast({ message: `Release ${tagName} created`, type: 'success' })
    } catch (err: any) { setToast({ message: err.message, type: 'error' }) }
    finally { setCreating(false) }
  }, [owner, name, tagName, title, body, creating])

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-14 right-4 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.type === 'success' ? 'var(--color-success-fg)' : 'var(--color-danger-fg)', color: '#fff' }}>
          {toast.message}
        </motion.div>
      )}

      <div className="container-lg py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{owner}/{name}</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <span style={{ color: 'var(--color-fg-muted)' }}>Releases</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-fg-default)' }}>Releases</h1>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-sm btn-primary">
              {showCreate ? <><X className="w-3 h-3" strokeWidth={1.5} /> Cancel</> : <><Plus className="w-3 h-3" strokeWidth={1.5} /> New Release</>}
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="Box mb-6">
            <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Create a new release</h3>
            </div>
            <div className="Box-body space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Tag name</label>
                <input type="text" value={tagName} onChange={e => setTagName(e.target.value)} placeholder="v1.0.0" className="form-control text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Release title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Version 1.0.0" className="form-control text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Description (Markdown)</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Release notes..." className="form-control text-sm resize-none" rows={6}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
              </div>
              <div className="flex justify-end">
                <button onClick={handleCreate} disabled={!tagName.trim() || !title.trim() || creating} className="btn btn-sm btn-primary">
                  {creating ? 'Creating...' : 'Create release'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Release list */}
        <div className="space-y-4">
          {releases.map((r: any, i: number) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3, delay: i * 0.05 }}>
              <div className="Box">
                <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <Tag className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-success-fg)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{r.tagName}</span>
                  <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>— {r.title}</span>
                </div>
                <div className="Box-body">
                  {r.body ? (
                    <div className="markdown-body text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.body}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>No description provided.</p>
                  )}
                  <div className="mt-3 text-xs flex items-center gap-2" style={{ color: 'var(--color-fg-subtle)' }}>
                    <span>Published {new Date(r.createdAt).toLocaleDateString()}</span>
                    {r.author && <span>by {r.author.username}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {!loading && releases.length === 0 && (
            <div className="Box">
              <div className="Box-body text-center py-8">
                <Tag className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
                <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>No releases yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

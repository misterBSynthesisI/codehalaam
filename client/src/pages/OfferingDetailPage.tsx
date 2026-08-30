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
import { GitPullRequest, Check, ChevronRight, Send, MessageSquare, GitMerge } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { VerificationBadge } from '@/components/ui/UserBadge'

export function OfferingDetailPage() {
  const { owner: ownerParam, name, number } = useParams()
  const owner = ownerParam || ''
  const { user } = useAuth()

  const [offering, setOffering] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [binding, setBinding] = useState(false)
  const [closing, setClosing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!owner || !name || !number) return
    api.getOffering(owner, name, parseInt(number)).then(data => {
      setOffering(data.offering)
      setComments(data.comments || [])
    }).finally(() => setLoading(false))
  }, [owner, name, number])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }
  }, [toast])

  const handleComment = useCallback(async () => {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const { comment } = await api.addOfferingComment(owner, name, parseInt(number), commentText)
      setComments(prev => [...prev, comment])
      setCommentText('')
    } catch (err: any) { alert(err.message) }
    finally { setSubmitting(false) }
  }, [owner, name, number, commentText, submitting])

  const handleBind = useCallback(async () => {
    if (!offering || binding) return
    setBinding(true)
    try {
      const data = await api.bindOffering(owner, name, parseInt(number))
      setOffering(data.offering)
      setToast({ message: data.gitBound ? 'Offering bound successfully!' : 'Offering marked as Bound', type: 'success' })
    } catch (err: any) { setToast({ message: err.message, type: 'error' }) }
    finally { setBinding(false) }
  }, [offering, owner, name, number, binding])

  const handleClose = useCallback(async () => {
    if (!offering || closing) return
    setClosing(true)
    try {
      const { offering: updated } = await api.updateOffering(owner, name, parseInt(number), { status: 'Closed' })
      setOffering(updated)
    } catch (err: any) { alert(err.message) }
    finally { setClosing(false) }
  }, [offering, owner, name, number, closing])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div></div>
  if (!offering) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Offering not found</div></div>

  const isOpen = offering.status === 'Open'
  const isBound = offering.status === 'Bound'

  const statusColor = isBound ? 'var(--color-done-fg)' : isOpen ? 'var(--color-success-fg)' : 'var(--color-fg-muted)'

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed top-14 right-4 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.type === 'success' ? 'var(--color-success-fg)' : 'var(--color-danger-fg)', color: '#fff' }}>
          {toast.message}
        </motion.div>
      )}

      <div className="container-lg py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{owner}/{name}</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>Offerings</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <span style={{ color: 'var(--color-fg-muted)' }}>#{offering.number}</span>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
              <GitPullRequest className="w-5 h-5" strokeWidth={1.5} style={{ color: statusColor }} />
              {offering.title}
              <span className="text-sm font-normal px-2 py-0.5 rounded" style={{
                backgroundColor: isBound ? 'rgba(163, 113, 247, 0.15)' : isOpen ? 'rgba(63, 185, 80, 0.15)' : 'rgba(139, 148, 158, 0.15)',
                color: statusColor,
              }}>
                {offering.status}
              </span>
            </h1>
            <p className="text-sm mt-1 flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
              #{offering.number} opened by <span className="flex items-center gap-1">{offering.author?.displayName || offering.author?.username}<VerificationBadge badgeColor={offering.author?.badgeColor} size={13} /></span> · {new Date(offering.createdAt).toLocaleDateString()}
            </p>
          </div>
          {user && isOpen && (
            <div className="flex items-center gap-2 shrink-0">
              <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={handleBind} disabled={binding} className="btn btn-sm btn-primary">
                <GitMerge className="w-3.5 h-3.5" strokeWidth={1.5} /> {binding ? 'Binding...' : 'Bind'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={handleClose} disabled={closing} className="btn btn-sm btn-default">
                <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> {closing ? 'Closing...' : 'Close'}
              </motion.button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
          <div>
            {/* Body */}
            {offering.body && (
              <div className="Box mb-4">
                <div className="Box-body markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{offering.body}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Path info */}
            <div className="Box mb-4">
              <div className="Box-body text-sm">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-accent-fg)' }}>{offering.sourcePath}</span>
                  <span style={{ color: 'var(--color-fg-subtle)' }}>→</span>
                  <span className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-success-fg)' }}>{offering.targetPath}</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} /> Comments ({comments.length})
              </h3>

              {comments.map((c: any, i: number) => (
                <motion.div key={c._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3, delay: i * 0.05 }}>
                  <div className="Box">
                    <div className="Box-header flex items-center gap-2 text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                      <Link to={`/${c.author?.username}`} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium no-underline" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>
                        {c.author?.username?.charAt(0).toUpperCase()}
                      </Link>
                      <Link to={`/${c.author?.username}`} className="no-underline hover:underline font-semibold flex items-center gap-1" style={{ color: 'var(--color-accent-fg)' }}>{c.author?.displayName || c.author?.username}<VerificationBadge badgeColor={c.author?.badgeColor} size={12} /></Link>
                      <span style={{ color: 'var(--color-fg-subtle)' }}>· {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="Box-body markdown-body text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}

              {user && isOpen && (
                <div className="Box">
                  <div className="Box-body">
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Leave a comment... (supports Markdown)" className="form-control resize-none" rows={4}
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }} />
                    <div className="flex justify-end mt-2">
                      <button onClick={handleComment} disabled={!commentText.trim() || submitting} className="btn btn-sm btn-primary">
                        <Send className="w-3 h-3" strokeWidth={1.5} /> {submitting ? 'Sending...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="Box">
              <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Details</h3>
              </div>
              <div className="Box-body text-xs space-y-2" style={{ color: 'var(--color-fg-muted)' }}>
                <p><strong>Status:</strong> {offering.status}</p>
                <p><strong>Author:</strong> <span className="flex items-center gap-1 inline-flex">{offering.author?.displayName || offering.author?.username}<VerificationBadge badgeColor={offering.author?.badgeColor} size={12} /></span></p>
                <p><strong>Source:</strong> <code style={{ backgroundColor: 'var(--color-canvas-subtle)', padding: '1px 4px', borderRadius: 3 }}>{offering.sourcePath}</code></p>
                <p><strong>Target:</strong> <code style={{ backgroundColor: 'var(--color-canvas-subtle)', padding: '1px 4px', borderRadius: 3 }}>{offering.targetPath}</code></p>
                <p><strong>Created:</strong> {new Date(offering.createdAt).toLocaleDateString()}</p>
                {offering.boundAt && <p><strong>Bound:</strong> {new Date(offering.boundAt).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
import { AlertCircle, Check, ChevronRight, Send, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function QuestDetailPage() {
  const { owner: ownerParam, name, number } = useParams()
  const owner = ownerParam || ''
  const { user } = useAuth()

  const [quest, setQuest] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!owner || !name || !number) return
    api.getQuest(owner, name, parseInt(number)).then(data => {
      setQuest(data.quest)
      setComments(data.comments || [])
    }).finally(() => setLoading(false))
  }, [owner, name, number])

  const handleComment = useCallback(async () => {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const { comment } = await api.addQuestComment(owner, name, parseInt(number), commentText)
      setComments(prev => [...prev, comment])
      setCommentText('')
    } catch (err: any) { alert(err.message) }
    finally { setSubmitting(false) }
  }, [owner, name, number, commentText, submitting])

  const handleToggleStatus = useCallback(async () => {
    if (!quest || toggling) return
    setToggling(true)
    const newStatus = quest.status === 'Closed' ? 'Open' : 'Closed'
    try {
      const { quest: updated } = await api.updateQuest(owner, name, parseInt(number), { status: newStatus })
      setQuest(updated)
    } catch (err: any) { alert(err.message) }
    finally { setToggling(false) }
  }, [quest, owner, name, number, toggling])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div></div>
  if (!quest) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Quest not found</div></div>

  const isOpen = quest.status !== 'Closed'

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      <div className="container-lg py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{owner}/{name}</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <Link to={`/codex/${owner}/${name}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>Quests</Link>
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          <span style={{ color: 'var(--color-fg-muted)' }}>#{quest.number}</span>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
              {quest.title}
              <span className="text-sm font-normal px-2 py-0.5 rounded" style={{
                backgroundColor: isOpen ? 'rgba(63, 185, 80, 0.15)' : 'rgba(163, 113, 247, 0.15)',
                color: isOpen ? 'var(--color-success-fg)' : 'var(--color-done-fg)',
              }}>
                {quest.status}
              </span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-fg-muted)' }}>
              #{quest.number} opened by {quest.author?.displayName || quest.author?.username} · {new Date(quest.createdAt).toLocaleDateString()}
              {quest.bountyXp > 0 && <span className="ml-2">⚡ {quest.bountyXp} XP bounty</span>}
            </p>
          </div>
          {user && (
            <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={handleToggleStatus} disabled={toggling} className="btn btn-sm btn-default shrink-0">
              {toggling ? '...' : isOpen ? <><Check className="w-4 h-4" strokeWidth={1.5} /> Close</> : <><AlertCircle className="w-4 h-4" strokeWidth={1.5} /> Reopen</>}
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
          <div>
            {/* Body */}
            {quest.body && (
              <div className="Box mb-4">
                <div className="Box-body markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{quest.body}</ReactMarkdown>
                </div>
              </div>
            )}

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
                      <Link to={`/${c.author?.username}`} className="no-underline hover:underline font-semibold" style={{ color: 'var(--color-accent-fg)' }}>{c.author?.displayName || c.author?.username}</Link>
                      <span style={{ color: 'var(--color-fg-subtle)' }}>· {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="Box-body markdown-body text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Comment composer */}
              {user && (
                <div className="Box">
                  <div className="Box-body">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Leave a comment... (supports Markdown)"
                      className="form-control resize-none"
                      rows={4}
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}
                    />
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
                <p><strong>Status:</strong> {quest.status}</p>
                <p><strong>Author:</strong> {quest.author?.displayName || quest.author?.username}</p>
                {quest.bountyXp > 0 && <p><strong>Bounty:</strong> ⚡ {quest.bountyXp} XP</p>}
                <p><strong>Created:</strong> {new Date(quest.createdAt).toLocaleDateString()}</p>
                {quest.closedAt && <p><strong>Closed:</strong> {new Date(quest.closedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

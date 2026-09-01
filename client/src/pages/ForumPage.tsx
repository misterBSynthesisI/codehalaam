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
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, ChevronUp, ChevronDown, Check, Plus, Search, Tag,
  ArrowLeft, Trash2, Clock, Eye,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function ForumPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(searchParams.get('sort') || 'hot')
  const [showCreate, setShowCreate] = useState(false)

  // New post form
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getForumPosts({ sort, search: search || undefined, page: 1 })
      setPosts(data.posts || [])
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [sort, search])

  useEffect(() => {
    const timeout = setTimeout(() => fetchPosts(), 300)
    return () => clearTimeout(timeout)
  }, [fetchPosts])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const { post } = await api.createForumPost({
        title,
        body,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5),
      })
      setPosts(prev => [post, ...prev])
      setTitle('')
      setBody('')
      setTags('')
      setShowCreate(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6" style={{ color: 'var(--color-accent-fg)' }} />
          <h1 className="text-2xl font-semibold">Developer Forum</h1>
          <span className="text-sm ml-auto" style={{ color: 'var(--color-fg-muted)' }}>
            {total} {total === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions..."
              className="form-control pl-9"
            />
          </div>
          <div className="flex gap-1">
            {['hot', 'new', 'unanswered'].map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize"
                style={{
                  backgroundColor: sort === s ? 'var(--color-accent-muted)' : 'var(--color-canvas-subtle)',
                  color: sort === s ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)',
                  border: `1px solid ${sort === s ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {user && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> Ask
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>
            {error}
          </div>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <form onSubmit={handleCreate} className="Box p-5 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your question? Be specific."
                    className="form-control"
                    required
                    minLength={10}
                    maxLength={300}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Details</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe what you've tried and what's happening. Include code samples if relevant."
                    className="form-control"
                    rows={5}
                    required
                    minLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated, max 5)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, mongodb, deployment"
                    className="form-control"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn btn-default">Cancel</button>
                  <button type="submit" disabled={creating} className="btn btn-primary">
                    {creating ? 'Posting...' : 'Post question'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-fg-subtle)' }} />
            <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              No posts yet. {user ? 'Be the first to ask a question!' : 'Sign in to ask a question.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/forum/${post._id}`)}
                className="Box-row cursor-pointer flex items-start gap-3"
                style={{ transition: 'background-color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Vote count */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-fg-default)' }}>{post.score}</span>
                  <span className="text-[10px]" style={{ color: 'var(--color-fg-muted)' }}>votes</span>
                </div>
                {/* Answers count */}
                <div className="flex flex-col items-center shrink-0 pt-1" style={{ minWidth: 40 }}>
                  <span className="text-sm font-bold" style={{ color: post.isAnswered ? 'var(--color-success-fg)' : 'var(--color-fg-muted)' }}>
                    {post.answers?.length || 0}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--color-fg-muted)' }}>answers</span>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium mb-1 truncate" style={{ color: 'var(--color-accent-fg)' }}>
                    {post.isAnswered && <Check className="inline w-3.5 h-3.5 mr-1" style={{ color: 'var(--color-success-fg)' }} />}
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    <span>by {post.author?.displayName || post.author?.username || 'unknown'}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {post.views}</span>
                    {post.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-muted)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ForumPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [answerBody, setAnswerBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchPost()
  }, [id])

  async function fetchPost() {
    setLoading(true)
    try {
      const { post } = await api.getForumPost(id!)
      setPost(post)
    } catch (err: any) {
      setError(err.message || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { answer } = await api.addForumAnswer(post._id, answerBody)
      setPost({ ...post, answers: [...(post.answers || []), answer] })
      setAnswerBody('')
    } catch (err: any) {
      setError(err.message || 'Failed to post answer')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(direction: 'up' | 'down') {
    try {
      const result = await api.voteForumPost(post._id, direction)
      setPost({ ...post, score: result.score, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote })
    } catch { /* ignore */ }
  }

  async function handleAccept(answerId: string) {
    try {
      const { post: updated } = await api.acceptForumAnswer(post._id, answerId)
      setPost(updated)
    } catch (err: any) {
      setError(err.message || 'Failed to accept answer')
    }
  }

  async function handleDelete() {
    try {
      await api.deleteForumPost(post._id)
      navigate('/forum')
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><span style={{ color: 'var(--color-fg-muted)' }}>Loading…</span></div>
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><span style={{ color: 'var(--color-fg-muted)' }}>Post not found</span></div>
  }

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6 max-w-3xl">
        <button onClick={() => navigate('/forum')} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: 'var(--color-fg-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to forum
        </button>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>
            {error}
          </div>
        )}

        {/* Post */}
        <div className="Box mb-6">
          <div className="Box-body">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button onClick={() => handleVote('up')} className="p-1 rounded hover:bg-[var(--color-canvas-subtle)]" style={{ color: 'var(--color-fg-muted)' }}>
                  <ChevronUp className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold">{post.score}</span>
                <button onClick={() => handleVote('down')} className="p-1 rounded hover:bg-[var(--color-canvas-subtle)]" style={{ color: 'var(--color-fg-muted)' }}>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h1 className="text-xl font-semibold mb-3">{post.title}</h1>
                <div className="text-sm whitespace-pre-wrap mb-4" style={{ color: 'var(--color-fg-default)' }}>{post.body}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-muted)' }}>
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{timeAgo(post.createdAt)}</span>
                    <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>· {post.views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{post.author?.displayName || post.author?.username}</span>
                    {post.author?.badgeColor && <VerifiedBadge badgeColor={post.author.badgeColor} />}
                    {user?.id === post.author?._id && (
                      <button onClick={handleDelete} className="p-1 rounded hover:bg-[var(--color-danger-muted)]" style={{ color: 'var(--color-fg-muted)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-fg-muted)' }}>
          {post.answers?.length || 0} {(post.answers?.length || 0) === 1 ? 'Answer' : 'Answers'}
        </h2>

        {post.answers?.map((answer: any, i: number) => (
          <div key={answer._id} className="Box mb-3" style={{ border: answer.isAccepted ? '2px solid var(--color-success-fg)' : undefined }}>
            <div className="Box-body">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {answer.isAccepted && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-success-subtle)' }}>
                      <Check className="w-5 h-5" style={{ color: 'var(--color-success-fg)' }} />
                    </div>
                  )}
                  <span className="text-sm font-bold">{answer.score}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap mb-3">{answer.body}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{timeAgo(answer.createdAt)}</span>
                      <span className="text-sm font-medium">{answer.author?.displayName || answer.author?.username}</span>
                      {answer.author?.badgeColor && <VerifiedBadge badgeColor={answer.author.badgeColor} />}
                    </div>
                    {(user?.id === post.author?._id || user?.isAdmin) && !answer.isAccepted && (
                      <button onClick={() => handleAccept(answer._id)} className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--color-success-fg)' }}>
                        <Check className="w-3 h-3" /> Accept
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Answer form */}
        {user ? (
          <form onSubmit={handleAnswer} className="Box mt-4">
            <div className="Box-body space-y-3">
              <label className="block text-sm font-medium">Your answer</label>
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write your answer here. Include code snippets if helpful."
                className="form-control"
                rows={5}
                required
                minLength={5}
              />
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Posting...' : 'Post answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="Box mt-4">
            <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              <button onClick={() => navigate('/auth')} style={{ color: 'var(--color-accent-fg)' }} className="hover:underline">Sign in</button> to post an answer.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

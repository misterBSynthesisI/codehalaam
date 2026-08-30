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

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Hash, GitPullRequest, AlertCircle, User, FileCode, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface SearchResult {
  id: string
  type: 'codex' | 'quest' | 'offering' | 'user'
  title: string
  subtitle: string
  url: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Search as user types
  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const data = await api.getRepos({ sort: 'updated' })
      const repos: SearchResult[] = (data.repos || [])
        .filter((r: any) => r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || '').toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5)
        .map((r: any) => ({
          id: r._id,
          type: 'codex' as const,
          title: r.name,
          subtitle: r.description || 'No description',
          url: `/${r.owner?.username || user?.username}/${r.name}`,
        }))
      setResults(repos)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].url)
      setOpen(false)
    }
  }

  if (!open) return null

  const icon = (type: string) => {
    switch (type) {
      case 'codex': return <FileCode className="w-4 h-4" style={{ color: 'var(--color-accent-fg)' }} />
      case 'quest': return <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-success-fg)' }} />
      case 'offering': return <GitPullRequest className="w-4 h-4" style={{ color: 'var(--color-done-fg)' }} />
      case 'user': return <User className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
      default: return <Hash className="w-4 h-4" />
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
      data-testid="command-palette"
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-xl overflow-hidden animate-fade-in"
        style={{
          backgroundColor: 'var(--color-canvas-default)',
          border: '1px solid var(--color-border-default)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--color-fg-subtle)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search codexes, quests, offerings, users..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-fg-default)' }}
            data-testid="command-input"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-muted)', border: '1px solid var(--color-border-default)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-1">
          {loading && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              No results for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && results.map((result, i) => (
            <button
              key={result.id}
              onClick={() => { navigate(result.url); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                backgroundColor: i === selectedIndex ? 'var(--color-canvas-subtle)' : 'transparent',
                color: 'var(--color-fg-default)',
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              data-testid="command-result"
            >
              {icon(result.type)}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{result.title}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-fg-muted)' }}>{result.subtitle}</div>
              </div>
              <ArrowRight className="w-3 h-3 shrink-0" style={{ color: 'var(--color-fg-subtle)' }} />
            </button>
          ))}

          {!loading && query.length < 2 && (
            <div className="px-4 py-4 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              <p className="mb-2 font-medium" style={{ color: 'var(--color-fg-default)' }}>Quick actions</p>
              {user && (
                <>
                  <button
                    onClick={() => { navigate('/new'); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded text-left transition-colors hover:bg-[var(--color-canvas-subtle)]"
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded text-xs" style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent-fg)' }}>+</span>
                    <span>New Codex</span>
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard'); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded text-left transition-colors hover:bg-[var(--color-canvas-subtle)]"
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded text-xs" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>⚡</span>
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => { navigate(`/${user.username}`); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded text-left transition-colors hover:bg-[var(--color-canvas-subtle)]"
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-default)' }}>👤</span>
                    <span>My Profile</span>
                  </button>
                </>
              )}
              {!user && (
                <p className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>Sign in to search codexes and more.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

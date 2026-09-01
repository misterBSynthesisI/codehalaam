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

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, GitFork, FileCode2, GitPullRequest,
  AlertCircle, Eye, GitBranch, BookOpen, Users, Flame, Radio,
  Plus, Tag, ExternalLink, Settings, X, Upload, Globe, Lock,
  File, Folder, FolderOpen, ChevronDown
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { VerificationBadge } from '@/components/ui/UserBadge'
import { PrivateCodexPage } from '@/pages/PrivateCodexPage'

/* ===== MARKDOWN COMPONENTS ===== */
const markdownComponents: Record<string, any> = {
  h1: ({ children, ...props }: any) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b" style={{ color: 'var(--color-fg-default)', borderColor: 'var(--color-border-default)', letterSpacing: '-0.02em' }} {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 className="text-2xl font-semibold mt-6 mb-3 pb-2 border-b" style={{ color: 'var(--color-fg-default)', borderColor: 'var(--color-border-default)', letterSpacing: '-0.015em' }} {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 className="text-xl font-semibold mt-5 mb-2" style={{ color: 'var(--color-fg-default)', letterSpacing: '-0.01em' }} {...props}>{children}</h3>,
  p: ({ children, ...props }: any) => <p className="mb-3 leading-relaxed" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</p>,
  a: ({ children, href, ...props }: any) => <a href={href} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
  ul: ({ children, ...props }: any) => <ul className="mb-3 ml-6 list-disc space-y-1" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</ul>,
  ol: ({ children, ...props }: any) => <ol className="mb-3 ml-6 list-decimal space-y-1" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</ol>,
  li: ({ children, ...props }: any) => <li className="leading-relaxed" {...props}>{children}</li>,
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l pl-4 my-4 italic" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-fg-muted)' }} {...props}>{children}</blockquote>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return <code className="px-1.5 py-0.5 rounded text-sm" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-accent-fg)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} {...props}>{children}</code>
    }
    return <code className={className} {...props}>{children}</code>
  },
  pre: ({ children, ...props }: any) => (
    <pre className="rounded-md p-4 my-4 overflow-x-auto text-sm leading-relaxed" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} {...props}>{children}</pre>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4"><table className="w-full border-collapse text-sm" style={{ border: '1px solid var(--color-border-default)' }} {...props}>{children}</table></div>
  ),
  thead: ({ children, ...props }: any) => <thead style={{ backgroundColor: 'var(--color-canvas-subtle)' }} {...props}>{children}</thead>,
  th: ({ children, ...props }: any) => <th className="px-3 py-2 text-left font-semibold border" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-fg-default)' }} {...props}>{children}</th>,
  td: ({ children, ...props }: any) => <td className="px-3 py-2 border" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-fg-default)' }} {...props}>{children}</td>,
  hr: (props: any) => <hr className="my-6" style={{ borderColor: 'var(--color-border-default)' }} {...props} />,
  input: ({ ...props }: any) => <input className="mr-2" {...props} />,
}

/* ===== CUSTOMIZE STOREFRONT MODAL ===== */
function CustomizeModal({ repo, owner, onSave, onClose }: { repo: any; owner: string; onSave: (data: any) => void; onClose: () => void }) {
  const [tagline, setTagline] = useState(repo.tagline || '')
  const [websiteUrl, setWebsiteUrl] = useState(repo.websiteUrl || '')
  const [accentColor, setAccentColor] = useState(repo.accentColor || '#58a6ff')
  const [technologies, setTechnologies] = useState<string[]>(repo.technologies || [])
  const [techInput, setTechInput] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(repo.coverUrl || '')
  const [logoPreview, setLogoPreview] = useState(repo.logoUrl || '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)) }
  }
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)) }
  }

  const addTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput('')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upload cover — capture real URL from server
      let savedCoverUrl = repo.coverUrl
      if (coverFile) {
        const coverRes = await api.uploadCodexMedia(owner, repo.name, coverFile, 'cover')
        savedCoverUrl = coverRes.url
        setCoverPreview(coverRes.url)
      }
      // Upload logo — capture real URL from server
      let savedLogoUrl = repo.logoUrl
      if (logoFile) {
        const logoRes = await api.uploadCodexMedia(owner, repo.name, logoFile, 'logo')
        savedLogoUrl = logoRes.url
        setLogoPreview(logoRes.url)
      }
      await api.updateCodex(owner, repo.name, { tagline, websiteUrl, technologies, accentColor })
      onSave({ tagline, websiteUrl, technologies, accentColor, coverUrl: savedCoverUrl, logoUrl: savedLogoUrl })
      setToast({ msg: 'Storefront updated!', type: 'success' })
    } catch (err: any) { setToast({ msg: err.message, type: 'error' }) }
    finally { setSaving(false) }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="w-full max-w-lg rounded-lg shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)' }} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-fg-default)' }}>Customize Storefront</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-canvas-subtle" style={{ color: 'var(--color-fg-muted)' }}><X className="w-4 h-4" strokeWidth={1.5} /></button>
          </div>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {toast && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-3 py-2 rounded text-sm font-medium" style={{ backgroundColor: toast.type === 'success' ? 'var(--color-success-muted)' : 'var(--color-danger-muted)', color: toast.type === 'success' ? 'var(--color-success-fg)' : 'var(--color-danger-fg)' }}>
                {toast.msg}
              </motion.div>
            )}
            {/* Cover photo */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Cover Photo</label>
              <div className="relative rounded-md overflow-hidden" style={{ height: 120, backgroundColor: 'var(--color-canvas-subtle)' }}>
                {coverPreview ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--color-fg-muted)' }}>No cover image</div>}
              </div>
              <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              <button onClick={() => coverRef.current?.click()} className="btn btn-sm btn-default mt-2"><Upload className="w-3 h-3" strokeWidth={1.5} /> Upload cover</button>
            </div>
            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-lg font-bold" style={{ color: 'var(--color-fg-muted)' }}>{repo.name?.charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <button onClick={() => logoRef.current?.click()} className="btn btn-sm btn-default"><Upload className="w-3 h-3" strokeWidth={1.5} /> Upload logo</button>
                </div>
              </div>
            </div>
            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Tagline</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="A short description of your codex" className="form-control text-sm" />
            </div>
            {/* Website */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Website URL</label>
              <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." className="form-control text-sm" />
            </div>
            {/* Technologies */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Technologies</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {technologies.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
                    {t}
                    <button onClick={() => setTechnologies(technologies.filter(x => x !== t))} className="hover:text-danger-fg"><X className="w-3 h-3" strokeWidth={1.5} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="Add technology..." className="form-control text-sm flex-1" />
                <button onClick={addTech} className="btn btn-sm btn-default">Add</button>
              </div>
            </div>
            {/* Accent Color */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" style={{ border: '1px solid var(--color-border-default)' }} />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="form-control text-sm flex-1" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
            <button onClick={onClose} className="btn btn-sm btn-default">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ===== FILE TREE PREVIEW NODE ===== */
function FileTreePreviewNode({ node, owner, name, depth = 0 }: { node: any; owner: string; name: string; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const isFolder = node.type === 'folder' || node.children

  return (
    <div>
      <div
        onClick={() => isFolder && setExpanded(!expanded)}
        className="file-row"
        style={{ paddingLeft: `${depth * 16 + 16}px`, cursor: isFolder ? 'pointer' : 'default' }}
      >
        {isFolder ? (
          <>
            <ChevronDown
              className="w-3 h-3 shrink-0"
              strokeWidth={1.5}
              style={{ color: 'var(--color-fg-subtle)', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
            />
            {expanded ? (
              <FolderOpen className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />
            ) : (
              <Folder className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />
            )}
          </>
        ) : (
          <>
            <span className="w-3 h-3 shrink-0" />
            <File className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          </>
        )}
        {isFolder ? (
          <span className="file-name" style={{ fontWeight: 500 }}>{node.name}</span>
        ) : (
          <Link
            to={`/codex/${owner}/${name}/code?path=${encodeURIComponent(node.path || node.name)}`}
            className="file-name no-underline"
            style={{ textDecoration: 'none' }}
          >
            {node.name}
          </Link>
        )}
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.slice(0, 6).map((child: any) => (
            <FileTreePreviewNode key={child.name} node={child} owner={owner} name={name} depth={depth + 1} />
          ))}
          {node.children.length > 6 && (
            <div className="text-xs py-1" style={{ paddingLeft: `${(depth + 1) * 16 + 16}px`, color: 'var(--color-fg-muted)' }}>
              ... {node.children.length - 6} more items
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ===== CODEX HOME PAGE ===== */
export function CodexHomePage() {
  const { owner: ownerParam, name } = useParams()
  const owner = ownerParam || ''
  const navigate = useNavigate()
  const { user } = useAuth()

  const [repo, setRepo] = useState<any>(null)
  const [readme, setReadme] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<any>({})
  const [showCustomize, setShowCustomize] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  // Social states
  const [isEmbered, setIsEmbered] = useState(false)
  const [embersCount, setEmbersCount] = useState(0)
  const [isWatching, setIsWatching] = useState(false)
  const [watchersCount, setWatchersCount] = useState(0)
  const [hasEchoed, setHasEchoed] = useState(false)
  const [echoesCount, setEchoesCount] = useState(0)

  // Preview data
  const [quests, setQuests] = useState<any[]>([])
  const [offerings, setOfferings] = useState<any[]>([])
  const [releases, setReleases] = useState<any[]>([])
  const [paths, setPaths] = useState<any[]>([])
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [fileTree, setFileTree] = useState<any[]>([])

  useEffect(() => {
    if (!owner || !name) return
    setLoading(true)
    Promise.allSettled([
      api.getCodex(owner, name),
      api.getReadme(owner, name),
    ]).then(([codexResult, readmeResult]) => {
      if (codexResult.status === 'fulfilled') {
        const codexData = codexResult.value
        setRepo(codexData.repo)
        setCounts(codexData.counts)
        setIsEmbered(codexData.isEmbered)
        setEmbersCount(codexData.counts.embers)
        setIsWatching(codexData.isWatching)
        setWatchersCount(codexData.counts.watchers)
        setHasEchoed(codexData.hasEchoed)
        setEchoesCount(codexData.counts.echoes)
      } else {
        setNotFound(true)
        setIsPrivate(true)
      }
      if (readmeResult.status === 'fulfilled') {
        setReadme(readmeResult.value.readme)
      }
    }).finally(() => setLoading(false))

    api.getQuests(owner, name).then(d => setQuests(d.quests?.slice(0, 5) || [])).catch(() => {})
    api.getOfferings(owner, name).then(d => setOfferings(d.offerings?.slice(0, 5) || [])).catch(() => {})
    api.getReleases(owner, name).then(d => setReleases(d.releases?.slice(0, 3) || [])).catch(() => {})
    api.getPaths(owner, name).then(d => setPaths(d.paths || [])).catch(() => {})
    api.getCodexCollaborators(owner, name).then(d => setCollaborators(d.collaborators || [])).catch(() => {})
    api.getCodexTree(owner, name).then(d => setFileTree(d.tree || [])).catch(() => {})
  }, [owner, name])

  const handleToggleEmber = useCallback(async () => {
    if (!owner || !name) return
    const prev = { isEmbered, embersCount }
    setIsEmbered(!isEmbered)
    setEmbersCount(isEmbered ? embersCount - 1 : embersCount + 1)
    try { const data = await api.toggleCodexEmber(owner, name); setIsEmbered(data.isEmbered); setEmbersCount(data.embersCount) } catch { setIsEmbered(prev.isEmbered); setEmbersCount(prev.embersCount) }
  }, [owner, name, isEmbered, embersCount])

  const handleToggleWatch = useCallback(async () => {
    if (!owner || !name) return
    const prev = { isWatching, watchersCount }
    setIsWatching(!isWatching)
    setWatchersCount(isWatching ? watchersCount - 1 : watchersCount + 1)
    try { const data = await api.toggleCodexWatch(owner, name); setIsWatching(data.isWatching); setWatchersCount(data.watchersCount) } catch { setIsWatching(prev.isWatching); setWatchersCount(prev.watchersCount) }
  }, [owner, name, isWatching, watchersCount])

  const handleToggleEcho = useCallback(async () => {
    if (!owner || !name) return
    const prev = { hasEchoed, echoesCount }
    setHasEchoed(!hasEchoed)
    setEchoesCount(hasEchoed ? echoesCount - 1 : echoesCount + 1)
    try { const data = await api.toggleCodexEcho(owner, name); setHasEchoed(data.hasEchoed); setEchoesCount(data.echoesCount) } catch { setHasEchoed(prev.hasEchoed); setEchoesCount(prev.echoesCount) }
  }, [owner, name, hasEchoed, echoesCount])

  const handleSaveStorefront = (data: any) => {
    setRepo((prev: any) => ({ ...prev, ...data }))
    setShowCustomize(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading codex...</div></div>
  }

  if (!repo) {
    if (isPrivate || notFound) {
      return <PrivateCodexPage />
    }
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Codex not found</div></div>
  }

  const isOwner = user?.username === owner
  const accent = repo.accentColor || '#58a6ff'

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      {/* ===== HERO SECTION ===== */}
      <div className="relative" style={{ minHeight: 200 }}>
        {/* Cover image or gradient */}
        {repo.coverUrl ? (
          <div className="absolute inset-0">
            <img src={repo.coverUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--color-canvas-default) 100%)' }} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 50%, transparent 100%)` }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, var(--color-canvas-default) 100%)' }} />
          </div>
        )}

        {/* Customize button (owner only) — top right */}
        {isOwner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
            <button onClick={() => setShowCustomize(true)} className="btn btn-sm btn-default">
              <Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">Customize</span>
            </button>
          </motion.div>
        )}

        <div className="relative flex flex-col items-center pt-6 pb-4 px-4">
          {/* Logo centered */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg"
            style={{ border: `3px solid var(--color-canvas-default)`, backgroundColor: repo.logoUrl ? 'transparent' : accent + '22', color: accent }}>
            {repo.logoUrl ? <img src={repo.logoUrl} alt={repo.name} className="w-full h-full rounded-xl object-cover" /> : repo.name?.charAt(0).toUpperCase()}
          </motion.div>

          {/* Project name */}
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.05 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 text-center" style={{ color: 'var(--color-fg-default)', letterSpacing: '-0.02em' }}>
            {repo.name}
          </motion.h1>

          {/* Tagline */}
          {repo.tagline && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm mt-1 text-center max-w-md" style={{ color: 'var(--color-fg-muted)' }}>
              {repo.tagline}
            </motion.p>
          )}

          {/* Owner info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            <Link to={`/${owner}`} className="flex items-center gap-1.5 no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>{owner?.charAt(0).toUpperCase()}</span>
              {repo.owner?.displayName || owner}
            </Link>
            <VerificationBadge badgeColor={repo.owner?.badgeColor} size={14} />
            <span className="Label Label-muted flex items-center gap-1" style={{ fontSize: 10 }}>{repo.visibility === 'private' && <Lock className="w-3 h-3" strokeWidth={2} />}{repo.visibility}</span>
          </motion.div>

          {/* Action buttons — centered, wrapping on mobile */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {user && (
              <>
                {/* Watch button with sticker */}
                <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={handleToggleWatch} className="btn btn-sm btn-default relative">
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Watch <span className="Counter">{watchersCount}</span>
                  <AnimatePresence>
                    {isWatching && (
                      <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-fg)', border: '1.5px solid var(--color-canvas-default)', zIndex: 10 }}>
                        <Eye className="w-2.5 h-2.5" strokeWidth={2} style={{ color: '#fff' }} fill="currentColor" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                {/* Echo button with sticker */}
                <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={handleToggleEcho} className="btn btn-sm btn-default relative">
                  <Radio className="w-3.5 h-3.5" strokeWidth={1.5} /> Echo <span className="Counter">{echoesCount}</span>
                  <AnimatePresence>
                    {hasEchoed && (
                      <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-done-fg)', border: '1.5px solid var(--color-canvas-default)', zIndex: 10 }}>
                        <Radio className="w-2.5 h-2.5" strokeWidth={2} style={{ color: '#fff' }} fill="currentColor" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                {/* Ember button with sticker */}
                <motion.button whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={handleToggleEmber} className="btn btn-sm btn-default relative">
                  <Flame className="w-3.5 h-3.5" strokeWidth={1.5} /> Ember <span className="Counter">{embersCount}</span>
                  <AnimatePresence>
                    {isEmbered && (
                      <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f97316', border: '1.5px solid var(--color-canvas-default)', zIndex: 10 }}>
                        <Flame className="w-2.5 h-2.5" strokeWidth={2} style={{ color: '#fff' }} fill="currentColor" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </>
            )}
            <button onClick={() => navigate(`/codex/${owner}/${name}/code`)} className="btn btn-sm btn-primary">
              <FileCode2 className="w-4 h-4" strokeWidth={1.5} /> Code
            </button>
          </motion.div>

          {/* Technology badges — centered */}
          {(repo.technologies?.length > 0 || isOwner) && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {repo.technologies?.map((t: string) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
                  {t}
                </span>
              ))}
              {isOwner && (
                <button onClick={() => setShowCustomize(true)} className="px-2.5 py-1 rounded-full text-xs transition-all hover:scale-105" style={{ border: '1px dashed var(--color-border-default)', color: 'var(--color-fg-muted)' }}>
                  <Plus className="w-3 h-3 inline" strokeWidth={1.5} /> Add technologies
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container-lg py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
          <div>
            {/* File Tree Preview */}
            {fileTree.length > 0 && (
              <div className="Box mb-6">
                <div className="Box-header flex items-center justify-between" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                    <Folder className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />
                    Files
                  </span>
                  <button onClick={() => navigate(`/codex/${owner}/${name}/code`)} className="text-xs flex items-center gap-1 hover:underline" style={{ color: 'var(--color-accent-fg)' }}>
                    Browse code <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
                <div>
                  {fileTree.slice(0, 8).map((node: any) => (
                    <FileTreePreviewNode key={node.name} node={node} owner={owner} name={name || ''} depth={0} />
                  ))}
                  {fileTree.length > 8 && (
                    <div className="px-4 py-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                      ... and {fileTree.length - 8} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* README */}
            <div className="Box mb-6">
              <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                <BookOpen className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-fg-muted)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>README.md</span>
              </div>
              <div className="Box-body markdown-body">
                {readme ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{readme}</ReactMarkdown>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>No README found for this codex.</p>
                    {isOwner && (
                      <button onClick={() => navigate(`/codex/${owner}/${name}/code?path=README.md`)} className="btn btn-sm btn-primary mt-2">
                        <Plus className="w-3 h-3" strokeWidth={1.5} /> Create README
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Open Quests preview */}
            {quests.length > 0 && (
              <div className="Box mb-4">
                <div className="Box-header flex items-center justify-between" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                    <AlertCircle className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-success-fg)' }} /> Open Quests
                  </span>
                  <span className="Counter">{counts.openQuests}</span>
                </div>
                {quests.map(q => (
                  <Link key={q._id} to={`/codex/${owner}/${name}/quests/${q.number}`} className="Box-row hover-row flex items-center gap-3 no-underline" style={{ textDecoration: 'none' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: q.status === 'Closed' ? 'var(--color-done-fg)' : 'var(--color-success-fg)' }} />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{q.title}</span>
                      <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>#{q.number} · opened by {q.author?.displayName || q.author?.username} · {new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Open Offerings preview */}
            {offerings.length > 0 && (
              <div className="Box mb-4">
                <div className="Box-header flex items-center justify-between" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                    <GitPullRequest className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-success-fg)' }} /> Open Offerings
                  </span>
                  <span className="Counter">{counts.openOfferings}</span>
                </div>
                {offerings.map(o => (
                  <Link key={o._id} to={`/codex/${owner}/${name}/offerings/${o.number}`} className="Box-row hover-row flex items-center gap-3 no-underline" style={{ textDecoration: 'none' }}>
                    <GitPullRequest className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: o.status === 'Bound' ? 'var(--color-done-fg)' : o.status === 'Closed' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)' }} />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{o.title}</span>
                      <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>#{o.number} · {o.sourcePath} → {o.targetPath} · {o.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-0">
            <div className="sidebar-section">
              <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)' }}>About</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--color-fg-muted)' }}>{repo.description || 'No description provided'}</p>
              {repo.websiteUrl && (
                <a href={repo.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--color-accent-fg)' }}>
                  <Globe className="w-4 h-4" strokeWidth={1.5} />{repo.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
              <div className="space-y-2 text-sm">
                <div className="sidebar-item"><Flame className="w-4 h-4" strokeWidth={1.5} style={{ color: '#f97316' }} /><span className="count">{embersCount}</span><span style={{ color: 'var(--color-fg-muted)' }}>embers</span></div>
                <div className="sidebar-item"><Eye className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-fg-muted)' }} /><span className="count">{watchersCount}</span><span style={{ color: 'var(--color-fg-muted)' }}>watching</span></div>
                <div className="sidebar-item"><Radio className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-done-fg)' }} /><span className="count">{echoesCount}</span><span style={{ color: 'var(--color-fg-muted)' }}>echoes</span></div>
                {repo.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {repo.topics.map((t: string) => <span key={t} className="Label Label-blue">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            {collaborators.length > 0 && (
              <div className="sidebar-section">
                <h2 className="sidebar-heading flex items-center gap-1" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>
                  The Crew <span className="Counter">{collaborators.length}</span>
                </h2>
                <div className="space-y-1.5 mt-1">
                  {collaborators.slice(0, 8).map((c: any) => (
                    <div key={c.user?._id || c._id} className="flex items-center gap-2">
                      <Link to={`/${c.user?.username}`} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium no-underline hover:scale-110 transition-transform overflow-hidden" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>
                        {c.user?.avatarUrl ? <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (c.user?.username?.charAt(0).toUpperCase() || '?')}
                      </Link>
                      <Link to={`/${c.user?.username}`} className="text-sm no-underline hover:underline flex items-center gap-1" style={{ color: 'var(--color-accent-fg)' }}>
                        {c.user?.displayName || c.user?.username}
                        <VerificationBadge badgeColor={c.user?.badgeColor} size={14} />
                      </Link>
                      <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>{c.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paths.length > 0 && (
              <div className="sidebar-section">
                <h2 className="sidebar-heading flex items-center gap-1" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>
                  Paths <span className="Counter">{paths.length}</span>
                </h2>
                <div className="space-y-1 mt-1">
                  {paths.map((p: any) => (
                    <Link key={p._id} to={`/codex/${owner}/${name}/code?ref=${p.name}`} className="flex items-center gap-2 text-sm no-underline hover:underline" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                      <GitBranch className="w-3.5 h-3.5" strokeWidth={1.5} />{p.name}
                      {p.isDefault && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>default</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {releases.length > 0 && (
              <div className="sidebar-section">
                <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>Latest Release</h2>
                <div className="mt-1">
                  <Link to={`/codex/${owner}/${name}/releases`} className="flex items-center gap-2 text-sm no-underline" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                    <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />{releases[0].tagName} — {releases[0].title}
                  </Link>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>{new Date(releases[0].createdAt).toLocaleDateString()} by {releases[0].author?.displayName || releases[0].author?.username}</p>
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <div className="space-y-1">
                <Link to={`/codex/${owner}/${name}/code`} className="sidebar-item text-sm no-underline" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                  <Eye className="w-4 h-4" strokeWidth={1.5} /> Open Code Workspace
                </Link>
                {isOwner && (
                  <Link to={`/codex/${owner}/${name}/settings`} className="sidebar-item text-sm no-underline" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                    <Settings className="w-4 h-4" strokeWidth={1.5} /> Settings
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <CustomizeModal repo={repo} owner={owner} onSave={handleSaveStorefront} onClose={() => setShowCustomize(false)} />
      )}
    </div>
  )
}

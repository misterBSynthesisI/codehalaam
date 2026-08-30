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
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, File, Folder, FolderOpen,
  Star, GitFork, Code, MessageSquare, GitPullRequest,
  Settings, Check, Plus, AlertCircle, Users, Eye
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type RepoTab = 'code' | 'issues' | 'pull-requests' | 'settings' | 'collaborators'

/* ===== FILE TREE ===== */
function FileTreeNode({ node, depth = 0, onSelect, selectedPath }: {
  node: any; depth?: number; onSelect: (n: any) => void; selectedPath: string
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const isFolder = node.type === 'folder'

  return (
    <div>
      <div
        onClick={() => { if (isFolder) setExpanded(!expanded); else onSelect(node) }}
        className="file-row"
        style={{ paddingLeft: `${depth * 16 + 16}px`, backgroundColor: selectedPath === node.name ? 'var(--color-accent-muted)' : undefined }}
      >
        {isFolder ? (
          <>
            <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--color-fg-subtle)', transform: expanded ? 'rotate(90deg)' : 'none' }} />
            {expanded ? (
              <FolderOpen className="file-icon" style={{ color: 'var(--color-accent-fg)' }} />
            ) : (
              <Folder className="file-icon" style={{ color: 'var(--color-accent-fg)' }} />
            )}
          </>
        ) : (
          <><span className="w-3 h-3" /><File className="file-icon" style={{ color: 'var(--color-fg-subtle)' }} /></>
        )}
        <span className="file-name">{node.name}</span>
        {node.size && <span style={{ color: 'var(--color-fg-subtle)', fontSize: 12 }}>{node.size}</span>}
      </div>
      <AnimatePresence>
        {isFolder && expanded && node.children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
            {node.children.map((child: any) => (
              <FileTreeNode key={child.name} node={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ===== CODE TAB ===== */
function CodeTab({ repo, owner }: { repo: any; owner: string }) {
  const [selectedFile, setSelectedFile] = useState<any>(null)

  useEffect(() => {
    const findReadme = (files: any[]): any => {
      for (const f of files) {
        if (f.name === 'README.md') return f
        if (f.children) { const found = findReadme(f.children); if (found) return found }
      }
      return null
    }
    setSelectedFile(findReadme(repo.fileTree || []))
  }, [repo])

  const totalFiles = (repo.fileTree || []).length

  return (
    <div>
      {/* Commit info bar */}
      <div className="commit-info">
        <div className="avatar" />
        <span style={{ color: 'var(--color-fg-default)', fontWeight: 600 }}>{owner}</span>
        <span>{repo.defaultReadme ? 'feat: initial commit' : 'Initial commit'}</span>
        <span style={{ color: 'var(--color-fg-subtle)' }}>·</span>
        <span>{Math.floor(Math.random() * 24)} hours ago</span>
        <span style={{ color: 'var(--color-fg-subtle)' }}>·</span>
        <span style={{ color: 'var(--color-success-fg)' }}>{Math.floor(Math.random() * 5) + 1} commits</span>
      </div>

      {/* Branch / Tag / Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-3">
          <button className="btn btn-sm btn-default" style={{ gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7.5h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" /></svg>
            {repo.defaultBranch || 'main'}
          </button>
          <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="inline mr-1 align-text-bottom"><path d="M2.5 7.775V2.75a.25.25 0 0 1 .25-.25h5.025a.25.25 0 0 1 .177.073l6.25 6.25a.25.25 0 0 1 0 .354l-5.025 5.025a.25.25 0 0 1-.354 0l-6.25-6.25a.25.25 0 0 1-.073-.177Z" /></svg>
            {totalFiles} Path
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input type="text" placeholder="Go to file" className="form-control text-sm py-1 px-3" style={{ width: 200 }} />
          </div>
          <button className="btn btn-sm btn-default">Add file</button>
          <button className="btn btn-sm btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073H2.75ZM1 1.75v11.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V4.664c0-.69-.56-1.25-1.25-1.25H11.5a.75.75 0 0 1-.53.22H2.75A1.75 1.75 0 0 1 1 1.75Z" /></svg>
            Code
          </button>
        </div>
      </div>

      {/* File browser */}
      <div className="Box mb-6">
        {(repo.fileTree || []).map((node: any) => (
          <FileTreeNode key={node.name} node={node} onSelect={setSelectedFile} selectedPath={selectedFile?.name || ''} />
        ))}
      </div>

      {/* README */}
      {selectedFile && selectedFile.content && (
        <div className="Box">
          <div className="Box-header flex items-center gap-2" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
            <File className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>README.md</span>
            <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>{selectedFile.size}</span>
          </div>
          <div className="Box-body">
            <pre className="font-mono text-sm leading-relaxed" style={{ color: 'var(--color-fg-default)', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }}>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== ISSUES TAB ===== */
function QuestsTab({ owner, name }: { owner: string; name: string }) {
  const [issues, setIssues] = useState<any[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [closedCount, setClosedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getIssues(owner, name).then(data => { setIssues(data.issues); setOpenCount(data.openCount); setClosedCount(data.closedCount) }).finally(() => setLoading(false))
  }, [owner, name])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-fg-default)' }}>
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-success-fg)' }} /> {openCount} Open
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
            <Check className="w-4 h-4" /> {closedCount} Closed
          </span>
        </div>
        <button className="btn btn-sm btn-primary"><Plus className="w-3 h-3" /> New issue</button>
      </div>
      <div className="Box">
        {issues.map((issue) => (
          <div key={issue._id} className="Box-row">
            <div className="flex items-start gap-3">
              {issue.state === 'open' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-success-fg)' }} /> : <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-done-fg)' }} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{issue.title}</h3>
                  {(issue.labels || []).map((label: any) => (
                    <span key={label.name} className={`Label Label-${label.color}`}>{label.name}</span>
                  ))}
                  {issue.bountyXp > 0 && <span className="Label Label-yellow">⚡ {issue.bountyXp} XP</span>}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                  #{issue.number} opened {new Date(issue.createdAt).toLocaleDateString()} by {issue.author?.username || 'unknown'}
                  {issue.commentsCount > 0 && ` · ${issue.commentsCount} comments`}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!loading && issues.length === 0 && <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No quests yet</div>}
      </div>
    </div>
  )
}

/* ===== PULL REQUESTS TAB ===== */
function OfferingsTab({ owner, name }: { owner: string; name: string }) {
  const [pulls, setPulls] = useState<any[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [mergedCount, setMergedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPulls(owner, name).then(data => { setPulls(data.pulls); setOpenCount(data.openCount); setMergedCount(data.mergedCount) }).finally(() => setLoading(false))
  }, [owner, name])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-fg-default)' }}>
            <GitPullRequest className="w-4 h-4" style={{ color: 'var(--color-success-fg)' }} /> {openCount} Open
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
            <Check className="w-4 h-4" /> {mergedCount} Bound
          </span>
        </div>
        <button className="btn btn-sm btn-primary"><Plus className="w-3 h-3" /> New pull request</button>
      </div>
      <div className="Box">
        {pulls.map((pr) => (
          <div key={pr._id} className="Box-row">
            <div className="flex items-start gap-3">
              <GitPullRequest className="w-4 h-4 mt-0.5 shrink-0" style={{ color: pr.state === 'merged' ? 'var(--color-done-fg)' : pr.state === 'open' ? 'var(--color-success-fg)' : 'var(--color-fg-muted)' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{pr.title}</h3>
                  {(pr.labels || []).map((label: any) => (
                    <span key={label.name} className={`Label Label-${label.color}`}>{label.name}</span>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                  #{pr.number} {pr.state === 'merged' ? 'merged' : pr.state === 'closed' ? 'closed' : 'opened'} {new Date(pr.mergedAt || pr.createdAt).toLocaleDateString()} by {pr.author?.username || 'unknown'}
                  {' · '}<span style={{ color: 'var(--color-success-fg)' }}>+{pr.additions}</span> <span style={{ color: 'var(--color-danger-fg)' }}>-{pr.deletions}</span> in {pr.changedFiles} files
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {pr.commentsCount > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{pr.commentsCount}</span>}
              </div>
            </div>
          </div>
        ))}
        {!loading && pulls.length === 0 && <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No offerings yet</div>}
      </div>
    </div>
  )
}

/* ===== COLLABORATORS TAB ===== */
function CollaboratorsTab({ owner, name }: { owner: string; name: string }) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteRole, setInviteRole] = useState('write')
  const { user } = useAuth()

  useEffect(() => {
    api.getCollaborators(owner, name).then(data => setCollaborators(data.collaborators)).finally(() => setLoading(false))
  }, [owner, name])

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return
    try {
      const { collaborator } = await api.addCollaborator(owner, name, inviteUsername, inviteRole)
      setCollaborators(prev => [...prev, collaborator])
      setInviteUsername('')
    } catch (err: any) { alert(err.message) }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this collaborator?')) return
    try {
      await api.removeCollaborator(owner, name, userId)
      setCollaborators(prev => prev.filter(c => c.user?._id !== userId))
    } catch (err: any) { alert(err.message) }
  }

  const isOwner = user?.username === owner

  return (
    <div>
      {isOwner && (
        <div className="Box mb-4">
          <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Invite a collaborator</h3>
          </div>
          <div className="Box-body">
            <div className="flex gap-2">
              <input type="text" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="Username" className="form-control flex-1" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="form-control" style={{ width: 120 }}>
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      )}

      <div className="Box">
        {collaborators.map((collab) => (
          <div key={collab.user?._id || collab._id} className="Box-row">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-counter-bg)', color: 'var(--color-fg-default)' }}>
                  {collab.user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <Link to={`/${collab.user?.username}`} className="text-sm font-medium no-underline hover:underline" style={{ color: 'var(--color-fg-default)' }}>
                    {collab.user?.displayName || collab.user?.username}
                  </Link>
                  <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{collab.user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`Label ${collab.role === 'admin' ? 'Label-purple' : collab.role === 'write' ? 'Label-blue' : 'Label-green'}`}>{collab.role}</span>
                {isOwner && !collab.isOwner && (
                  <button onClick={() => handleRemove(collab.user._id)} className="p-1 rounded transition-colors" style={{ color: 'var(--color-fg-muted)' }} title="Remove">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.15l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && collaborators.length === 0 && <div className="Box-body text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No collaborators yet</div>}
      </div>
    </div>
  )
}

/* ===== SETTINGS TAB ===== */
function SettingsTab({ repo, owner }: { repo: any; owner: string }) {
  const [description, setDescription] = useState(repo.description || '')
  const [visibility, setVisibility] = useState(repo.visibility)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await api.updateRepo(owner, repo.name, { description, visibility }); alert('Settings saved') } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="Box">
        <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Description</h3></div>
        <div className="Box-body"><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" /></div>
      </div>
      <div className="Box">
        <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Visibility</h3></div>
        <div className="Box-body">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-fg-default)' }}>
              <input type="radio" checked={visibility === 'public'} onChange={() => setVisibility('public')} /> Public
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-fg-default)' }}>
              <input type="radio" checked={visibility === 'private'} onChange={() => setVisibility('private')} /> Private
            </label>
          </div>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
    </div>
  )
}

/* ===== SIDEBAR ===== */
function RepoSidebar({ repo, owner, languages }: { repo: any; owner: string; languages: any[] }) {
  return (
    <div className="space-y-0">
      {/* About */}
      <div className="sidebar-section">
        <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)' }}>About</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-fg-muted)' }}>{repo.description || 'No description provided'}</p>
        {repo.homepage && (
          <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--color-accent-fg)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z" /></svg>
            {repo.homepage.replace(/^https?:\/\//, '')}
          </a>
        )}
        <div className="space-y-2 text-sm">
          <div className="sidebar-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Z" /></svg>
            <span style={{ color: 'var(--color-fg-muted)' }}>Readme</span>
          </div>
          <div className="sidebar-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" /></svg>
            <span style={{ color: 'var(--color-fg-muted)' }}>Activity</span>
          </div>
          <div className="sidebar-item">
            <Star className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
            <span className="count">{repo.starsCount || 0}</span>
            <span style={{ color: 'var(--color-fg-muted)' }}>embers</span>
          </div>
          <div className="sidebar-item">
            <Eye className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
            <span className="count">1</span>
            <span style={{ color: 'var(--color-fg-muted)' }}>watching</span>
          </div>
          <div className="sidebar-item">
            <GitFork className="w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
            <span className="count">{repo.forksCount || 0}</span>
            <span style={{ color: 'var(--color-fg-muted)' }}>echoes</span>
          </div>
        </div>
      </div>

      {/* Releases */}
      <div className="sidebar-section">
        <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>Releases</h2>
        <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>No releases published</p>
        <a href="#" className="text-xs mt-1 inline-block" style={{ color: 'var(--color-accent-fg)' }}>Create a new release</a>
      </div>

      {/* Packages */}
      <div className="sidebar-section">
        <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>Packages</h2>
        <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>No packages published</p>
        <a href="#" className="text-xs mt-1 inline-block" style={{ color: 'var(--color-accent-fg)' }}>Publish your first package</a>
      </div>

      {/* Contributors */}
      <div className="sidebar-section">
        <h2 className="sidebar-heading flex items-center gap-1" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>
          Contributors <span className="Counter">1</span>
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)' }}>
            {owner?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm" style={{ color: 'var(--color-accent-fg)' }}>{owner}</span>
        </div>
      </div>

      {/* Languages */}
      {languages.length > 0 && (
        <div className="sidebar-section">
          <h2 className="sidebar-heading" style={{ color: 'var(--color-fg-default)', fontSize: 16 }}>Languages</h2>
          <div className="language-bar">
            {languages.map((lang, i) => (
              <div
                key={lang.name}
                className="language-bar-segment"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: ['#3178c6', '#dea584', '#00add8', '#563d7c', '#3572A5'][i % 5],
                }}
              />
            ))}
          </div>
          <div className="space-y-1">
            {languages.map((lang, i) => (
              <div key={lang.name} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3178c6', '#dea584', '#00add8', '#563d7c', '#3572A5'][i % 5] }} />
                <span style={{ color: 'var(--color-fg-muted)' }}>{lang.name}</span>
                <span style={{ color: 'var(--color-fg-subtle)' }}>{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== MAIN REPO PAGE ===== */
export function RepoPage() {
  const { username, repoName } = useParams()
  const [repo, setRepo] = useState<any>(null)
  const [languages, setLanguages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RepoTab>('code')

  useEffect(() => {
    if (!username || !repoName) return
    api.getRepo(username, repoName).then(data => { setRepo(data.repo); setLanguages(data.languages || []) }).finally(() => setLoading(false))
  }, [username, repoName])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div></div>
  }

  if (!repo) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Codex not found</div></div>
  }

  const tabs: { id: RepoTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
    { id: 'issues', label: 'Quests', icon: <AlertCircle className="w-4 h-4" />, count: repo.openIssuesCount },
    { id: 'pull-requests', label: 'Offerings', icon: <GitPullRequest className="w-4 h-4" />, count: repo.openPullRequestsCount },
    { id: 'collaborators', label: 'Collaborators', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      <div className="container-lg py-4">
        {/* Repo header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to={`/${username}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{username}</Link>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-fg-subtle)' }} />
            <span className="font-semibold text-lg" style={{ color: 'var(--color-fg-default)' }}>{repo.name}</span>
            <span className="Label Label-muted">{repo.visibility}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-default">
              <Eye className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} /> Watch <span className="Counter">0</span>
            </button>
            <button className="btn btn-sm btn-default">
              <GitFork className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} /> Echo <span className="Counter">{repo.forksCount || 0}</span>
            </button>
            <button className="btn btn-sm btn-default">
              <Star className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} /> Ember <span className="Counter">{repo.starsCount || 0}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="UnderlineNav mb-4">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="UnderlineNav-item flex items-center gap-1.5" aria-selected={activeTab === tab.id}>
              {tab.icon}{tab.label}
              {tab.count !== undefined && tab.count > 0 && <span className="Counter">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Content: 2-column layout for Code tab, single column for others */}
        {activeTab === 'code' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
            <CodeTab repo={repo} owner={username!} />
            <RepoSidebar repo={repo} owner={username!} languages={languages} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
                {activeTab === 'issues' && <QuestsTab owner={username!} name={repo.name} />}
                {activeTab === 'pull-requests' && <OfferingsTab owner={username!} name={repo.name} />}
                {activeTab === 'collaborators' && <CollaboratorsTab owner={username!} name={repo.name} />}
                {activeTab === 'settings' && <SettingsTab repo={repo} owner={username!} />}
              </motion.div>
            </AnimatePresence>
            <RepoSidebar repo={repo} owner={username!} languages={languages} />
          </div>
        )}
      </div>
    </div>
  )
}

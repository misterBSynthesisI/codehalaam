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
  ChevronRight, File, Folder, FolderOpen, PanelRightOpen, PanelRightClose,
  AlertCircle, GitPullRequest, Check, Plus, Copy, Code
} from 'lucide-react'
import { api } from '@/lib/api'

/* ═══ FILE TREE NODE ═══ */
function FileTreeNode({ node, depth = 0, onSelect, selectedPath }: {
  node: any; depth?: number; onSelect: (n: any) => void; selectedPath: string
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const isFolder = node.type === 'folder'

  return (
    <div>
      <div
        onClick={() => { if (isFolder) setExpanded(!expanded); else onSelect(node) }}
        className="file-row"
        style={{
          paddingLeft: `${depth * 16 + 12}px`,
          backgroundColor: selectedPath === node.name ? 'var(--color-accent-muted)' : undefined,
          cursor: 'pointer',
        }}
      >
        {isFolder ? (
          <>
            <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--color-fg-subtle)', transform: expanded ? 'rotate(90deg)' : 'none' }} />
            {expanded ? <FolderOpen className="file-icon" style={{ color: 'var(--color-accent-fg)' }} /> : <Folder className="file-icon" style={{ color: 'var(--color-accent-fg)' }} />}
          </>
        ) : (
          <><span className="w-3 h-3" /><File className="file-icon" style={{ color: 'var(--color-fg-subtle)' }} /></>
        )}
        <span className="file-name">{node.name}</span>
      </div>
      <AnimatePresence>
        {isFolder && expanded && node.children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}>
            {node.children.map((child: any) => (
              <FileTreeNode key={child.name} node={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══ CODE VIEWER (Center Pane) ═══ */
function CodeViewer({ file }: { file: any }) {
  if (!file || !file.content) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-fg-muted)' }}>
        <div className="text-center">
          <Code className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-fg-subtle)' }} />
          <p className="text-sm">Select a file to view its contents</p>
        </div>
      </div>
    )
  }

  const lines = file.content.split('\n')

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--color-canvas-default)' }}>
      {/* File header */}
      <div className="sticky top-0 flex items-center gap-2 px-4 py-2 text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}>
        <File className="w-3.5 h-3.5" />
        <span className="font-medium" style={{ color: 'var(--color-fg-default)' }}>{file.name}</span>
        {file.size && <span className="ml-auto">{file.size}</span>}
        {file.language && <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)' }}>{file.language}</span>}
      </div>
      {/* Code with line numbers */}
      <div className="flex" style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace', fontSize: 13, lineHeight: '20px' }}>
        <div className="select-none py-3 pl-3 pr-2 text-right" style={{ color: 'var(--color-fg-subtle)', minWidth: 48, borderRight: '1px solid var(--color-border-default)' }}>
          {lines.map((_: string, i: number) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="flex-1 overflow-x-auto py-3 px-4 m-0" style={{ color: 'var(--color-fg-default)' }}>
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  )
}

/* ═══ CONTEXT DRAWER (Right Pane) ═══ */
type DrawerTab = 'readme' | 'quests' | 'offerings'

function ContextDrawer({ owner, name, repo, onClose }: { owner: string; name: string; repo: any; onClose: () => void }) {
  const [tab, setTab] = useState<DrawerTab>('readme')
  const [issues, setIssues] = useState<any[]>([])
  const [pulls, setPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'quests' && issues.length === 0) {
      setLoading(true)
      api.getIssues(owner, name).then(d => setIssues(d.issues || [])).finally(() => setLoading(false))
    }
    if (tab === 'offerings' && pulls.length === 0) {
      setLoading(true)
      api.getPulls(owner, name).then(d => setPulls(d.pulls || [])).finally(() => setLoading(false))
    }
  }, [tab, owner, name])

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '1px solid var(--color-border-default)', width: 350, minWidth: 350 }}>
      {/* Tab bar */}
      <div className="flex items-center gap-0 shrink-0" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
        {([
          { id: 'readme' as const, label: 'README' },
          { id: 'quests' as const, label: `Quests${issues.length ? ` (${issues.filter(i => i.state === 'open').length})` : ''}` },
          { id: 'offerings' as const, label: `Offerings${pulls.length ? ` (${pulls.filter(p => p.state === 'open').length})` : ''}` },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-3 py-2 text-xs font-medium transition-colors"
            style={{
              color: tab === t.id ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
              borderBottom: tab === t.id ? '2px solid var(--color-accent-fg)' : '2px solid transparent',
              background: 'transparent',
            }}
          >{t.label}</button>
        ))}
        <button onClick={onClose} className="ml-auto p-2" style={{ color: 'var(--color-fg-muted)' }} title="Close panel">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'readme' && (
          <div className="p-4">
            {repo.defaultReadme ? (
              <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-fg-default)', fontFamily: 'inherit' }}>
                {repo.defaultReadme}
              </pre>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>No README found.</p>
            )}
          </div>
        )}

        {tab === 'quests' && (
          <div>
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
            ) : issues.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No quests yet</div>
            ) : (
              issues.map(issue => (
                <div key={issue._id} className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <div className="flex items-start gap-2">
                    {issue.state === 'open' ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-success-fg)' }} /> : <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-done-fg)' }} />}
                    <div className="min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{issue.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                        #{issue.number} · {issue.author?.username || 'unknown'}
                        {issue.bountyXp > 0 && <span style={{ color: 'var(--color-attention-fg)' }}> · ⚡{issue.bountyXp}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'offerings' && (
          <div>
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>Loading...</div>
            ) : pulls.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>No offerings yet</div>
            ) : (
              pulls.map(pr => (
                <div key={pr._id} className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{
                      color: pr.state === 'merged' ? 'var(--color-done-fg)' : pr.state === 'open' ? 'var(--color-success-fg)' : 'var(--color-fg-muted)'
                    }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{pr.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                        #{pr.number} · {pr.author?.username || 'unknown'} ·
                        <span style={{ color: 'var(--color-success-fg)' }}> +{pr.additions}</span>
                        <span style={{ color: 'var(--color-danger-fg)' }}> -{pr.deletions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ MAIN 3-PANE WORKSPACE ═══ */
export function RepoPage() {
  const { username, repoName } = useParams()
  const [repo, setRepo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)

  useEffect(() => {
    if (!username || !repoName) return
    api.getRepo(username, repoName).then(data => {
      setRepo(data.repo)
      // Auto-select README
      const findReadme = (files: any[]): any => {
        for (const f of files) {
          if (f.name === 'README.md') return f
          if (f.children) { const found = findReadme(f.children); if (found) return found }
        }
        return null
      }
      setSelectedFile(findReadme(data.repo.fileTree || []))
    }).finally(() => setLoading(false))
  }, [username, repoName])

  if (loading) {
    return <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading...</div></div>
  }

  if (!repo) {
    return <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Codex not found</div></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]" style={{ backgroundColor: 'var(--color-canvas-default)' }}>

      {/* ═══ Top Bar ═══ */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
        <div className="flex items-center gap-2 text-sm">
          <Link to={`/${username}`} className="no-underline hover:underline" style={{ color: 'var(--color-accent-fg)' }}>{username}</Link>
          <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-fg-subtle)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-fg-default)' }}>{repo.name}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{
            backgroundColor: repo.visibility === 'private' ? 'var(--color-canvas-subtle)' : 'var(--color-success-muted)',
            color: repo.visibility === 'private' ? 'var(--color-fg-muted)' : 'var(--color-success-fg)',
            border: '1px solid var(--color-border-default)',
          }}>{repo.visibility}</span>
          {repo.description && <span className="text-xs hidden sm:inline ml-2" style={{ color: 'var(--color-fg-muted)' }}>— {repo.description}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}
          >
            <Copy className="w-3 h-3" /> Clone
          </button>
          {!drawerOpen && (
            <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded transition-colors" style={{ color: 'var(--color-fg-muted)' }} title="Open context panel">
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ═══ 3-Pane Body ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Pane: File Tree */}
        <div className="overflow-y-auto shrink-0" style={{ width: 250, minWidth: 250, borderRight: '1px solid var(--color-border-default)' }}>
          <div className="py-1">
            {(repo.fileTree || []).map((node: any) => (
              <FileTreeNode key={node.name} node={node} onSelect={setSelectedFile} selectedPath={selectedFile?.name || ''} />
            ))}
            {(repo.fileTree || []).length === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                No files yet
              </div>
            )}
          </div>
        </div>

        {/* Center Pane: Code Viewer */}
        <CodeViewer file={selectedFile} />

        {/* Right Pane: Context Drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 350, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <ContextDrawer owner={username!} name={repoName!} repo={repo} onClose={() => setDrawerOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

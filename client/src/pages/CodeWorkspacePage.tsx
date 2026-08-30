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

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, File, Folder, FolderOpen, FileCode2,
  GitBranch, ChevronDown, BookOpen, AlertCircle, GitPullRequest,
  MessageSquare
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'

/* ===== MARKDOWN COMPONENTS ===== */
const mdComponents: Record<string, any> = {
  h1: ({ children, ...props }: any) => <h1 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b" style={{ color: 'var(--color-fg-default)', borderColor: 'var(--color-border-default)' }} {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 className="text-xl font-semibold mt-4 mb-2 pb-1 border-b" style={{ color: 'var(--color-fg-default)', borderColor: 'var(--color-border-default)' }} {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</h3>,
  p: ({ children, ...props }: any) => <p className="mb-2 leading-relaxed text-sm" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</p>,
  a: ({ children, href, ...props }: any) => <a href={href} className="no-underline hover:underline text-sm" style={{ color: 'var(--color-accent-fg)' }} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
  ul: ({ children, ...props }: any) => <ul className="mb-2 ml-5 list-disc space-y-1 text-sm" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</ul>,
  ol: ({ children, ...props }: any) => <ol className="mb-2 ml-5 list-decimal space-y-1 text-sm" style={{ color: 'var(--color-fg-default)' }} {...props}>{children}</ol>,
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) return <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-accent-fg)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} {...props}>{children}</code>
    return <code className={className} {...props}>{children}</code>
  },
  pre: ({ children, ...props }: any) => (
    <pre className="rounded p-3 my-3 overflow-x-auto text-xs leading-relaxed" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }} {...props}>{children}</pre>
  ),
  table: ({ children, ...props }: any) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-xs" style={{ border: '1px solid var(--color-border-default)' }} {...props}>{children}</table></div>,
  thead: ({ children, ...props }: any) => <thead style={{ backgroundColor: 'var(--color-canvas-subtle)' }} {...props}>{children}</thead>,
  th: ({ children, ...props }: any) => <th className="px-2 py-1.5 text-left font-semibold border text-xs" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-fg-default)' }} {...props}>{children}</th>,
  td: ({ children, ...props }: any) => <td className="px-2 py-1.5 border text-xs" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-fg-default)' }} {...props}>{children}</td>,
  hr: (props: any) => <hr className="my-4" style={{ borderColor: 'var(--color-border-default)' }} {...props} />,
  input: ({ ...props }: any) => <input className="mr-2" {...props} />,
}

/* ===== FILE TREE NODE ===== */
function FileTreeNode({ node, depth = 0, onSelect, selectedPath }: {
  node: any; depth?: number; onSelect: (n: any) => void; selectedPath: string
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const isFolder = node.type === 'folder'
  const isSelected = selectedPath === node.path || selectedPath === node.name

  return (
    <div>
      <div
        onClick={() => { if (isFolder) setExpanded(!expanded); else onSelect(node) }}
        className="flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-canvas-subtle text-xs"
        style={{
          paddingLeft: `${depth * 14 + 8}px`,
          backgroundColor: isSelected ? 'var(--color-accent-muted)' : undefined,
          color: isSelected ? 'var(--color-accent-fg)' : 'var(--color-fg-default)',
        }}
      >
        {isFolder ? (
          <>
            <ChevronDown className="w-3 h-3 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
            {expanded ? <FolderOpen className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} /> : <Folder className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-accent-fg)' }} />}
          </>
        ) : (
          <>
            <span className="w-3 h-3 shrink-0" />
            <File className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
          </>
        )}
        <span className="truncate">{node.name}</span>
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

/* ===== LINE-NUMBERED CODE ===== */
function CodeViewer({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="flex overflow-x-auto" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12, lineHeight: '1.6' }}>
      <div className="shrink-0 select-none text-right pr-3 py-3" style={{ color: 'var(--color-fg-subtle)', minWidth: 40, borderRight: '1px solid var(--color-border-default)' }}>
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <pre className="flex-1 p-3 overflow-x-auto" style={{ color: 'var(--color-fg-default)' }}>
        <code>{content}</code>
      </pre>
    </div>
  )
}

/* ===== CODE WORKSPACE PAGE ===== */
export function CodeWorkspacePage() {
  const { owner: ownerParam, name } = useParams()
  const owner = ownerParam || ''
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const ref = searchParams.get('ref') || 'main'
  const selectedPath = searchParams.get('path') || ''

  const [repo, setRepo] = useState<any>(null)
  const [fileTree, setFileTree] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [paths, setPaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPathDropdown, setShowPathDropdown] = useState(false)

  // Load codex data
  useEffect(() => {
    if (!owner || !name) return
    api.getCodex(owner, name).then(d => {
      setRepo(d.repo)
      setFileTree(d.repo.fileTree || [])
    }).catch(() => {}).finally(() => setLoading(false))
    api.getPaths(owner, name).then(d => setPaths(d.paths || [])).catch(() => {})
  }, [owner, name])

  // Load selected file
  useEffect(() => {
    if (!owner || !name || !selectedPath) {
      // Auto-select README
      const findReadme = (files: any[]): any => {
        for (const f of files) {
          if (f.name === 'README.md') return f
          if (f.children) { const found = findReadme(f.children); if (found) return found }
        }
        return null
      }
      const readme = findReadme(fileTree)
      if (readme) {
        setSelectedFile(readme)
        setSearchParams({ ref, path: readme.path || readme.name })
      }
      return
    }
    // Find file in tree
    const parts = selectedPath.split('/')
    let current = fileTree
    for (let i = 0; i < parts.length; i++) {
      const found = current.find((f: any) => f.name === parts[i])
      if (!found) { setSelectedFile(null); return }
      if (i === parts.length - 1) { setSelectedFile(found); return }
      if (found.children) current = found.children
      else { setSelectedFile(null); return }
    }
  }, [selectedPath, fileTree, owner, name])

  const handleSelectFile = useCallback((node: any) => {
    const filePath = node.path || node.name
    setSelectedFile(node)
    setSearchParams({ ref, path: filePath })
  }, [ref, setSearchParams])

  const handleSwitchRef = useCallback((newRef: string) => {
    setSearchParams({ ref: newRef })
    setShowPathDropdown(false)
  }, [setSearchParams])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Loading workspace...</div></div>
  }

  if (!repo) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-default)' }}><div style={{ color: 'var(--color-fg-muted)' }}>Codex not found</div></div>
  }

  const isMarkdown = selectedFile && (selectedFile.name?.endsWith('.md') || selectedFile.language === 'Markdown')

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="border-b flex items-center h-10 px-3 gap-2" style={{ borderColor: 'var(--color-border-default)' }}>
        <Link to={`/codex/${owner}/${name}`} className="text-xs no-underline hover:underline flex items-center gap-1" style={{ color: 'var(--color-accent-fg)' }}>
          <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />{owner}/{name}
        </Link>
        <ChevronRight className="w-3 h-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--color-fg-default)' }}>Code</span>

        {/* Branch selector */}
        <div className="relative ml-2">
          <button onClick={() => setShowPathDropdown(!showPathDropdown)} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors hover:bg-canvas-subtle" style={{ border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
            <GitBranch className="w-3 h-3" strokeWidth={1.5} />{ref}
          </button>
          {showPathDropdown && (
            <div className="absolute top-full left-0 mt-1 rounded-md shadow-lg z-50 py-1" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', minWidth: 160, backdropFilter: 'blur(12px)' }}>
              {paths.map((p: any) => (
                <button key={p._id} onClick={() => handleSwitchRef(p.name)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-canvas-default" style={{ color: ref === p.name ? 'var(--color-accent-fg)' : 'var(--color-fg-default)' }}>
                  <GitBranch className="w-3 h-3" strokeWidth={1.5} />{p.name}
                  {p.isDefault && <span className="ml-auto text-xs" style={{ color: 'var(--color-fg-subtle)' }}>default</span>}
                </button>
              ))}
              {paths.length === 0 && (
                <button onClick={() => handleSwitchRef('main')} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs" style={{ color: 'var(--color-fg-default)' }}>
                  <GitBranch className="w-3 h-3" strokeWidth={1.5} />main
                </button>
              )}
            </div>
          )}
        </div>

        {selectedPath && (
          <span className="text-xs ml-2" style={{ color: 'var(--color-fg-muted)' }}>
            {selectedPath}
          </span>
        )}
      </div>

      {/* 3-pane layout */}
      <div className="grid grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_280px] h-[calc(100vh-40px)]">
        {/* Left: File tree */}
        <div className="border-r overflow-y-auto" style={{ borderColor: 'var(--color-border-default)', maxHeight: 'calc(100vh - 40px)' }}>
          <div className="py-2">
            {fileTree.map((node: any) => (
              <FileTreeNode key={node.name} node={node} depth={0} onSelect={handleSelectFile} selectedPath={selectedPath} />
            ))}
          </div>
        </div>

        {/* Center: File content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 40px)' }}>
          {selectedFile ? (
            <div>
              {/* File header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-canvas-subtle)' }}>
                <File className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: 'var(--color-fg-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-fg-default)' }}>{selectedFile.name}</span>
                {selectedFile.size && <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>{selectedFile.size}</span>}
              </div>

              {/* Content */}
              {selectedFile.content ? (
                isMarkdown ? (
                  <div className="p-4 markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                      {selectedFile.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <CodeViewer content={selectedFile.content} />
                )
              ) : (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                  No content available
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileCode2 className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} style={{ color: 'var(--color-fg-subtle)' }} />
                <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Context panel */}
        <div className="border-l overflow-y-auto hidden lg:block" style={{ borderColor: 'var(--color-border-default)', maxHeight: 'calc(100vh - 40px)' }}>
          <div className="p-3 space-y-3">
            {/* Codex info */}
            <div className="text-xs space-y-1">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>Codex Info</h3>
              <p style={{ color: 'var(--color-fg-muted)' }}>{repo.description || 'No description'}</p>
              {repo.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {repo.topics.map((t: string) => <span key={t} className="Label Label-blue">{t}</span>)}
                </div>
              )}
            </div>

            <hr style={{ borderColor: 'var(--color-border-default)' }} />

            {/* Quick links */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>Quick Links</h3>
              <Link to={`/codex/${owner}/${name}`} className="flex items-center gap-2 text-xs no-underline py-1 hover:bg-canvas-subtle rounded px-2" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                <BookOpen className="w-3 h-3" strokeWidth={1.5} /> Codex Home
              </Link>
              <Link to={`/codex/${owner}/${name}`} className="flex items-center gap-2 text-xs no-underline py-1 hover:bg-canvas-subtle rounded px-2" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                <AlertCircle className="w-3 h-3" strokeWidth={1.5} /> Quests
              </Link>
              <Link to={`/codex/${owner}/${name}`} className="flex items-center gap-2 text-xs no-underline py-1 hover:bg-canvas-subtle rounded px-2" style={{ color: 'var(--color-accent-fg)', textDecoration: 'none' }}>
                <GitPullRequest className="w-3 h-3" strokeWidth={1.5} /> Offerings
              </Link>
            </div>

            <hr style={{ borderColor: 'var(--color-border-default)' }} />

            {/* Selected file info */}
            {selectedFile && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>File Info</h3>
                <div className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  <p><strong>Path:</strong> {selectedFile.path || selectedFile.name}</p>
                  {selectedFile.size && <p><strong>Size:</strong> {selectedFile.size}</p>}
                  {selectedFile.language && <p><strong>Language:</strong> {selectedFile.language}</p>}
                  {selectedFile.content && <p><strong>Lines:</strong> {selectedFile.content.split('\n').length}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

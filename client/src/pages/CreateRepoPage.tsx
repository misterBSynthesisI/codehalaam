import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Lock, Globe } from 'lucide-react'

export function CreateRepoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return; setLoading(true); setError('')
    try { const { repo } = await api.createRepo({ name: name.trim(), description: description.trim(), visibility }); navigate(`/${user!.username}/${repo.name}`) }
    catch (err: any) { setError(err.message || 'Failed') } finally { setLoading(false) }
  }

  const s = { backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }

  return (
    <div style={s}>
      <div className="container-md py-6">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>Create a new repository</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-fg-muted)' }}>A repository contains all your project's files and revision history.</p>
        <div className="Box p-6">
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)' }}>{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Repository name <span style={{ color: 'var(--color-danger-fg)' }}>*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>{user?.username} /</span>
                <input type="text" value={name} onChange={e => setName(e.target.value.replace(/\s/g, '-'))} placeholder="my-project" className="form-control flex-1" autoFocus required />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="form-control" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-fg-default)' }}>Visibility</label>
              <div className="space-y-3">
                {[{ val: 'public', icon: <Globe className="w-4 h-4" />, label: 'Public', desc: 'Anyone on the internet can see this repository.' }, { val: 'private', icon: <Lock className="w-4 h-4" />, label: 'Private', desc: 'You choose who can see and commit to this repository.' }].map(opt => (
                  <label key={opt.val} className="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors"
                    style={{ border: `1px solid ${visibility === opt.val ? 'var(--color-accent-fg)' : 'var(--color-border-default)'}`, backgroundColor: visibility === opt.val ? 'var(--color-accent-muted)' : 'transparent' }}>
                    <input type="radio" checked={visibility === opt.val} onChange={() => setVisibility(opt.val as any)} className="mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{opt.icon} {opt.label}</div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading || !name.trim()} className="btn btn-primary">{loading ? 'Creating...' : 'Create repository'}</button>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-default">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

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
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Check, X, AlertCircle, Database, Lock } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function CodeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  )
}

interface SetupChecks {
  needsSetup: boolean | null
  dbReachable: boolean | null
}

export function SetupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [checks, setChecks] = useState<SetupChecks>({ needsSetup: null, dbReachable: null })
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    runChecks()
  }, [])

  async function runChecks() {
    setChecking(true)
    try {
      // Health check
      try {
        const healthRes = await fetch('/api/health')
        const health = await healthRes.json()
        setChecks(prev => ({ ...prev, dbReachable: health.database === 'connected' }))
      } catch {
        setChecks(prev => ({ ...prev, dbReachable: false }))
      }

      // Setup status
      const { needsSetup } = await api.getSetupStatus()
      setChecks(prev => ({ ...prev, needsSetup }))
    } catch {
      setChecks({ needsSetup: null, dbReachable: false })
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // Create admin
      const { user, token } = await api.createAdmin(username, email, password)
      api.setToken(token)
      // Log the user in via context
      login(email, password).catch(() => {
        // If login fails, still navigate — token is set
        navigate('/dashboard')
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create admin account')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (checking || checks.needsSetup === null) {
    return (
      <div className="flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: 'calc(100vh - 50px)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 animate-pulse" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)' }}>
            <CodeLogo />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Checking database…</p>
        </div>
      </div>
    )
  }

  // Database not reachable
  if (checks.dbReachable === false) {
    return (
      <div className="flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: 'calc(100vh - 50px)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="w-full max-w-[480px]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--color-danger-subtle)', border: '1px solid rgba(248,81,73,0.4)' }}>
              <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-danger-fg)' }} />
            </div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-fg-default)' }}>Database Not Connected</h1>
          </div>

          <div className="Box p-6">
            <p className="text-sm mb-4" style={{ color: 'var(--color-fg-muted)' }}>
              CODEHALAAM needs a MongoDB database to run. Choose one of these free options:
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Option 1: MongoDB Atlas (Recommended)</h3>
                <p style={{ color: 'var(--color-fg-muted)' }}>Free M0 cluster at <a href="https://www.mongodb.com/atlas" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-fg)' }}>mongodb.com/atlas</a>. Set the <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>MONGODB_URI</code> env var.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Option 2: Supabase (Postgres)</h3>
                <p style={{ color: 'var(--color-fg-muted)' }}>Not yet supported — MongoDB is required.</p>
              </div>
            </div>

            <button onClick={runChecks} className="btn btn-primary w-full py-2 mt-6">Retry connection</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Setup already complete
  if (checks.needsSetup === false) {
    return (
      <div className="flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: 'calc(100vh - 50px)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--color-success-subtle)', border: '1px solid var(--color-success-muted)' }}>
            <Check className="w-8 h-8" style={{ color: 'var(--color-success-fg)' }} />
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>Setup Complete</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-fg-muted)' }}>An admin account already exists. Sign in to continue.</p>
          <button onClick={() => navigate('/auth?mode=login')} className="btn btn-primary w-full py-2">Go to sign in</button>
        </motion.div>
      </div>
    )
  }

  // Setup form — first-run admin creation
  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: 'calc(100vh - 50px)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-fg-default)' }}>Welcome to CODEHALAAM</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-fg-muted)' }}>Create your admin account to get started</p>
        </div>

        {/* Status checks */}
        <div className="flex items-center justify-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1" style={{ color: checks.dbReachable ? 'var(--color-success-fg)' : 'var(--color-danger-fg)' }}>
            {checks.dbReachable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            <Database className="w-3 h-3" />
            Database
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-success-fg)' }}>
            <Check className="w-3 h-3" />
            <Lock className="w-3 h-3" />
            Admin setup
          </span>
        </div>

        <div className="Box p-6" style={{ boxShadow: 'var(--color-shadow-large)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', border: '1px solid rgba(248,81,73,0.4)', color: 'var(--color-danger-fg)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Admin username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin" className="form-control" autoFocus required minLength={3} maxLength={39} pattern="[a-zA-Z0-9-]+" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="form-control" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="form-control" required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="form-control" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2 mt-2">{loading ? 'Creating admin…' : 'Create admin account'}</button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-fg-muted)' }}>
          This setup page is only available when the database has no users. Once an admin is created, it disables automatically.
        </p>
      </motion.div>
    </div>
  )
}

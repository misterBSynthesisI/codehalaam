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

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Zap } from 'lucide-react'

type AuthMode = 'login' | 'signup'

function CodeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<AuthMode>(() => {
    const param = searchParams.get('mode')
    return param === 'login' ? 'login' : 'signup'
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') await signup(username, email, password)
      else await login(email, password)
      navigate('/dashboard')
    } catch (err: any) { setError(err.message || 'Something went wrong') } finally { setLoading(false) }
  }

  const handleQuickLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await login('kai@codehalaam.dev', 'kai12345')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Quick login failed. Make sure the database is seeded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: 'calc(100vh - 50px)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="w-full max-w-[340px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-default)' }}>
            <CodeLogo />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-fg-default)' }}>
            {mode === 'signup' ? 'Create your account' : 'Sign in to CODEHALAAM'}
          </h1>
        </div>

        <div className="Box p-6" style={{ boxShadow: 'var(--color-shadow-large)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'var(--color-danger-muted)', border: '1px solid rgba(248,81,73,0.4)', color: 'var(--color-danger-fg)' }}>
              {error}
            </div>
          )}

          {/* Quick login button */}
          {mode === 'login' && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                onClick={handleQuickLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm border transition-colors"
                style={{
                  backgroundColor: 'var(--color-success-subtle)',
                  borderColor: 'var(--color-success-muted)',
                  color: 'var(--color-success-fg)',
                }}
                data-testid="quick-login"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Logging in...' : 'Try Demo Account'}
              </motion.button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--color-border-default)' }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-muted)' }}>or sign in with credentials</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Username</label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. kai" className="form-control" autoFocus required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Email address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="form-control" required />
                </div>
              </>
            )}
            {mode === 'login' && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Username or email address</label>
                <input id="email-login" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Username or email" className="form-control" autoFocus required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Create a password (8+ characters)' : 'Enter your password'} className="form-control" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2 mt-2">{loading ? 'Loading...' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-fg-muted)' }}>
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={() => { setMode('login'); setError('') }} style={{ color: 'var(--color-accent-fg)' }} className="hover:underline">Sign in</button></>
          ) : (
            <>New to CODEHALAAM? <button onClick={() => { setMode('signup'); setError('') }} style={{ color: 'var(--color-accent-fg)' }} className="hover:underline">Create an account</button></>
          )}
        </p>
      </motion.div>
    </div>
  )
}

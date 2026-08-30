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

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, Users, Lock, Zap, Globe, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [demoLoading, setDemoLoading] = useState(false)
  const [stats, setStats] = useState<{ totalUsers: number; totalRepos: number } | null>(null)

  useEffect(() => { api.getStats().then(setStats).catch(() => {}) }, [])

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="relative container-lg py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--color-fg-default)' }}>
                Build software <span style={{ color: 'var(--color-accent-fg)' }}>better</span>, <span style={{ color: 'var(--color-success-fg)' }}>together</span>
              </h1>
              <p className="text-xl mb-8 max-w-lg" style={{ color: 'var(--color-fg-muted)' }}>
                The development platform where teams ship faster. Free private codexes, unlimited collaborators, and rewards for every contribution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button onClick={() => navigate('/auth')} className="btn btn-primary text-base px-6 py-2">
                  Get started for free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    setDemoLoading(true)
                    try {
                      await login('kai@codehalaam.dev', 'password123')
                      navigate('/dashboard')
                    } catch { navigate('/auth?mode=login') } finally { setDemoLoading(false) }
                  }}
                  disabled={demoLoading}
                  className="btn btn-default text-base px-6 py-2"
                  data-testid="see-demo"
                >
                  {demoLoading ? 'Signing in...' : 'See the demo'}
                </button>
              </div>
              <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                <div className="flex items-center gap-2">
                  {stats ? (
                    <span>{stats.totalUsers.toLocaleString()} developers</span>
                  ) : (
                    <span>developers</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--color-attention-fg)' }}>★</span>
                  {stats ? (
                    <span>{stats.totalRepos.toLocaleString()} codexes</span>
                  ) : (
                    <span>codexes</span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.15 }} className="lg:ml-auto">
              <div className="Box p-6 w-full max-w-md" style={{ boxShadow: 'var(--color-shadow-large)' }}>
                <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>Create your free account</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--color-fg-muted)' }}>Unlimited public and private codexes and collaborators.</p>
                <form onSubmit={(e) => { e.preventDefault(); navigate('/auth') }} className="space-y-3">
                  <input type="text" placeholder="Username" className="form-control" />
                  <input type="email" placeholder="Email address" className="form-control" />
                  <input type="password" placeholder="Password" className="form-control" />
                  <button type="submit" className="btn btn-primary w-full py-2">Create account</button>
                </form>
                <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                    Already have an account?{' '}
                    <button onClick={() => navigate('/auth?mode=login')} style={{ color: 'var(--color-accent-fg)' }} className="hover:underline">Sign in</button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="container-lg py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-fg-default)' }}>Everything you need to ship</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-fg-muted)' }}>
              Free private codexes, unlimited collaborators, and rewards for every contribution. Everything GitHub charges for, free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Lock className="w-5 h-5" />, title: 'Unlimited private codexes', desc: 'Keep your code private with unlimited codexes.', color: 'var(--color-success-fg)' },
              { icon: <Users className="w-5 h-5" />, title: 'Unlimited collaborators', desc: 'Invite your entire team. No per-seat pricing.', color: 'var(--color-accent-fg)' },
              { icon: <GitBranch className="w-5 h-5" />, title: 'Offerings & reviews', desc: 'Code review with inline comments and approvals.', color: 'var(--color-done-fg)' },
              { icon: <Zap className="w-5 h-5" />, title: 'Earn XP for contributions', desc: 'Level up by committing, reviewing offerings, and closing quests.', color: 'var(--color-attention-fg)' },
              { icon: <Globe className="w-5 h-5" />, title: 'Global leaderboard', desc: 'See how you rank against developers worldwide.', color: 'var(--color-danger-fg)' },
              { icon: <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" /></svg>, title: 'Quests & bounties', desc: 'Track bugs, feature requests, and bounties.', color: 'var(--color-fg-muted)' },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: i * 0.08 }}
                className="Box p-6" style={{ borderColor: 'var(--color-border-default)' }}>
                <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-canvas-subtle)', color: feature.color }}>{feature.icon}</div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg-muted)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lg py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-fg-default)' }}>Ready to start building?</h2>
        <p className="mb-6" style={{ color: 'var(--color-fg-muted)' }}>Join thousands of developers shipping faster with CODEHALAAM.</p>
        <button onClick={() => navigate('/auth')} className="btn btn-primary px-8 py-2 text-base">Create your free account</button>
      </section>
    </div>
  )
}

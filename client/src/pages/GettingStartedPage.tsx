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

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Rocket, UserPlus, FolderPlus, GitBranch, Upload, Flame,
  Trophy, Users, BookOpen, ArrowRight, Check, Code2, Zap,
  Terminal, Shield, Star
} from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up for free — no credit card, no feature gates. Every capability is available from day one.',
    details: [
      'Choose a unique username (this becomes your public identity)',
      'Set a secure password (8+ characters)',
      'Verify your email (coming soon)',
    ],
    color: 'var(--color-accent-fg)',
    link: '/auth',
    linkText: 'Sign up now',
  },
  {
    number: 2,
    icon: FolderPlus,
    title: 'Create Your First Codex',
    description: 'A codex is your project workspace — like a repository, but gamified. Public or private, your choice.',
    details: [
      'Navigate to /new or click "New Codex" in the navbar',
      'Give it a name and description',
      'Choose visibility: public (anyone can see) or private (invite-only)',
      'Your codex comes with a default README, .gitignore, and file tree',
    ],
    color: 'var(--color-success-fg)',
    link: '/new',
    linkText: 'Create a codex',
  },
  {
    number: 3,
    icon: Upload,
    title: 'Add Your Code',
    description: 'Push via Git or upload files directly — up to 30MB per file with Vercel Blob persistence.',
    details: [
      'Clone your codex and push with standard Git commands',
      'Or upload files directly from the code workspace',
      'Supported: all programming languages, archives, images, docs',
      'File tree updates automatically on upload',
    ],
    color: 'var(--color-done-fg)',
    code: `git clone https://codehalaam.vercel.app/you/your-codex.git\ncd your-codex\ngit add .\ngit commit -m "Initial upload"\ngit push origin main`,
  },
  {
    number: 4,
    icon: Users,
    title: 'Invite Collaborators',
    description: 'Unlimited collaborators on every codex — no per-seat pricing, no limits.',
    details: [
      'Go to your codex settings → Collaborators',
      'Invite by username or email',
      'Set roles: Owner, Admin, Write, or Read',
      'Non-existing users get an invitation link',
    ],
    color: 'var(--color-attention-fg)',
  },
  {
    number: 5,
    icon: Flame,
    title: 'Start Earning XP',
    description: 'Every action earns experience points. Level up, unlock achievements, and climb the leaderboard.',
    details: [
      'Commit code: +10 XP',
      'Open a Quest (issue): +5 XP',
      'Submit an Offering (PR): +10 XP',
      'Bind an Offering (merge): +50 XP',
      'Review code: +25 XP',
      'Give an Ember (star): +2 XP',
    ],
    color: '#f97316',
  },
]

const FEATURES = [
  { icon: Shield, title: 'Private Codexes', desc: 'Hidden from unauthorized viewers — returns 404, not 403' },
  { icon: Trophy, title: 'XP & Levels', desc: 'Earn experience for every contribution, level up with 1.5x multiplier' },
  { icon: Zap, title: 'Quests & Offerings', desc: 'Gamified issues and PRs with XP bounties and binding workflow' },
  { icon: Star, title: 'Embers & Echoes', desc: 'Star your favorites, fork to contribute — every interaction counts' },
  { icon: BookOpen, title: 'Community Forum', desc: 'Q&A-style discussions with voting, accepted answers, and admin moderation' },
  { icon: Terminal, title: 'Full REST API', desc: 'Programmatic access to everything — authenticate with JWT tokens' },
]

export function GettingStartedPage() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-accent-muted) 0%, transparent 50%, var(--color-success-muted) 100%)' }} />
        <div className="relative container-lg py-16 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)', border: '1px solid rgba(46,160,67,0.3)' }}>
              <Rocket className="w-3 h-3" /> Free forever — no credit card required
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Get started with <span style={{ color: 'var(--color-accent-fg)' }}>CODEHALAAM</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-fg-muted)' }}>
              Ship faster with gamified code hosting. Free private codexes, unlimited collaborators, 
              and XP rewards for every contribution.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="container-lg py-12 max-w-3xl">
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-6"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: `${step.color}20`, color: step.color, border: `2px solid ${step.color}40` }}>
                    {step.number}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 my-2" style={{ backgroundColor: 'var(--color-border-default)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-fg-default)' }}>{step.title}</h3>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--color-fg-muted)' }}>{step.description}</p>
                  
                  <ul className="space-y-1.5 mb-3">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: step.color }} />
                        <span style={{ color: 'var(--color-fg-default)' }}>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {step.code && (
                    <div className="rounded-lg p-3 mb-3 text-xs font-mono overflow-x-auto"
                      style={{ backgroundColor: 'var(--color-canvas-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}>
                      <pre className="whitespace-pre">{step.code}</pre>
                    </div>
                  )}

                  {step.link && (
                    <button
                      onClick={() => navigate(step.link)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: step.color }}
                    >
                      {step.linkText} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="container-lg py-12 max-w-4xl">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ letterSpacing: '-0.01em' }}>Everything you need</h2>
          <p className="text-sm text-center mb-8" style={{ color: 'var(--color-fg-muted)' }}>
            CODEHALAAM includes everything GitHub charges for — plus gamification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="Box p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-fg)' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>{feature.title}</h4>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container-lg py-12 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to start building?</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-fg-muted)' }}>
          Join developers shipping faster with CODEHALAAM. It&apos;s free, forever.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate('/auth')} className="btn btn-primary px-6 py-2">
            Create your free account <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/docs')} className="btn btn-default px-6 py-2">
            <Code2 className="w-4 h-4" /> Read the docs
          </button>
        </div>
      </div>
    </div>
  )
}

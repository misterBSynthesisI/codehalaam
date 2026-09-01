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
import { Home, ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  code: 400 | 401 | 403 | 404 | 500 | 503
  title?: string
  message?: string
}

const ERROR_CONFIG: Record<number, { title: string; message: string; emoji: string }> = {
  400: { title: 'Bad Request', message: 'The request could not be understood. Check your input and try again.', emoji: '🤔' },
  401: { title: 'Unauthorized', message: 'You need to sign in to access this page.', emoji: '🔒' },
  403: { title: 'Forbidden', message: 'You don’t have permission to access this resource.', emoji: '🚫' },
  404: { title: 'Page not found', message: 'The page you’re looking for doesn’t exist or has been moved.', emoji: '🌌' },
  500: { title: 'Server error', message: 'Something went wrong on our end. We’re on it — try again in a moment.', emoji: '💥' },
  503: { title: 'Service unavailable', message: 'CODEHALAAM is temporarily down for maintenance. We’ll be back shortly.', emoji: '🔧' },
}

export function ErrorPage({ code, title, message }: ErrorPageProps) {
  const navigate = useNavigate()
  const config = ERROR_CONFIG[code] || ERROR_CONFIG[404]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Big code number */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-7xl font-bold tracking-tight"
            style={{ color: 'var(--color-fg-default)', letterSpacing: '-0.04em' }}>
            {code}
          </span>
          <span className="text-5xl">{config.emoji}</span>
        </div>

        {/* Ghost illustration (GitHub-style) */}
        {code === 404 && (
          <div className="mb-6 select-none">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none"
              style={{ color: 'var(--color-fg-subtle)', opacity: 0.5 }}>
              <motion.path
                d="M60 10C35 10 20 30 20 55v45l10-8 10 8 10-8 10 8 10-8 10 8 10-8V55c0-25-15-45-40-45z"
                fill="currentColor"
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />
              <circle cx="45" cy="48" r="6" fill="var(--color-canvas-default)" />
              <circle cx="75" cy="48" r="6" fill="var(--color-canvas-default)" />
            </svg>
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>
          {title || config.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-fg-muted)' }}>
          {message || config.message}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
            Go home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-default inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Go back
          </button>
          {(code === 500 || code === 503) && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-default inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export function NotFoundPage() {
  return <ErrorPage code={404} />
}

export function ServerErrorPage() {
  return <ErrorPage code={500} />
}

export function ServiceUnavailablePage() {
  return <ErrorPage code={503} />
}

export function UnauthorizedPage() {
  return <ErrorPage code={401} />
}

export function ForbiddenPage() {
  return <ErrorPage code={403} />
}

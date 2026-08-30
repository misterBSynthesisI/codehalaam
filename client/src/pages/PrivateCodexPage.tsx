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

import { Lock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function PrivateCodexPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-canvas-default)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className="text-center max-w-md mx-4"
      >
        {/* Lock icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '2px solid var(--color-border-default)',
          }}
        >
          <Lock
            className="w-8 h-8"
            strokeWidth={1.5}
            style={{ color: 'var(--color-fg-muted)' }}
          />
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-fg-default)', letterSpacing: '-0.02em' }}
        >
          This Codex is private
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          You don't have permission to view this codex. If you believe you should have access, contact the owner.
        </p>

        <Link
          to="/"
          className="btn btn-sm inline-flex items-center gap-2 no-underline"
          style={{
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-fg-default)',
          }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Go home
        </Link>
      </motion.div>
    </div>
  )
}

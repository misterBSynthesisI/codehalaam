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
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

interface DemoLockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  title?: string
  disabled?: boolean
}

/**
 * Wraps any button. If the user is in demo mode, clicking shows a shake
 * animation + lock tooltip instead of firing the onClick.
 */
export function DemoLockButton({ children, onClick, className, style, title, disabled }: DemoLockButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Show shake + tooltip
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 2000)
  }

  return (
    <div className="relative inline-flex">
      <motion.button
        onClick={handleClick}
        className={className}
        style={{ ...style, opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}
        whileTap={{ x: [0, -4, 4, -4, 4, 0] }}
        transition={{ duration: 0.4 }}
        title="Demo mode — sign up to use this"
        disabled={disabled}
      >
        {children}
        <Lock className="absolute -top-1 -right-1 w-3 h-3" style={{ color: 'var(--color-attention-fg)', backgroundColor: 'var(--color-canvas-default)', borderRadius: '50%', padding: 1 }} />
      </motion.button>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap z-50"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-fg-default)',
              boxShadow: 'var(--color-shadow-medium)',
            }}
          >
            🔒 Demo mode — create an account to use this
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Higher-order component: wraps any element and adds demo lock behavior
 */
export function withDemoLock<P extends { onClick?: () => void }>(
  Component: React.ComponentType<P>
) {
  return function DemoLockedComponent(props: P & { isDemo?: boolean }) {
    const { isDemo, ...rest } = props
    if (isDemo) {
      return <DemoLockButton onClick={props.onClick}><Component {...rest as P} /></DemoLockButton>
    }
    return <Component {...rest as P} />
  }
}

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

import { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface XPToastItem {
  id: number
  amount: number
  message: string
}

interface XPContextType {
  triggerXP: (amount: number, message?: string) => void
}

const XPContext = createContext<XPContextType>({ triggerXP: () => {} })

export function useXP() {
  return useContext(XPContext)
}

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<XPToastItem[]>([])
  const [counter, setCounter] = useState(0)

  const triggerXP = useCallback((amount: number, message?: string) => {
    const id = counter
    setCounter((c) => c + 1)

    const toast: XPToastItem = {
      id,
      amount,
      message: message || `+${amount} XP`,
    }

    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [counter])

  return (
    <XPContext.Provider value={{ triggerXP }}>
      {children}

      {/* XP Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="flex items-center gap-2 px-3 py-2 bg-canvas-subtle border border-border rounded-md shadow-md text-sm"
            >
              <Zap className="w-4 h-4 text-attention fill-attention" />
              <span className="text-fg font-medium">+{toast.amount} XP</span>
              {toast.message !== `+${toast.amount} XP` && (
                <span className="text-fg-muted">· {toast.message.replace(`+${toast.amount} XP · `, '')}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPContext.Provider>
  )
}

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

import { Info, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  if (dismissed) return null

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-sm"
      style={{
        backgroundColor: 'var(--color-attention-muted)',
        borderBottom: '1px solid rgba(187, 128, 9, 0.3)',
        color: 'var(--color-attention-fg)',
      }}
    >
      <Info className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span>
        You&apos;re in <strong>demo mode</strong> — read-only.{' '}
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="underline font-semibold"
          style={{ color: 'var(--color-attention-fg)' }}
        >
          Create a free account
        </button>{' '}
        to start building.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:bg-black/10 shrink-0"
        style={{ color: 'var(--color-attention-fg)' }}
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

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

import { ShieldCheck } from 'lucide-react'

const BADGE_COLORS: Record<string, string> = {
  blue: '#58a6ff',
  black: '#1f2328',
  red: '#f85149',
}

const BADGE_LABELS: Record<string, string> = {
  blue: 'Verified',
  black: 'Stealth Verified',
  red: 'Admin',
}

export function VerifiedBadge({ badgeColor, className = '' }: { badgeColor?: string; className?: string }) {
  if (!badgeColor || badgeColor === 'none') return null

  const color = BADGE_COLORS[badgeColor] || BADGE_COLORS.blue
  const label = BADGE_LABELS[badgeColor] || 'Verified'

  return (
    <span
      className={`inline-flex items-center ${className}`}
      title={label}
      style={{ color }}
    >
      <ShieldCheck className="w-4 h-4" strokeWidth={2} />
    </span>
  )
}

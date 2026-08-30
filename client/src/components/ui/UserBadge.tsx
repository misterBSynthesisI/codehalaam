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

import { BadgeCheck } from 'lucide-react'

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

interface UserBadgeProps {
  user: {
    displayName?: string
    username?: string
    avatarUrl?: string
    badgeColor?: string
    isAdmin?: boolean
  }
  size?: 'sm' | 'md' | 'lg'
  showAvatar?: boolean
  showUsername?: boolean
  className?: string
  linkTo?: string
}

const SIZE_CLASSES = {
  sm: { text: 'text-xs', seal: 14, avatar: 20, gap: 'gap-1.5' },
  md: { text: 'text-sm', seal: 16, avatar: 24, gap: 'gap-2' },
  lg: { text: 'text-xl', seal: 20, avatar: 32, gap: 'gap-2.5' },
}

export function UserBadge({ user, size = 'md', showAvatar = false, showUsername = false, className = '', linkTo }: UserBadgeProps) {
  const badgeColor = user.badgeColor || 'none'
  const hasBadge = badgeColor && badgeColor !== 'none'
  const color = hasBadge ? (BADGE_COLORS[badgeColor] || BADGE_COLORS.blue) : undefined
  const label = hasBadge ? (BADGE_LABELS[badgeColor] || 'Verified') : undefined
  const sizeConfig = SIZE_CLASSES[size]
  const displayName = user.displayName || user.username || 'Unknown'

  const content = (
    <span className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
      {showAvatar && (
        <div
          className="rounded-full flex items-center justify-center font-medium overflow-hidden shrink-0"
          style={{
            width: sizeConfig.avatar,
            height: sizeConfig.avatar,
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-fg-default)',
            fontSize: size === 'sm' ? 10 : size === 'md' ? 12 : 16,
          }}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
      )}
      <span
        className={`font-medium ${sizeConfig.text} leading-none`}
        style={{ color: 'var(--color-fg-default)' }}
      >
        {displayName}
      </span>
      {hasBadge && (
        <span
          className="inline-flex items-center"
          title={label}
          style={{ color, verticalAlign: 'middle', marginLeft: 2 }}
        >
          <BadgeCheck
            width={sizeConfig.seal}
            height={sizeConfig.seal}
            strokeWidth={1.5}
            fill={color}
            stroke="var(--color-canvas-default)"
          />
        </span>
      )}
    </span>
  )

  return content
}

// Simpler standalone badge (just the seal icon) for inline use
export function VerificationBadge({ badgeColor, size = 16, className = '' }: { badgeColor?: string; size?: number; className?: string }) {
  if (!badgeColor || badgeColor === 'none') return null
  const color = BADGE_COLORS[badgeColor] || BADGE_COLORS.blue
  const label = BADGE_LABELS[badgeColor] || 'Verified'

  return (
    <span className={`inline-flex items-center ${className}`} title={label} style={{ color }}>
      <BadgeCheck width={size} height={size} strokeWidth={1.5} fill={color} stroke="var(--color-canvas-default)" />
    </span>
  )
}

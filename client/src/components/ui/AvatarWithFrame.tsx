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

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface FrameRef {
  imageUrl?: string | null
  blend?: string
  animation?: string
  borderStyle?: string
  borderColor?: string
  borderWidth?: number
  gradientColors?: string[]
}

interface AvatarWithFrameProps {
  user: {
    avatarUrl?: string
    avatarFrame?: string
    avatarFrameRef?: FrameRef | Record<string, any> | null
    username: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
}

const SIZE_MAP = { sm: 32, md: 48, lg: 96, xl: 160 }
const FONT_SIZE_MAP = { sm: 12, md: 16, lg: 32, xl: 56 }

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AvatarWithFrame({ user, size = 'md', className = '', style: overrideStyle }: AvatarWithFrameProps) {
  const px = SIZE_MAP[size]
  const fontSize = FONT_SIZE_MAP[size]
  const frameRef: Record<string, any> | null = user.avatarFrameRef || null
  const frameName = user.avatarFrame || ''
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  // Frame image URL — from avatarFrameRef, OR hardcode the mythic founder frame
  const frameImageUrl = frameRef?.imageUrl
    || (frameName === 'Mythic Flame' ? '/frames/mythic-founder.png' : null)

  const hasFrameImage = !!frameImageUrl
  const hasAnimation = frameRef?.animation && frameRef.animation !== 'none' && !reducedMotion
  const useBlend = frameRef?.blend === 'screen'

  // Frame image extends 40% beyond the avatar — that's the "ring" you see
  const frameExtra = hasFrameImage ? Math.round(px * 0.4) : 0
  const frameSize = px + frameExtra * 2

  // Outer wrapper — sized to fit frame + optional glow animation
  const Wrapper = hasAnimation ? motion.div : 'div'
  const wrapperProps: any = hasAnimation
    ? {
        animate: {
          boxShadow: [
            `0 0 12px 4px ${frameRef?.gradientColors?.[0] || '#f97316'}50`,
            `0 0 24px 8px ${frameRef?.gradientColors?.[0] || '#f97316'}70`,
            `0 0 12px 4px ${frameRef?.gradientColors?.[0] || '#f97316'}50`,
          ],
        },
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  return (
    <Wrapper
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: px + frameExtra * 2 + (hasAnimation ? 8 : 0),
        height: px + frameExtra * 2 + (hasAnimation ? 8 : 0),
        ...overrideStyle,
      }}
      {...wrapperProps}
    >
      {/* Avatar circle — the profile picture underneath */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: px,
          height: px,
          backgroundColor: 'var(--color-canvas-subtle)',
          color: 'var(--color-fg-default)',
          fontSize,
          fontWeight: 600,
        }}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          user.username.charAt(0).toUpperCase()
        )}
      </div>

      {/* Frame image — ON TOP of the avatar, like Google/gaming frames */}
      {hasFrameImage && (
        <img
          src={frameImageUrl!}
          alt=""
          className="absolute inset-0 m-auto pointer-events-none"
          style={{
            width: frameSize,
            height: frameSize,
            mixBlendMode: useBlend ? 'screen' : 'normal',
          }}
          onError={(e) => {
            // If frame image fails to load, hide it silently
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}
    </Wrapper>
  )
}

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

/**
 * The founder frame colors — used for the Mythic Flame / Grandmaster Founder
 * visual fallback when no image URL is set.
 */
const MYTHIC_COLORS = ['#f97316', '#ffd700', '#f85149']

export function AvatarWithFrame({ user, size = 'md', className = '', style: overrideStyle }: AvatarWithFrameProps) {
  const px = SIZE_MAP[size]
  const fontSize = FONT_SIZE_MAP[size]
  const frameRef: Record<string, any> | null = user.avatarFrameRef || null
  const frameName = user.avatarFrame || ''
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const hasImageFrame = !!frameRef?.imageUrl
  const hasFrame = !!frameRef || !!frameName
  const hasAnimation = frameRef?.animation && frameRef.animation !== 'none' && !reducedMotion
  const useBlend = frameRef?.blend === 'screen'

  // Frame ring extends 40% beyond the avatar
  const ringExtra = hasFrame ? Math.round(px * 0.4) : 0
  const borderWidth = frameRef?.borderWidth || 4

  // Colors for gradient/glow fallback
  const colors = frameRef?.gradientColors?.length
    ? frameRef.gradientColors
    : frameName.toLowerCase().includes('mythic') || frameName.toLowerCase().includes('flame')
      ? MYTHIC_COLORS
      : [frameRef?.borderColor || '#58a6ff']

  const primaryColor = colors[0] || '#f97316'
  const secondaryColor = colors[1] || primaryColor

  const wrapperSize = px + ringExtra * 2 + (hasAnimation ? 8 : 0)

  // Outer wrapper with glow animation — no overflow clipping
  const Wrapper = hasAnimation ? motion.div : 'div'
  const wrapperProps: any = hasAnimation
    ? {
        animate: {
          boxShadow: [
            `0 0 12px 4px ${primaryColor}50`,
            `0 0 24px 8px ${primaryColor}70`,
            `0 0 12px 4px ${primaryColor}50`,
          ],
        },
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  // The ring is a full circle around the avatar
  const ringSize = px + ringExtra * 2

  return (
    <Wrapper
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: wrapperSize, height: wrapperSize, ...overrideStyle }}
      {...wrapperProps}
    >
      {/* ── CSS gradient ring (always visible when frame is set) ── */}
      {hasFrame && !hasImageFrame && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: ringSize,
            height: ringSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(from 0deg, ${colors.join(', ')}, ${colors[0]})`,
            padding: borderWidth,
            zIndex: 0,
          }}
        >
          {/* Inner transparent circle to create ring effect */}
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: 'var(--color-canvas-default)' }}
          />
        </div>
      )}

      {/* ── Image-based frame overlay ── */}
      {hasImageFrame && (
        <img
          src={frameRef!.imageUrl!}
          alt=""
          className="absolute pointer-events-none"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          style={{
            width: ringSize,
            height: ringSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            mixBlendMode: useBlend ? 'screen' : 'normal',
            zIndex: 0,
          }}
        />
      )}

      {/* ── Glow ring for glow/flame styles (CSS-only, no image needed) ── */}
      {hasFrame && !hasImageFrame && (frameRef?.borderStyle === 'glow' || frameRef?.borderStyle === 'flame') && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: ringSize + 8,
            height: ringSize + 8,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px 6px ${primaryColor}50, inset 0 0 12px 4px ${primaryColor}20`,
            zIndex: 0,
          }}
        />
      )}

      {/* ── Avatar circle ── */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: px,
          height: px,
          zIndex: 1,
          backgroundColor: 'var(--color-canvas-subtle)',
          border: hasFrame && !hasImageFrame
            ? `${Math.max(borderWidth, 2)}px solid ${primaryColor}`
            : 'none',
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
    </Wrapper>
  )
}

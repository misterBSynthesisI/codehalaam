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
  overlaySvg?: string
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

/**
 * Total wrapper sizes (avatar + visible frame).
 * The avatar sits inside with room for the frame to show around it.
 */
const TOTAL_SIZE = { sm: 36, md: 52, lg: 104, xl: 176 }

/**
 * Frame visual extension beyond the avatar circle.
 * Kept small so the frame stays within the parent container.
 */
const FRAME_EXTRA = { sm: 2, md: 3, lg: 5, xl: 8 }

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AvatarWithFrame({ user, size = 'md', className = '', style: overrideStyle }: AvatarWithFrameProps) {
  const totalPx = TOTAL_SIZE[size]
  const frameExtra = FRAME_EXTRA[size]
  const avatarPx = totalPx - frameExtra * 2

  const frameRef: Record<string, any> | null = user.avatarFrameRef || null
  const frameName = user.avatarFrame || ''
  const hasFrame = !!(frameRef || frameName)
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  // Frame image URL — from avatarFrameRef, OR hardcode the mythic founder frame
  const frameImageUrl = frameRef?.imageUrl
    || (frameName === 'Mythic Flame' ? '/frames/mythic-founder.png' : null)

  const hasFrameImage = !!frameImageUrl
  const hasAnimation = frameRef?.animation && frameRef.animation !== 'none' && !reducedMotion
  const useBlend = frameRef?.blend === 'screen'

  // Determine if the frame has an actual image or just CSS styling
  const hasImageFrame = hasFrameImage
  const hasCssFrame = hasFrame && !hasImageFrame && frameRef?.borderStyle && frameRef.borderStyle !== 'none'

  // Build CSS ring for non-image frames
  const cssRingStyle = useMemo(() => {
    if (!hasCssFrame || !frameRef) return null
    const bw = frameRef.borderWidth || 3
    const color = frameRef.borderColor || '#58a6ff'
    const gs = frameRef.gradientColors
    const bs = frameRef.borderStyle

    if (bs === 'gradient' && gs && gs.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${gs.join(', ')}) padding-box, linear-gradient(135deg, ${gs.join(', ')}) border-box`,
        border: `${bw}px solid transparent`,
        borderRadius: '50%',
        boxShadow: `0 0 ${bw * 3}px ${bw}px ${gs[0]}40`,
      }
    }

    if (bs === 'flame' || bs === 'glow' || bs === 'electric' || bs === 'crystal') {
      const g1 = gs?.[0] || color
      return {
        border: `${bw}px solid ${color}`,
        borderRadius: '50%',
        boxShadow: `0 0 ${bw * 4}px ${bw * 2}px ${g1}50, inset 0 0 ${bw * 2}px ${bw}px ${g1}20`,
      }
    }

    return {
      border: `${bw}px solid ${color}`,
      borderRadius: '50%',
    }
  }, [hasCssFrame, frameRef])

  // Fonts
  const fontSize = Math.round(avatarPx * 0.4)

  // Animation wrapper — subtle pulse glow for animated frames
  const Wrapper = hasAnimation ? motion.div : 'div'
  const wrapperProps: any = hasAnimation
    ? {
        animate: {
          boxShadow: [
            `0 0 8px 2px ${frameRef?.gradientColors?.[0] || frameRef?.borderColor || '#f97316'}40`,
            `0 0 16px 4px ${frameRef?.gradientColors?.[0] || frameRef?.borderColor || '#f97316'}60`,
            `0 0 8px 2px ${frameRef?.gradientColors?.[0] || frameRef?.borderColor || '#f97316'}40`,
          ],
        },
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  return (
    <Wrapper
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: totalPx,
        height: totalPx,
        ...overrideStyle,
      }}
      {...wrapperProps}
    >
      {/* Avatar circle — the profile picture */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: avatarPx,
          height: avatarPx,
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

      {/* Frame overlay — image-based frame on top of avatar */}
      {hasImageFrame && (
        <img
          src={frameImageUrl!}
          alt=""
          className="absolute inset-0 m-auto pointer-events-none"
          style={{
            width: totalPx,
            height: totalPx,
            mixBlendMode: useBlend ? 'screen' : 'normal',
          }}
          onError={(e) => {
            // If frame image fails to load, hide it silently
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}

      {/* Frame overlay — CSS-based ring (gradient, glow, solid border) */}
      {hasCssFrame && cssRingStyle && (
        <div
          className="absolute inset-0 m-auto pointer-events-none"
          style={{
            width: avatarPx + (frameRef?.borderWidth || 3) * 2 + 2,
            height: avatarPx + (frameRef?.borderWidth || 3) * 2 + 2,
            ...cssRingStyle,
          }}
        />
      )}

      {/* SVG overlay — special effects like flames */}
      {hasFrame && frameRef?.overlaySvg && (
        <div
          className="absolute inset-0 m-auto pointer-events-none"
          style={{ width: totalPx, height: totalPx }}
          dangerouslySetInnerHTML={{ __html: frameRef.overlaySvg }}
        />
      )}
    </Wrapper>
  )
}

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

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 96,
  xl: 160,
}

const FONT_SIZE_MAP = {
  sm: 12,
  md: 16,
  lg: 32,
  xl: 56,
}

const FRAME_BORDER_WIDTH: Record<string, number> = {
  solid: 3,
  gradient: 4,
  glow: 4,
  flame: 5,
  electric: 5,
  crystal: 4,
}

function getFrameBorderStyle(frame: FrameRef | Record<string, any> | null | undefined, frameName?: string): string {
  if (!frame) return 'none'
  const style = frame.borderStyle || 'none'
  if (style === 'none' || !style) return 'none'
  return style
}

function getFrameGradientCSS(frame: FrameRef | Record<string, any> | null | undefined): string {
  if (!frame) return ''
  const colors = frame.gradientColors || []
  if (colors.length < 2) return ''
  return `linear-gradient(135deg, ${colors.join(', ')})`
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AvatarWithFrame({ user, size = 'md', className = '', style: overrideStyle }: AvatarWithFrameProps) {
  const px = SIZE_MAP[size]
  const fontSize = FONT_SIZE_MAP[size]
  const frameRef: Record<string, any> | null = user.avatarFrameRef || null
  const frameName = user.avatarFrame || ''
  const borderStyle = getFrameBorderStyle(frameRef, frameName)
  const borderWidth = frameRef?.borderWidth || FRAME_BORDER_WIDTH[borderStyle] || 0
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const hasImageFrame = !!frameRef?.imageUrl
  const hasAnimation = frameRef?.animation && frameRef.animation !== 'none' && !reducedMotion
  const useBlend = frameRef?.blend === 'screen'

  // Outer wrapper with glow animation
  const Wrapper = hasAnimation ? motion.div : 'div'
  const wrapperProps: any = hasAnimation
    ? {
        animate: {
          boxShadow: [
            `0 0 8px 2px ${frameRef?.gradientColors?.[0] || '#f97316'}40`,
            `0 0 16px 6px ${frameRef?.gradientColors?.[0] || '#f97316'}60`,
            `0 0 8px 2px ${frameRef?.gradientColors?.[0] || '#f97316'}40`,
          ],
        },
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }
    : {}

  return (
    <Wrapper
      className={`relative inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: px + borderWidth * 2 + (hasAnimation ? 8 : 0),
        height: px + borderWidth * 2 + (hasAnimation ? 8 : 0),
        ...overrideStyle,
      }}
      {...wrapperProps}
    >
      {/* Avatar circle */}
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: px,
          height: px,
          backgroundColor: 'var(--color-canvas-subtle)',
          border: borderStyle !== 'none' && !hasImageFrame
            ? `${borderWidth}px ${borderStyle === 'double' ? 'double' : 'solid'} ${frameRef?.borderColor || '#58a6ff'}`
            : borderStyle !== 'none' && hasImageFrame
            ? 'none'
            : 'none',
          ...(borderStyle === 'glow' && !hasImageFrame
            ? { boxShadow: `0 0 10px 2px ${frameRef?.borderColor || '#58a6ff'}60` }
            : {}),
          ...(borderStyle === 'gradient' && !hasImageFrame
            ? { borderImage: `${frameRef ? getFrameGradientCSS(frameRef) : ''} 1`, borderStyle: 'solid', borderWidth }
            : {}),
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

      {/* Image-based frame overlay */}
      {hasImageFrame && (
        <img
          src={frameRef!.imageUrl!}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            width: px + borderWidth * 2,
            height: px + borderWidth * 2,
            mixBlendMode: useBlend ? 'screen' : 'normal',
          }}
        />
      )}

      {/* CSS flame overlay for frame.animation === 'flame' */}
      {frameRef?.animation === 'flame' && !reducedMotion && !hasImageFrame && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            width: px + borderWidth * 2,
            height: px + borderWidth * 2,
            background: `radial-gradient(circle, transparent 60%, ${frameRef?.gradientColors?.[0] || '#f97316'}30 100%)`,
          }}
        />
      )}
    </Wrapper>
  )
}

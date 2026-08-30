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

interface StarMapProps {
  contributions: number[][]
  totalContributions?: number
}

function getStarIntensity(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 8) return 3
  return 4
}

const starColors = [
  'transparent',
  'rgba(251, 191, 36, 0.35)',
  'rgba(251, 191, 36, 0.55)',
  'rgba(251, 191, 36, 0.8)',
  '#fbbf24',
]

const starSizes = [3, 4, 5, 6, 7]

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function StarMap({ contributions, totalContributions }: StarMapProps) {
  const total = useMemo(() => {
    if (totalContributions !== undefined) return totalContributions
    return contributions.flat().reduce((a, b) => a + b, 0)
  }, [contributions, totalContributions])

  return (
    <div className="p-4" data-testid="star-map" style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 40%, #111827 100%)',
      borderRadius: 8,
      border: '1px solid var(--color-border-default)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
          ✦ {total.toLocaleString()} contributions in the last year
        </h3>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(251,191,36,0.6)' }}>
          <span>Dim</span>
          {[1, 2, 3, 4].map(level => (
            <span key={level} style={{
              display: 'inline-block',
              width: starSizes[level],
              height: starSizes[level],
              borderRadius: '50%',
              backgroundColor: starColors[level],
              boxShadow: level >= 3 ? `0 0 ${4 + level}px ${starColors[level]}` : 'none',
            }} />
          ))}
          <span>Bright</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex mb-1 ml-8">
            {monthLabels.map((month, i) => (
              <div key={month} className="w-[11px] text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {i % 3 === 0 ? month : ''}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col mr-1">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[11px] text-[10px] leading-[11px] mr-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {contributions.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((count, d) => {
                    const intensity = getStarIntensity(count)
                    return (
                      <div
                        key={`${w}-${d}`}
                        style={{
                          width: starSizes[intensity],
                          height: starSizes[intensity],
                          borderRadius: '50%',
                          backgroundColor: starColors[intensity],
                          boxShadow: intensity >= 3 ? `0 0 ${4 + intensity * 2}px ${starColors[intensity]}` : 'none',
                          transition: 'box-shadow 0.2s ease',
                        }}
                        title={`${count} contributions`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

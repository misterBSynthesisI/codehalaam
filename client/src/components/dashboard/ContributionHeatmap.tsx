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

interface ContributionHeatmapProps {
  contributions: number[][]
  totalContributions?: number
}

function getLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 8) return 3
  return 4
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ContributionHeatmap({ contributions, totalContributions }: ContributionHeatmapProps) {
  const total = useMemo(() => {
    if (totalContributions !== undefined) return totalContributions
    return contributions.flat().reduce((a, b) => a + b, 0)
  }, [contributions, totalContributions])

  const levelColors = [
    'var(--color-counter-bg)',
    '#9be9a8',
    '#40c463',
    '#30a14e',
    '#216e39',
  ]

  const lightLevelColors = [
    'var(--color-counter-bg)',
    '#9be9a8',
    '#40c463',
    '#30a14e',
    '#216e39',
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
          {total.toLocaleString()} contributions in the last year
        </h3>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          <span>Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex mb-1 ml-8">
            {monthLabels.map((month, i) => (
              <div key={month} className="w-[11px] text-[10px]" style={{ color: 'var(--color-fg-subtle)' }}>
                {i % 3 === 0 ? month : ''}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col mr-1">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[11px] text-[10px] leading-[11px] mr-1" style={{ color: 'var(--color-fg-subtle)' }}>
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {contributions.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((count, d) => (
                    <div
                      key={`${w}-${d}`}
                      className="w-[11px] h-[11px] rounded-[2px]"
                      style={{
                        backgroundColor: levelColors[getLevel(count)],
                        border: '1px solid var(--color-border-subtle)',
                      }}
                      title={`${count} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

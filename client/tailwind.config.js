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

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // GitHub's actual dark theme palette
        canvas: {
          DEFAULT: '#0d1117',
          subtle: '#161b22',
          inset: '#010409',
        },
        border: {
          DEFAULT: '#30363d',
          muted: '#21262d',
        },
        fg: {
          DEFAULT: '#e6edf3',
          muted: '#8b949e',
          subtle: '#6e7681',
        },
        accent: {
          DEFAULT: '#58a6ff',
          emphasis: '#1f6feb',
          muted: 'rgba(56,139,253,0.1)',
          subtle: 'rgba(56,139,253,0.4)',
        },
        success: {
          DEFAULT: '#3fb950',
          emphasis: '#238636',
          muted: 'rgba(46,160,67,0.1)',
        },
        danger: {
          DEFAULT: '#f85149',
          emphasis: '#da3633',
          muted: 'rgba(248,81,73,0.1)',
        },
        attention: {
          DEFAULT: '#d29922',
          emphasis: '#9e6a03',
          muted: 'rgba(187,128,9,0.1)',
        },
        done: {
          DEFAULT: '#a371f7',
          emphasis: '#8957e5',
          muted: 'rgba(163,113,247,0.1)',
        },
        // XP/Achievement colors
        xp: {
          DEFAULT: '#58a6ff',
          bar: '#1f6feb',
        },
        // Light theme support
        light: {
          canvas: '#ffffff',
          'canvas-subtle': '#f6f8fa',
          border: '#d0d7de',
          'border-muted': '#d8dee4',
          fg: '#1f2328',
          'fg-muted': '#656d76',
          accent: '#0969da',
          'accent-emphasis': '#0550ae',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
        mono: ['"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['2rem', { lineHeight: '1.25' }],
        '4xl': ['2.5rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 0 rgba(31,35,40,0.04)',
        'DEFAULT': '0 3px 6px rgba(140,149,159,0.15)',
        'md': '0 8px 24px rgba(140,149,159,0.2)',
        'lg': '0 12px 28px rgba(140,149,159,0.3), 0 0 0 1px rgba(31,35,40,0.04)',
        'card': '0 1px 0 rgba(27,31,36,0.04)',
        'card-hover': '0 3px 6px rgba(140,149,159,0.15)',
        'overlay': '0 0 0 1px rgba(31,35,40,0.04), 0 8px 24px rgba(140,149,159,0.2)',
        'inset': 'inset 0 1px 0 rgba(208,215,222,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'xp-toast': 'xpToast 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        xpToast: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '70%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
      },
    },
  },
  plugins: [],
}

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

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, ChevronDown, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react'

function CodeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  )
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isLanding = location.pathname === '/'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b material-toolbar" style={{ borderColor: 'var(--color-header-border)' }}>
      <div className="container-lg flex items-center h-[50px] gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0" style={{ color: 'var(--color-fg-default)' }}>
          <CodeLogo />
          <span className="font-semibold text-lg hidden sm:inline tracking-tight">CODEHALAAM</span>
        </Link>

        {/* Search */}
        {!isLanding && user && (
          <div className="flex-1 max-w-[320px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-fg-subtle)' }} />
              <input
                type="text"
                placeholder="Type / to search"
                className="form-control pl-9"
                style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', borderColor: 'var(--color-border-default)' }}
              />
            </div>
          </div>
        )}

        {/* Center nav */}
        {!isLanding && user && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/dashboard', label: 'Pull Requests' },
              { to: '/dashboard', label: 'Issues' },
            ].map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors"
                style={{
                  color: location.pathname === to ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
                  backgroundColor: location.pathname === to ? 'var(--color-canvas-subtle)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isLanding ? (
            <div className="flex items-center gap-3">
              <Link to="/auth?mode=login" className="btn-link text-sm no-underline hover:underline">Sign in</Link>
              <Link to="/auth" className="btn-primary text-sm no-underline">Sign up</Link>
            </div>
          ) : user ? (
            <>
              <Link to="/new" className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-fg-muted)' }}>
                <Plus className="w-4 h-4" />
              </Link>

              <button className="relative p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-fg-muted)' }}>
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-fg)' }} />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 p-1 rounded-md transition-colors"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)', border: '1px solid rgba(46,160,67,0.4)' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md py-1 animate-fade-in material-toolbar" style={{ border: '1px solid var(--color-border-default)', boxShadow: 'var(--color-shadow-large)' }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>{user.displayName || user.username}</p>
                      <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{user.username}</p>
                    </div>

                    {[
                      { to: `/${user.username}`, label: 'Your profile' },
                      { to: '/settings', label: 'Settings' },
                      { to: '/new', label: 'New repository' },
                      { to: '/admin', label: 'Admin dashboard' },
                    ].map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="block px-3 py-1.5 text-sm no-underline"
                        style={{ color: 'var(--color-fg-default)' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {label}
                      </Link>
                    ))}

                    <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--color-border-default)' }}>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); navigate('/') }}
                        className="w-full text-left px-3 py-1.5 text-sm"
                        style={{ color: 'var(--color-fg-default)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth?mode=login" className="btn-link text-sm no-underline hover:underline">Sign in</Link>
              <Link to="/auth" className="btn-primary text-sm no-underline">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

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
import { Search, Bell, ChevronDown, ShieldAlert, Sun, Moon, BadgeCheck, BadgeCheck as BadgeCheckIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useSiteSettingsContext } from '@/contexts/SiteSettingsContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

function CodeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  )
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const siteSettings = useSiteSettingsContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const isLanding = location.pathname === '/'

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch { /* silent */ }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.markNotificationsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, fetchNotifications])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Open command palette from search trigger
  const openCmdK = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
  }

  return (
    <header className="sticky top-0 z-50 border-b material-toolbar" style={{ borderColor: 'var(--color-header-border)' }}>
      <div className="flex items-center h-[48px] px-4 gap-3" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0" style={{ color: 'var(--color-fg-default)' }}>
          {siteSettings?.logoUrl ? (
            <img src={siteSettings.logoUrl} alt="Logo" className="h-7 w-auto object-contain" style={{ maxWidth: 120 }} />
          ) : (
            <CodeLogo />
          )}
          <span className="font-semibold text-base hidden sm:inline tracking-tight">{siteSettings?.siteName || 'CODEHALAAM'}</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side only: Search trigger, Bell, Avatar */}
        <div className="flex items-center gap-1.5">
          {isLanding ? (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                data-testid="theme-toggle"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/auth?mode=login" className="btn-link text-sm no-underline hover:underline">Sign in</Link>
              <Link to="/auth" className="btn-primary text-sm no-underline">Sign up</Link>
            </div>
          ) : user ? (
            <>
              {/* Search trigger (Cmd+K) */}
              <button
                onClick={openCmdK}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-canvas-subtle)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-fg-muted)',
                }}
                data-testid="search-trigger"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="text-[10px] px-1 py-0.5 rounded ml-1 hidden sm:inline" style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-subtle)', border: '1px solid var(--color-border-default)' }}>⌘K</kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                data-testid="theme-toggle"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) fetchNotifications() }}
                  className="relative p-2 rounded-md transition-colors"
                  style={{ color: 'var(--color-fg-muted)' }}
                  data-testid="notification-bell"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ backgroundColor: 'var(--color-danger-fg)' }}
                      data-testid="notification-badge"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto rounded-md py-1 animate-fade-in material-toolbar"
                    style={{ border: '1px solid var(--color-border-default)', boxShadow: 'var(--color-shadow-large)' }}
                    data-testid="notification-dropdown"
                  >
                    <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-default)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--color-accent-fg)' }} data-testid="mark-all-read">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center">
                        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const actorName = notif.actor?.username || 'Someone'
                        let text = ''
                        switch (notif.type) {
                          case 'EMBER_RECEIVED': text = `${actorName} gave an Ember to your Codex`; break
                          case 'OFFERING_MADE': text = `${actorName} submitted an Offering`; break
                          case 'QUEST_COMPLETED': text = `${actorName} completed a Quest on your Codex`; break
                          case 'ECHO_CREATED': text = `${actorName} created an Echo of your Codex`; break
                          default: text = `${actorName} did something`
                        }
                        return (
                          <div key={notif._id} className="px-3 py-2 text-sm flex items-start gap-2 transition-colors"
                            style={{ backgroundColor: notif.read ? 'transparent' : 'var(--color-canvas-subtle)', color: 'var(--color-fg-default)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'var(--color-canvas-subtle)'}
                          >
                            {!notif.read && <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-accent-fg)' }} />}
                            <span className={!notif.read ? '' : 'ml-4'}>{text}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-1 p-0.5 rounded-full transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                    style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)', border: '1px solid rgba(46,160,67,0.4)' }}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 rounded-md py-1 animate-fade-in material-toolbar"
                    style={{ border: '1px solid var(--color-border-default)', boxShadow: 'var(--color-shadow-large)' }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                      <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-fg-default)' }}>
                        {user.avatarUrl ? (
                          <span className="w-5 h-5 rounded-full overflow-hidden inline-flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-success-muted)' }}>
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          </span>
                        ) : null}
                        {user.displayName || user.username}
                        {user.badgeColor && user.badgeColor !== 'none' && (
                          <BadgeCheck
                            width={14}
                            height={14}
                            strokeWidth={1.5}
                            fill={user.badgeColor === 'red' ? '#f85149' : user.badgeColor === 'black' ? '#1f2328' : '#58a6ff'}
                            stroke="var(--color-canvas-default)"
                          />
                        )}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>@{user.username}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-counter-bg)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.round((user.xp / user.xpToNext) * 100)}%`, backgroundColor: 'var(--color-success-fg)' }} />
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--color-fg-muted)' }}>L{user.level}</span>
                      </div>
                    </div>
                    {[
                      { to: `/${user.username}`, label: 'Profile' },
                      { to: '/settings', label: 'Settings' },
                      { to: '/new', label: 'New Codex' },
                      ...(user.isAdmin ? [{ to: '/admin', label: 'Admin', icon: true }] : []),
                    ].map(({ to, label, icon }) => (
                      <Link key={to} to={to} className="flex items-center gap-2 px-3 py-1.5 text-sm no-underline" style={{ color: 'var(--color-fg-default)' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >{icon && <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--color-danger-fg)' }} />}{label}</Link>
                    ))}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--color-border-default)' }}>
                      <button onClick={() => { logout(); setShowUserMenu(false); navigate('/') }} className="w-full text-left px-3 py-1.5 text-sm"
                        style={{ color: 'var(--color-fg-default)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                data-testid="theme-toggle"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/auth?mode=login" className="btn-link text-sm no-underline hover:underline">Sign in</Link>
              <Link to="/auth" className="btn-primary text-sm no-underline">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

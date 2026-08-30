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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security'>('profile')
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [company, setCompany] = useState(user?.company || '')
  const [location, setLocation] = useState(user?.location || '')
  const [website, setWebsite] = useState(user?.website || '')
  const [twitter, setTwitter] = useState(user?.twitter || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('')
    try { const { user: updated } = await api.updateProfile({ displayName, bio, company, location, website, twitter }); updateUser(updated); setMessage('Profile updated successfully') }
    catch (err: any) { setMessage(err.message || 'Failed') } finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setMessage('Passwords do not match'); return }
    setSaving(true); setMessage('')
    try { await api.updatePassword(currentPassword, newPassword); setMessage('Password updated'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
    catch (err: any) { setMessage(err.message || 'Failed') } finally { setSaving(false) }
  }

  const s = { backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }

  return (
    <div style={s}>
      <div className="container-lg py-6">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-fg-default)' }}>Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <nav className="space-y-1">
            {(['profile', 'account', 'security'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize"
                style={{ backgroundColor: activeTab === tab ? 'var(--color-canvas-subtle)' : 'transparent', color: activeTab === tab ? 'var(--color-fg-default)' : 'var(--color-fg-muted)', fontWeight: activeTab === tab ? 500 : 400 }}>
                {tab}
              </button>
            ))}
          </nav>
          <div className="max-w-xl">
            {message && <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: message.includes('success') ? 'var(--color-success-muted)' : 'var(--color-danger-muted)', color: message.includes('success') ? 'var(--color-success-fg)' : 'var(--color-danger-fg)' }}>{message}</div>}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <div className="Box">
                  <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Public profile</h3></div>
                  <div className="Box-body space-y-4">
                    {[
                      { label: 'Name', value: displayName, set: setDisplayName, type: 'text' },
                      { label: 'Company', value: company, set: setCompany, type: 'text' },
                      { label: 'Location', value: location, set: setLocation, type: 'text' },
                      { label: 'Website', value: website, set: setWebsite, type: 'url' },
                      { label: 'Twitter', value: twitter, set: setTwitter, type: 'text' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>{f.label}</label>
                        <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} className="form-control" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>Bio</label>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="form-control resize-none" maxLength={160} />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>{bio.length}/160</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                    <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
                  </div>
                </div>
              </form>
            )}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword}>
                <div className="Box">
                  <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Change password</h3></div>
                  <div className="Box-body space-y-4">
                    {[{ label: 'Current password', val: currentPassword, set: setCurrentPassword }, { label: 'New password', val: newPassword, set: setNewPassword }, { label: 'Confirm new password', val: confirmPassword, set: setConfirmPassword }].map(f => (
                      <div key={f.label}>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>{f.label}</label>
                        <input type="password" value={f.val} onChange={e => f.set(e.target.value)} className="form-control" required minLength={8} />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                    <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Updating...' : 'Update password'}</button>
                  </div>
                </div>
              </form>
            )}
            {activeTab === 'account' && (
              <div className="Box">
                <div className="Box-header" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>Account</h3></div>
                <div className="Box-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>Delete account</p>
                      <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Once deleted, there is no going back.</p>
                    </div>
                    <button onClick={() => { if (confirm('Delete?')) { logout(); navigate('/') } }} className="btn btn-danger">Delete account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

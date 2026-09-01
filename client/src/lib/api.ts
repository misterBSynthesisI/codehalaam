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

const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('codehalaam_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('codehalaam_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('codehalaam_token')
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let res: Response
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      })
    } catch (networkError: any) {
      if (networkError.name === 'TypeError') {
        throw new Error('Cannot reach server. Is the backend running?')
      }
      throw networkError
    }

    // Safely parse response — handle non-JSON, empty, and HTML error pages
    const text = await res.text()
    let data: any
    try {
      data = text ? JSON.parse(text) : {}
    } catch (_parseError) {
      console.error(`Non-JSON response from ${path}:`, text.substring(0, 200))
      throw new Error(`Server returned invalid response for ${path}`)
    }

    if (!res.ok) {
      const err: any = new Error(data.error || data.message || `Request failed: ${res.status}`)
      err.status = res.status
      throw err
    }

    return data
  }

  // Site settings (public read, admin write)
  async getSettings() {
    return this.request<{ settings: any }>('/settings')
  }

  async updateSettings(data: {
    siteName?: string; tagline?: string; logoUrl?: string; faviconUrl?: string;
    ogImageUrl?: string; description?: string; footerText?: string;
    signupEnabled?: boolean; maintenanceMode?: boolean
  }) {
    return this.request<{ settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async uploadLogo(file: File) {
    const formData = new FormData()
    formData.append('logo', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/settings/logo`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data as { logoUrl: string; settings: any }
  }

  async uploadFavicon(file: File) {
    const formData = new FormData()
    formData.append('favicon', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/settings/favicon`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data as { faviconUrl: string; settings: any }
  }

  // Admin stats (additional admin endpoints)
  async adminGetStats() {
    return this.request<any>('/admin/stats')
  }

  async adminGetActivity() {
    return this.request<{ activity: any[] }>('/admin/activity')
  }

  // Forum
  async getForumPosts(params?: { sort?: string; tag?: string; search?: string; page?: number }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request<{ posts: any[]; total: number; page: number; pages: number }>(`/forum?${query}`)
  }

  async getForumPost(id: string) {
    return this.request<{ post: any }>(`/forum/${id}`)
  }

  async createForumPost(data: { title: string; body: string; tags?: string[] }) {
    return this.request<{ post: any }>('/forum', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addForumAnswer(postId: string, body: string) {
    return this.request<{ answer: any }>(`/forum/${postId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }

  async voteForumPost(postId: string, direction: 'up' | 'down') {
    return this.request<{ score: number; upvotes: number; downvotes: number; userVote: string | null }>(
      `/forum/${postId}/vote`,
      { method: 'POST', body: JSON.stringify({ direction }) }
    )
  }

  async acceptForumAnswer(postId: string, answerId: string) {
    return this.request<{ post: any }>(`/forum/${postId}/answer/${answerId}/accept`, {
      method: 'POST',
    })
  }

  async deleteForumPost(postId: string) {
    return this.request<{ message: string }>(`/forum/${postId}`, {
      method: 'DELETE',
    })
  }

  // Setup (first-run)
  async getSetupStatus() {
    return this.request<{ needsSetup: boolean; userCount: number; message: string }>('/setup/status')
  }

  async createAdmin(username: string, email: string, password: string) {
    const data = await this.request<{ user: any; token: string; message: string }>(
      '/setup/admin',
      { method: 'POST', body: JSON.stringify({ username, email, password }) }
    )
    this.setToken(data.token)
    return data
  }

  // Project file upload (up to 30 MB)
  async uploadProjectFile(owner: string, name: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/codexes/${owner}/${name}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data as { url: string; filename: string; size: number; maxSize: number }
  }

  // Auth
  async signup(username: string, email: string, password: string) {
    const data = await this.request<{ user: any; token: string; message: string }>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify({ username, email, password }) }
    )
    this.setToken(data.token)
    return data
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string; message: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    )
    this.setToken(data.token)
    return data
  }

  async demoLogin() {
    const data = await this.request<{ user: any; token: string; message: string }>(
      '/auth/demo',
      { method: 'POST' }
    )
    this.setToken(data.token)
    return data
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me')
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  }

  async uploadCover(file: File) {
    const formData = new FormData()
    formData.append('cover', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/auth/cover`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  }

  async updateProfile(data: { displayName?: string; bio?: string; location?: string; websiteUrl?: string; company?: string; twitter?: string }) {
    return this.request<{ user: any }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Users
  async getUser(username: string) {
    return this.request<{ user: any; repos: any[]; pinnedRepos: any[] }>(`/users/${username}`)
  }

  async getUserContributions(username: string) {
    return this.request<{ contributions: any[]; total: number }>(`/users/${username}/contributions`)
  }

  async getLeaderboard() {
    return this.request<{ leaderboard: any[] }>('/users/leaderboard/top')
  }

  async getStats() {
    return this.request<{ totalUsers: number; totalRepos: number }>('/users/stats')
  }

  async awardXP(amount: number, reason?: string) {
    return this.request<any>('/users/xp', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  }

  // Repositories (legacy)
  async getRepos(params?: { sort?: string; type?: string }) {
    const query = new URLSearchParams(params).toString()
    return this.request<{ repos: any[]; total: number }>(`/repos?${query}`)
  }

  async getRepo(owner: string, name: string) {
    return this.request<{ repo: any; languages: any[]; isEmbered: boolean; isWatching: boolean; isStarred: boolean }>(`/repos/${owner}/${name}`)
  }

  async createRepo(data: any) {
    return this.request<{ repo: any }>('/repos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRepo(owner: string, name: string, data: any) {
    return this.request<{ repo: any }>(`/repos/${owner}/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRepo(owner: string, name: string) {
    return this.request<{ message: string }>(`/repos/${owner}/${name}`, {
      method: 'DELETE',
    })
  }

  async toggleStar(owner: string, name: string) {
    return this.request<{ starred: boolean; starsCount: number }>(
      `/repos/${owner}/${name}/star`,
      { method: 'POST' }
    )
  }

  async toggleEmber(owner: string, name: string) {
    return this.request<{ isEmbered: boolean; embersCount: number }>(
      `/repos/${owner}/${name}/ember`,
      { method: 'POST' }
    )
  }

  async toggleWatch(owner: string, name: string) {
    return this.request<{ isWatching: boolean; watchersCount: number }>(
      `/repos/${owner}/${name}/watch`,
      { method: 'POST' }
    )
  }

  async echoRepo(owner: string, name: string) {
    return this.request<{ echoesCount: number }>(
      `/repos/${owner}/${name}/echo`,
      { method: 'POST' }
    )
  }

  async forkRepo(owner: string, name: string) {
    return this.request<{ repo: any }>(`/repos/${owner}/${name}/fork`, {
      method: 'POST',
    })
  }

  async getRepoCommits(owner: string, name: string) {
    return this.request<{ commits: any[] }>(`/repos/${owner}/${name}/commits`)
  }

  async getRepoFile(owner: string, name: string, path: string) {
    return this.request<{ file: any; path: string }>(
      `/repos/${owner}/${name}/file?path=${encodeURIComponent(path)}`
    )
  }

  // === CODEX (Barry) API ===

  async uploadCodexMedia(owner: string, name: string, file: File, field: 'cover' | 'logo' = 'cover') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_BASE}/codexes/${owner}/${name}/media`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  }

  async updateCodex(owner: string, name: string, data: { tagline?: string; websiteUrl?: string; technologies?: string[]; accentColor?: string; description?: string }) {
    return this.request<{ repo: any }>(`/codexes/${owner}/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Codex meta
  async getCodex(owner: string, name: string) {
    return this.request<{ repo: any; isEmbered: boolean; isWatching: boolean; hasEchoed: boolean; counts: any }>(
      `/codexes/${owner}/${name}`
    )
  }

  async getReadme(owner: string, name: string) {
    return this.request<{ readme: string | null; filename: string | null }>(
      `/codexes/${owner}/${name}/readme`
    )
  }

  async getCodexTree(owner: string, name: string) {
    return this.request<{ tree: any[] }>(`/codexes/${owner}/${name}/tree`)
  }

  async getCodexBlob(owner: string, name: string, path: string) {
    return this.request<{ file: any; path: string }>(
      `/codexes/${owner}/${name}/blob?path=${encodeURIComponent(path)}`
    )
  }

  // Ember / Watch / Echo
  async toggleCodexEmber(owner: string, name: string) {
    return this.request<{ isEmbered: boolean; embersCount: number }>(
      `/codexes/${owner}/${name}/ember`, { method: 'POST' }
    )
  }

  async toggleCodexWatch(owner: string, name: string) {
    return this.request<{ isWatching: boolean; watchersCount: number }>(
      `/codexes/${owner}/${name}/watch`, { method: 'POST' }
    )
  }

  async toggleCodexEcho(owner: string, name: string) {
    return this.request<{ hasEchoed: boolean; echoesCount: number }>(
      `/codexes/${owner}/${name}/echo`, { method: 'POST' }
    )
  }

  // Quests
  async getQuests(owner: string, name: string, state?: string) {
    const query = state ? `?state=${state}` : ''
    return this.request<{ quests: any[]; openCount: number; closedCount: number }>(
      `/codexes/${owner}/${name}/quests${query}`
    )
  }

  async getQuest(owner: string, name: string, number: number) {
    return this.request<{ quest: any; comments: any[] }>(
      `/codexes/${owner}/${name}/quests/${number}`
    )
  }

  async createQuest(owner: string, name: string, data: any) {
    return this.request<{ quest: any }>(
      `/codexes/${owner}/${name}/quests`, { method: 'POST', body: JSON.stringify(data) }
    )
  }

  async updateQuest(owner: string, name: string, number: number, data: any) {
    return this.request<{ quest: any }>(
      `/codexes/${owner}/${name}/quests/${number}`, { method: 'PATCH', body: JSON.stringify(data) }
    )
  }

  async addQuestComment(owner: string, name: string, number: number, body: string) {
    return this.request<{ comment: any }>(
      `/codexes/${owner}/${name}/quests/${number}/comments`,
      { method: 'POST', body: JSON.stringify({ body }) }
    )
  }

  // Offerings
  async getOfferings(owner: string, name: string, state?: string) {
    const query = state ? `?state=${state}` : ''
    return this.request<{ offerings: any[]; openCount: number; boundCount: number; closedCount: number }>(
      `/codexes/${owner}/${name}/offerings${query}`
    )
  }

  async getOffering(owner: string, name: string, number: number) {
    return this.request<{ offering: any; comments: any[] }>(
      `/codexes/${owner}/${name}/offerings/${number}`
    )
  }

  async createOffering(owner: string, name: string, data: any) {
    return this.request<{ offering: any }>(
      `/codexes/${owner}/${name}/offerings`, { method: 'POST', body: JSON.stringify(data) }
    )
  }

  async updateOffering(owner: string, name: string, number: number, data: any) {
    return this.request<{ offering: any }>(
      `/codexes/${owner}/${name}/offerings/${number}`, { method: 'PATCH', body: JSON.stringify(data) }
    )
  }

  async addOfferingComment(owner: string, name: string, number: number, body: string) {
    return this.request<{ comment: any }>(
      `/codexes/${owner}/${name}/offerings/${number}/comments`,
      { method: 'POST', body: JSON.stringify({ body }) }
    )
  }

  async bindOffering(owner: string, name: string, number: number) {
    return this.request<{ offering: any; gitBound: boolean }>(
      `/codexes/${owner}/${name}/offerings/${number}/bind`, { method: 'POST' }
    )
  }

  // Paths
  async getPaths(owner: string, name: string) {
    return this.request<{ paths: any[] }>(`/codexes/${owner}/${name}/paths`)
  }

  async createPath(owner: string, name: string, data: { name: string; from?: string }) {
    return this.request<{ path: any }>(
      `/codexes/${owner}/${name}/paths`, { method: 'POST', body: JSON.stringify(data) }
    )
  }

  // Releases
  async getReleases(owner: string, name: string) {
    return this.request<{ releases: any[] }>(`/codexes/${owner}/${name}/releases`)
  }

  async createRelease(owner: string, name: string, data: any) {
    return this.request<{ release: any }>(
      `/codexes/${owner}/${name}/releases`, { method: 'POST', body: JSON.stringify(data) }
    )
  }

  // Collaborators (Barry)
  async getCodexCollaborators(owner: string, name: string) {
    return this.request<{ collaborators: any[] }>(`/codexes/${owner}/${name}/collaborators`)
  }

  async addCodexCollaborator(owner: string, name: string, data: { username?: string; email?: string; role?: string }) {
    return this.request<{ collaborator?: any; invited?: boolean; invitation?: any; inviteLink?: string }>(
      `/codexes/${owner}/${name}/collaborators`, { method: 'POST', body: JSON.stringify(data) }
    )
  }

  async removeCodexCollaborator(owner: string, name: string, userId: string) {
    return this.request<{ message: string }>(
      `/codexes/${owner}/${name}/collaborators/${userId}`, { method: 'DELETE' }
    )
  }

  // Invitations
  async getInvitation(token: string) {
    return this.request<{ invitation: any }>(`/codexes/invitations/${token}`)
  }

  async acceptInvitation(token: string) {
    return this.request<{ message: string; codexId: string }>(
      `/codexes/invitations/${token}/accept`, { method: 'POST' }
    )
  }

  // Issues
  async getIssues(owner: string, name: string, params?: { state?: string }) {
    const query = new URLSearchParams(params).toString()
    return this.request<{ issues: any[]; openCount: number; closedCount: number }>(
      `/issues/${owner}/${name}?${query}`
    )
  }

  async getIssue(owner: string, name: string, number: number) {
    return this.request<{ issue: any }>(`/issues/${owner}/${name}/${number}`)
  }

  async createIssue(owner: string, name: string, data: any) {
    return this.request<{ issue: any }>(`/issues/${owner}/${name}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateIssue(owner: string, name: string, number: number, data: any) {
    return this.request<{ issue: any }>(`/issues/${owner}/${name}/${number}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async addIssueComment(owner: string, name: string, number: number, body: string) {
    return this.request<{ comment: any }>(`/issues/${owner}/${name}/${number}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }

  // Pull Requests
  async getPulls(owner: string, name: string, params?: { state?: string }) {
    const query = new URLSearchParams(params).toString()
    return this.request<{ pulls: any[]; openCount: number; closedCount: number; mergedCount: number }>(
      `/pulls/${owner}/${name}?${query}`
    )
  }

  async getPull(owner: string, name: string, number: number) {
    return this.request<{ pull: any }>(`/pulls/${owner}/${name}/${number}`)
  }

  async createPull(owner: string, name: string, data: any) {
    return this.request<{ pull: any }>(`/pulls/${owner}/${name}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePull(owner: string, name: string, number: number, data: any) {
    return this.request<{ pull: any }>(`/pulls/${owner}/${name}/${number}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async mergePull(owner: string, name: string, number: number) {
    return this.request<{ pull: any; message: string }>(
      `/pulls/${owner}/${name}/${number}/merge`,
      { method: 'POST' }
    )
  }

  async submitReview(owner: string, name: string, number: number, data: any) {
    return this.request<{ review: any }>(`/pulls/${owner}/${name}/${number}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addPullComment(owner: string, name: string, number: number, body: string) {
    return this.request<{ comment: any }>(`/pulls/${owner}/${name}/${number}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }

  // Collaborators
  async getCollaborators(owner: string, name: string) {
    return this.request<{ collaborators: any[] }>(`/collaborators/${owner}/${name}`)
  }

  async addCollaborator(owner: string, name: string, username: string, role: string) {
    return this.request<{ collaborator: any }>(`/collaborators/${owner}/${name}`, {
      method: 'POST',
      body: JSON.stringify({ username, role }),
    })
  }

  async updateCollaboratorRole(owner: string, name: string, userId: string, role: string) {
    return this.request<{ collaborator: any }>(`/collaborators/${owner}/${name}/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  async removeCollaborator(owner: string, name: string, userId: string) {
    return this.request<{ message: string }>(`/collaborators/${owner}/${name}/${userId}`, {
      method: 'DELETE',
    })
  }

  logout() {
    this.clearToken()
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>('/notifications')
  }

  async markNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read', {
      method: 'PATCH',
    })
  }

  // Admin
  async adminGetUsers(params?: { page?: number; limit?: number; search?: string; sort?: string }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request<{ users: any[]; total: number; page: number; pages: number }>(`/admin/users?${query}`)
  }

  async adminUpdateUser(userId: string, data: { level?: number; xp?: number; badgeColor?: string; characterClass?: string }) {
    return this.request<{ user: any }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async adminDeleteUser(userId: string) {
    return this.request<{ message: string; user: { _id: string; username: string } }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  async adminGetRepos(params?: { page?: number; limit?: number; search?: string; sort?: string; visibility?: string }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request<{ repos: any[]; total: number; page: number; pages: number }>(`/admin/repos?${query}`)
  }
}

export const api = new ApiClient()

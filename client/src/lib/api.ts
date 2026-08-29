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

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
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

  async getMe() {
    return this.request<{ user: any }>('/auth/me')
  }

  async updateProfile(data: Record<string, any>) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
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

  async awardXP(amount: number, reason?: string) {
    return this.request<any>('/users/xp', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  }

  // Repositories
  async getRepos(params?: { sort?: string; type?: string }) {
    const query = new URLSearchParams(params).toString()
    return this.request<{ repos: any[]; total: number }>(`/repos?${query}`)
  }

  async getRepo(owner: string, name: string) {
    return this.request<{ repo: any; languages: any[] }>(`/repos/${owner}/${name}`)
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
}

export const api = new ApiClient()

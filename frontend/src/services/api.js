const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

export const api = {
  getToken() { return localStorage.getItem('arena_token') },
  getLeagueId() { return localStorage.getItem('arena_league_id') },
  getHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  },

  setSession(adminId, token) {
    localStorage.setItem('arena_admin_id', adminId)
    localStorage.setItem('arena_token', token)
  },

  setLeague(id) {
    localStorage.setItem('arena_league_id', id)
  },

  logout() {
    localStorage.clear()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(this.getToken() ? { 'Authorization': `Bearer ${this.getToken()}` } : {})
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

    if (response.status === 401) {
      this.logout()
      throw new Error('Sessão expirada. Por favor, faça login novamente.')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Erro na requisição: ${response.status}`)
    }

    return response.json()
  },

  async login(email, password) {
    const data = await this.request('/admins/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    this.setSession(data.admin.id, data.token)
    return data.admin
  },

  async getAdminLeagues() {
    return this.request('/leagues/mine')
  },

  async createLeague(name, season) {
    return this.request('/leagues', {
      method: 'POST',
      body: JSON.stringify({ name, season })
    })
  },

  async getPlayers() {
    return this.request('/players/mine')
  },

  async createPlayer(name) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
  },

  async updatePlayer(id, name) {
    return this.request(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    })
  },

  async deletePlayer(id) {
    return this.request(`/players/${id}`, {
      method: 'DELETE'
    })
  },

  async createTournament(name, date, status = 'active') {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        league_id: this.getLeagueId(),
        name,
        tournament_date: date,
        status: status
      })
    })
  },

  async getLeagueTournaments() {
    return this.request(`/tournaments/league/${this.getLeagueId()}`)
  },

  async deleteTournament(id) {
    return this.request(`/tournaments/${id}`, {
      method: 'DELETE'
    })
  },

  async saveResults(tournamentId, results) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify({ tournament_id: tournamentId, results })
    })
  },

  async getLeagueRanking() {
    return this.request(`/results/ranking/${this.getLeagueId()}`)
  },

  async getPublicLeagueData(leagueId) {
    const response = await fetch(`${API_URL}/public/league/${leagueId}`)
    if (!response.ok) {
      throw new Error('Liga não encontrada ou indisponível.')
    }
    return response.json()
  },

  async updateTournament(tournamentId, data) {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Falha ao atualizar o torneio')
    return response.json()
  },

  async deleteTournament(tournamentId) {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    if (!response.ok) throw new Error('Falha ao excluir o torneio')
    return response.json()
  }
}
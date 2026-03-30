const API_URL = 'http://localhost:3333/api'

export const api = {
  // --- CONTROLE DE SESSÃO ---
  getToken() { return localStorage.getItem('arena_token') },
  getAdminId() { return localStorage.getItem('arena_admin_id') },
  getLeagueId() { return localStorage.getItem('arena_league_id') },

  setSession(adminId, token) {
    localStorage.setItem('arena_admin_id', adminId)
    localStorage.setItem('arena_token', token)
  },

  setLeague(id) {
    localStorage.setItem('arena_league_id', id)
  },

  logout() {
    localStorage.clear()
    // Redireciona para o login caso o token expire ou o usuário saia
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  },

  // Helper para centralizar os Headers e a lógica de erro 401
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(this.getToken() ? { 'Authorization': `Bearer ${this.getToken()}` } : {})
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

    // Se o token for inválido ou expirar, desloga automaticamente
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

  // --- ADMIN & AUTH ---
  async login(email, password) {
    const data = await this.request('/admins/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    this.setSession(data.admin.id, data.token)
    return data.admin
  },

  // --- LIGAS ---
  async getAdminLeagues() {
    return this.request(`/leagues/admin/${this.getAdminId()}`)
  },

  async createLeague(name, season) {
    return this.request('/leagues', {
      method: 'POST',
      body: JSON.stringify({ admin_id: this.getAdminId(), name, season })
    })
  },

  // --- JOGADORES ---
  async getPlayers() {
    return this.request(`/players/admin/${this.getAdminId()}`)
  },

  async createPlayer(name) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify({ admin_id: this.getAdminId(), name })
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

  // --- TORNEIOS ---
  async createTournament(name, date, status = 'active') {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.getAdminId(),
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

  // --- RESULTADOS E RANKING ---
  async saveResults(tournamentId, results) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify({ tournament_id: tournamentId, results })
    })
  },

  async getLeagueRanking() {
    return this.request(`/results/ranking/${this.getLeagueId()}`)
  },

  // --- ROTAS PÚBLICAS (Sem Token) ---
  async getPublicLeagueData(leagueId) {
    const response = await fetch(`${API_URL}/public/league/${leagueId}`)
    if (!response.ok) {
      throw new Error('Liga não encontrada ou indisponível.')
    }
    return response.json()
  }
}
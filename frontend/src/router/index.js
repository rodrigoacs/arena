import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import LeagueDetailsView from '../views/LeagueDetailsView.vue'
import TournamentView from '../views/TournamentView.vue'
import PublicLeagueView from '../views/PublicLeagueView.vue' // Novo Import
import { api } from '../services/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/league',
      name: 'league',
      component: LeagueDetailsView,
      meta: { requiresAuth: true, requiresLeague: true }
    },
    {
      path: '/tournament',
      name: 'tournament',
      component: TournamentView,
      meta: { requiresAuth: true, requiresLeague: true }
    },
    // Nova Rota Pública (não tem meta requiresAuth)
    {
      path: '/l/:id',
      name: 'public-league',
      component: PublicLeagueView
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = api.getToken()
  const leagueId = api.getLeagueId()

  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else if (to.meta.requiresLeague && !leagueId) {
    next({ name: 'dashboard' })
  } else if (to.name === 'login' && token) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
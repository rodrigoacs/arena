import { Router } from 'express'
import { getPublicLeagueData } from '../controllers/publicController.js'

const router = Router()

// Rota aberta, sem authMiddleware
router.get('/league/:id', getPublicLeagueData)

export default router

import { Router } from 'express'
import { createLeague, getAdminLeagues } from '../controllers/leagueController.js'

const router = Router()

router.post('/', createLeague)
router.get('/mine', getAdminLeagues)

export default router
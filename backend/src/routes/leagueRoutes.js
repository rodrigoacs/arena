import { Router } from 'express'
import { createLeague, getAdminLeagues } from '../controllers/leagueController.js'

const router = Router()

router.post('/', createLeague)
router.get('/admin/:admin_id', getAdminLeagues)

export default router
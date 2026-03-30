import { Router } from 'express'
import { saveTournamentResults, getLeagueRanking } from '../controllers/resultController.js'

const router = Router()

router.post('/', saveTournamentResults)
router.get('/ranking/:league_id', getLeagueRanking)

export default router
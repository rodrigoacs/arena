import { Router } from 'express'
import { createTournament, getLeagueTournaments, deleteTournament } from '../controllers/tournamentController.js'

const router = Router()

router.post('/', createTournament)
router.get('/league/:league_id', getLeagueTournaments)
router.delete('/:id', deleteTournament)

export default router
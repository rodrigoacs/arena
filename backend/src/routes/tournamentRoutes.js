import { Router } from 'express'
import { createTournament, getLeagueTournaments, updateTournament, deleteTournament } from '../controllers/tournamentController.js'

const router = Router()

router.post('/', createTournament)
router.get('/league/:league_id', getLeagueTournaments)
router.put('/:id', updateTournament)
router.delete('/:id', deleteTournament)

export default router
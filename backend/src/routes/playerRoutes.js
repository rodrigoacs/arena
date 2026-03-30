import { Router } from 'express'
import { createPlayer, getAdminPlayers, updatePlayer, deletePlayer } from '../controllers/playerController.js'

const router = Router()

router.post('/', createPlayer)
router.get('/admin/:admin_id', getAdminPlayers)
router.put('/:id', updatePlayer)
router.delete('/:id', deletePlayer)

export default router
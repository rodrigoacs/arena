import { Router } from 'express'
import { createAdmin, getAdminProfile, loginAdmin } from '../controllers/adminController.js'

const router = Router()

router.post('/', createAdmin)
router.post('/login', loginAdmin)
router.get('/:id', getAdminProfile)

export default router
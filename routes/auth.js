import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { register, login, me } from '../controllers/authController.js'
import { updateMe } from '../controllers/userController.js'

const r = Router()
r.post('/register', register)
r.post('/login', login)
r.get('/me', requireAuth, me)
r.put('/me', requireAuth, updateMe) 
export default r

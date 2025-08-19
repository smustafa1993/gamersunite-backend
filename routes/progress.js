// routes/progress.js
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { setProgress, getMyProgress } from '../controllers/progressController.js'
const r = Router()
r.get('/', requireAuth, getMyProgress)
r.put('/:gameId', requireAuth, setProgress)
export default r

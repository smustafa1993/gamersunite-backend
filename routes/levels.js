import { Router } from 'express'
import { createLevel, getLevel } from '../controllers/levelController.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()
r.post('/:gameId/levels', requireAuth, createLevel)  // POST /levels/:gameId/levels via /games in UI or call directly
r.get('/:levelId', getLevel)
export default r

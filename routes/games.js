import { Router } from 'express'
import { listGames, createGame, getGameBySlug } from '../controllers/gameController.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()
r.get('/', listGames)
r.post('/', requireAuth, createGame)
r.get('/:slug', getGameBySlug)
export default r

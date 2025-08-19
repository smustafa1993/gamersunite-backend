import { z } from 'zod'
import User from '../models/User.js'
import Game from '../models/Game.js'

const schema = z.object({ levelNumber: z.number().int().nonnegative() })

export async function setProgress(req, res, next) {
  try {
    const { gameId } = req.params
    const game = await Game.findById(gameId).lean()
    if (!game) throw Object.assign(new Error('Game not found'), { status: 404 })

    const { levelNumber } = schema.parse({ levelNumber: Number(req.body.levelNumber) })

    const user = await User.findById(req.userId)
    const idx = user.progress.findIndex((p) => String(p.game) === String(gameId))
    if (idx >= 0) user.progress[idx].levelNumber = levelNumber
    else user.progress.push({ game: gameId, levelNumber })
    await user.save()

    res.json({ ok: true, progress: user.progress })
  } catch (e) { next(e) }
}
export async function getMyProgress(req, res, next) {
  try {
    const user = await User.findById(req.userId).lean()
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
    // Populate game titles
    const Level = (await import('../models/Level.js')).default
    const Game = (await import('../models/Game.js')).default

    const gameIds = (user.progress || []).map(p => p.game)
    const games = await Game.find({ _id: { $in: gameIds } }).select('_id title').lean()
    const gameById = new Map(games.map(g => [String(g._id), g.title]))

    const rows = (user.progress || []).map(p => ({
      gameId: String(p.game),
      gameTitle: gameById.get(String(p.game)) || '(unknown)',
      levelNumber: p.levelNumber
    }))

    res.json({ progress: rows })
  } catch (e) { next(e) }
}

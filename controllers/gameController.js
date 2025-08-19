import { z } from 'zod'
import Game from '../models/Game.js'
import Level from '../models/Level.js'
import { toSlug } from '../utils/slug.js'

export async function listGames(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    const filter = q ? { $text: { $search: q } } : {}
    const games = await Game.find(filter).sort({ createdAt: -1 }).limit(50).lean()
    res.json(games)
  } catch (e) { next(e) }
}

const createSchema = z.object({
  title: z.string().min(2),
  coverUrl: z.string().url().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  rawgId: z.string().optional()
})

export async function createGame(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const slug = toSlug(data.title)
    const exists = await Game.findOne({ slug })
    if (exists) throw Object.assign(new Error('Game already exists'), { status: 400 })
    const game = await Game.create({ ...data, slug })
    res.status(201).json(game)
  } catch (e) { next(e) }
}

export async function getGameBySlug(req, res, next) {
  try {
    const { slug } = req.params
    const game = await Game.findOne({ slug }).lean()
    if (!game) throw Object.assign(new Error('Not found'), { status: 404 })
    const levels = await Level.find({ game: game._id }).sort({ number: 1 }).select('_id number title').lean()
    res.json({ game, levels })
  } catch (e) { next(e) }
}

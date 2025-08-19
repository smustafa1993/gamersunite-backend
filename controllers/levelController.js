import { z } from 'zod'
import Level from '../models/Level.js'
import Game from '../models/Game.js'

const createSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(2),
  summary: z.string().optional()
})

export async function createLevel(req, res, next) {
  try {
    const { gameId } = req.params
    const game = await Game.findById(gameId)
    if (!game) throw Object.assign(new Error('Game not found'), { status: 404 })

    const body = createSchema.parse({
      number: Number(req.body.number),
      title: req.body.title,
      summary: req.body.summary
    })

    const level = await Level.create({
      game: game._id,
      number: body.number,
      title: body.title,
      summary: body.summary,
      createdBy: req.userId
    })
    res.status(201).json(level)
  } catch (e) { next(e) }
}

export async function getLevel(req, res, next) {
  try {
    const { levelId } = req.params
    const level = await Level.findById(levelId).populate('game', 'title slug').lean()
    if (!level) throw Object.assign(new Error('Not found'), { status: 404 })
    res.json(level)
// after you fetched the level and its game id
const reveal = req.query.reveal === '1'

// get user progress for this game (if logged in)
let progress = null
if (req.user) {
  const Progress = require('../models/Progress').default || require('../models/Progress')
  progress = await Progress.findOne({ user: req.user._id, game: level.game })
}

// helper: should this comment be masked?
const shouldMask = !reveal && progress && (progress.levelNumber < level.number)

const sanitized = comments.map(c => {
  if (shouldMask) {
    return {
      _id: c._id,
      createdAt: c.createdAt,
      author: c.author ? { displayName: c.author.displayName, _id: c.author._id } : null,
      votes: c.votes,
      masked: true,
      preview: c.body.slice(0, 60) + (c.body.length > 60 ? '…' : '')
    }
  }
  return {
    _id: c._id,
    createdAt: c.createdAt,
    author: c.author ? { displayName: c.author.displayName, _id: c.author._id } : null,
    votes: c.votes,
    masked: false,
    body: c.body
  }
})

res.json({ comments: sanitized })

  } catch (e) { next(e) }
}


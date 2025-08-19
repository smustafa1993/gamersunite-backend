// controllers/commentController.js
import { z } from 'zod'
import Comment from '../models/Comment.js'
import Level from '../models/Level.js'
import User from '../models/User.js'
import { maskCommentBody } from '../utils/mask.js'


export async function listComments(req, res, next) {
  try {
    const { levelId } = req.params
    const reveal =
      req.query.reveal === '1' ||
      req.query.reveal === 'true' ||
      req.query.reveal === 'yes'

    const sort =
      req.query.sort === 'top'
        ? { votes: -1, createdAt: -1 }
        : { createdAt: -1 }

    const level = await Level.findById(levelId).lean()
    if (!level) throw Object.assign(new Error('Level not found'), { status: 404 })

    // determine viewer prefs and progress for THIS game
    let prefsMode = 'auto'
    let userLevel = 0
    let viewerIdStr = null

    const currentUserId = req.userId ?? req.user?._id ?? null
    if (currentUserId) {
      const me = await User.findById(currentUserId).select('prefs progress').lean()
      viewerIdStr = String(currentUserId)
      prefsMode = me?.prefs?.spoilerMode || 'auto'
      const entry = me?.progress?.find(p => String(p.game) === String(level.game))
      userLevel = entry?.levelNumber ?? 0
    }

    const baseMask =
      prefsMode === 'always_hide' ||
      (prefsMode === 'auto' && userLevel < level.number)

    // we keep reported comments visible
    const items = await Comment.find({ level: level._id })
      .sort(sort)
      .populate('author', 'displayName')
      .lean()

    const mapped = items.map(c => {
      const isMine = viewerIdStr && String(c.author?._id) === viewerIdStr
      const masked = !reveal && baseMask && !isMine
      const { body, preview } = maskCommentBody({ body: c.body, masked })

      // expose the viewer's vote
      let myVote = 0
      if (viewerIdStr && c.voteMap && c.voteMap[viewerIdStr] != null) {
        // when using Map in Mongoose + lean, it materializes as plain object
        myVote = Number(c.voteMap[viewerIdStr]) || 0
      }

      return {
        _id: c._id,
        author: c.author, // {_id, displayName}
        votes: c.votes,
        myVote,
        status: c.status,
        createdAt: c.createdAt,
        masked,
        body,     // undefined when masked
        preview   // defined when masked
      }
    })

    res.json({
      comments: mapped,
      levelNumber: level.number,
      userLevel,
      prefsMode,
      reveal
    })
  } catch (e) { next(e) }
}

const createSchema = z.object({
  body: z.string().min(2)
})

// POST /levels/:levelId/comments
export async function createComment(req, res, next) {
  try {
    const { levelId } = req.params
    const level = await Level.findById(levelId).lean()
    if (!level) throw Object.assign(new Error('Level not found'), { status: 404 })

    const { body } = createSchema.parse({ body: req.body.body })

    const comment = await Comment.create({
      game: level.game,
      level: level._id,
      author: req.userId,
      body
    })

    res.status(201).json(comment)
  } catch (e) { next(e) }
}

// upsert vote schema: value ∈ {-1, 0, 1}
const voteSchema = z.object({
  value: z.number().int().refine(v => v === -1 || v === 0 || v === 1)
})

// POST /comments/:id/vote
export async function voteComment(req, res, next) {
  try {
    const { id } = req.params
    const { value } = voteSchema.parse({ value: Number(req.body.value) })

    const doc = await Comment.findById(id)
    if (!doc) throw Object.assign(new Error('Not found'), { status: 404 })

    const key = String(req.userId)
    const prev = Number(doc.voteMap.get(key) || 0)
    const nextVal = value // -1, 0, or 1
    const delta = nextVal - prev

    if (nextVal === 0) {
      doc.voteMap.delete(key)
    } else {
      doc.voteMap.set(key, nextVal)
    }
    doc.votes = (doc.votes || 0) + delta
    await doc.save()

    res.json({
      _id: doc._id,
      votes: doc.votes,
      myVote: nextVal
    })
  } catch (e) { next(e) }
}

// POST /comments/:id/report  (do not hide; record report only)
export async function reportComment(req, res, next) {
  try {
    const { id } = req.params
    const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined

    const updated = await Comment.findByIdAndUpdate(
      id,
      {
        $push: { reports: { user: req.userId, reason, createdAt: new Date() } },
        $set: { status: 'reported' }
      },
      { new: true }
    )
    if (!updated) throw Object.assign(new Error('Not found'), { status: 404 })

    // still visible
    res.json({ ok: true, status: updated.status, reportsCount: updated.reports?.length || 0 })
  } catch (e) { next(e) }
}

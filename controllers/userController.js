import { z } from 'zod'
import User from '../models/User.js'

const schema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  spoilerMode: z.enum(['auto', 'always_hide', 'always_show']).optional()
})

export async function updateMe(req, res, next) {
  try {
    const { displayName, spoilerMode } = schema.parse(req.body || {})
    const set = {}
    if (displayName != null) set.displayName = displayName
    if (spoilerMode != null) set['prefs.spoilerMode'] = spoilerMode

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: set },
      { new: true, select: 'email displayName prefs' }
    ).lean()

    if (!updated) throw Object.assign(new Error('User not found'), { status: 404 })
    res.json(updated)
  } catch (e) { next(e) }
}

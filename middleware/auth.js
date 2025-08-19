import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function requireAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch (e) {
    next(Object.assign(new Error('Unauthorized'), { status: 401 }))
  }
}

/**
 * Soft-auth: if an Authorization header is present and valid,
 * set req.userId and req.user. If not present/invalid, continue as guest.
 */
export async function attachUser(req, _res, next) {
  try {
    if (!req.userId) {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.sub
      }
    }
  } catch (_e) {
    
  }

  if (!req.userId) return next()
  const user = await User.findById(req.userId).lean()
  req.user = user || null
  next()
}

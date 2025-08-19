import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2)
})

export async function register(req, res, next) {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body)
    const exists = await User.findOne({ email })
    if (exists) throw Object.assign(new Error('Email already in use'), { status: 400 })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ email, passwordHash, displayName })
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: safeUser(user) })
  } catch (e) { next(e) }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await User.findOne({ email })
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 })
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: safeUser(user) })
  } catch (e) { next(e) }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).lean()
    res.json({ user: user ? safeUser(user) : null })
  } catch (e) { next(e) }
}

function safeUser(u) {
  return {
    _id: u._id,
    email: u.email,
    displayName: u.displayName,
    roles: u.roles,
    prefs: u.prefs,
    progress: u.progress
  }
}

import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/games.js'
import levelRoutes from './routes/levels.js'
import commentRoutes from './routes/comments.js'
import progressRoutes from './routes/progress.js'
import { errorHandler } from './middleware/error.js'

const app = express()

// CORS
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))

app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// routes
app.use('/auth', authRoutes)
app.use('/games', gameRoutes)
app.use('/levels', levelRoutes)
app.use('/comments', commentRoutes)
app.use('/progress', progressRoutes)

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'GamersUnite API' })
})

// centralized error handler
app.use(errorHandler)

const PORT = process.env.PORT || 4000
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API on :${PORT}`))
})

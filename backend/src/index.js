import express from 'express'
import cors from 'cors'

import adminRoutes from './routes/adminRoutes.js'
import leagueRoutes from './routes/leagueRoutes.js'
import playerRoutes from './routes/playerRoutes.js'
import tournamentRoutes from './routes/tournamentRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

import { authMiddleware } from './middlewares/auth.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
}))
app.use(express.json())

app.use('/api/admins', adminRoutes)
app.use('/api/public', publicRoutes)

app.use('/api/leagues', authMiddleware, leagueRoutes)
app.use('/api/players', authMiddleware, playerRoutes)
app.use('/api/tournaments', authMiddleware, tournamentRoutes)
app.use('/api/results', authMiddleware, resultRoutes)

app.get('/ping', (req, res) => res.status(200).json({ status: 'OK' }))

app.listen(process.env.PORT, () => {
  console.log(`Servidor blindado na porta ${process.env.PORT}`)
})
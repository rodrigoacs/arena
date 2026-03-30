import express from 'express'
import cors from 'cors'

import adminRoutes from './routes/adminRoutes.js'
import leagueRoutes from './routes/leagueRoutes.js'
import playerRoutes from './routes/playerRoutes.js'
import tournamentRoutes from './routes/tournamentRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import publicRoutes from './routes/publicRoutes.js' // Novo Import

import { authMiddleware } from './middlewares/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

// --- Rotas Púbicas (Não exigem Token) ---
app.use('/api/admins', adminRoutes)
app.use('/api/public', publicRoutes) // Rota para a galera ver o ranking

// --- Rotas Protegidas (Exigem o Token JWT do Organizador) ---
app.use('/api/leagues', authMiddleware, leagueRoutes)
app.use('/api/players', authMiddleware, playerRoutes)
app.use('/api/tournaments', authMiddleware, tournamentRoutes)
app.use('/api/results', authMiddleware, resultRoutes)

app.get('/ping', (req, res) => res.status(200).json({ status: 'OK' }))

app.listen(process.env.PORT, () => {
  console.log(`Servidor blindado na porta ${process.env.PORT}`)
})
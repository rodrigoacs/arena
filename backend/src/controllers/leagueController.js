import { query } from '../config/db.js'

export const createLeague = async (req, res) => {
  try {
    const admin_id = req.adminId
    const { name, season } = req.body

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório.' })
    }

    const result = await query(
      'INSERT INTO leagues (admin_id, name, season) VALUES ($1, $2, $3) RETURNING *',
      [admin_id, name, season || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao criar liga:', error)
    res.status(500).json({ error: 'Erro interno ao criar a liga.' })
  }
}

export const getAdminLeagues = async (req, res) => {
  try {
    const admin_id = req.adminId

    const result = await query(
      'SELECT * FROM leagues WHERE admin_id = $1 ORDER BY created_at DESC',
      [admin_id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar ligas:', error)
    res.status(500).json({ error: 'Erro interno ao buscar as ligas.' })
  }
}
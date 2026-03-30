import { query } from '../config/db.js'

export const createPlayer = async (req, res) => {
  try {
    const { admin_id, name } = req.body

    if (!admin_id || !name) {
      return res.status(400).json({ error: 'admin_id e name são obrigatórios.' })
    }

    const result = await query(
      'INSERT INTO players (admin_id, name) VALUES ($1, $2) RETURNING *',
      [admin_id, name]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe um jogador com este nome na tua lista.' })
    }
    console.error('Erro ao criar jogador:', error)
    res.status(500).json({ error: 'Erro interno ao criar o jogador.' })
  }
}

export const getAdminPlayers = async (req, res) => {
  try {
    const { admin_id } = req.params

    const result = await query(
      'SELECT id, name, created_at FROM players WHERE admin_id = $1 ORDER BY name ASC',
      [admin_id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error)
    res.status(500).json({ error: 'Erro interno ao buscar os jogadores.' })
  }
}

export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'O nome é obrigatório.' })
    }

    const result = await query(
      'UPDATE players SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado.' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe um jogador com este nome.' })
    }
    console.error('Erro ao atualizar jogador:', error)
    res.status(500).json({ error: 'Erro interno ao atualizar o jogador.' })
  }
}

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params

    const result = await query('DELETE FROM players WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado.' })
    }

    res.status(200).json({ message: 'Jogador removido com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar jogador:', error)
    res.status(500).json({ error: 'Erro interno ao deletar o jogador.' })
  }
}
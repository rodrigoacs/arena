import { query } from '../config/db.js'

export const createTournament = async (req, res) => {
  try {
    const { admin_id, league_id, name, tournament_date, status } = req.body

    if (!admin_id || !name || !tournament_date) {
      return res.status(400).json({ error: 'admin_id, name e tournament_date são obrigatórios.' })
    }

    const result = await query(
      `INSERT INTO tournaments (admin_id, league_id, name, tournament_date, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [admin_id, league_id || null, name, tournament_date, status || 'pending']
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao criar torneio:', error)
    res.status(500).json({ error: 'Erro interno ao criar o torneio.' })
  }
}

export const getLeagueTournaments = async (req, res) => {
  try {
    const { league_id } = req.params

    const sql = `
      SELECT 
        t.id, t.admin_id, t.league_id, t.name, t.tournament_date, t.status, t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'player_name', p.name,
              'final_position', tr.final_position,
              'deck_name', tr.deck_name,
              'deck_url', tr.deck_url,
              'total_points', tr.total_points
            ) ORDER BY tr.final_position ASC
          ) FILTER (WHERE tr.player_id IS NOT NULL), '[]'
        ) as results
      FROM tournaments t
      LEFT JOIN tournament_results tr ON t.id = tr.tournament_id
      LEFT JOIN players p ON tr.player_id = p.id
      WHERE t.league_id = $1
      GROUP BY t.id
      ORDER BY t.tournament_date DESC, t.id DESC
    `

    const result = await query(sql, [league_id])

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar torneios:', error)
    res.status(500).json({ error: 'Erro interno ao buscar os torneios.' })
  }
}

export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM tournaments WHERE id = $1', [id])
    res.status(200).json({ message: 'Torneio cancelado e removido do banco com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar torneio:', error)
    res.status(500).json({ error: 'Erro interno ao deletar o torneio.' })
  }
}
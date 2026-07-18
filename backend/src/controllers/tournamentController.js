import { query, getClient } from '../config/db.js'

export const createTournament = async (req, res) => {
  try {
    const admin_id = req.adminId
    const { league_id, name, tournament_date, status } = req.body

    if (!name || !tournament_date) {
      return res.status(400).json({ error: 'name e tournament_date são obrigatórios.' })
    }

    if (league_id) {
      const leagueCheck = await query(
        'SELECT id FROM leagues WHERE id = $1 AND admin_id = $2',
        [league_id, admin_id]
      )
      if (leagueCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Liga inválida ou não pertence a este admin.' })
      }
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
    const admin_id = req.adminId
    const { league_id } = req.params

    const leagueCheck = await query(
      'SELECT id FROM leagues WHERE id = $1 AND admin_id = $2',
      [league_id, admin_id]
    )
    if (leagueCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Liga inválida ou não pertence a este admin.' })
    }

    const sql = `
      SELECT 
        t.id, t.admin_id, t.league_id, t.name, t.tournament_date, t.status, t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'player_id', p.id,
              'player_name', p.name,
              'final_position', tr.final_position,
              'total_points', tr.total_points,
              'golds', tr.tiebreaker_golds,
              'silvers', tr.tiebreaker_silvers,
              'bronzes', tr.tiebreaker_bronzes,
              'deck_name', tr.deck_name,
              'deck_url', tr.deck_url
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

export const updateTournament = async (req, res) => {
  try {
    const admin_id = req.adminId
    const { id } = req.params
    const { name, tournament_date } = req.body

    if (!name || !tournament_date) {
      return res.status(400).json({ error: 'name e tournament_date são obrigatórios.' })
    }

    const result = await query(
      'UPDATE tournaments SET name = $1, tournament_date = $2 WHERE id = $3 AND admin_id = $4 RETURNING *',
      [name, tournament_date, id, admin_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Torneio não encontrado ou acesso negado.' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao atualizar torneio:', error)
    res.status(500).json({ error: 'Erro interno ao atualizar o torneio.' })
  }
}

export const deleteTournament = async (req, res) => {
  const admin_id = req.adminId
  const { id } = req.params

  const client = await getClient()

  try {
    const check = await client.query(
      'SELECT id FROM tournaments WHERE id = $1 AND admin_id = $2',
      [id, admin_id]
    )

    if (check.rows.length === 0) {
      client.release()
      return res.status(404).json({ error: 'Torneio não encontrado.' })
    }

    await client.query('BEGIN')
    await client.query('DELETE FROM tournament_results WHERE tournament_id = $1', [id])
    await client.query('DELETE FROM tournaments WHERE id = $1', [id])
    await client.query('COMMIT')

    res.status(200).json({ message: 'Torneio e resultados removidos do banco com sucesso.' })
  } catch (error) {
    try { await client.query('ROLLBACK') } catch (_) { }
    console.error('Erro ao deletar torneio:', error)
    res.status(500).json({ error: 'Erro interno ao deletar o torneio.' })
  } finally {
    client.release()
  }
}
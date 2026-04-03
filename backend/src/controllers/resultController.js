import { query } from '../config/db.js'

export const saveTournamentResults = async (req, res) => {
  try {
    const { tournament_id, results } = req.body

    if (!tournament_id || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'ID do torneio e array de resultados são obrigatórios.' })
    }

    await query('BEGIN')

    for (const result of results) {
      await query(
        `INSERT INTO tournament_results 
         (tournament_id, player_id, final_position, total_points, tiebreaker_golds, tiebreaker_silvers, tiebreaker_bronzes, deck_name, deck_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tournament_id, player_id) 
         DO UPDATE SET 
            final_position = EXCLUDED.final_position, 
            total_points = EXCLUDED.total_points,
            tiebreaker_golds = EXCLUDED.tiebreaker_golds,
            tiebreaker_silvers = EXCLUDED.tiebreaker_silvers,
            tiebreaker_bronzes = EXCLUDED.tiebreaker_bronzes,
            deck_name = EXCLUDED.deck_name,
            deck_url = EXCLUDED.deck_url`,
        [
          tournament_id,
          result.player_id,
          result.final_position,
          result.total_points,
          result.golds || 0,
          result.silvers || 0,
          result.bronzes || 0,
          result.deck_name || null,
          result.deck_url || null
        ]
      )
    }

    await query(
      `UPDATE tournaments SET status = 'finished', active_state = NULL WHERE id = $1`,
      [tournament_id]
    )

    await query('COMMIT')

    res.status(200).json({ message: 'Resultados salvos e torneio finalizado com sucesso.' })
  } catch (error) {
    await query('ROLLBACK')
    console.error('Erro ao salvar resultados:', error)
    res.status(500).json({ error: 'Erro interno ao processar os resultados.' })
  }
}

export const getLeagueRanking = async (req, res) => {
  try {
    const { league_id } = req.params

    const sql = `
      SELECT 
        p.id as player_id,
        p.name as player_name,
        COUNT(tr.tournament_id) as tournaments_played,
        SUM(tr.total_points) as league_points,
        SUM(tr.tiebreaker_golds) as total_golds,
        SUM(tr.tiebreaker_silvers) as total_silvers,
        SUM(tr.tiebreaker_bronzes) as total_bronzes,
        ROUND(AVG(tr.final_position), 2) as avg_position
      FROM tournament_results tr
      JOIN tournaments t ON tr.tournament_id = t.id
      JOIN players p ON tr.player_id = p.id
      WHERE t.league_id = $1 AND t.status IN ('finished', 'imported')
      GROUP BY p.id, p.name
      ORDER BY 
        league_points DESC, 
        total_golds DESC, 
        total_silvers DESC, 
        total_bronzes DESC,
        avg_position ASC, 
        tournaments_played DESC
    `

    const result = await query(sql, [league_id])

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erro ao gerar ranking da liga:', error)
    res.status(500).json({ error: 'Erro interno ao calcular o ranking.' })
  }
}
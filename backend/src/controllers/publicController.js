import { query } from '../config/db.js'

export const getPublicLeagueData = async (req, res) => {
  try {
    const { id } = req.params

    const leagueResult = await query('SELECT id, name, season FROM leagues WHERE id = $1', [id])

    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Liga não encontrada.' })
    }

    const league = leagueResult.rows[0]

    const rankingSql = `
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

    const rankingResult = await query(rankingSql, [id])

    res.status(200).json({
      league,
      ranking: rankingResult.rows
    })

  } catch (error) {
    console.error('Erro ao buscar dados públicos da liga:', error)
    res.status(500).json({ error: 'Erro interno ao carregar a página pública.' })
  }
}
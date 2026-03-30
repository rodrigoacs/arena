import { query } from '../config/db.js'

export const getPublicLeagueData = async (req, res) => {
  try {
    const { id } = req.params

    // 1. Buscar os detalhes da Liga
    const leagueResult = await query('SELECT id, name, season FROM leagues WHERE id = $1', [id])

    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Liga não encontrada.' })
    }

    const league = leagueResult.rows[0]

    // 2. Buscar o Ranking
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

    // 3. NOVO: Buscar os Últimos Torneios com as listas de decks
    const tourneysSql = `
      SELECT 
        t.id, t.name, t.tournament_date, t.status,
        COALESCE(
          json_agg(
            json_build_object(
              'player_name', p.name,
              'final_position', tr.final_position,
              'deck_name', tr.deck_name,
              'total_points', tr.total_points
            ) ORDER BY tr.final_position ASC
          ) FILTER (WHERE tr.player_id IS NOT NULL), '[]'
        ) as results
      FROM tournaments t
      LEFT JOIN tournament_results tr ON t.id = tr.tournament_id
      LEFT JOIN players p ON tr.player_id = p.id
      WHERE t.league_id = $1 AND t.status IN ('finished', 'imported')
      GROUP BY t.id
      ORDER BY t.tournament_date DESC, t.id DESC
    `

    const tourneysResult = await query(tourneysSql, [id])

    res.status(200).json({
      league,
      ranking: rankingResult.rows,
      tournaments: tourneysResult.rows
    })

  } catch (error) {
    console.error('Erro ao buscar dados públicos da liga:', error)
    res.status(500).json({ error: 'Erro interno ao carregar a página pública.' })
  }
}
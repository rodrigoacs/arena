import { ref, computed, watchEffect } from 'vue'
import { api } from '../services/api'

const STORAGE_KEY = 'arena_tournament_state'

function loadState() {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    try {
      return JSON.parse(savedState)
    } catch (e) {
      console.error('Falha ao carregar estado salvo:', e)
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  return null
}

const initialState = loadState()

const activeTournamentId = ref(initialState?.activeTournamentId || null)
const roundCount = ref(initialState?.roundCount || 3)
const playersPerTable = ref(initialState?.playersPerTable || 4)
const players = ref(initialState?.players || [])
const allAdminPlayers = ref([])
const tournamentStarted = ref(initialState?.tournamentStarted || false)
const currentRound = ref(initialState?.currentRound || 1)
const rounds = ref(initialState?.rounds || [])

let isWatcherRegistered = false

export function useTournament() {
  const playerCount = computed(() => players.value.length)
  const tableCount = computed(() => {
    if (players.value.length < playersPerTable.value) return 0
    return Math.ceil(players.value.length / playersPerTable.value)
  })

  const getAveragePosition = (player) => {
    if (!player.matches || player.matches.length === 0) return playersPerTable.value
    return player.matches.reduce((sum, match) => sum + match.position, 0) / player.matches.length
  }

  const sortedPlayers = computed(() => {
    return [...players.value].sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0)
      const aFirsts = (a.matches || []).filter(m => m.position === 1).length
      const bFirsts = (b.matches || []).filter(m => m.position === 1).length
      if (bFirsts !== aFirsts) return bFirsts - aFirsts
      const aSeconds = (a.matches || []).filter(m => m.position === 2).length
      const bSeconds = (b.matches || []).filter(m => m.position === 2).length
      if (bSeconds !== aSeconds) return bSeconds - aSeconds
      const aThirds = (a.matches || []).filter(m => m.position === 3).length
      const bThirds = (b.matches || []).filter(m => m.position === 3).length
      if (bThirds !== aThirds) return bThirds - aThirds
      const aAvg = getAveragePosition(a)
      const bAvg = getAveragePosition(b)
      if (aAvg !== bAvg) return aAvg - bAvg
      return Math.random() - 0.5
    })
  })

  const currentTables = computed(() => {
    if (!tournamentStarted.value || rounds.value.length === 0) return []
    return rounds.value[currentRound.value - 1]?.tables || []
  })

  const allResultsRegistered = computed(() => {
    if (currentTables.value.length === 0) return false
    return currentTables.value.every(table => table.status === 'completed')
  })

  async function fetchExistingPlayers() {
    try {
      allAdminPlayers.value = await api.getPlayers()
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error)
    }
  }

  function togglePlayer(dbPlayer) {
    const index = players.value.findIndex(p => p.id === dbPlayer.id)
    if (index > -1) {
      players.value.splice(index, 1)
    } else {
      players.value.push({ id: dbPlayer.id, name: dbPlayer.name, deck_name: '', deck_url: '', points: 0, matches: [] })
    }
  }

  async function addPlayer(name) {
    if (!name.trim()) return false
    try {
      const newPlayer = await api.createPlayer(name.trim())
      allAdminPlayers.value.push(newPlayer)
      players.value.push({ id: newPlayer.id, name: newPlayer.name, deck_name: '', deck_url: '', points: 0, matches: [] })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  function removePlayer(index) {
    players.value.splice(index, 1)
  }

  function generateRound() {
    let roundPlayers = [...players.value]
    if (currentRound.value > 1) {
      roundPlayers.sort((a, b) => (b.points || 0) - (a.points || 0))
    } else {
      for (let i = roundPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roundPlayers[i], roundPlayers[j]] = [roundPlayers[j], roundPlayers[i]]
      }
    }

    const tables = []
    const numPlayers = playerCount.value
    const numTables = tableCount.value
    if (numTables === 0) return

    const basePlayersPerTable = Math.floor(numPlayers / numTables)
    let extraPlayers = numPlayers % numTables
    let playerIndex = 0

    for (let i = 0; i < numTables; i++) {
      const playersForThisTable = basePlayersPerTable + (extraPlayers > 0 ? 1 : 0)
      extraPlayers--
      const tablePlayers = roundPlayers.slice(playerIndex, playerIndex + playersForThisTable)
      playerIndex += playersForThisTable
      if (tablePlayers.length > 0) {
        tables.push({ number: i + 1, players: tablePlayers.map(p => ({ id: p.id, name: p.name, result: null })), status: 'pending' })
      }
    }
    rounds.value.push({ number: currentRound.value, tables })
  }

  function updateCurrentRoundPairings(newTables) {
    if (rounds.value.length > 0) {
      rounds.value[currentRound.value - 1].tables = newTables
    }
  }

  async function startTournament() {
    if (players.value.length < playersPerTable.value) return false

    try {
      const dataFormatada = new Date().toISOString().split('T')[0]
      const nomeTorneio = `Etapa ${dataFormatada}`

      const dbTournament = await api.createTournament(nomeTorneio, dataFormatada)
      activeTournamentId.value = dbTournament.id

      players.value.forEach(p => { p.points = 0; p.matches = [] })
      currentRound.value = 1
      rounds.value = []
      tournamentStarted.value = true
      generateRound()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  function revertResults(tableIndex, roundNumber) {
    const round = rounds.value.find(r => r.number === roundNumber)
    if (!round) return
    const table = round.tables[tableIndex]
    if (!table || table.status !== 'completed') return

    table.players.forEach((playerInTable) => {
      const originalPlayer = players.value.find(p => p.id === playerInTable.id)
      if (originalPlayer && originalPlayer.matches) {
        const matchIndex = originalPlayer.matches.findIndex(
          m => m.round === roundNumber && m.table === table.number
        )

        if (matchIndex > -1) {
          const matchToRemove = originalPlayer.matches[matchIndex]
          originalPlayer.points = (originalPlayer.points || 0) - matchToRemove.points
          originalPlayer.matches.splice(matchIndex, 1)
        }
      }
      playerInTable.result = null
    })
    table.status = 'pending'
  }

  function saveResults(tableIndex, results, isEditing = false) {
    const roundData = rounds.value[currentRound.value - 1]
    if (!roundData) return
    const table = roundData.tables[tableIndex]
    if (!table) return

    if (isEditing) {
      revertResults(tableIndex, currentRound.value)
    }

    table.players.forEach((player, idx) => {
      const position = results[idx]
      player.result = position
      const originalPlayer = players.value.find(p => p.id === player.id)
      if (originalPlayer) {
        let points = 0
        if (position === 1) points = 4
        if (position === 2) points = 3
        if (position === 3) points = 2
        if (position === 4) points = 1

        originalPlayer.points = (originalPlayer.points || 0) + points
        if (!originalPlayer.matches) originalPlayer.matches = []
        originalPlayer.matches.push({ round: currentRound.value, table: table.number, position, points })
      }
    })
    table.status = 'completed'
  }

  function nextRound() {
    if (currentRound.value >= roundCount.value || !allResultsRegistered.value) return false
    currentRound.value++
    generateRound()
    return true
  }

  async function endTournament() {
    if (!activeTournamentId.value) return false

    try {
      const formattedResults = sortedPlayers.value.map((p, index) => {
        const golds = (p.matches || []).filter(m => m.position === 1).length
        const silvers = (p.matches || []).filter(m => m.position === 2).length
        const bronzes = (p.matches || []).filter(m => m.position === 3).length

        return {
          player_id: p.id,
          final_position: index + 1,
          total_points: p.points || 0,
          golds,
          silvers,
          bronzes,
          deck_name: p.deck_name || null,
          deck_url: p.deck_url || null
        }
      })

      await api.saveResults(activeTournamentId.value, formattedResults)
      tournamentStarted.value = false
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async function cancelTournament() {
    if (activeTournamentId.value) {
      try {
        await api.deleteTournament(activeTournamentId.value)
      } catch (error) {
        console.error('Falha ao limpar o torneio abortado no banco', error)
      }
    }
    clearTournamentState()
  }

  function clearTournamentState() {
    tournamentStarted.value = false
    activeTournamentId.value = null
    currentRound.value = 1
    rounds.value = []
    players.value.forEach(p => { p.points = 0; p.matches = []; p.deck_name = ''; p.deck_url = '' })
  }

  if (!isWatcherRegistered) {
    watchEffect(() => {
      const stateToSave = {
        activeTournamentId: activeTournamentId.value,
        roundCount: roundCount.value,
        playersPerTable: playersPerTable.value,
        players: players.value,
        tournamentStarted: tournamentStarted.value,
        currentRound: currentRound.value,
        rounds: rounds.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    })
    isWatcherRegistered = true
  }

  return {
    playerCount, tableCount,
    roundCount, playersPerTable, players, allAdminPlayers, tournamentStarted, activeTournamentId,
    currentRound, rounds, sortedPlayers, currentTables, allResultsRegistered,
    addPlayer, togglePlayer, startTournament, saveResults, nextRound,
    endTournament, cancelTournament, clearTournamentState, getAveragePosition, revertResults, fetchExistingPlayers,
    updateCurrentRoundPairings
  }
}
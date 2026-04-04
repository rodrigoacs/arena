<template>
  <div class="league-details-page">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <button
            class="ios-icon-btn mr-2"
            @click="goBack"
            title="Voltar"
          >
            <i class="pi pi-arrow-left"></i>
          </button>
          <i class="pi pi-trophy text-yellow-500 text-xl mr-2"></i>
          <h1>Painel da Liga</h1>
        </div>
        <div class="header-actions">
          <button
            class="ios-btn ios-btn-primary"
            @click="goToTournament"
          >
            <i class="pi pi-play"></i> Nova Etapa (Ao Vivo)
          </button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="content-grid">

        <section class="ranking-section">
          <div class="section-header">
            <h2>🏆 Ranking Geral</h2>
            <div class="flex gap-2 flex-wrap">
              <button
                class="ios-btn ios-btn-success-outlined ios-btn-sm"
                @click="exportCSV"
              >
                <i class="pi pi-download"></i> Exportar CSV
              </button>
              <button
                class="ios-btn ios-btn-info-outlined ios-btn-sm"
                @click="copyPublicLink"
              >
                <i class="pi pi-link"></i> Copiar Link
              </button>
              <button
                class="ios-btn ios-btn-secondary-outlined ios-btn-sm"
                @click="openImportModal"
              >
                <i class="pi pi-upload"></i> Importar Histórico
              </button>
            </div>
          </div>

          <div class="apple-list-card">
            <div
              v-if="isLoading"
              class="p-4 text-center text-gray-500"
            >
              <i class="pi pi-spin pi-spinner mr-2"></i> A carregar ranking...
            </div>

            <div
              v-else-if="ranking.length === 0"
              class="p-4 text-center text-gray-500"
            >
              Nenhum resultado registado ainda.
            </div>

            <div
              class="table-responsive"
              v-else
            >
              <table class="ios-table">
                <thead>
                  <tr>
                    <th style="width: 60px; text-align: center;">Pos</th>
                    <th>Jogador</th>
                    <th style="width: 70px; text-align: center;">Pts</th>
                    <th
                      style="text-align: center;"
                      title="1º Lugares (Ouros)"
                    >1º</th>
                    <th
                      style="text-align: center;"
                      title="2º Lugares (Pratas)"
                    >2º</th>
                    <th
                      style="text-align: center;"
                      title="3º Lugares (Bronzes)"
                    >3º</th>
                    <th style="text-align: center;">Média Pos.</th>
                    <th style="text-align: center;">Etapas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in ranking"
                    :key="row.player_name"
                  >
                    <td style="text-align: center;">
                      <div
                        class="rank-position"
                        :class="`pos-${index + 1}`"
                      >{{ index + 1 }}º</div>
                    </td>
                    <td class="font-bold">{{ row.player_name }}</td>
                    <td
                      style="text-align: center;"
                      class="text-blue-500 font-bold"
                    >{{ row.league_points }}</td>
                    <td
                      style="text-align: center;"
                      class="text-yellow-500 font-bold"
                    >{{ row.total_golds }}</td>
                    <td
                      style="text-align: center;"
                      class="text-gray-400 font-bold"
                    >{{ row.total_silvers }}</td>
                    <td
                      style="text-align: center;"
                      class="text-amber-700 font-bold"
                    >{{ row.total_bronzes }}</td>
                    <td style="text-align: center;">
                      <span class="avg-badge">{{ row.avg_position || '-' }}</span>
                    </td>
                    <td style="text-align: center;">{{ row.tournaments_played }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="history-section">
          <div class="section-header">
            <h2>Últimos Torneios</h2>
          </div>

          <div class="tournaments-list">
            <div
              v-if="tournaments.length === 0 && !isLoading"
              class="p-4 text-center text-gray-500 apple-list-card"
            >
              Nenhum torneio realizado.
            </div>

            <div
              v-for="tourney in tournaments"
              :key="tourney.id"
              class="tournament-card"
              :class="{ 'expanded': expandedTournaments[tourney.id] }"
            >
              <div
                class="tourney-header-clickable"
                @click="toggleTournament(tourney.id)"
              >
                <div class="tourney-info">
                  <h4>{{ tourney.name }}</h4>
                  <div class="tourney-meta">
                    <span><i class="pi pi-calendar"></i> {{ formatDate(tourney.tournament_date) }}</span>
                    <span
                      class="status-badge"
                      :class="tourney.status"
                    >
                      {{ formatStatus(tourney.status) }}
                    </span>
                  </div>
                </div>
                <div class="expand-icon">
                  <i
                    class="pi"
                    :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
                  ></i>
                </div>
              </div>

              <div
                v-if="expandedTournaments[tourney.id]"
                class="tourney-details-body"
              >
                <div
                  v-if="tourney.results.length === 0"
                  class="text-center text-gray-400 py-3 text-sm"
                >
                  Nenhum jogador pontuou nesta etapa.
                </div>
                <div
                  v-else
                  class="results-inner-list"
                >
                  <div
                    v-for="res in tourney.results"
                    :key="res.player_name"
                    class="result-inner-row"
                  >
                    <div
                      class="inner-pos"
                      :class="`medal-${res.final_position}`"
                    >{{ res.final_position }}º</div>
                    <div class="inner-player">
                      <span class="inner-name">{{ res.player_name }}</span>
                      <span
                        v-if="res.deck_name"
                        class="inner-deck-name text-sm text-gray-500 mt-1"
                      >
                        <i class="pi pi-id-card mr-1"></i> {{ res.deck_name }}
                      </span>
                      <a
                        v-if="res.deck_url"
                        :href="res.deck_url"
                        target="_blank"
                        class="mt-1 text-blue-500 hover:text-blue-700 text-sm font-semibold inline-flex align-items-center"
                        style="text-decoration: none;"
                      >
                        <i class="pi pi-external-link mr-1 text-xs"></i> Ver Lista
                      </a>
                    </div>
                    <div class="inner-pts">{{ res.total_points }} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div
      v-if="showImportModal"
      class="ios-modal-overlay"
      style="align-items: flex-start; padding-top: 2rem;"
    >
      <div class="ios-modal ios-modal-xl">
        <div class="ios-modal-header text-center">Reconstruir Torneio Passado</div>
        <div
          class="ios-modal-content p-0"
          style="overflow: hidden;"
        >

          <div class="import-workspace">
            <div class="workspace-sidebar">
              <div class="apple-form-section">
                <div class="apple-section-label">1. DADOS DO EVENTO</div>
                <div class="apple-form-group">
                  <div class="apple-form-row">
                    <label>NOME DO TORNEIO</label>
                    <input
                      type="text"
                      v-model="importData.name"
                      placeholder="Ex: Etapa Inverno 2026"
                      class="ios-input"
                    />
                  </div>
                  <div class="apple-form-row">
                    <label>DATA DE REALIZAÇÃO</label>
                    <input
                      type="date"
                      v-model="importData.date"
                      class="ios-input"
                    />
                  </div>
                </div>
              </div>

              <div class="apple-form-section mt-5">
                <div class="apple-section-label">2. NOVO JOGADOR</div>
                <div class="apple-section-desc">Cadastre para ele aparecer nas mesas.</div>
                <div class="apple-form-group flex align-items-center pr-2">
                  <input
                    type="text"
                    v-model="quickPlayerName"
                    placeholder="Nome completo..."
                    @keydown.enter="handleQuickAddPlayer"
                    class="ios-input flex-1 ml-3 my-2"
                  />
                  <button
                    class="ios-icon-btn text-blue-500 flex-shrink-0"
                    @click="handleQuickAddPlayer"
                    :disabled="!quickPlayerName || isCreatingPlayer"
                    title="Adicionar Jogador"
                  >
                    <i :class="isCreatingPlayer ? 'pi pi-spin pi-spinner' : 'pi pi-plus-circle'"></i>
                  </button>
                </div>
              </div>

              <div class="ios-tip mt-5">
                <i class="pi pi-lightbulb"></i>
                <p>Reconstrua as mesas exatas. Jogadores já sentados numa rodada não aparecerão nas outras mesas da
                  mesma rodada.</p>
              </div>
            </div>

            <div class="workspace-main">
              <div class="main-header">
                <div class="header-text">
                  <h3 class="panel-title m-0">3. Rodadas e Mesas</h3>
                  <p class="text-sm text-gray-500 m-0 mt-1">Deixe em branco os lugares ou mesas que não foram
                    utilizados.</p>
                </div>
                <button
                  class="ios-btn ios-btn-primary ios-btn-sm"
                  @click="addRound"
                >
                  <i class="pi pi-plus"></i> Nova Rodada
                </button>
              </div>

              <div class="placements-list-container">
                <div
                  class="import-alert mb-4"
                  v-if="importError"
                >
                  <i class="pi pi-exclamation-triangle mr-2"></i> {{ importError }}
                </div>

                <div
                  v-for="(round, rIndex) in importData.rounds"
                  :key="round.id"
                  class="apple-round-container"
                >
                  <div class="apple-section-label flex justify-content-between align-items-center mb-2">
                    <span>RODADA {{ rIndex + 1 }}</span>
                    <button
                      v-if="importData.rounds.length > 1"
                      class="ios-icon-btn text-red-500 p-1 w-2rem h-2rem"
                      @click="removeRound(rIndex)"
                      title="Excluir Rodada"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <div class="apple-tables-grid">
                    <div
                      v-for="(table, tIndex) in round.tables"
                      :key="table.id"
                      class="apple-table-card"
                    >
                      <div class="apple-table-header">
                        <span>MESA {{ tIndex + 1 }}</span>
                        <div class="flex gap-2">
                          <button
                            class="ios-icon-btn text-blue-500 w-2rem h-2rem p-0"
                            @click="addSeat(rIndex, tIndex)"
                            title="Adicionar Jogador"
                          >
                            <i class="pi pi-user-plus"></i>
                          </button>
                          <button
                            v-if="round.tables.length > 1"
                            class="ios-icon-btn text-red-400 w-2rem h-2rem p-0"
                            @click="removeTable(rIndex, tIndex)"
                            title="Remover Mesa"
                          >
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      </div>

                      <div class="apple-table-content">
                        <div
                          v-for="(seat, sIndex) in table.seats"
                          :key="sIndex"
                          class="apple-seat-row"
                        >
                          <div
                            class="seat-medal"
                            :class="`pos-${seat.pos}`"
                          >{{ seat.pos }}º</div>
                          <select
                            v-model="seat.player_id"
                            class="ios-native-select flex-1"
                          >
                            <option :value="null">Selecionar jogador...</option>
                            <option
                              v-for="player in getAvailablePlayers(rIndex, seat.player_id)"
                              :key="player.id"
                              :value="player.id"
                            >
                              {{ player.name }}
                            </option>
                          </select>
                          <button
                            v-if="table.seats.length > 2"
                            class="ios-delete-btn"
                            @click="removeSeat(rIndex, tIndex, sIndex)"
                            tabindex="-1"
                          >
                            <i class="pi pi-minus-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-content-start mt-3 mb-5">
                    <button
                      class="ios-btn ios-btn-text ios-btn-sm text-blue-500 font-bold"
                      @click="addTable(rIndex)"
                    >
                      <i class="pi pi-plus-circle"></i> Nova Mesa
                    </button>
                  </div>
                </div>

                <div
                  v-if="uniquePlayersInImport.length > 0"
                  class="apple-form-section border-top-1 surface-border pt-4 mt-2"
                >
                  <div class="apple-section-label">4. COMANDANTES (OPCIONAL)</div>
                  <div class="apple-section-desc">Insira o deck dos jogadores para o metagame.</div>

                  <div class="apple-form-group">
                    <div
                      v-for="player in uniquePlayersInImport"
                      :key="player.id"
                      class="apple-form-row ios-deck-row"
                    >
                      <div class="ios-deck-player">
                        <i class="pi pi-user text-gray-400"></i>
                        <span class="font-bold text-sm">{{ player.name }}</span>
                      </div>
                      <div class="ios-deck-inputs">
                        <input
                          type="text"
                          v-model="importDecks[player.id].name"
                          placeholder="Nome do Comandante"
                          class="ios-input"
                        />
                        <div class="ios-divider"></div>
                        <input
                          type="text"
                          v-model="importDecks[player.id].url"
                          placeholder="Link da Lista"
                          class="ios-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer justify-content-between">
          <button
            class="ios-btn ios-btn-text text-gray-500"
            @click="showImportModal = false"
            :disabled="isSaving"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="handleImport"
            :disabled="!isImportValid || isSaving"
          >
            <i :class="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i> Calcular Ranking e Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

// --- SISTEMA DE TOAST NATIVO ---
const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}
// --------------------------------

const ranking = ref([])
const tournaments = ref([])
const allPlayers = ref([])
const isLoading = ref(true)

const showImportModal = ref(false)
const isSaving = ref(false)
const importError = ref('')

const quickPlayerName = ref('')
const isCreatingPlayer = ref(false)
const expandedTournaments = ref({})

const importData = ref({
  name: '',
  date: new Date().toISOString().split('T')[0],
  rounds: []
})

const importDecks = ref({})

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  isLoading.value = true
  try {
    const [rankData, tourneysData, playersData] = await Promise.all([
      api.getLeagueRanking(),
      api.getLeagueTournaments(),
      api.getPlayers()
    ])
    ranking.value = rankData
    tournaments.value = tourneysData
    allPlayers.value = playersData
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados da liga', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

function getInitialTables() {
  return Array.from({ length: 4 }, (_, i) => ({
    id: Date.now() + i + 1,
    seats: [
      { pos: 1, player_id: null },
      { pos: 2, player_id: null },
      { pos: 3, player_id: null },
      { pos: 4, player_id: null }
    ]
  }))
}

function initImportData() {
  importData.value = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    rounds: [{
      id: Date.now(),
      tables: getInitialTables()
    }]
  }
  importDecks.value = {}
  quickPlayerName.value = ''
  importError.value = ''
}

function openImportModal() {
  initImportData()
  showImportModal.value = true
}

function addRound() {
  importData.value.rounds.push({
    id: Date.now(),
    tables: getInitialTables()
  })
}

function removeRound(rIndex) {
  importData.value.rounds.splice(rIndex, 1)
}

function addTable(rIndex) {
  importData.value.rounds[rIndex].tables.push({
    id: Date.now(),
    seats: [
      { pos: 1, player_id: null },
      { pos: 2, player_id: null },
      { pos: 3, player_id: null },
      { pos: 4, player_id: null }
    ]
  })
}

function removeTable(rIndex, tIndex) {
  importData.value.rounds[rIndex].tables.splice(tIndex, 1)
}

function addSeat(rIndex, tIndex) {
  const table = importData.value.rounds[rIndex].tables[tIndex]
  table.seats.push({ pos: table.seats.length + 1, player_id: null })
}

function removeSeat(rIndex, tIndex, sIndex) {
  const table = importData.value.rounds[rIndex].tables[tIndex]
  table.seats.splice(sIndex, 1)
  table.seats.forEach((seat, idx) => { seat.pos = idx + 1 })
}

function getAvailablePlayers(rIndex, currentSeatPlayerId) {
  const selectedInRound = new Set()
  const round = importData.value.rounds[rIndex]

  if (round) {
    round.tables.forEach(t => {
      t.seats.forEach(s => {
        if (s.player_id) selectedInRound.add(s.player_id)
      })
    })
  }

  return allPlayers.value.filter(p => {
    if (p.id === currentSeatPlayerId) return true
    return !selectedInRound.has(p.id)
  })
}

const uniquePlayersInImport = computed(() => {
  const uniqueIds = new Set()
  const playersList = []

  importData.value.rounds.forEach(r => {
    r.tables.forEach(t => {
      t.seats.forEach(s => {
        if (s.player_id && !uniqueIds.has(s.player_id)) {
          uniqueIds.add(s.player_id)
          const playerObj = allPlayers.value.find(p => p.id === s.player_id)
          if (playerObj) {
            playersList.push(playerObj)
            if (!importDecks.value[s.player_id]) {
              importDecks.value[s.player_id] = { name: '', url: '' }
            }
          }
        }
      })
    })
  })
  return playersList
})

const isImportValid = computed(() => {
  importError.value = ''

  if (!importData.value.name.trim()) return false
  if (!importData.value.date) return false
  if (importData.value.rounds.length === 0) return false

  let hasAtLeastOnePlayer = false

  for (const [rIndex, round] of importData.value.rounds.entries()) {
    const playersInRound = new Set()

    for (const [tIndex, table] of round.tables.entries()) {
      let playersInThisTable = 0

      for (const seat of table.seats) {
        if (seat.player_id) {
          hasAtLeastOnePlayer = true
          playersInThisTable++

          if (playersInRound.has(seat.player_id)) {
            const p = allPlayers.value.find(x => x.id === seat.player_id)
            importError.value = `O jogador ${p?.name || ''} está escalado mais de uma vez na Rodada ${rIndex + 1}.`
            return false
          }
          playersInRound.add(seat.player_id)
        }
      }

      if (playersInThisTable === 1) {
        importError.value = `A Mesa ${tIndex + 1} da Rodada ${rIndex + 1} tem apenas 1 jogador preenchido. Mesas ativas exigem no mínimo 2 jogadores.`
        return false
      }
    }
  }

  return hasAtLeastOnePlayer
})

async function handleImport() {
  isSaving.value = true
  try {
    const playerStats = {}

    importData.value.rounds.forEach(round => {
      round.tables.forEach(table => {
        table.seats.forEach(seat => {
          if (!seat.player_id) return

          const pid = seat.player_id
          if (!playerStats[pid]) {
            playerStats[pid] = { points: 0, golds: 0, silvers: 0, bronzes: 0, positionsSum: 0, matchCount: 0 }
          }

          playerStats[pid].matchCount++
          playerStats[pid].positionsSum += seat.pos

          if (seat.pos === 1) { playerStats[pid].points += 4; playerStats[pid].golds++ }
          if (seat.pos === 2) { playerStats[pid].points += 3; playerStats[pid].silvers++ }
          if (seat.pos === 3) { playerStats[pid].points += 2; playerStats[pid].bronzes++ }
          if (seat.pos === 4) { playerStats[pid].points += 1 }
        })
      })
    })

    const sortedPlayers = Object.keys(playerStats).map(pid => {
      const s = playerStats[pid]
      return {
        player_id: pid,
        ...s,
        avg_position: s.positionsSum / s.matchCount
      }
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.golds !== a.golds) return b.golds - a.golds
      if (b.silvers !== a.silvers) return b.silvers - a.silvers
      if (b.bronzes !== a.bronzes) return b.bronzes - a.bronzes
      if (a.avg_position !== b.avg_position) return a.avg_position - b.avg_position
      return 0
    })

    const resultsPayload = sortedPlayers.map((p, index) => ({
      player_id: p.player_id,
      final_position: index + 1,
      total_points: p.points,
      golds: p.golds,
      silvers: p.silvers,
      bronzes: p.bronzes,
      deck_name: importDecks.value[p.player_id]?.name || null,
      deck_url: importDecks.value[p.player_id]?.url || null
    }))

    const tourney = await api.createTournament(importData.value.name, importData.value.date, 'imported')
    await api.saveResults(tourney.id, resultsPayload)

    showToast({ severity: 'success', summary: 'Histórico Reconstruído', detail: 'O ranking foi processado com sucesso!', life: 4000 })
    showImportModal.value = false
    await loadDashboardData()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao salvar o torneio.', life: 4000 })
  } finally {
    isSaving.value = false
  }
}

async function handleQuickAddPlayer() {
  if (!quickPlayerName.value.trim()) return
  isCreatingPlayer.value = true
  try {
    const newPlayer = await api.createPlayer(quickPlayerName.value.trim())
    allPlayers.value.push(newPlayer)
    showToast({ severity: 'success', summary: 'Cadastrado', detail: `${newPlayer.name} pronto para jogar.`, life: 3000 })
    quickPlayerName.value = ''
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado ou falha na rede.', life: 4000 })
  } finally {
    isCreatingPlayer.value = false
  }
}

function toggleTournament(id) { expandedTournaments.value[id] = !expandedTournaments.value[id] }
function goBack() { router.push({ name: 'dashboard' }) }
function goToTournament() { router.push({ name: 'tournament' }) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '' }
function formatStatus(status) {
  const m = { 'active': 'Ao Vivo', 'finished': 'Finalizado', 'imported': 'Importado', 'pending': 'Pendente' }
  return m[status] || status
}

function copyPublicLink() {
  const url = `${window.location.origin}/l/${api.getLeagueId()}`
  navigator.clipboard.writeText(url).then(() => {
    showToast({ severity: 'info', summary: 'Link Copiado!', detail: 'Envie para a galera.', life: 3000 })
  })
}

function exportCSV() {
  if (!ranking.value || ranking.value.length === 0) return
  let csvContent = "data:text/csv;charset=utf-8,Posição,Jogador,Pontos,1º Lugar,2º Lugar,3º Lugar,Média de Posição,Etapas Jogadas\n"
  ranking.value.forEach((row, i) => {
    csvContent += `${i + 1},"${row.player_name}",${row.league_points},${row.total_golds},${row.total_silvers},${row.total_bronzes},${row.avg_position || '-'},${row.tournaments_played}\n`
  })
  const link = document.createElement("a")
  link.href = encodeURI(csvContent)
  link.download = `ranking_liga_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');

.league-details-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 50px;
}

.dashboard-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.title-area h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* TABELA NATIVA (Apple HIG) */
.apple-list-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.ios-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.ios-table th {
  background: rgba(0, 0, 0, 0.02);
  padding: 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-color);
}

.ios-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.ios-table tbody tr:last-child td {
  border-bottom: none;
}

.ios-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.01);
}

.rank-position {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.pos-1 {
  color: #f59e0b;
  font-size: 1.25rem;
}

.avg-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: inline-block;
}

.tournaments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tournament-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
  overflow: hidden;
}

.tournament-card:hover {
  border-color: var(--accent-primary);
}

.tournament-card.expanded {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.tourney-header-clickable {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  background: var(--bg-secondary);
}

.tourney-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.tourney-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-badge.finished {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.imported {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.tourney-details-body {
  background: var(--bg-primary);
  border-top: 1px dashed var(--border-color);
  padding: 1rem;
}

.result-inner-row {
  display: flex;
  align-items: flex-start;
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.inner-pos {
  width: 32px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.medal-1 {
  color: #b45309;
}

.medal-2 {
  color: #475569;
}

.medal-3 {
  color: #92400e;
}

.inner-player {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.inner-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.inner-pts {
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 0.95rem;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.1rem;
}

/* COMPONENTES NATIVOS APPLE HIG */
.ios-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
}

.ios-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ios-btn-primary {
  background: var(--accent-primary);
  color: white;
}

.ios-btn-primary:hover:not(:disabled) {
  filter: brightness(0.9);
}

.ios-btn-text {
  background: transparent;
  color: var(--text-secondary);
}

.ios-btn-text:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.ios-btn-info-outlined {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.ios-btn-info-outlined:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
}

.ios-btn-success-outlined {
  background: transparent;
  border: 1px solid #10b981;
  color: #10b981;
}

.ios-btn-success-outlined:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
}

.ios-btn-secondary-outlined {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.ios-btn-secondary-outlined:hover:not(:disabled) {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.ios-btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.ios-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.ios-icon-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

/* TOAST NATIVO */
.ios-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--accent-primary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid var(--border-color);
  border-left-width: 4px;
}

.ios-toast-container.success {
  border-left-color: #10b981;
}

.ios-toast-container.error {
  border-left-color: #ef4444;
}

.ios-toast-container.info {
  border-left-color: #3b82f6;
}

.ios-toast-summary {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.ios-toast-detail {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* MODAIS NATIVOS E FORMS HIG */
.ios-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.ios-modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: scaleUp 0.2s ease;
}

.ios-modal-xl {
  max-width: 1200px;
  height: 90vh;
}

.ios-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.ios-modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.ios-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  background: var(--bg-primary);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.import-workspace {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: var(--bg-primary);
}

.workspace-sidebar {
  width: 350px;
  flex-shrink: 0;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem;
  overflow-y: auto;
}

.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.main-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
}

.placements-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.placements-list-container::-webkit-scrollbar,
.workspace-sidebar::-webkit-scrollbar {
  width: 8px;
}

.placements-list-container::-webkit-scrollbar-thumb,
.workspace-sidebar::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

.apple-form-section {
  display: flex;
  flex-direction: column;
}

.apple-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.apple-section-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  padding-left: 1rem;
  line-height: 1.3;
}

.apple-form-group {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.apple-form-row {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.apple-form-row:last-child {
  border-bottom: none;
}

.apple-form-row label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.ios-input {
  background: transparent;
  border: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  width: 100%;
}

.ios-native-select {
  appearance: none;
  background-color: transparent;
  border: none;
  font-size: 0.95rem;
  font-family: inherit;
  padding: 0.5rem;
  width: 100%;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
}

.ios-native-select option {
  color: #000;
  background: #fff;
}

.ios-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

.ios-tip i {
  color: var(--accent-primary);
  font-size: 1.25rem;
  margin-top: 0.1rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 0;
  letter-spacing: -0.5px;
}

.apple-round-container {
  margin-bottom: 2rem;
}

.apple-tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.apple-table-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.apple-table-header {
  background: rgba(0, 0, 0, 0.02);
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.apple-seat-row {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  gap: 0.5rem;
}

.apple-seat-row:last-child {
  border-bottom: none;
}

.seat-medal {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 1.1rem;
  width: 30px;
}

.seat-medal.pos-1 {
  color: #f59e0b;
}

.seat-medal.pos-2 {
  color: #94a3b8;
}

.seat-medal.pos-3 {
  color: #b45309;
}

.seat-medal.pos-other {
  color: var(--text-tertiary);
}

.ios-delete-btn {
  color: #ef4444 !important;
  background: transparent !important;
  border: none !important;
  font-size: 1.2rem;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.ios-delete-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  border-radius: 50%;
}

.ios-deck-row {
  padding: 1rem;
}

.ios-deck-player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ios-deck-inputs {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.ios-deck-inputs .ios-input {
  padding: 0.75rem 1rem !important;
}

.ios-divider {
  height: 1px;
  background: var(--border-color);
  width: 100%;
}

.import-alert {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.ios-shadow {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (max-width: 1024px) {
  .import-workspace {
    flex-direction: column;
    height: auto;
    max-height: 85vh;
  }

  .workspace-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 350px;
  }

  .workspace-main {
    overflow: visible;
  }

  .placements-list-container {
    max-height: 50vh;
  }

  .apple-tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-main {
    padding: 1.5rem 1rem;
  }

  .ios-modal-footer {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .ios-modal-footer .ios-btn {
    width: 100%;
    margin: 0 !important;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
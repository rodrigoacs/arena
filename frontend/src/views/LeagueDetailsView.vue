<template>
  <div class="league-details-page">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary p-button-rounded mr-2"
            @click="goBack"
          />
          <i class="pi pi-trophy"></i>
          <h1>Painel da Liga</h1>
        </div>
        <div class="header-actions">
          <Button
            label="Nova Etapa (Ao Vivo)"
            icon="pi pi-play"
            class="p-button-primary action-btn"
            @click="goToTournament"
          />
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="content-grid">
        <section class="ranking-section">
          <div class="section-header">
            <h2>🏆 Ranking Geral</h2>
            <div class="flex gap-2">
              <Button
                label="Exportar CSV"
                icon="pi pi-download"
                class="p-button-outlined p-button-success p-button-sm"
                @click="exportCSV"
              />
              <Button
                label="Copiar Link"
                icon="pi pi-link"
                class="p-button-outlined p-button-info p-button-sm"
                @click="copyPublicLink"
              />
              <Button
                label="Importar Histórico"
                icon="pi pi-upload"
                class="p-button-outlined p-button-secondary p-button-sm"
                @click="openImportModal"
              />
            </div>
          </div>

          <div class="card p-0">
            <DataTable
              :value="ranking"
              :loading="isLoading"
              stripedRows
              responsiveLayout="scroll"
            >
              <template #empty>
                <div class="p-4 text-center text-gray-500">Nenhum resultado registado ainda.</div>
              </template>

              <Column
                header="Pos"
                style="width: 70px"
              >
                <template #body="slotProps">
                  <div
                    class="rank-position"
                    :class="`pos-${slotProps.index + 1}`"
                  >
                    {{ slotProps.index + 1 }}º
                  </div>
                </template>
              </Column>
              <Column
                field="player_name"
                header="Jogador"
                class="font-bold"
              ></Column>
              <Column
                field="league_points"
                header="Pts"
                style="width: 70px"
                class="text-blue-500 font-bold"
              ></Column>
              <Column header="1º">
                <template #body="slotProps">
                  <span class="text-yellow-500 font-bold">{{ slotProps.data.total_golds }}</span>
                </template>
              </Column>
              <Column header="2º">
                <template #body="slotProps">
                  <span class="text-gray-400 font-bold">{{ slotProps.data.total_silvers }}</span>
                </template>
              </Column>
              <Column header="3º">
                <template #body="slotProps">
                  <span class="text-amber-700 font-bold">{{ slotProps.data.total_bronzes }}</span>
                </template>
              </Column>
              <Column
                field="avg_position"
                header="Média Pos."
                style="width: 100px"
              >
                <template #body="slotProps">
                  <span class="avg-badge">{{ slotProps.data.avg_position || '-' }}</span>
                </template>
              </Column>
              <Column
                field="tournaments_played"
                header="Etapas"
                style="width: 80px"
              ></Column>
            </DataTable>
          </div>
        </section>

        <section class="history-section">
          <div class="section-header">
            <h2>Últimos Torneios</h2>
          </div>

          <div class="tournaments-list">
            <div
              v-if="tournaments.length === 0 && !isLoading"
              class="p-4 text-center text-gray-500 card"
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
                        <i class="pi pi-id-card mr-1"></i>{{ res.deck_name }}
                      </span>
                      <a
                        v-if="res.deck_url"
                        :href="res.deck_url"
                        target="_blank"
                        class="mt-1 inline-block p-button p-component p-button-text p-button-sm p-0 text-blue-500 hover:text-blue-700"
                        style="text-decoration: none;"
                      >
                        <span class="pi pi-external-link mr-1 text-xs"></span>
                        <span class="p-button-label">Ver Lista</span>
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

    <Dialog
      v-model:visible="showImportModal"
      header="Reconstruir Torneio Passado"
      :style="{ width: '95vw', maxWidth: '1200px' }"
      modal
      :closable="!isSaving"
      class="workspace-dialog"
    >
      <div class="import-workspace">
        <div class="workspace-sidebar">
          <div class="apple-form-section">
            <div class="apple-section-label">1. DADOS DO EVENTO</div>
            <div class="apple-form-group">
              <div class="apple-form-row">
                <label>NOME DO TORNEIO</label>
                <InputText
                  v-model="importData.name"
                  placeholder="Ex: Etapa Inverno 2026"
                  class="ios-input"
                />
              </div>
              <div class="apple-form-row">
                <label>DATA DE REALIZAÇÃO</label>
                <InputText
                  type="date"
                  v-model="importData.date"
                  class="ios-input"
                />
              </div>
            </div>
          </div>

          <div class="apple-form-section mt-5">
            <div class="apple-section-label">2. NOVO JOGADOR</div>
            <div class="apple-section-desc">Cadastre rapidamente para que ele apareça nas mesas ao lado.</div>
            <div class="apple-form-group flex align-items-center pr-2">
              <InputText
                v-model="quickPlayerName"
                placeholder="Nome completo..."
                @keydown.enter="handleQuickAddPlayer"
                class="ios-input flex-1 ml-3 my-2"
              />
              <Button
                icon="pi pi-plus-circle"
                class="p-button-rounded p-button-text p-button-primary m-0 w-2rem h-2rem flex-shrink-0"
                @click="handleQuickAddPlayer"
                :loading="isCreatingPlayer"
                :disabled="!quickPlayerName"
                v-tooltip.top="'Adicionar Jogador'"
              />
            </div>
          </div>

          <div class="ios-tip mt-5">
            <i class="pi pi-lightbulb"></i>
            <p>Reconstrua as mesas exatas. Jogadores já sentados numa rodada não aparecerão nas outras mesas da mesma
              rodada.</p>
          </div>
        </div>

        <div class="workspace-main">
          <div class="main-header">
            <div class="header-text">
              <h3 class="panel-title m-0">3. Rodadas e Mesas</h3>
              <p class="text-sm text-gray-500 m-0 mt-1">Deixe em branco os lugares ou mesas que não foram utilizados.
              </p>
            </div>
            <Button
              label="Nova Rodada"
              icon="pi pi-plus"
              class="p-button-primary p-button-sm ios-shadow"
              @click="addRound"
            />
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
              <div class="apple-section-label flex justify-content-between align-items-center">
                <span>RODADA {{ rIndex + 1 }}</span>
                <Button
                  v-if="importData.rounds.length > 1"
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-text p-button-sm p-0 w-2rem h-2rem"
                  @click="removeRound(rIndex)"
                  v-tooltip.left="'Excluir Rodada'"
                />
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
                      <Button
                        label="Jogador"
                        icon="pi pi-user-plus"
                        class="p-button-text p-button-sm p-0 text-blue-500 font-normal"
                        @click="addSeat(rIndex, tIndex)"
                      />
                      <Button
                        v-if="round.tables.length > 1"
                        icon="pi pi-times"
                        class="p-button-rounded p-button-danger p-button-text p-0 w-1rem h-1rem ml-2"
                        @click="removeTable(rIndex, tIndex)"
                        v-tooltip.top="'Remover Mesa'"
                      />
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
                      <Dropdown
                        v-model="seat.player_id"
                        :options="getAvailablePlayers(rIndex, seat.player_id)"
                        optionLabel="name"
                        optionValue="id"
                        filter
                        showClear
                        placeholder="Selecionar jogador..."
                        class="ios-dropdown flex-1"
                      />
                      <Button
                        v-if="table.seats.length > 2"
                        icon="pi pi-minus-circle"
                        class="ios-delete-btn"
                        @click="removeSeat(rIndex, tIndex, sIndex)"
                        tabindex="-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-content-start mt-3 mb-5">
                <Button
                  label="Nova Mesa"
                  icon="pi pi-plus-circle"
                  class="p-button-text p-button-sm text-blue-500 font-bold"
                  @click="addTable(rIndex)"
                />
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
                    <InputText
                      v-model="importDecks[player.id].name"
                      placeholder="Nome do Comandante"
                      class="ios-input"
                    />
                    <div class="ios-divider"></div>
                    <InputText
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

      <template #footer>
        <div class="workspace-footer">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showImportModal = false"
            class="p-button-text p-button-secondary"
            :disabled="isSaving"
          />
          <Button
            label="Calcular Ranking e Salvar"
            icon="pi pi-check"
            @click="handleImport"
            :loading="isSaving"
            :disabled="!isImportValid"
            class="p-button-primary p-button-lg ml-3 ios-shadow"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { api } from '../services/api'

const router = useRouter()
const toast = useToast()

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
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados da liga', life: 3000 })
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

    toast.add({ severity: 'success', summary: 'Histórico Reconstruído', detail: 'O ranking foi processado com sucesso!', life: 4000 })
    showImportModal.value = false
    await loadDashboardData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao salvar o torneio.', life: 4000 })
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
    toast.add({ severity: 'success', summary: 'Cadastrado', detail: `${newPlayer.name} pronto para jogar.`, life: 3000 })
    quickPlayerName.value = ''
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado ou falha na rede.', life: 4000 })
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
    toast.add({ severity: 'info', summary: 'Link Copiado!', detail: 'Envie para a galera.', life: 3000 })
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
  gap: 1rem;
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

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.rank-position {
  font-family: 'JetBrains Mono', monospace !important;
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

:deep(.workspace-dialog .p-dialog-content) {
  padding: 0;
  overflow: hidden;
}

.import-workspace {
  display: flex;
  flex-direction: row;
  height: 85vh;
  min-height: 600px;
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
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  font-size: 1rem !important;
  color: var(--text-primary) !important;
  box-shadow: none !important;
}

.ios-input:focus {
  outline: none !important;
  box-shadow: none !important;
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

.ios-tip p {
  margin: 0;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 0;
  letter-spacing: -0.5px;
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
  background: var(--bg-secondary);
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

:deep(.ios-dropdown .p-dropdown-label) {
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
}

:deep(.ios-dropdown.p-dropdown) {
  border: none;
  background: transparent;
  box-shadow: none;
  width: 100%;
}

:deep(.ios-dropdown.p-dropdown:not(.p-disabled):hover) {
  background: transparent;
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

.workspace-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding-top: 1rem;
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

  .workspace-footer {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .workspace-footer .p-button {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
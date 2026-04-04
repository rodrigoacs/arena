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

    <header class="ios-page-header px-4 pt-4 pb-2 flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-2">
        <button
          class="ios-btn ios-btn-text p-0 m-0 text-gray-500"
          @click="goBack"
          title="Voltar"
        >
          <i class="pi pi-chevron-left text-2xl"></i>
        </button>
        <h1 class="ios-large-title m-0">Painel da Liga</h1>
      </div>
      <button
        class="ios-btn ios-btn-primary"
        @click="goToTournament"
      >
        <i class="pi pi-play"></i> Nova Etapa
      </button>
    </header>

    <main
      class="max-w-content px-4 py-3"
      style="max-width: 1000px; margin: 0 auto;"
    >

      <div class="ios-grouped-section mb-5">
        <div class="flex justify-content-between align-items-end mb-2 px-2">
          <div class="ios-grouped-label m-0">🏆 RANKING GERAL</div>
          <div class="flex gap-3">
            <button
              class="ios-btn ios-btn-text text-xs p-0 text-blue-500 font-bold"
              @click="exportCSV"
            ><i class="pi pi-download"></i> CSV</button>
            <button
              class="ios-btn ios-btn-text text-xs p-0 text-blue-500 font-bold"
              @click="copyPublicLink"
            ><i class="pi pi-link"></i> Link</button>
            <button
              class="ios-btn ios-btn-text text-xs p-0 text-blue-500 font-bold"
              @click="openImportModal"
            ><i class="pi pi-history"></i> Importar Histórico</button>
          </div>
        </div>

        <div
          class="ios-grouped-list"
          style="overflow-x: auto;"
        >
          <div
            v-if="isLoading"
            class="p-4 text-center text-gray-500"
          >A carregar ranking...</div>
          <div
            v-else-if="ranking.length === 0"
            class="p-4 text-center text-gray-500"
          >Nenhum resultado registado.</div>
          <table
            v-else
            class="w-full text-left border-collapse"
            style="min-width: 600px;"
          >
            <thead>
              <tr
                style="background: rgba(0,0,0,0.02);"
                class="border-bottom-1 surface-border text-xs text-gray-500 uppercase"
              >
                <th class="p-3 text-center font-bold">Pos</th>
                <th class="p-3 font-bold">Jogador</th>
                <th class="p-3 text-center font-bold">Pts</th>
                <th
                  class="p-3 text-center font-bold"
                  title="1º Lugares"
                >1º</th>
                <th
                  class="p-3 text-center font-bold"
                  title="2º Lugares"
                >2º</th>
                <th
                  class="p-3 text-center font-bold"
                  title="3º Lugares"
                >3º</th>
                <th class="p-3 text-center font-bold">Média</th>
                <th class="p-3 text-center font-bold">Etapas</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in ranking"
                :key="row.player_name"
                class="border-bottom-1 surface-border last:border-none transition-colors hover:surface-hover"
              >
                <td
                  class="p-3 text-center font-bold"
                  :class="'text-pos-' + (index + 1)"
                >{{ index + 1 }}º</td>
                <td
                  class="p-3 font-bold"
                  style="white-space: nowrap;"
                >{{ row.player_name }}</td>
                <td class="p-3 text-center text-blue-500 font-bold text-lg">{{ row.league_points }}</td>
                <td class="p-3 text-center text-yellow-500 font-bold">{{ row.total_golds }}</td>
                <td class="p-3 text-center text-gray-500 font-bold">{{ row.total_silvers }}</td>
                <td class="p-3 text-center text-orange-600 font-bold">{{ row.total_bronzes }}</td>
                <td class="p-3 text-center"><span
                    class="bg-gray-100 text-gray-600 px-2 py-1 border-round text-xs font-bold"
                  >{{ row.avg_position || '-' }}</span></td>
                <td class="p-3 text-center text-gray-500">{{ row.tournaments_played }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label pl-2">ÚLTIMOS TORNEIOS</div>
        <div
          v-if="tournaments.length === 0 && !isLoading"
          class="ios-grouped-list p-4 text-center text-gray-500"
        >Nenhum torneio realizado.</div>
        <div
          v-else
          class="flex flex-column gap-3"
        >
          <div
            v-for="tourney in tournaments"
            :key="tourney.id"
            class="ios-grouped-list"
          >
            <div
              class="ios-list-item cursor-pointer"
              @click="toggleTournament(tourney.id)"
            >
              <div class="flex flex-column">
                <span class="font-bold text-lg">{{ tourney.name }}</span>
                <span class="text-xs text-gray-500 mt-1"><i class="pi pi-calendar mr-1"></i> {{
                  formatDate(tourney.tournament_date) }} &bull; {{ formatStatus(tourney.status) }}</span>
              </div>
              <i
                class="pi text-gray-400"
                :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
              ></i>
            </div>

            <div
              v-if="expandedTournaments[tourney.id]"
              class="p-3"
              style="background: rgba(0,0,0,0.02); border-top: 1px solid var(--border-color);"
            >
              <div
                v-if="tourney.results.length === 0"
                class="text-center text-gray-400 text-sm"
              >Nenhum jogador pontuou nesta etapa.</div>
              <div
                v-else
                class="flex flex-column gap-2"
              >
                <div
                  v-for="res in tourney.results"
                  :key="res.player_name"
                  class="flex align-items-center bg-white p-2 border-round border-1 surface-border"
                >
                  <div
                    class="font-bold w-2rem text-center text-lg"
                    :class="'text-pos-' + res.final_position"
                  >{{ res.final_position }}º</div>
                  <div class="flex-1 px-2 flex flex-column">
                    <span class="font-bold text-sm">{{ res.player_name }}</span>
                    <a
                      v-if="res.deck_url"
                      :href="res.deck_url"
                      target="_blank"
                      class="text-xs text-blue-500 no-underline mt-1 font-medium"
                    ><i class="pi pi-external-link"></i> {{ res.deck_name || 'Ver Lista' }}</a>
                    <span
                      v-else-if="res.deck_name"
                      class="text-xs text-gray-500 mt-1"
                    ><i class="pi pi-id-card"></i> {{ res.deck_name }}</span>
                  </div>
                  <div class="font-bold text-blue-500 text-sm bg-blue-50 px-2 py-1 border-round">{{ res.total_points }}
                    pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="showImportModal"
      class="ios-modal-overlay"
      @click.self="showImportModal = false"
    >
      <div
        class="ios-modal ios-modal-lg flex flex-column h-full"
        style="max-width: 900px; max-height: 90vh;"
      >
        <div class="ios-modal-header flex justify-content-between align-items-center p-3">
          <button
            class="ios-btn ios-btn-text text-gray-500 p-0 m-0"
            @click="showImportModal = false"
          >Cancelar</button>
          <span class="font-bold">Máquina do Tempo</span>
          <button
            class="ios-btn ios-btn-text font-bold p-0 m-0 text-blue-500"
            @click="handleImport"
            :disabled="!isImportValid || isSaving"
          >
            <i
              v-if="isSaving"
              class="pi pi-spin pi-spinner"
            ></i><span v-else>Salvar</span>
          </button>
        </div>

        <div
          class="ios-modal-content p-0 flex flex-column md:flex-row flex-1 overflow-hidden"
          style="background: var(--bg-primary);"
        >
          <div class="w-full md:w-20rem bg-white border-right-1 surface-border overflow-y-auto p-3">
            <div class="ios-grouped-section mb-4">
              <div class="ios-grouped-label">DADOS DO EVENTO</div>
              <div class="ios-grouped-list">
                <div class="ios-list-item flex-column align-items-start py-2">
                  <span class="text-xs font-bold text-gray-400 mb-1">NOME DO TORNEIO</span>
                  <input
                    type="text"
                    v-model="importData.name"
                    placeholder="Ex: Etapa Inverno 2026"
                    class="ios-input text-sm"
                  />
                </div>
                <div class="ios-list-item flex-column align-items-start py-2">
                  <span class="text-xs font-bold text-gray-400 mb-1">DATA</span>
                  <input
                    type="date"
                    v-model="importData.date"
                    class="ios-input text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="ios-grouped-section">
              <div class="ios-grouped-label">CADASTRAR NOVO JOGADOR</div>
              <div class="ios-grouped-list">
                <div class="ios-list-item p-1 pl-3">
                  <input
                    type="text"
                    v-model="quickPlayerName"
                    placeholder="Nome..."
                    @keydown.enter="handleQuickAddPlayer"
                    class="ios-input flex-1 text-sm"
                  />
                  <button
                    class="ios-btn ios-btn-text p-2"
                    @click="handleQuickAddPlayer"
                    :disabled="!quickPlayerName || isCreatingPlayer"
                  ><i class="pi pi-plus-circle text-xl text-blue-500"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-3">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="m-0 text-lg font-bold">Rodadas e Mesas</h3>
              <button
                class="ios-btn ios-btn-text text-sm font-bold p-0"
                @click="addRound"
              ><i class="pi pi-plus"></i> Rodada</button>
            </div>

            <div
              v-if="importError"
              class="bg-orange-100 border-1 border-orange-300 text-orange-700 p-2 border-round mb-3 font-medium text-xs flex align-items-center gap-2"
            >
              <i class="pi pi-exclamation-triangle"></i> {{ importError }}
            </div>

            <div
              v-for="(round, rIndex) in importData.rounds"
              :key="round.id"
              class="mb-4"
            >
              <div class="flex justify-content-between align-items-center mb-2 px-1">
                <span class="font-bold text-gray-500 text-xs uppercase">RODADA {{ rIndex + 1 }}</span>
                <button
                  v-if="importData.rounds.length > 1"
                  class="ios-btn ios-btn-text text-red-500 p-0 text-xs font-bold"
                  @click="removeRound(rIndex)"
                >Excluir Rodada</button>
              </div>

              <div class="grid formgrid gap-3">
                <div
                  v-for="(table, tIndex) in round.tables"
                  :key="table.id"
                  class="col-12 p-0"
                >
                  <div class="ios-grouped-list h-full flex flex-column">
                    <div class="ios-list-item bg-gray-50 py-2">
                      <span class="font-bold text-xs text-gray-500">MESA {{ tIndex + 1 }}</span>
                      <div class="flex gap-2">
                        <i
                          class="pi pi-user-plus text-blue-500 cursor-pointer"
                          @click="addSeat(rIndex, tIndex)"
                        ></i>
                        <i
                          v-if="round.tables.length > 1"
                          class="pi pi-times text-red-500 cursor-pointer ml-3"
                          @click="removeTable(rIndex, tIndex)"
                        ></i>
                      </div>
                    </div>
                    <div
                      v-for="(seat, sIndex) in table.seats"
                      :key="sIndex"
                      class="ios-list-item px-2 py-1"
                    >
                      <span
                        class="font-bold w-2rem text-center text-sm"
                        :class="'text-pos-' + seat.pos"
                      >{{ seat.pos }}º</span>
                      <select
                        v-model="seat.player_id"
                        class="ios-input flex-1 py-2 text-sm bg-transparent border-none outline-none"
                      >
                        <option :value="null">Selecionar jogador...</option>
                        <option
                          v-for="player in getAvailablePlayers(rIndex, seat.player_id)"
                          :key="player.id"
                          :value="player.id"
                        >{{ player.name }}</option>
                      </select>
                      <button
                        v-if="table.seats.length > 2"
                        class="ios-btn ios-btn-text text-red-500 p-1"
                        @click="removeSeat(rIndex, tIndex, sIndex)"
                      ><i class="pi pi-minus-circle"></i></button>
                    </div>
                  </div>
                </div>
                <div class="col-12 mt-1">
                  <button
                    class="ios-btn ios-btn-text text-blue-500 p-0 text-sm font-bold"
                    @click="addTable(rIndex)"
                  ><i class="pi pi-plus-circle"></i> Nova Mesa nesta rodada</button>
                </div>
              </div>
            </div>

            <div
              v-if="uniquePlayersInImport.length > 0"
              class="ios-grouped-section mt-4 border-top-1 surface-border pt-4"
            >
              <div class="ios-grouped-label px-0">COMANDANTES (OPCIONAL)</div>
              <div class="flex flex-column gap-3">
                <div
                  v-for="player in uniquePlayersInImport"
                  :key="player.id"
                  class="ios-grouped-list"
                >
                  <div class="ios-list-item bg-gray-50 py-2 font-bold text-sm"><i
                      class="pi pi-user mr-2 text-gray-400"></i>{{ player.name }}</div>
                  <div class="ios-list-item py-1"><input
                      type="text"
                      v-model="importDecks[player.id].name"
                      placeholder="Nome do Comandante"
                      class="ios-input text-sm"
                    /></div>
                  <div class="ios-list-item py-1"><input
                      type="text"
                      v-model="importDecks[player.id].url"
                      placeholder="Link da Lista (Opcional)"
                      class="ios-input text-sm"
                    /></div>
                </div>
              </div>
            </div>
          </div>
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

const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}

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

const importData = ref({ name: '', date: new Date().toISOString().split('T')[0], rounds: [] })
const importDecks = ref({})

onMounted(loadDashboardData)

async function loadDashboardData() {
  isLoading.value = true
  try {
    const [rankData, tourneysData, playersData] = await Promise.all([
      api.getLeagueRanking(), api.getLeagueTournaments(), api.getPlayers()
    ])
    ranking.value = rankData; tournaments.value = tourneysData; allPlayers.value = playersData
  } catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar' }) }
  finally { isLoading.value = false }
}

function getInitialTables() { return Array.from({ length: 4 }, (_, i) => ({ id: Date.now() + i + 1, seats: [{ pos: 1, player_id: null }, { pos: 2, player_id: null }, { pos: 3, player_id: null }, { pos: 4, player_id: null }] })) }
function initImportData() { importData.value = { name: '', date: new Date().toISOString().split('T')[0], rounds: [{ id: Date.now(), tables: getInitialTables() }] }; importDecks.value = {}; quickPlayerName.value = ''; importError.value = '' }
function openImportModal() { initImportData(); showImportModal.value = true }
function addRound() { importData.value.rounds.push({ id: Date.now(), tables: getInitialTables() }) }
function removeRound(rIndex) { importData.value.rounds.splice(rIndex, 1) }
function addTable(rIndex) { importData.value.rounds[rIndex].tables.push({ id: Date.now(), seats: [{ pos: 1, player_id: null }, { pos: 2, player_id: null }, { pos: 3, player_id: null }, { pos: 4, player_id: null }] }) }
function removeTable(rIndex, tIndex) { importData.value.rounds[rIndex].tables.splice(tIndex, 1) }
function addSeat(rIndex, tIndex) { const t = importData.value.rounds[rIndex].tables[tIndex]; t.seats.push({ pos: t.seats.length + 1, player_id: null }) }
function removeSeat(rIndex, tIndex, sIndex) { const t = importData.value.rounds[rIndex].tables[tIndex]; t.seats.splice(sIndex, 1); t.seats.forEach((seat, idx) => { seat.pos = idx + 1 }) }

function getAvailablePlayers(rIndex, currentSeatPlayerId) {
  const selectedInRound = new Set()
  const round = importData.value.rounds[rIndex]
  if (round) round.tables.forEach(t => t.seats.forEach(s => { if (s.player_id) selectedInRound.add(s.player_id) }))
  return allPlayers.value.filter(p => p.id === currentSeatPlayerId || !selectedInRound.has(p.id))
}

const uniquePlayersInImport = computed(() => {
  const uniqueIds = new Set(); const playersList = []
  importData.value.rounds.forEach(r => r.tables.forEach(t => t.seats.forEach(s => {
    if (s.player_id && !uniqueIds.has(s.player_id)) {
      uniqueIds.add(s.player_id); const p = allPlayers.value.find(x => x.id === s.player_id)
      if (p) { playersList.push(p); if (!importDecks.value[s.player_id]) importDecks.value[s.player_id] = { name: '', url: '' } }
    }
  })))
  return playersList
})

const isImportValid = computed(() => {
  importError.value = ''
  if (!importData.value.name.trim() || !importData.value.date || importData.value.rounds.length === 0) return false
  let hasAtLeastOnePlayer = false
  for (const [rIndex, round] of importData.value.rounds.entries()) {
    const playersInRound = new Set()
    for (const [tIndex, table] of round.tables.entries()) {
      let playersInThisTable = 0
      for (const seat of table.seats) {
        if (seat.player_id) {
          hasAtLeastOnePlayer = true; playersInThisTable++
          if (playersInRound.has(seat.player_id)) { importError.value = `Jogador duplicado na Rodada ${rIndex + 1}.`; return false }
          playersInRound.add(seat.player_id)
        }
      }
      if (playersInThisTable === 1) { importError.value = `Mesa ${tIndex + 1} da Rodada ${rIndex + 1} incompleta.`; return false }
    }
  }
  return hasAtLeastOnePlayer
})

async function handleImport() {
  isSaving.value = true
  try {
    const playerStats = {}
    importData.value.rounds.forEach(round => round.tables.forEach(table => table.seats.forEach(seat => {
      if (!seat.player_id) return
      const pid = seat.player_id
      if (!playerStats[pid]) playerStats[pid] = { points: 0, golds: 0, silvers: 0, bronzes: 0, positionsSum: 0, matchCount: 0 }
      playerStats[pid].matchCount++; playerStats[pid].positionsSum += seat.pos
      if (seat.pos === 1) { playerStats[pid].points += 4; playerStats[pid].golds++ }
      if (seat.pos === 2) { playerStats[pid].points += 3; playerStats[pid].silvers++ }
      if (seat.pos === 3) { playerStats[pid].points += 2; playerStats[pid].bronzes++ }
      if (seat.pos === 4) { playerStats[pid].points += 1 }
    })))

    const sortedPlayers = Object.keys(playerStats).map(pid => {
      const s = playerStats[pid]; return { player_id: pid, ...s, avg_position: s.positionsSum / s.matchCount }
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.golds !== a.golds) return b.golds - a.golds
      if (b.silvers !== a.silvers) return b.silvers - a.silvers
      if (b.bronzes !== a.bronzes) return b.bronzes - a.bronzes
      return a.avg_position - b.avg_position
    })

    const resultsPayload = sortedPlayers.map((p, index) => ({
      player_id: p.player_id, final_position: index + 1, total_points: p.points, golds: p.golds, silvers: p.silvers, bronzes: p.bronzes,
      deck_name: importDecks.value[p.player_id]?.name || null, deck_url: importDecks.value[p.player_id]?.url || null
    }))

    const tourney = await api.createTournament(importData.value.name, importData.value.date, 'imported')
    await api.saveResults(tourney.id, resultsPayload)
    showToast({ severity: 'success', summary: 'Sucesso', detail: 'Ranking gerado!' })
    showImportModal.value = false; await loadDashboardData()
  } catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar' }) }
  finally { isSaving.value = false }
}

async function handleQuickAddPlayer() {
  if (!quickPlayerName.value.trim()) return
  isCreatingPlayer.value = true
  try {
    const newPlayer = await api.createPlayer(quickPlayerName.value.trim())
    allPlayers.value.push(newPlayer)
    showToast({ severity: 'success', summary: 'Cadastrado', detail: `${newPlayer.name} pronto.` })
    quickPlayerName.value = ''
  } catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado?' }) }
  finally { isCreatingPlayer.value = false }
}

function toggleTournament(id) { expandedTournaments.value[id] = !expandedTournaments.value[id] }
function goBack() { router.push({ name: 'dashboard' }) }
function goToTournament() { router.push({ name: 'tournament' }) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '' }
function formatStatus(status) { const m = { 'active': 'Ao Vivo', 'finished': 'Finalizado', 'imported': 'Importado', 'pending': 'Pendente' }; return m[status] || status }

function copyPublicLink() {
  navigator.clipboard.writeText(`${window.location.origin}/l/${api.getLeagueId()}`).then(() => showToast({ severity: 'success', summary: 'Link Copiado!', detail: 'Envie aos jogadores.' }))
}

function exportCSV() {
  if (!ranking.value || ranking.value.length === 0) return
  let csvContent = "data:text/csv;charset=utf-8,Posição,Jogador,Pontos,1º Lugar,2º Lugar,3º Lugar,Média de Posição,Etapas Jogadas\n"
  ranking.value.forEach((row, i) => { csvContent += `${i + 1},"${row.player_name}",${row.league_points},${row.total_golds},${row.total_silvers},${row.total_bronzes},${row.avg_position || '-'},${row.tournaments_played}\n` })
  const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = `ranking_${new Date().toISOString().split('T')[0]}.csv`; link.click()
}
</script>

<style scoped>
.text-pos-1 {
  color: #f59e0b;
}

.text-pos-2 {
  color: #94a3b8;
}

.text-pos-3 {
  color: #b45309;
}

.text-pos-4 {
  color: #6b7280;
}

.last\:border-none:last-child {
  border-bottom: none !important;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-white {
  background-color: #ffffff;
}

.cursor-pointer {
  cursor: pointer;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.align-items-end {
  align-items: flex-end;
}

.align-items-start {
  align-items: flex-start;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}

.p-0 {
  padding: 0;
}

.p-1 {
  padding: 0.25rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 1rem;
}

.p-4 {
  padding: 1.5rem;
}

.m-0 {
  margin: 0;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-5 {
  margin-bottom: 2rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mt-5 {
  margin-top: 2.5rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-4 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-xl {
  font-size: 1.25rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.text-blue-500 {
  color: var(--system-blue);
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-yellow-500 {
  color: #f59e0b;
}

.text-orange-600 {
  color: #ea580c;
}

.text-red-500 {
  color: var(--system-red);
}

.border-round {
  border-radius: 6px;
}

.border-bottom-1 {
  border-bottom: 1px solid var(--border-color);
}

.border-top-1 {
  border-top: 1px solid var(--border-color);
}

.border-1 {
  border: 1px solid var(--border-color);
}

.border-right-1 {
  border-right: 1px solid var(--border-color);
}

.surface-border {
  border-color: var(--border-color) !important;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1;
}

.h-full {
  height: 100%;
}

.max-h-screen {
  max-height: 100vh;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.no-underline {
  text-decoration: none;
}

.uppercase {
  text-transform: uppercase;
}

@media (min-width: 768px) {
  .md\:flex-row {
    flex-direction: row;
  }

  .md\:w-20rem {
    width: 20rem;
  }

  .col-6 {
    width: 50%;
  }
}

@media (max-width: 767px) {
  .md\:w-20rem {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 250px;
  }

  .col-12 {
    width: 100%;
  }
}
</style>
<template>
  <div class="min-h-screen pb-12">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header
      class="px-4 pt-6 pb-4 flex justify-between items-center w-full sticky top-0 z-50 bg-system-bg/80 dark:bg-system-bgDark/80 backdrop-blur-md border-b border-system-border dark:border-system-borderDark/50"
    >
      <div class="flex items-center justify-between gap-2 max-w-[1000px] mx-auto w-full">
        <div class="flex items-center gap-2">
          <button
            class="ios-icon-btn text-system-gray w-9 h-9"
            @click="goBack"
            title="Voltar"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          <h1 class="text-3xl font-bold tracking-tight m-0">Painel da Liga</h1>
        </div>
        <button
          class="ios-btn ios-btn-primary py-2 px-3 text-sm"
          @click="goToTournament"
        >
          <i class="pi pi-play"></i> Novo Torneio
        </button>
      </div>
    </header>

    <main class="max-w-[1000px] mx-auto px-4 py-6">
      <div class="ios-grouped-section mb-10">
        <div class="flex justify-between items-end mb-2 px-2">
          <div class="ios-grouped-label !m-0">🏆 RANKING GERAL</div>
          <div class="flex gap-4">
            <button
              class="text-xs font-bold text-system-blue hover:opacity-70 transition-opacity"
              @click="exportCSV"
            ><i class="pi pi-download"></i> CSV</button>
            <button
              class="text-xs font-bold text-system-blue hover:opacity-70 transition-opacity"
              @click="copyPublicLink"
            ><i class="pi pi-link"></i> Link</button>
            <button
              class="text-xs font-bold text-system-blue hover:opacity-70 transition-opacity"
              @click="openImportModal"
            ><i class="pi pi-history"></i> Importar</button>
          </div>
        </div>

        <div class="ios-grouped-list overflow-x-auto">
          <div
            v-if="isLoading"
            class="p-6"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="flex gap-4 mb-4 animate-pulse"
            >
              <div class="h-6 bg-system-gray/20 rounded w-8"></div>
              <div class="h-6 bg-system-gray/20 rounded flex-1"></div>
              <div class="h-6 bg-system-gray/20 rounded w-12"></div>
            </div>
          </div>

          <div
            v-else-if="ranking.length === 0"
            class="p-6 text-center text-system-gray"
          >Nenhum resultado registrado.</div>

          <table
            v-else
            class="w-full text-left border-collapse min-w-[600px]"
          >
            <thead>
              <tr
                class="bg-black/5 dark:bg-white/5 border-b border-system-border dark:border-system-borderDark text-xs text-system-gray uppercase tracking-wide"
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
                <th class="p-3 text-center font-bold">Torneios</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in ranking"
                :key="row.player_name"
                class="border-b border-system-border dark:border-system-borderDark last:border-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <td
                  class="p-3 text-center font-bold"
                  :class="index === 0 ? 'text-foil text-2xl drop-shadow-md' : index === 1 ? 'text-system-gray text-lg' : index === 2 ? 'text-[#b45309] text-lg' : 'text-system-gray'"
                >{{ index + 1 }}º</td>
                <td
                  class="p-3 font-bold text-lg max-w-[180px] sm:max-w-[250px] truncate"
                  :title="row.player_name"
                  :class="index === 0 ? 'text-foil' : ''"
                >{{ row.player_name }}</td>
                <td class="p-3 text-center text-system-blue font-bold text-lg">{{ row.league_points }}</td>
                <td class="p-3 text-center text-mythic font-bold text-lg">{{ row.total_golds }}</td>
                <td class="p-3 text-center text-rare font-bold text-lg">{{ row.total_silvers }}</td>
                <td class="p-3 text-center text-uncommon font-bold text-lg">{{ row.total_bronzes }}</td>
                <td class="p-3 text-center"><span
                    class="bg-system-bg dark:bg-black/20 text-system-gray px-2 py-1 rounded text-xs font-bold"
                  >{{ row.avg_position || '-' }}</span></td>
                <td class="p-3 text-center text-system-gray">{{ row.tournaments_played }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label pl-2">ÚLTIMOS TORNEIOS</div>

        <div
          v-if="isLoading"
          class="ios-grouped-list p-6"
        >
          <div class="h-6 bg-system-gray/20 rounded w-1/2 mb-4 animate-pulse"></div>
          <div class="h-6 bg-system-gray/20 rounded w-1/3 animate-pulse"></div>
        </div>

        <div
          v-else-if="tournaments.length === 0"
          class="ios-grouped-list p-6 text-center text-system-gray"
        >Nenhum torneio realizado.</div>

        <div
          v-else
          class="flex flex-col gap-4"
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
              <div class="flex flex-col">
                <span class="font-bold text-lg">{{ tourney.name }}</span>
                <span class="text-xs text-system-gray mt-1"><i class="pi pi-calendar mr-1"></i> {{
                  formatDate(tourney.tournament_date) }} &bull; {{ formatStatus(tourney.status) }}</span>
              </div>
              <i
                class="pi text-system-gray"
                :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
              ></i>
            </div>

            <div
              v-if="expandedTournaments[tourney.id]"
              class="p-4 bg-black/5 dark:bg-white/5 border-t border-system-border dark:border-system-borderDark"
            >
              <div
                v-if="tourney.results.length === 0"
                class="text-center text-system-gray text-sm"
              >Nenhum jogador pontuou nesta torneio.</div>
              <div
                v-else
                class="flex flex-col gap-2"
              >
                <div
                  v-for="res in tourney.results"
                  :key="res.player_name"
                  class="flex items-center bg-system-card dark:bg-system-cardDark p-3 rounded-lg border border-system-border dark:border-system-borderDark"
                >
                  <div
                    class="font-bold w-8 text-center text-lg"
                    :class="res.final_position === 1 ? 'text-system-orange' : res.final_position === 2 ? 'text-system-gray' : res.final_position === 3 ? 'text-[#b45309]' : 'text-system-gray'"
                  >{{ res.final_position }}º</div>
                  <div class="avatar-circle shadow-sm">{{ res.player_name.charAt(0) }}</div>
                  <div class="flex-1 px-3 flex flex-col min-w-0">
                    <span
                      class="font-bold text-sm truncate"
                      :title="res.player_name"
                    >{{ res.player_name }}</span>
                    <a
                      v-if="res.deck_url"
                      :href="res.deck_url"
                      target="_blank"
                      class="text-xs text-system-blue no-underline mt-1 font-medium truncate"
                    ><i class="pi pi-external-link"></i> {{ res.deck_name || 'Ver Lista' }}</a>
                    <span
                      v-else-if="res.deck_name"
                      class="text-xs text-system-gray mt-1 truncate"
                    ><i class="pi pi-id-card"></i> {{ res.deck_name }}</span>
                  </div>
                  <div class="font-bold text-system-blue text-sm bg-system-blue/10 px-2 py-1 rounded">{{
                    res.total_points }} pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="showImportModal"
      class="ios-modal-overlay items-start pt-8"
      @click.self="showImportModal = false"
    >
      <div class="ios-modal ios-modal-xl h-[85vh] flex flex-col !max-w-[1000px]">
        <div class="ios-modal-header flex justify-between items-center p-4">
          <button
            class="ios-btn ios-btn-text text-system-gray p-0"
            @click="showImportModal = false"
          >Cancelar</button>
          <span class="font-bold">Máquina do Tempo</span>
          <button
            class="ios-btn ios-btn-text font-bold p-0 text-system-blue"
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
          class="ios-modal-content p-0 flex flex-col md:flex-row flex-1 overflow-hidden bg-system-bg dark:bg-system-bgDark"
        >
          <div
            class="w-full md:w-[300px] bg-system-card dark:bg-system-cardDark border-b md:border-b-0 md:border-r border-system-border dark:border-system-borderDark overflow-y-auto p-4 shrink-0"
          >
            <div class="ios-grouped-section mb-6">
              <div class="ios-grouped-label">DADOS DO EVENTO</div>
              <div class="ios-grouped-list">
                <div class="ios-list-item flex-col items-start py-2">
                  <span class="text-xs font-bold text-system-gray mb-1">NOME DO TORNEIO</span>
                  <input
                    type="text"
                    v-model="importData.name"
                    placeholder="Ex: Torneio Inverno"
                    class="ios-input text-sm"
                  />
                </div>
                <div class="ios-list-item flex-col items-start py-2">
                  <span class="text-xs font-bold text-system-gray mb-1">DATA</span>
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
                    class="ios-input flex-1 text-sm min-w-0"
                  />
                  <button
                    class="ios-btn ios-btn-text p-2 shrink-0"
                    @click="handleQuickAddPlayer"
                    :disabled="!quickPlayerName || isCreatingPlayer"
                  ><i class="pi pi-plus-circle text-xl text-system-blue"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 lg:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="m-0 text-lg font-bold">Rodadas e Mesas</h3>
              <button
                class="ios-btn ios-btn-text text-sm font-bold p-0"
                @click="addRound"
              ><i class="pi pi-plus"></i> Rodada</button>
            </div>

            <div
              v-if="importError"
              class="bg-system-orange/10 border border-system-orange/30 text-system-orange p-3 rounded-lg mb-4 font-medium text-xs flex items-center gap-2"
            >
              <i class="pi pi-exclamation-triangle"></i> {{ importError }}
            </div>

            <div
              v-for="(round, rIndex) in importData.rounds"
              :key="round.id"
              class="mb-6"
            >
              <div class="flex justify-between items-center mb-2 px-1">
                <span class="font-bold text-system-gray text-xs uppercase tracking-wide">RODADA {{ rIndex + 1 }}</span>
                <button
                  v-if="importData.rounds.length > 1"
                  class="ios-btn ios-btn-text text-system-red p-0 text-xs font-bold"
                  @click="removeRound(rIndex)"
                >Excluir Rodada</button>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div
                  v-for="(table, tIndex) in round.tables"
                  :key="table.id"
                  class="col-span-1"
                >
                  <div class="ios-grouped-list h-full flex flex-col">
                    <div class="ios-list-item bg-black/5 dark:bg-white/5 py-2">
                      <span class="font-bold text-xs text-system-gray">MESA {{ tIndex + 1 }}</span>
                      <div class="flex gap-4">
                        <i
                          class="pi pi-user-plus text-system-blue cursor-pointer text-lg"
                          @click="addSeat(rIndex, tIndex)"
                        ></i>
                        <i
                          v-if="round.tables.length > 1"
                          class="pi pi-times text-system-red cursor-pointer text-lg"
                          @click="removeTable(rIndex, tIndex)"
                        ></i>
                      </div>
                    </div>
                    <div
                      v-for="(seat, sIndex) in table.seats"
                      :key="sIndex"
                      class="ios-list-item px-3 py-1"
                    >
                      <span
                        class="font-bold w-8 text-center text-sm"
                        :class="seat.pos === 1 ? 'text-system-orange' : seat.pos === 2 ? 'text-system-gray' : seat.pos === 3 ? 'text-[#b45309]' : 'text-system-gray'"
                      >{{ seat.pos }}º</span>
                      <select
                        v-model="seat.player_id"
                        class="ios-native-select flex-1 py-2 text-sm min-w-0"
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
                        class="ios-btn ios-btn-text text-system-red p-2 shrink-0"
                        @click="removeSeat(rIndex, tIndex, sIndex)"
                      ><i class="pi pi-minus-circle"></i></button>
                    </div>
                  </div>
                </div>
                <div class="col-span-1 xl:col-span-2 mt-1">
                  <button
                    class="ios-btn ios-btn-text text-system-blue p-0 text-sm font-bold"
                    @click="addTable(rIndex)"
                  ><i class="pi pi-plus-circle"></i> Nova Mesa nesta rodada</button>
                </div>
              </div>
            </div>

            <div
              v-if="uniquePlayersInImport.length > 0"
              class="ios-grouped-section mt-8 border-t border-system-border dark:border-system-borderDark pt-6"
            >
              <div class="ios-grouped-label px-0">COMANDANTES (OPCIONAL)</div>
              <div class="flex flex-col gap-4">
                <div
                  v-for="player in uniquePlayersInImport"
                  :key="player.id"
                  class="ios-grouped-list"
                >
                  <div class="ios-list-item bg-black/5 dark:bg-white/5 py-2 font-bold text-sm"><i
                      class="pi pi-user mr-2 text-system-gray"
                    ></i>{{ player.name }}</div>
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
    const [rankData, tourneysData, playersData] = await Promise.all([api.getLeagueRanking(), api.getLeagueTournaments(), api.getPlayers()])
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
  let csvContent = "data:text/csv;charset=utf-8,Posição,Jogador,Pontos,1º Lugar,2º Lugar,3º Lugar,Média de Posição,Torneios Jogados\n"
  ranking.value.forEach((row, i) => { csvContent += `${i + 1},"${row.player_name}",${row.league_points},${row.total_golds},${row.total_silvers},${row.total_bronzes},${row.avg_position || '-'},${row.tournaments_played}\n` })
  const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = `ranking_${new Date().toISOString().split('T')[0]}.csv`; link.click()
}
</script>
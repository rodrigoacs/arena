<template>
  <div class="active-round-container">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <div class="round-header card">
      <div
        class="flex justify-content-between align-items-center mb-3 pb-3"
        style="border-bottom: 1px solid var(--border-color)"
      >
        <button
          class="ios-btn ios-btn-text"
          title="Abortar torneio atual e mudar formato"
          @click="showResetConfirmDialog = true"
        >
          <i class="pi pi-cog"></i> Voltar p/ Configuração
        </button>
        <button
          class="ios-btn ios-btn-text"
          title="Voltar ao painel sem cancelar o torneio"
          @click="pauseAndGoToLeague"
        >
          <i class="pi pi-home"></i> Pausar e Ir p/ Liga
        </button>
      </div>

      <div class="header-titles text-center mt-2 relative">
        <h2>Rodada {{ currentRound }} de {{ roundCount }}</h2>
        <p>A batalha está rolando. Cuidado com os combos infinitos!</p>

        <button
          v-if="canEditPairings"
          class="ios-btn ios-btn-outlined ios-btn-sm mt-3"
          @click="openEditPairings"
        >
          <i class="pi pi-sliders-h"></i> Ajustar Mesas Manualmente
        </button>
      </div>

      <div
        class="header-actions"
        v-if="allResultsRegistered"
      >
        <button
          v-if="currentRound < roundCount"
          class="ios-btn ios-btn-success ios-btn-lg w-full mt-3"
          @click="handleNextRound"
        >
          <i class="pi pi-arrow-right"></i> Gerar Próxima Rodada
        </button>
        <button
          v-else
          class="ios-btn ios-btn-danger ios-btn-lg w-full mt-3"
          @click="showFinishConfirmDialog = true"
        >
          <i class="pi pi-flag-fill"></i> Encerrar Torneio e Ver Pódio
        </button>
      </div>
    </div>

    <div class="tables-grid">
      <div
        v-for="(table, index) in currentTables"
        :key="index"
        class="table-card card"
      >
        <div class="table-header">
          <h3>Mesa {{ table.number }}</h3>
          <span
            class="status-badge"
            :class="table.status"
          >
            {{ table.status === 'completed' ? 'Finalizada' : 'Em Andamento' }}
          </span>
        </div>

        <ul class="players-list">
          <li
            v-for="player in table.players"
            :key="player.id"
            class="player-item"
          >
            <span class="player-name">{{ player.name }}</span>
            <span
              class="player-result"
              v-if="table.status === 'completed'"
            >
              {{ player.result }}º Lugar
            </span>
          </li>
        </ul>

        <div class="table-actions flex gap-2 w-full mt-3">
          <button
            v-if="table.status === 'pending'"
            class="ios-btn ios-btn-outlined w-full"
            @click="openResultDialog(index)"
          >
            <i class="pi pi-check-square"></i> Registrar Placar
          </button>
          <button
            v-else
            class="ios-btn ios-btn-text w-full"
            @click="openResultDialog(index, true)"
          >
            <i class="pi pi-pencil"></i> Editar Placar
          </button>
        </div>
      </div>
    </div>

    <div
      class="developer-controls"
      v-if="DEBUG"
    >
      <button
        class="ios-btn ios-btn-warning mt-3"
        @click="generateRandomResults"
      >
        <i class="pi pi-fast-forward"></i> Auto Win (Dev)
      </button>
    </div>

    <div
      v-if="showResultDialog"
      class="ios-modal-overlay"
      @click.self="showResultDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">
          Placar - Mesa {{ selectedTable !== null ? currentTables[selectedTable]?.number : '' }}
        </div>
        <div class="ios-modal-content">
          <div
            v-if="selectedTable !== null"
            class="result-list"
          >
            <div
              v-for="(player, playerIndex) in currentTables[selectedTable].players"
              :key="player.id"
              class="result-row"
            >
              <div class="player-info">
                <span class="font-bold">{{ player.name }}</span>
              </div>
              <div class="position-selector">
                <button
                  v-for="pos in currentTables[selectedTable].players.length"
                  :key="pos"
                  class="pos-btn"
                  :class="{ 'selected': playerResults[playerIndex] === pos }"
                  @click="selectPosition(playerIndex, pos)"
                >
                  {{ pos }}º
                </button>
              </div>
            </div>
          </div>
          <div
            v-if="resultsError"
            class="text-error text-center mt-4 font-bold"
          >
            <i class="pi pi-exclamation-triangle mr-1"></i> {{ resultsError }}
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showResultDialog = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="handleSaveResults"
            :disabled="!isValidResults"
          >
            <i class="pi pi-check"></i> Salvar Mesa
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEditPairingsDialog"
      class="ios-modal-overlay"
      @click.self="showEditPairingsDialog = false"
    >
      <div class="ios-modal ios-modal-lg">
        <div class="ios-modal-header">Ajustar Mesas da Rodada</div>
        <div
          class="ios-modal-content"
          style="background: var(--bg-primary);"
        >
          <div class="apple-form-section">
            <p class="text-gray-500 text-sm mb-3">Mova os jogadores de lugar livremente. Se selecionar alguém que já
              está em outra mesa, o sistema fará a troca automaticamente.</p>

            <div
              class="import-alert mb-4"
              v-if="manualPairingError"
            >
              <i class="pi pi-exclamation-triangle mr-2"></i> {{ manualPairingError }}
            </div>

            <div class="apple-tables-grid">
              <div
                v-for="(table, tIndex) in manualTables"
                :key="tIndex"
                class="apple-table-card"
              >
                <div class="apple-table-header">
                  <span>MESA {{ tIndex + 1 }}</span>
                  <div class="flex gap-2">
                    <button
                      class="ios-icon-btn text-blue-500"
                      title="Adicionar Cadeira"
                      @click="addManualSlot(tIndex)"
                    >
                      <i class="pi pi-user-plus"></i>
                    </button>
                    <button
                      v-if="manualTables.length > 1"
                      class="ios-icon-btn text-red-400"
                      title="Remover Mesa"
                      @click="removeManualTable(tIndex)"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </div>

                <div class="apple-table-content">
                  <div
                    v-for="(slotId, sIndex) in table.slots"
                    :key="sIndex"
                    class="apple-seat-row"
                  >
                    <i class="pi pi-user text-gray-400"></i>

                    <select
                      v-model="table.slots[sIndex]"
                      class="ios-native-select flex-1"
                      @change="handlePlayerMove(tIndex, sIndex, table.slots[sIndex])"
                    >
                      <option :value="null">Selecionar jogador...</option>
                      <option
                        v-for="player in players"
                        :key="player.id"
                        :value="player.id"
                      >
                        {{ player.name }} {{ getPlayerTable(player.id) ? `(Mesa ${getPlayerTable(player.id)})` : '' }}
                      </option>
                    </select>

                    <button
                      class="ios-delete-btn"
                      @click="removeManualSlot(tIndex, sIndex)"
                    >
                      <i class="pi pi-minus-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-content-center mt-4 mb-2">
              <button
                class="ios-btn ios-btn-outlined ios-btn-sm"
                @click="addManualTable"
              >
                <i class="pi pi-plus-circle"></i> Adicionar Nova Mesa
              </button>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showEditPairingsDialog = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="saveManualPairings"
            :disabled="!!manualPairingError"
          >
            <i class="pi pi-check"></i> Salvar Mesas
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showResetConfirmDialog"
      class="ios-modal-overlay"
      @click.self="showResetConfirmDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">Confirmar Retorno</div>
        <div class="ios-modal-content">
          <div class="flex align-items-center gap-4 py-3">
            <i
              class="pi pi-exclamation-triangle text-red-500"
              style="font-size: 2.5rem"
            ></i>
            <p class="m-0 text-lg">Para voltar à configuração, todo o progresso atual será apagado e o torneio será
              <strong>cancelado</strong>. Continuar?</p>
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showResetConfirmDialog = false"
          >Não, ficar no torneio</button>
          <button
            class="ios-btn ios-btn-danger"
            @click="confirmCancel"
          ><i class="pi pi-trash"></i> Sim, cancelar torneio</button>
        </div>
      </div>
    </div>

    <div
      v-if="showFinishConfirmDialog"
      class="ios-modal-overlay"
      @click.self="showFinishConfirmDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">Encerrar Torneio</div>
        <div class="ios-modal-content">
          <div class="flex align-items-center gap-4 py-3">
            <i
              class="pi pi-flag-fill text-blue-500"
              style="font-size: 2.5rem"
            ></i>
            <p class="m-0 text-lg">Confirma o encerramento? Os resultados serão gravados definitivamente na base de
              dados e no Ranking da Liga.</p>
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showFinishConfirmDialog = false"
          >Revisar Mesas</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="confirmFinish"
            :disabled="isFinishing"
          >
            <i
              v-if="isFinishing"
              class="pi pi-spin pi-spinner"
            ></i>
            <i
              v-else
              class="pi pi-check"
            ></i> Gravar e Encerrar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showFinalResultsDialog"
      class="ios-modal-overlay"
    >
      <div class="ios-modal">
        <div class="ios-modal-header text-center">Pódio do Torneio</div>
        <div class="ios-modal-content">
          <div class="final-podium py-2">
            <div
              v-for="(player, index) in sortedPlayers"
              :key="player.id"
              class="podium-row"
              :class="`rank-${index + 1}`"
            >
              <div class="rank-number">{{ index + 1 }}º</div>
              <div class="podium-name font-bold">{{ player.name }}</div>
              <div class="podium-points">{{ player.points }} pts</div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex-column">
          <button
            class="ios-btn ios-btn-primary ios-btn-lg w-full"
            @click="finishAndGoToLeague"
          >
            <i class="pi pi-trophy"></i> Voltar ao Painel da Liga
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTournament } from '../composables/useTournament'

const DEBUG = false
const router = useRouter()

// --- SISTEMA DE TOAST NATIVO (Substitui PrimeVue Toast) ---
const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}
// --------------------------------------------------------

const {
  tableCount, roundCount, players, currentRound, sortedPlayers, currentTables, allResultsRegistered,
  saveResults, nextRound, endTournament, cancelTournament, clearTournamentState, updateCurrentRoundPairings
} = useTournament()

const showResultDialog = ref(false)
const selectedTable = ref(null)
const playerResults = ref([])
const isEditingResult = ref(false)
const showResetConfirmDialog = ref(false)
const showFinishConfirmDialog = ref(false)
const showFinalResultsDialog = ref(false)
const isFinishing = ref(false)

const showEditPairingsDialog = ref(false)
const manualTables = ref([])

const canEditPairings = computed(() => {
  return currentTables.value.every(t => t.status === 'pending')
})

function openEditPairings() {
  manualTables.value = currentTables.value.map(t => ({
    slots: t.players.map(p => p.id)
  }))
  showEditPairingsDialog.value = true
}

function addManualTable() { manualTables.value.push({ slots: [null, null, null, null] }) }
function removeManualTable(tIndex) { manualTables.value.splice(tIndex, 1) }
function addManualSlot(tIndex) { manualTables.value[tIndex].slots.push(null) }
function removeManualSlot(tIndex, sIndex) { manualTables.value[tIndex].slots.splice(sIndex, 1) }

function getPlayerTable(playerId) {
  for (let i = 0; i < manualTables.value.length; i++) {
    if (manualTables.value[i].slots.includes(playerId)) {
      return i + 1
    }
  }
  return null
}

function handlePlayerMove(tIndex, sIndex, newPlayerId) {
  if (!newPlayerId) return

  manualTables.value.forEach((t, i) => {
    t.slots.forEach((id, j) => {
      if ((i !== tIndex || j !== sIndex) && id === newPlayerId) {
        manualTables.value[i].slots[j] = null
      }
    })
  })
}

const manualPairingError = computed(() => {
  let selectedCount = 0

  for (let i = 0; i < manualTables.value.length; i++) {
    const t = manualTables.value[i]
    let playersInThisTable = 0

    for (const id of t.slots) {
      if (id) {
        selectedCount++
        playersInThisTable++
      }
    }

    if (playersInThisTable === 1) {
      return `A Mesa ${i + 1} possui apenas 1 jogador. É necessário um mínimo de 2 jogadores.`
    }
  }

  if (selectedCount !== players.value.length) {
    return `Atenção: Você tem ${players.value.length} jogadores no torneio, mas apenas ${selectedCount} estão escalados nas mesas.`
  }

  return null
})

function saveManualPairings() {
  if (manualPairingError.value) return

  const newTables = manualTables.value.map((t, index) => {
    const tablePlayers = t.slots.filter(id => id).map(id => {
      const p = players.value.find(x => x.id === id)
      return { id: p.id, name: p.name, result: null }
    })

    return {
      number: 0,
      status: 'pending',
      players: tablePlayers
    }
  }).filter(t => t.players.length > 0)

  newTables.forEach((t, i) => t.number = i + 1)

  updateCurrentRoundPairings(newTables)
  showEditPairingsDialog.value = false
  showToast({ severity: 'success', summary: 'Mesas Atualizadas', detail: 'O emparceiramento da rodada foi modificado.', life: 3000 })
}


const resultsError = computed(() => {
  if (selectedTable.value === null) return 'Nenhuma mesa selecionada.'
  const table = currentTables.value[selectedTable.value]
  if (!table) return 'Erro ao carregar mesa.'
  const numPlayersOnTable = table.players.length
  const positions = playerResults.value.slice(0, numPlayersOnTable)
  if (positions.some(pos => pos === null || pos === undefined)) {
    return 'Todas as posições devem ser preenchidas.'
  }
  const expectedPositions = Array.from({ length: numPlayersOnTable }, (_, i) => i + 1)
  const sortedPositions = [...positions].sort((a, b) => a - b)
  if (JSON.stringify(sortedPositions) !== JSON.stringify(expectedPositions)) {
    return `As posições devem ser únicas (1 a ${numPlayersOnTable}).`
  }
  return null
})

const isValidResults = computed(() => resultsError.value === null)

function handleNextRound() {
  if (nextRound()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast({ severity: 'success', summary: 'Nova Rodada', detail: `A Rodada ${currentRound.value} começou. Que vença o melhor!`, life: 3000 })
  } else {
    if (currentRound.value >= roundCount.value) {
      showToast({ severity: 'info', summary: 'Limite Atingido', detail: 'O número máximo de rodadas já foi jogado.', life: 3000 })
    } else {
      showToast({ severity: 'warn', summary: 'Mesas Pendentes', detail: 'Registre o placar de TODAS as mesas antes de avançar.', life: 4000 })
    }
  }
}

function selectPosition(playerIndex, pos) {
  if (playerResults.value[playerIndex] === pos) {
    playerResults.value[playerIndex] = null
    return
  }
  const existingIndex = playerResults.value.indexOf(pos)
  if (existingIndex !== -1 && existingIndex !== playerIndex) {
    playerResults.value[existingIndex] = null
  }
  playerResults.value[playerIndex] = pos
}

function handleSaveResults() {
  if (!isValidResults.value) {
    showToast({ severity: 'error', summary: 'Erro de Placar', detail: resultsError.value, life: 3000 })
    return
  }
  const numPlayersOnTable = currentTables.value[selectedTable.value].players.length
  const finalResults = playerResults.value.slice(0, numPlayersOnTable)
  saveResults(selectedTable.value, finalResults, isEditingResult.value)
  showResultDialog.value = false
  showToast({
    severity: 'success',
    summary: 'Placar Salvo',
    detail: `Os resultados da Mesa ${selectedTable.value + 1} foram computados.`,
    life: 3000
  })
  isEditingResult.value = false
}

function openResultDialog(tableIndex, isEditing = false) {
  selectedTable.value = tableIndex
  isEditingResult.value = isEditing
  const table = currentTables.value[tableIndex]
  const numPlayersOnTable = table.players.length

  if (isEditing && table && table.players) {
    playerResults.value = table.players.map(p => p.result)
    while (playerResults.value.length < numPlayersOnTable) {
      playerResults.value.push(null)
    }
  } else {
    playerResults.value = new Array(numPlayersOnTable).fill(null)
  }
  showResultDialog.value = true
}

function generateRandomResults() {
  let pendingTablesCount = 0
  currentTables.value.forEach((table, tableIndex) => {
    if (table.status === 'completed') return
    pendingTablesCount++
    const numPlayersOnTable = table.players.length
    const positions = Array.from({ length: numPlayersOnTable }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
    saveResults(tableIndex, positions)
  })
  if (pendingTablesCount > 0) {
    showToast({ severity: 'success', summary: 'Auto-Win', detail: `Resultados simulados para ${pendingTablesCount} mesas.`, life: 3000 })
  }
}

async function confirmCancel() {
  await cancelTournament()
  showResetConfirmDialog.value = false
  showToast({ severity: 'info', summary: 'Cancelado', detail: 'O torneio foi abortado e removido do banco.', life: 3000 })
}

function pauseAndGoToLeague() {
  router.push({ name: 'league' })
}

async function confirmFinish() {
  if (isFinishing.value) return
  isFinishing.value = true

  showToast({ severity: 'info', summary: 'A Gravar...', detail: 'A calcular o ranking final no servidor...', life: 2000 })

  const success = await endTournament()

  if (success) {
    showFinishConfirmDialog.value = false
    showFinalResultsDialog.value = true
  } else {
    showToast({ severity: 'error', summary: 'Erro de Servidor', detail: 'Não foi possível gravar o resultado no banco.', life: 5000 })
  }

  isFinishing.value = false
}

function finishAndGoToLeague() {
  clearTournamentState()
  router.push({ name: 'league' })
}
</script>

<style scoped>
/* ESTILOS BASE DO COMPONENTE */
.active-round-container {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

.round-header {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.header-titles h2 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.header-titles p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.table-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--border-color);
}

.table-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.players-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
}

.player-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--bg-primary);
}

.player-name {
  font-weight: 500;
  color: var(--text-primary);
}

.player-result {
  font-weight: 700;
  color: var(--accent-primary);
}

.table-actions {
  margin-top: auto;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.result-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.position-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pos-btn {
  flex: 1;
  min-width: 45px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 8px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.pos-btn:hover {
  border-color: var(--accent-primary);
}

.pos-btn.selected {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.final-podium {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.podium-row {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.rank-number {
  width: 40px;
  font-weight: 800;
  color: var(--text-secondary);
}

.podium-name {
  flex: 1;
  font-size: 1.1rem;
}

.podium-points {
  font-weight: 700;
  color: var(--accent-primary);
}

.rank-1 {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
}

.rank-1 .rank-number {
  color: #b45309;
}

.rank-2 {
  background: rgba(148, 163, 184, 0.1);
  border-color: #94a3b8;
}

.rank-3 {
  background: rgba(180, 83, 9, 0.1);
  border-color: #b45309;
}

.text-error {
  color: #ef4444;
}

/* COMPONENTES HTML NATIVOS (Substitutos do PrimeVue) */
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

.ios-btn-danger {
  background: #ef4444;
  color: white;
}

.ios-btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.ios-btn-success {
  background: #10b981;
  color: white;
}

.ios-btn-success:hover:not(:disabled) {
  background: #059669;
}

.ios-btn-warning {
  background: #f59e0b;
  color: white;
}

.ios-btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.ios-btn-text {
  background: transparent;
  color: var(--text-secondary);
}

.ios-btn-text:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.ios-btn-outlined {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.ios-btn-outlined:hover:not(:disabled) {
  background: var(--bg-primary);
}

.ios-btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.ios-btn-lg {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
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
}

.ios-icon-btn:hover {
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
  border-right: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.ios-toast-container.success {
  border-left-color: #10b981;
}

.ios-toast-container.error {
  border-left-color: #ef4444;
}

.ios-toast-container.warn {
  border-left-color: #f59e0b;
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

/* MODAIS NATIVOS */
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
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: scaleUp 0.2s ease;
}

.ios-modal-lg {
  max-width: 900px;
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
  justify-content: flex-end;
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

/* SELECT NATIVO (Substituto do Dropdown) */
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

/* EMPARCEIRAMENTO MANUAL CSS (APPLE HIG) */
.apple-form-section {
  display: flex;
  flex-direction: column;
}

.apple-tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.apple-table-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
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

@media (max-width: 600px) {
  .round-header>div:first-child {
    flex-direction: column;
    gap: 1rem;
  }

  .round-header>div:first-child .ios-btn {
    width: 100%;
  }

  .ios-modal-footer {
    flex-direction: column;
  }

  .ios-modal-footer .ios-btn {
    width: 100%;
  }
}
</style>
<template>
  <div class="max-w-[600px] mx-auto pb-12">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header class="px-4 pt-8 pb-2">
      <div class="flex justify-between items-center mb-2">
        <button
          class="ios-btn ios-btn-text p-0 m-0 text-system-red"
          @click="showResetConfirmDialog = true"
        >
          <i class="pi pi-times"></i> Abortar
        </button>
        <button
          class="ios-btn ios-btn-text p-0 m-0"
          @click="pauseAndGoToLeague"
        >
          Pausar <i class="pi pi-chevron-right ml-1 text-xs"></i>
        </button>
      </div>
      <div class="text-center mt-4">
        <h1 class="text-3xl font-bold m-0">Rodada {{ currentRound }}</h1>
        <p class="text-system-gray text-sm mt-1 mb-3">De {{ roundCount }} rodadas programadas</p>
        <button
          v-if="canEditPairings"
          class="ios-btn ios-btn-text py-1 px-2"
          @click="openEditPairings"
        >
          <i class="pi pi-sliders-h"></i> Ajustar Mesas
        </button>
      </div>
    </header>

    <div class="px-4">
      <div class="flex flex-col gap-6">
        <div
          v-for="(table, index) in currentTables"
          :key="index"
          class="ios-grouped-section !mb-0"
        >
          <div class="ios-grouped-label flex justify-between">
            <span>MESA {{ table.number }}</span>
            <span :class="table.status === 'completed' ? 'text-system-green' : 'text-system-orange'">
              {{ table.status === 'completed' ? 'Finalizada' : 'Em Andamento' }}
            </span>
          </div>
          <div class="ios-grouped-list">
            <div
              v-for="player in table.players"
              :key="player.id"
              class="ios-list-item"
            >
              <span class="font-medium">{{ player.name }}</span>
              <span
                v-if="table.status === 'completed'"
                class="font-bold text-system-blue"
              >{{ player.result }}º</span>
            </div>
            <div class="ios-list-item p-0">
              <button
                v-if="table.status === 'pending'"
                class="ios-btn ios-btn-text w-full py-3"
                @click="openResultDialog(index)"
              >
                Registrar Placar
              </button>
              <button
                v-else
                class="ios-btn ios-btn-text w-full py-3 text-system-gray"
                @click="openResultDialog(index, true)"
              >
                Editar Placar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-8 mb-8"
        v-if="allResultsRegistered"
      >
        <button
          v-if="currentRound < roundCount"
          class="ios-btn ios-btn-success w-full py-3.5 text-lg rounded-xl"
          @click="handleNextRound"
        >
          Iniciar Próxima Rodada
        </button>
        <button
          v-else
          class="ios-btn ios-btn-primary w-full py-3.5 text-lg rounded-xl"
          @click="showFinishConfirmDialog = true"
        >
          Encerrar Torneio e Ver Pódio
        </button>
      </div>
    </div>

    <div
      v-if="showResultDialog"
      class="ios-modal-overlay"
      @click.self="showResultDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">Placar - Mesa {{ selectedTable !== null ? currentTables[selectedTable]?.number :
          '' }}</div>
        <div class="ios-modal-content p-0 bg-system-bg dark:bg-system-bgDark">
          <div
            v-if="selectedTable !== null"
            class="ios-grouped-section mt-6 mx-4"
          >
            <div class="ios-grouped-list">
              <div
                v-for="(player, playerIndex) in currentTables[selectedTable].players"
                :key="player.id"
                class="ios-list-item flex-col items-start py-4"
              >
                <span class="font-bold mb-3">{{ player.name }}</span>
                <div class="flex w-full gap-2 flex-wrap">
                  <button
                    v-for="pos in currentTables[selectedTable].players.length"
                    :key="pos"
                    class="flex-1 min-w-[45px] py-2.5 bg-system-bg dark:bg-system-bgDark border border-system-border dark:border-system-borderDark rounded-lg font-semibold text-system-gray transition-colors text-lg"
                    :class="playerResults[playerIndex] === pos ? '!bg-system-blue !text-white !border-system-blue' : ''"
                    @click="selectPosition(playerIndex, pos)"
                  >
                    {{ pos }}º
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="resultsError"
            class="text-system-red text-center text-sm font-bold mx-4 mb-4"
          >
            <i class="pi pi-exclamation-triangle"></i> {{ resultsError }}
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
          >Salvar</button>
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
        <div class="ios-modal-content p-0">
          <div
            class="p-4 bg-system-card dark:bg-system-cardDark text-sm text-system-gray text-center border-b border-system-border dark:border-system-borderDark"
          >
            Mova os jogadores de lugar. Se selecionar alguém que já está em outra mesa, o sistema fará a troca.
          </div>
          <div
            class="bg-system-orange/10 border border-system-orange/30 text-system-orange p-3 rounded-lg font-semibold mx-4 mt-4"
            v-if="manualPairingError"
          >
            <i class="pi pi-exclamation-triangle mr-2"></i> {{ manualPairingError }}
          </div>

          <div class="p-4">
            <div
              v-for="(table, tIndex) in manualTables"
              :key="tIndex"
              class="ios-grouped-section mb-6"
            >
              <div class="ios-grouped-label flex justify-between items-end">
                <span>MESA {{ tIndex + 1 }}</span>
                <div class="flex gap-4">
                  <i
                    class="pi pi-user-plus text-system-blue cursor-pointer text-lg"
                    @click="addManualSlot(tIndex)"
                  ></i>
                  <i
                    v-if="manualTables.length > 1"
                    class="pi pi-times text-system-red cursor-pointer text-lg"
                    @click="removeManualTable(tIndex)"
                  ></i>
                </div>
              </div>
              <div class="ios-grouped-list">
                <div
                  v-for="(slotId, sIndex) in table.slots"
                  :key="sIndex"
                  class="ios-list-item px-3 py-1"
                >
                  <select
                    v-model="table.slots[sIndex]"
                    class="ios-native-select flex-1 py-2"
                    @change="(e) => handlePlayerMove(tIndex, sIndex, e.target.value)"
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
                    class="ios-btn ios-btn-text text-system-red p-2"
                    @click="removeManualSlot(tIndex, sIndex)"
                  ><i class="pi pi-minus-circle text-lg"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center mb-6">
            <button
              class="ios-btn ios-btn-text"
              @click="addManualTable"
            ><i class="pi pi-plus-circle"></i> Nova Mesa</button>
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
          >Salvar Mesas</button>
        </div>
      </div>
    </div>

    <div
      v-if="showResetConfirmDialog"
      class="ios-modal-overlay"
      @click.self="showResetConfirmDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header text-system-red">Confirmar Retorno</div>
        <div class="ios-modal-content text-center">
          <p>Para voltar à configuração, todo o progresso será apagado e o torneio <strong
              class="text-system-red">cancelado</strong>.</p>
        </div>
        <div class="ios-modal-footer flex-col">
          <button
            class="ios-btn ios-btn-danger w-full"
            @click="confirmCancel"
          >Sim, cancelar torneio</button>
          <button
            class="ios-btn ios-btn-text w-full"
            @click="showResetConfirmDialog = false"
          >Não, voltar</button>
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
        <div class="ios-modal-content text-center">
          <p>Confirma o encerramento? Os resultados serão gravados no Ranking da Liga.</p>
        </div>
        <div class="ios-modal-footer flex-col">
          <button
            class="ios-btn ios-btn-primary w-full"
            @click="confirmFinish"
            :disabled="isFinishing"
          >Gravar e Encerrar</button>
          <button
            class="ios-btn ios-btn-text w-full"
            @click="showFinishConfirmDialog = false"
          >Revisar Mesas</button>
        </div>
      </div>
    </div>

    <div
      v-if="showFinalResultsDialog"
      class="ios-modal-overlay"
    >
      <div class="ios-modal">
        <div class="ios-modal-header text-2xl py-6">Pódio do Torneio 🏆</div>
        <div class="ios-modal-content p-0 bg-system-bg dark:bg-system-bgDark">
          <div class="ios-grouped-section mt-6 mx-4">
            <div class="ios-grouped-list">
              <div
                v-for="(player, index) in sortedPlayers"
                :key="player.id"
                class="ios-list-item"
              >
                <span
                  class="font-bold text-lg w-8"
                  :class="{
                    'text-foil text-2xl': index === 0,
                    'text-system-gray': index === 1,
                    'text-[#b45309]': index === 2
                  }"
                >{{ index + 1 }}º</span>
                <span
                  class="flex-1 ml-2 font-medium"
                  :class="index === 0 ? 'text-foil text-xl' : ''"
                >{{ player.name }}</span>
                <i
                  v-if="index === 0"
                  class="pi pi-crown text-foil ml-2 mr-2"
                ></i>
                <span class="font-bold text-system-blue bg-system-blue/10 px-2 py-1 rounded">{{ player.points }}
                  pts</span>
              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer p-4">
          <button
            class="ios-btn ios-btn-primary w-full py-3.5 text-lg rounded-xl"
            @click="finishAndGoToLeague"
          >Voltar ao Painel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTournament } from '../composables/useTournament'

const router = useRouter()

const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}

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

const canEditPairings = computed(() => currentTables.value.every(t => t.status === 'pending'))

function openEditPairings() {
  manualTables.value = currentTables.value.map(t => ({ slots: t.players.map(p => p.id) }))
  showEditPairingsDialog.value = true
}

function addManualTable() { manualTables.value.push({ slots: [null, null, null, null] }) }
function removeManualTable(tIndex) { manualTables.value.splice(tIndex, 1) }
function addManualSlot(tIndex) { manualTables.value[tIndex].slots.push(null) }
function removeManualSlot(tIndex, sIndex) { manualTables.value[tIndex].slots.splice(sIndex, 1) }

function getPlayerTable(playerId) {
  for (let i = 0; i < manualTables.value.length; i++) {
    if (manualTables.value[i].slots.includes(playerId)) return i + 1
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
    for (const id of t.slots) { if (id) { selectedCount++; playersInThisTable++ } }
    if (playersInThisTable === 1) return `A Mesa ${i + 1} possui apenas 1 jogador.`
  }
  if (selectedCount !== players.value.length) return `Atenção: Você tem ${players.value.length} jogadores, mas apenas ${selectedCount} estão escalados.`
  return null
})

function saveManualPairings() {
  if (manualPairingError.value) return
  const newTables = manualTables.value.map((t, index) => {
    const tablePlayers = t.slots.filter(id => id).map(id => {
      const p = players.value.find(x => x.id === id)
      return { id: p.id, name: p.name, result: null }
    })
    return { number: 0, status: 'pending', players: tablePlayers }
  }).filter(t => t.players.length > 0)
  newTables.forEach((t, i) => t.number = i + 1)
  updateCurrentRoundPairings(newTables)
  showEditPairingsDialog.value = false
  showToast({ severity: 'success', summary: 'Mesas Atualizadas', detail: 'O emparceiramento foi modificado.', life: 3000 })
}

const resultsError = computed(() => {
  if (selectedTable.value === null) return 'Nenhuma mesa selecionada.'
  const table = currentTables.value[selectedTable.value]
  if (!table) return 'Erro ao carregar mesa.'
  const numPlayersOnTable = table.players.length
  const positions = playerResults.value.slice(0, numPlayersOnTable)
  if (positions.some(pos => pos === null || pos === undefined)) return 'Todas as posições devem ser preenchidas.'
  const expectedPositions = Array.from({ length: numPlayersOnTable }, (_, i) => i + 1)
  const sortedPositions = [...positions].sort((a, b) => a - b)
  if (JSON.stringify(sortedPositions) !== JSON.stringify(expectedPositions)) return `As posições devem ser únicas (1 a ${numPlayersOnTable}).`
  return null
})

const isValidResults = computed(() => resultsError.value === null)

function handleNextRound() {
  if (nextRound()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast({ severity: 'success', summary: 'Nova Rodada', detail: `A Rodada ${currentRound.value} começou!`, life: 3000 })
  } else {
    if (currentRound.value >= roundCount.value) showToast({ severity: 'info', summary: 'Limite Atingido', detail: 'O torneio acabou.', life: 3000 })
    else showToast({ severity: 'warn', summary: 'Aviso', detail: 'Registre TODAS as mesas antes de avançar.', life: 4000 })
  }
}

function selectPosition(playerIndex, pos) {
  if (playerResults.value[playerIndex] === pos) { playerResults.value[playerIndex] = null; return }
  const existingIndex = playerResults.value.indexOf(pos)
  if (existingIndex !== -1 && existingIndex !== playerIndex) playerResults.value[existingIndex] = null
  playerResults.value[playerIndex] = pos
}

function handleSaveResults() {
  if (!isValidResults.value) return
  const numPlayersOnTable = currentTables.value[selectedTable.value].players.length
  const finalResults = playerResults.value.slice(0, numPlayersOnTable)
  saveResults(selectedTable.value, finalResults, isEditingResult.value)
  showResultDialog.value = false
  showToast({ severity: 'success', summary: 'Placar Salvo', detail: `Mesa ${selectedTable.value + 1} computada.`, life: 3000 })
  isEditingResult.value = false
}

function openResultDialog(tableIndex, isEditing = false) {
  selectedTable.value = tableIndex
  isEditingResult.value = isEditing
  const table = currentTables.value[tableIndex]
  const numPlayersOnTable = table.players.length
  if (isEditing && table && table.players) {
    playerResults.value = table.players.map(p => p.result)
    while (playerResults.value.length < numPlayersOnTable) playerResults.value.push(null)
  } else {
    playerResults.value = new Array(numPlayersOnTable).fill(null)
  }
  showResultDialog.value = true
}

async function confirmCancel() {
  await cancelTournament()
  showResetConfirmDialog.value = false
  showToast({ severity: 'info', summary: 'Cancelado', detail: 'O torneio foi abortado.', life: 3000 })
}

function pauseAndGoToLeague() { router.push({ name: 'league' }) }

async function confirmFinish() {
  if (isFinishing.value) return
  isFinishing.value = true
  const success = await endTournament()
  if (success) {
    showFinishConfirmDialog.value = false
    showFinalResultsDialog.value = true
  } else {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar no banco.', life: 5000 })
  }
  isFinishing.value = false
}

function finishAndGoToLeague() { clearTournamentState(); router.push({ name: 'league' }) }
</script>
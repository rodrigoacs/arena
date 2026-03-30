<template>
  <div class="active-round-container">
    <div class="round-header card">

      <div
        class="flex justify-content-between align-items-center mb-3 pb-3"
        style="border-bottom: 1px solid var(--border-color)"
      >
        <Button
          icon="pi pi-cog"
          label="Voltar p/ Configuração"
          class="p-button-text p-button-secondary"
          @click="showResetConfirmDialog = true"
          v-tooltip="'Abortar torneio atual e mudar formato'"
        />
        <Button
          icon="pi pi-home"
          label="Pausar e Ir p/ Liga"
          class="p-button-text p-button-secondary"
          @click="pauseAndGoToLeague"
          v-tooltip="'Voltar ao painel sem cancelar o torneio'"
        />
      </div>

      <div class="header-titles text-center mt-2">
        <h2>Rodada {{ currentRound }} de {{ roundCount }}</h2>
        <p>A batalha está rolando. Cuidado com os combos infinitos!</p>
      </div>

      <div
        class="header-actions"
        v-if="allResultsRegistered"
      >
        <Button
          v-if="currentRound < roundCount"
          label="Gerar Próxima Rodada"
          icon="pi pi-arrow-right"
          @click="handleNextRound"
          class="p-button-lg p-button-success w-full mt-3"
        />
        <Button
          v-else
          label="Encerrar Torneio e Ver Pódio"
          icon="pi pi-flag-fill"
          @click="showFinishConfirmDialog = true"
          class="p-button-lg p-button-danger w-full mt-3"
        />
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
          <Button
            v-if="table.status === 'pending'"
            label="Registrar Placar"
            icon="pi pi-check-square"
            class="w-full p-button-outlined"
            @click="openResultDialog(index)"
          />
          <Button
            v-else
            label="Editar Placar"
            icon="pi pi-pencil"
            class="w-full p-button-text p-button-secondary"
            @click="openResultDialog(index, true)"
          />
        </div>
      </div>
    </div>

    <div
      class="developer-controls"
      v-if="DEBUG"
    >
      <Button
        label="Auto Win (Dev)"
        icon="pi pi-fast-forward"
        class="p-button-warning mt-3"
        @click="generateRandomResults"
      />
    </div>

    <Dialog
      v-model:visible="showResultDialog"
      :header="`Placar - Mesa ${selectedTable !== null ? currentTables[selectedTable]?.number : ''}`"
      :style="{ width: '90vw', maxWidth: '500px' }"
      modal
    >
      <div class="p-fluid">
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
          class="p-error text-center mt-4 font-bold"
        >
          <i class="pi pi-exclamation-triangle mr-1"></i> {{ resultsError }}
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2 w-full mt-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showResultDialog = false"
            class="p-button-text"
          />
          <Button
            label="Salvar Mesa"
            icon="pi pi-check"
            @click="handleSaveResults"
            :disabled="!isValidResults"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showResetConfirmDialog"
      header="Confirmar Retorno"
      :style="{ width: '450px' }"
      modal
    >
      <div class="flex align-items-center gap-4 py-3">
        <i
          class="pi pi-exclamation-triangle text-red-500"
          style="font-size: 2.5rem"
        />
        <p class="m-0 text-lg">Para voltar à configuração, todo o progresso atual será apagado e o torneio será
          <strong>cancelado</strong>. Continuar?
        </p>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2 w-full mt-2">
          <Button
            label="Não, ficar no torneio"
            icon="pi pi-times"
            @click="showResetConfirmDialog = false"
            class="p-button-text"
          />
          <Button
            label="Sim, cancelar torneio"
            icon="pi pi-trash"
            class="p-button-danger"
            @click="confirmCancel"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showFinishConfirmDialog"
      header="Encerrar Torneio"
      :style="{ width: '450px' }"
      modal
    >
      <div class="flex align-items-center gap-4 py-3">
        <i
          class="pi pi-flag-fill text-blue-500"
          style="font-size: 2.5rem"
        />
        <p class="m-0 text-lg">Confirma o encerramento? Os resultados serão gravados definitivamente na base de dados e
          no
          Ranking da Liga.</p>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-3 w-full mt-2">
          <Button
            label="Revisar Mesas"
            icon="pi pi-times"
            @click="showFinishConfirmDialog = false"
            class="p-button-text p-button-secondary"
          />
          <Button
            label="Gravar e Encerrar"
            icon="pi pi-check"
            class="p-button-primary"
            @click="confirmFinish"
            :loading="isFinishing"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showFinalResultsDialog"
      header="Pódio do Torneio"
      :style="{ width: '90vw', maxWidth: '600px' }"
      modal
      :closable="false"
    >
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
      <template #footer>
        <div class="flex justify-content-center w-full mt-3">
          <Button
            label="Voltar ao Painel da Liga"
            icon="pi pi-trophy"
            class="p-button-primary w-full p-button-lg"
            @click="finishAndGoToLeague"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useTournament } from '../composables/useTournament'

const DEBUG = false

const router = useRouter()
const toast = useToast()
const {
  tableCount, roundCount, players, currentRound, sortedPlayers, currentTables, allResultsRegistered,
  saveResults, nextRound, endTournament, cancelTournament, clearTournamentState
} = useTournament()

const showResultDialog = ref(false)
const selectedTable = ref(null)
const playerResults = ref([])
const isEditingResult = ref(false)
const showResetConfirmDialog = ref(false)
const showFinishConfirmDialog = ref(false)
const showFinalResultsDialog = ref(false)
const isFinishing = ref(false)

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
    toast.add({ severity: 'success', summary: 'Nova Rodada', detail: `A Rodada ${currentRound.value} começou. Que vença o melhor!`, life: 3000 })
  } else {
    if (currentRound.value >= roundCount.value) {
      toast.add({ severity: 'info', summary: 'Limite Atingido', detail: 'O número máximo de rodadas já foi jogado.', life: 3000 })
    } else {
      toast.add({ severity: 'warn', summary: 'Mesas Pendentes', detail: 'Registre o placar de TODAS as mesas antes de avançar.', life: 4000 })
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
    toast.add({ severity: 'error', summary: 'Erro de Placar', detail: resultsError.value, life: 3000 })
    return
  }
  const numPlayersOnTable = currentTables.value[selectedTable.value].players.length
  const finalResults = playerResults.value.slice(0, numPlayersOnTable)
  saveResults(selectedTable.value, finalResults, isEditingResult.value)
  showResultDialog.value = false
  toast.add({
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
    toast.add({ severity: 'success', summary: 'Auto-Win', detail: `Resultados simulados para ${pendingTablesCount} mesas.`, life: 3000 })
  }
}

// 1. Botão: "Voltar para Configuração" (Cancela e apaga tudo)
async function confirmCancel() {
  await cancelTournament()
  showResetConfirmDialog.value = false
  toast.add({ severity: 'info', summary: 'Cancelado', detail: 'O torneio foi abortado e removido do banco.', life: 3000 })
}

// 2. Botão: "Pausar e Ir para a Liga" (Apenas navega, mantendo em memória)
function pauseAndGoToLeague() {
  router.push({ name: 'league' })
}

// 3. Finalização Oficial do Torneio
async function confirmFinish() {
  if (isFinishing.value) return
  isFinishing.value = true

  toast.add({ severity: 'info', summary: 'A Gravar...', detail: 'A calcular o ranking final no servidor...', life: 2000 })

  const success = await endTournament()

  if (success) {
    showFinishConfirmDialog.value = false
    showFinalResultsDialog.value = true
    toast.add({ severity: 'success', summary: 'Torneio Concluído!', detail: `O ranking foi gravado na base de dados com sucesso.`, life: 5000 })
  } else {
    toast.add({ severity: 'error', summary: 'Erro de Servidor', detail: 'Não foi possível gravar o resultado no banco. Tenta novamente.', life: 5000 })
  }

  isFinishing.value = false
}

// 4. Fechar Pódio e voltar à Liga
function finishAndGoToLeague() {
  clearTournamentState()
  router.push({ name: 'league' })
}
</script>

<style scoped>
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

/* Modals */
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

/* Final Podium */
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

@media (max-width: 600px) {
  .round-header>div:first-child {
    flex-direction: column;
    gap: 1rem;
  }

  .round-header>div:first-child .p-button {
    width: 100%;
  }
}
</style>
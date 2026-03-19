<template>
  <div class="active-container">
    <div class="active-header">
      <div class="round-title">
        <h1>Rodada {{ currentRound }}</h1>
        <span class="round-total">de {{ roundCount }}</span>
      </div>
      <div class="tournament-stats">
        <span
          title="Total de Jogadores"
          class="stat-badge"
        ><i class="pi pi-users"></i> {{ players.length }}</span>
        <span
          title="Total de Mesas"
          class="stat-badge"
        ><i class="pi pi-table"></i> {{ tableCount }}</span>
      </div>
    </div>

    <div class="round-actions">
      <Button
        label="Autocompletar (Dev)"
        icon="pi pi-bolt"
        @click="generateRandomResults"
        class="p-button-warning p-button-outlined p-button-sm hidden-mobile"
        v-if="(!allResultsRegistered && currentTables.length > 0) && DEBUG"
      />
      <Button
        label="Próxima Rodada"
        icon="pi pi-arrow-right"
        iconPos="right"
        @click="handleNextRound"
        :disabled="currentRound >= roundCount || !allResultsRegistered"
        class="next-round-button p-button-lg"
      />
    </div>

    <div class="tables-grid">
      <div
        v-for="(table, tableIndex) in currentTables"
        :key="tableIndex"
        class="table-card"
        :class="table.status"
      >
        <div class="table-card-header">
          <div class="table-title">
            <i class="pi pi-clone"></i>
            <h4>Mesa {{ tableIndex + 1 }}</h4>
          </div>
          <span class="table-status">
            <i :class="table.status === 'completed' ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
            {{ table.status === 'completed' ? 'Concluída' : 'Em Jogo' }}
          </span>
        </div>
        <div class="table-card-players">
          <div
            v-for="(player) in table.players"
            :key="player.id"
            class="player-chip"
            :class="{ 'winner': player.result === 1 }"
          >
            <div class="chip-content">
              <i class="pi pi-user"></i>
              <span
                class="player-name"
                :title="player.name"
              >{{ player.name }}</span>
            </div>
            <span
              v-if="player.result"
              class="player-pos"
              :class="`pos-${player.result}`"
            >{{ player.result }}º</span>
          </div>
        </div>
        <div
          v-if="table.status !== 'completed'"
          class="table-card-actions"
        >
          <Button
            label="Registrar Resultado"
            icon="pi pi-check-square"
            @click="openResultDialog(tableIndex)"
            class="register-result-button p-button-primary"
          />
        </div>
        <div
          v-else
          class="table-card-actions"
        >
          <Button
            label="Editar Resultado"
            icon="pi pi-pencil"
            @click="openResultDialog(tableIndex, true)"
            class="p-button-secondary p-button-outlined edit-result-button"
          />
        </div>
      </div>
    </div>

    <div class="tournament-actions">
      <Button
        label="Finalizar Torneio"
        icon="pi pi-stop-circle"
        @click="showFinishConfirmDialog = true"
        class="p-button-danger p-button-text action-btn-bottom"
      />
      <Button
        label="Reiniciar Tudo"
        icon="pi pi-refresh"
        @click="showResetConfirmDialog = true"
        class="p-button-secondary p-button-text action-btn-bottom"
      />
    </div>

    <Dialog
      v-model:visible="showResultDialog"
      :header="isEditingResult ? 'Editar Placar' : 'Registrar Placar'"
      modal
      class="results-dialog"
      :style="{ width: '100%', maxWidth: '500px' }"
      :draggable="false"
      :dismissableMask="true"
    >
      <div
        class="p-fluid"
        v-if="selectedTable !== null && currentTables[selectedTable]"
      >
        <div class="results-info">
          <div class="dialog-table-badge">Mesa {{ selectedTable + 1 }}</div>
          <p>Defina a colocação de cada jogador na mesa.</p>
        </div>

        <div class="results-list">
          <div
            v-for="(player, index) in currentTables[selectedTable].players"
            :key="index"
            class="player-result-row"
            :class="{ 'has-selection': playerResults[index] }"
          >
            <div class="player-info">
              <i class="pi pi-user"></i>
              <span class="player-name">{{ player.name }}</span>
              <span
                v-if="playerResults[index]"
                class="projected-points"
                :class="`pts-${getPointsForPosition(playerResults[index])}`"
              >
                +{{ getPointsForPosition(playerResults[index]) }} pts
              </span>
            </div>
            <div class="position-selector">
              <Button
                v-for="pos in currentTables[selectedTable].players.length"
                :key="pos"
                :label="`${pos}º`"
                :class="[
                  'pos-btn',
                  playerResults[index] === pos ? 'selected' : 'p-button-outlined p-button-secondary'
                ]"
                @click="selectPosition(index, pos)"
              />
            </div>
          </div>
        </div>

        <div
          v-if="resultsError"
          class="results-error-message"
        >
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ resultsError }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showResultDialog = false"
            class="p-button-text p-button-secondary"
          />
          <Button
            label="Salvar Placar"
            icon="pi pi-check"
            @click="handleSaveResults"
            :disabled="!isValidResults"
            class="save-btn"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showResetConfirmDialog"
      modal
      header="Reiniciar Torneio?"
      :style="{ width: '90%', maxWidth: '400px' }"
      :draggable="false"
    >
      <div class="confirmation-content">
        <div class="icon-box danger"><i class="pi pi-exclamation-triangle"></i></div>
        <p>Tem certeza que deseja recomeçar do zero? <strong>Todo o progresso atual será apagado.</strong></p>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          @click="showResetConfirmDialog = false"
          class="p-button-text"
        />
        <Button
          label="Sim, Reiniciar"
          icon="pi pi-refresh"
          @click="confirmReset"
          class="p-button-danger"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showFinishConfirmDialog"
      modal
      header="Finalizar Torneio?"
      :style="{ width: '90%', maxWidth: '400px' }"
      :draggable="false"
    >
      <div class="confirmation-content">
        <div class="icon-box primary"><i class="pi pi-flag"></i></div>
        <p>Deseja encerrar o torneio agora e ver a classificação final oficial?</p>
      </div>
      <template #footer>
        <Button
          label="Continuar Jogando"
          icon="pi pi-times"
          @click="showFinishConfirmDialog = false"
          class="p-button-text"
        />
        <Button
          label="Sim, Encerrar"
          icon="pi pi-check"
          @click="confirmFinish"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showFinalResultsDialog"
      modal
      header="🏆 Pódio Oficial 🏆"
      class="final-results-modal"
      :style="{ width: '95%', maxWidth: '550px' }"
      :draggable="false"
      :closable="false"
    >
      <div class="final-results-content">
        <div
          v-if="sortedPlayers.length > 0"
          class="winner-announcement"
        >
          <div class="crown-icon"><i class="pi pi-crown"></i></div>
          <h3>O Grande Campeão</h3>
          <div class="winner-name">{{ sortedPlayers[0].name }}</div>
          <div class="winner-points"><span>{{ sortedPlayers[0].points }}</span> pontos conquistados</div>
        </div>

        <div class="final-rankings-wrapper">
          <h4>Classificação Completa</h4>
          <div class="final-rankings-list">
            <div
              v-for="(player, index) in sortedPlayers"
              :key="player.id"
              class="final-ranking-item"
              :class="{ 'top-1': index === 0, 'top-2': index === 1, 'top-3': index === 2 }"
            >
              <div class="final-pos-wrapper">
                <span
                  class="final-pos"
                  v-if="index > 2"
                >{{ index + 1 }}º</span>
                <i
                  class="pi pi-trophy"
                  v-else
                ></i>
              </div>
              <span class="final-name">{{ player.name }}</span>
              <div class="final-stats">
                <span class="final-points">{{ player.points || 0 }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Fechar e Voltar ao Início"
          icon="pi pi-home"
          class="p-button-lg p-button-outlined w-full"
          @click="showFinalResultsDialog = false; resetTournament()"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useTournament } from '../composables/useTournament'

const DEBUG = false

const toast = useToast()
const {
  tableCount, roundCount, players, currentRound, sortedPlayers, currentTables, allResultsRegistered,
  saveResults, nextRound, endTournament, resetTournament
} = useTournament()

const showResultDialog = ref(false)
const selectedTable = ref(null)
const playerResults = ref([])
const isEditingResult = ref(false)
const showResetConfirmDialog = ref(false)
const showFinishConfirmDialog = ref(false)
const showFinalResultsDialog = ref(false)

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

function getPointsForPosition(position) {
  if (position === 1) return 3
  if (position === 2) return 2
  if (position === 3) return 1
  return 0
}

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

function handleEndTournament() {
  endTournament()
  if (players.value.length > 0) {
    const winner = sortedPlayers.value[0]
    toast.add({ severity: 'success', summary: 'Temos um Campeão!', detail: `${winner.name} venceu o torneio!`, life: 5000 })
  }
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

function confirmReset() {
  resetTournament()
  showResetConfirmDialog.value = false
  toast.add({ severity: 'info', summary: 'Resetado', detail: 'O campo de batalha foi limpo.', life: 3000 })
}

function confirmFinish() {
  handleEndTournament()
  showFinishConfirmDialog.value = false
  showFinalResultsDialog.value = true
}
</script>

<style scoped>
.active-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.round-title h1 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  display: inline-block;
}

.round-total {
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 0.5rem;
}

.tournament-stats {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
}

.stat-badge i {
  color: var(--accent-primary);
}

.round-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.next-round-button {
  border-radius: 50px;
  font-weight: 700;
  padding-left: 2rem;
  padding-right: 2rem;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }

  70% {
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.next-round-button:not(:disabled) {
  animation: pulse-glow 2s infinite;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.table-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
  transition: all 0.3s ease;
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover, 0 10px 25px rgba(0, 0, 0, 0.12));
  border-color: rgba(59, 130, 246, 0.3);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.table-title i {
  opacity: 0.5;
}

.table-title h4 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.table-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
}

.table-card.completed .table-status {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.table-card.pending .table-status {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.table-card-players {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  flex: 1;
}

.player-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md, 12px);
  border: 1px solid transparent;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.chip-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 75%;
}

.chip-content i {
  color: var(--text-secondary);
  opacity: 0.7;
}

.player-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-pos {
  font-weight: 800;
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
}

.pos-1 {
  background: rgba(245, 158, 11, 0.2);
  color: #b45309;
}

.pos-2 {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.pos-3 {
  background: rgba(180, 83, 9, 0.15);
  color: #92400e;
}

.player-chip.winner {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent);
  border-color: rgba(59, 130, 246, 0.3);
}

.player-chip.winner .player-name {
  color: var(--accent-primary);
}

.player-chip.winner i {
  color: var(--accent-primary);
  opacity: 1;
}

.table-card-actions {
  padding: 1.25rem;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.01);
}

.table-card-actions .p-button {
  width: 100%;
  border-radius: var(--radius-sm, 8px);
  font-weight: 600;
}

.tournament-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-color);
}

.action-btn-bottom {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.p-dialog) {
  border-radius: var(--radius-lg, 20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

:deep(.p-dialog-header) {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.02);
}

.results-info {
  text-align: center;
  margin-bottom: 2rem;
}

.dialog-table-badge {
  display: inline-block;
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.results-info p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.player-result-row {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 12px);
  padding: 1rem;
  transition: all 0.2s ease;
}

.player-result-row.has-selection {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.02);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.player-info i {
  color: var(--text-secondary);
}

.player-info .player-name {
  font-weight: 700;
  font-size: 1.05rem;
}

.projected-points {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.pts-3 {
  color: #b45309;
  background-color: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.pts-2 {
  color: #475569;
  background-color: rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.pts-1 {
  color: #92400e;
  background-color: rgba(180, 83, 9, 0.15);
  border: 1px solid rgba(180, 83, 9, 0.3);
}

.pts-0 {
  color: var(--text-secondary);
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.position-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pos-btn {
  flex: 1 1 calc(25% - 0.5rem);
  min-width: 44px;
  min-height: 44px;
  font-weight: 800;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 8px);
  transition: all 0.15s;
}

.pos-btn.selected {
  background-color: var(--accent-primary) !important;
  color: white !important;
  border-color: var(--accent-primary) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.results-error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #b45309;
  background-color: rgba(245, 158, 11, 0.1);
  padding: 1rem;
  border-radius: var(--radius-sm, 8px);
  margin-top: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-left: 4px solid #f59e0b;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  width: 100%;
}

.save-btn {
  min-width: 140px;
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0;
}

.icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.icon-box.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-box.primary {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-primary);
}

.confirmation-content p {
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

.final-results-modal :deep(.p-dialog-header) {
  background: var(--text-primary);
  color: var(--bg-primary);
  text-align: center;
  justify-content: center;
}

.final-results-content {
  text-align: center;
  padding: 1rem 0;
}

.winner-announcement {
  margin-bottom: 2.5rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crown-icon {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.winner-announcement h3 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.winner-name {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--accent-primary);
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.winner-points {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.winner-points span {
  font-weight: 800;
  color: var(--text-primary);
}

.final-rankings-wrapper h4 {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: left;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.final-rankings-list {
  max-height: 35vh;
  overflow-y: auto;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.final-ranking-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm, 8px);
  border: 1px solid var(--border-color);
}

.final-ranking-item.top-1 {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.final-ranking-item.top-2 {
  border-color: #94a3b8;
  background: rgba(148, 163, 184, 0.05);
}

.final-ranking-item.top-3 {
  border-color: #b45309;
  background: rgba(180, 83, 9, 0.05);
}

.final-pos-wrapper {
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.final-pos {
  font-weight: 700;
  color: var(--text-secondary);
}

.final-ranking-item.top-1 .pi-trophy {
  color: #f59e0b;
  font-size: 1.2rem;
}

.final-ranking-item.top-2 .pi-trophy {
  color: #94a3b8;
  font-size: 1.1rem;
}

.final-ranking-item.top-3 .pi-trophy {
  color: #b45309;
  font-size: 1rem;
}

.final-name {
  flex: 1;
  font-weight: 600;
  padding: 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.final-points {
  font-weight: 800;
  color: var(--accent-primary);
}

@media (max-width: 992px) {
  .active-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tournament-stats {
    width: 100%;
  }

  .stat-badge {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .round-actions {
    flex-direction: column-reverse;
  }

  .hidden-mobile {
    display: none !important;
  }

  .next-round-button {
    width: 100%;
    padding: 1rem;
  }

  .tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 400px) {
  .player-chip {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .chip-content {
    width: 100%;
  }

  .player-pos {
    align-self: flex-start;
    margin-left: 1.75rem;
  }

  .dialog-footer-actions {
    flex-direction: column;
  }

  .dialog-footer-actions .p-button {
    width: 100%;
    margin: 0;
  }
}
</style>
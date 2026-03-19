<template>
  <div class="setup-container">
    <div class="setup-header">
      <h1>Gerenciador de Torneios</h1>
      <p>Configure o formato, as rodadas e os planeswalkers para começar.</p>
    </div>
    <div class="card setup-card">
      <div class="card-header">
        <h2>Configuração Inicial</h2>
      </div>
      <div class="card-content">
        <div class="setup-controls">
          <div class="form-group format-group">
            <label for="playersPerTable">Tamanho da Mesa</label>
            <InputNumber
              id="playersPerTable"
              v-model="playersPerTable"
              :min="2"
              :max="10"
              showButtons
              suffix=" Jogadores"
            />
          </div>
          <div class="form-group rounds-group">
            <label for="roundCount">Nº de Rodadas</label>
            <InputNumber
              id="roundCount"
              v-model="roundCount"
              :min="1"
              showButtons
            />
          </div>
          <div class="form-group add-player-group">
            <label>Adicionar Jogador</label>
            <div class="p-inputgroup">
              <InputText
                v-model="newPlayerName"
                placeholder="Nome do jogador"
                @keydown.enter="handleAddPlayer"
              />
              <Button
                label="Add"
                icon="pi pi-plus"
                @click="handleAddPlayer"
                :disabled="!newPlayerName"
              />
            </div>
          </div>
        </div>

        <div class="players-section-header">
          <h3>Jogadores Inscritos</h3>
          <span class="player-count-badge">{{ players.length }}</span>
        </div>

        <div
          v-if="players.length > 0"
          class="player-list-container"
        >
          <DataTable
            :value="players"
            size="small"
            stripedRows
          >
            <Column
              field="name"
              header="Nome"
            ></Column>
            <Column
              header=""
              style="width: 60px; text-align: right;"
            >
              <template #body="slotProps">
                <Button
                  icon="pi pi-trash"
                  @click="removePlayer(slotProps.index)"
                  class="p-button-rounded p-button-text p-button-danger action-button"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        <div
          v-else
          class="empty-list small"
        >
          <i class="pi pi-user-plus"></i>
          <p>O lobby está vazio. Adicione a galera acima.</p>
        </div>
        <div class="start-tournament">
          <Button
            :label="`Iniciar Torneio (${players.length} Jogadores)`"
            icon="pi pi-play"
            @click="handleStartTournament"
            :disabled="players.length < playersPerTable"
            class="p-button-lg start-button"
          />
          <small
            class="min-players-warning"
            v-if="players.length < playersPerTable"
          >
            <i class="pi pi-info-circle"></i> Mínimo de {{ playersPerTable }} jogadores para este formato
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useTournament } from '../composables/useTournament'

const toast = useToast()
const {
  playersPerTable, roundCount, players, addPlayer, removePlayer, startTournament
} = useTournament()

const newPlayerName = ref('')

function handleAddPlayer() {
  if (addPlayer(newPlayerName.value)) {
    newPlayerName.value = ''
  } else {
    toast.add({ severity: 'warn', summary: 'Nome Inválido', detail: 'O nome do jogador não pode estar vazio.', life: 3000 })
  }
}

function handleStartTournament() {
  if (startTournament()) {
    toast.add({ severity: 'success', summary: 'Torneio iniciado!', detail: 'Primeira rodada gerada com sucesso.', life: 3000 })
  } else {
    toast.add({ severity: 'error', summary: 'Faltam Jogadores', detail: `O formato exige no mínimo ${playersPerTable.value} participantes.`, life: 4000 })
  }
}
</script>

<style scoped>
.setup-container {
  max-width: 850px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

.setup-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.setup-header h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-primary, #3b82f6), var(--accent-secondary, #8b5cf6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.setup-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.setup-card {
  background-color: var(--bg-secondary, #ffffff);
  border: none;
  border-radius: var(--radius-lg, 20px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.01);
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.card-content {
  padding: 2rem;
}

.setup-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px dashed var(--border-color);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.format-group,
.rounds-group {
  flex: 1 1 180px;
}

.add-player-group {
  flex: 2 1 300px;
}

:deep(.p-inputnumber),
:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
  width: 100%;
}

.p-inputgroup {
  display: flex;
  width: 100%;
  border-radius: var(--radius-sm, 8px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.p-inputgroup :deep(.p-inputtext) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.p-inputgroup :deep(.p-button) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.players-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.players-section-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.player-count-badge {
  background: var(--accent-primary);
  color: white;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.player-list-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 12px);
  margin-bottom: 2.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--bg-primary);
  padding: 0.75rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem 1rem;
}

.empty-list.small {
  padding: 2rem 1rem;
  background-color: var(--bg-card);
  border-radius: var(--radius-md, 12px);
  margin-top: 1rem;
  border: 1px dashed var(--border-color);
  text-align: center;
  color: var(--text-secondary);
}

.empty-list.small i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.start-tournament {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.start-button {
  padding: 1.25rem 3rem;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(59, 130, 246, 0.3);
}

.min-players-warning {
  margin-top: 1rem;
  color: #f59e0b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

@media (max-width: 600px) {
  .setup-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .format-group,
  .rounds-group,
  .add-player-group {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .card-content {
    padding: 1.25rem;
  }
}
</style>
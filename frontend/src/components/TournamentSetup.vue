<template>
  <div class="setup-container">
    <div class="setup-header relative">
      <Button
        icon="pi pi-arrow-left"
        label="Voltar à Liga"
        class="p-button-text p-button-secondary back-btn"
        @click="goToLeague"
      />
      <h1>Gerenciador de Torneios</h1>
      <p>Configure o formato e convoque os jogadores que apareceram hoje.</p>
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
            <label>Criar Novo Jogador</label>
            <div class="p-inputgroup">
              <InputText
                v-model="newPlayerName"
                placeholder="Nome do novato..."
                @keydown.enter="handleAddPlayer"
              />
              <Button
                label="Adicionar"
                icon="pi pi-plus"
                @click="handleAddPlayer"
                :disabled="!newPlayerName || isProcessing"
              />
            </div>
          </div>
        </div>

        <div class="players-section-header">
          <div>
            <h3>Quem vai jogar hoje?</h3>
            <p class="section-subtitle">Toque nos nomes para os incluir nesta etapa.</p>
          </div>
          <div
            class="player-count-badge"
            :class="{ 'ready': players.length >= playersPerTable }"
          >
            {{ players.length }} Selecionados
          </div>
        </div>

        <div
          v-if="allAdminPlayers.length > 0"
          class="player-pool-grid"
        >
          <button
            v-for="player in allAdminPlayers"
            :key="player.id"
            class="pool-chip"
            :class="{ 'selected': isPlaying(player) }"
            @click="togglePlayer(player)"
          >
            <i :class="isPlaying(player) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
            {{ player.name }}
          </button>
        </div>
        <div
          v-else
          class="empty-list small"
        >
          <i class="pi pi-users"></i>
          <p>O seu elenco está vazio. Cadastre o primeiro jogador acima.</p>
        </div>

        <div
          v-if="players.length > 0"
          class="decks-setup-section"
        >
          <h3 class="mt-0 mb-3"><i class="pi pi-list mr-2"></i>Comandantes / Decks (Opcional)</h3>
          <div class="decks-grid">
            <div
              v-for="(player, index) in players"
              :key="player.id"
              class="deck-input-group flex align-items-center justify-content-between p-3 border-1 border-round surface-border"
            >
              <div class="flex flex-column">
                <span class="font-bold text-sm">{{ player.name }}</span>
                <span
                  v-if="player.deck_name"
                  class="text-xs text-gray-500 mt-1"
                > ({{ player.deck_name }})</span>
              </div>
              <Button
                :label="player.deck_name ? 'Editar' : 'Adicionar'"
                :icon="player.deck_name ? 'pi pi-pencil' : 'pi pi-plus'"
                :class="player.deck_name ? 'p-button-success p-button-outlined p-button-sm' : 'p-button-secondary p-button-outlined p-button-sm'"
                @click="openDeckInput(index)"
              />
            </div>
          </div>
        </div>

        <div class="start-tournament">
          <Button
            :label="`Iniciar Etapa (${players.length} Jogadores)`"
            icon="pi pi-play"
            @click="handleStartTournament"
            :disabled="players.length < playersPerTable || isProcessing"
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

    <Dialog
      v-model:visible="showDeckInputModal"
      :header="`Deck de ${currentEditingPlayerName}`"
      modal
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <div class="p-fluid mt-2 flex flex-column gap-3">
        <div class="field mb-0">
          <label class="text-sm font-bold text-gray-700 block mb-2">Nome do Comandante</label>
          <InputText
            v-model="tempDeckInfo.name"
            placeholder="Ex: Atraxa, Praetors' Voice"
          />
        </div>
        <div class="field mb-0">
          <label class="text-sm font-bold text-gray-700 block mb-2">Link da Lista (Opcional)</label>
          <InputText
            v-model="tempDeckInfo.url"
            placeholder="Link do Moxfield, Archidekt, etc."
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-between w-full mt-3">
          <Button
            label="Limpar"
            icon="pi pi-trash"
            class="p-button-text p-button-danger"
            @click="clearTempDeck"
          />
          <div class="flex gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              class="p-button-text p-button-secondary"
              @click="showDeckInputModal = false"
            />
            <Button
              label="Salvar"
              icon="pi pi-check"
              class="p-button-primary"
              @click="saveDeckInput"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useTournament } from '../composables/useTournament'

const router = useRouter()
const toast = useToast()
const {
  playersPerTable, roundCount, players, allAdminPlayers,
  addPlayer, togglePlayer, startTournament, fetchExistingPlayers
} = useTournament()

const newPlayerName = ref('')
const isProcessing = ref(false)

// Estado da Edição do Deck Simplificado
const showDeckInputModal = ref(false)
const currentEditingPlayerIndex = ref(null)
const tempDeckInfo = ref({ name: '', url: '' })

const currentEditingPlayerName = computed(() => {
  if (currentEditingPlayerIndex.value !== null && players.value[currentEditingPlayerIndex.value]) {
    return players.value[currentEditingPlayerIndex.value].name
  }
  return ''
})

onMounted(async () => {
  await fetchExistingPlayers()
})

function goToLeague() {
  router.push({ name: 'league' })
}

function isPlaying(dbPlayer) {
  return players.value.some(p => p.id === dbPlayer.id)
}

function openDeckInput(index) {
  currentEditingPlayerIndex.value = index
  tempDeckInfo.value = {
    name: players.value[index].deck_name || '',
    url: players.value[index].deck_url || ''
  }
  showDeckInputModal.value = true
}

function clearTempDeck() {
  tempDeckInfo.value = { name: '', url: '' }
}

function saveDeckInput() {
  if (currentEditingPlayerIndex.value !== null) {
    players.value[currentEditingPlayerIndex.value].deck_name = tempDeckInfo.value.name.trim()
    players.value[currentEditingPlayerIndex.value].deck_url = tempDeckInfo.value.url.trim()
  }
  showDeckInputModal.value = false
  toast.add({ severity: 'success', summary: 'Comandante Salvo', detail: 'Deck anexado ao jogador.', life: 2000 })
}

async function handleAddPlayer() {
  if (isProcessing.value || !newPlayerName.value.trim()) return
  isProcessing.value = true

  const success = await addPlayer(newPlayerName.value)
  if (success) {
    toast.add({ severity: 'success', summary: 'Jogador Cadastrado', detail: `${newPlayerName.value} adicionado ao elenco e à etapa.`, life: 3000 })
    newPlayerName.value = ''
  } else {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao registar o jogador no servidor (nome duplicado?).', life: 3000 })
  }

  isProcessing.value = false
}

async function handleStartTournament() {
  if (isProcessing.value) return
  isProcessing.value = true

  const success = await startTournament()
  if (success) {
    toast.add({ severity: 'success', summary: 'Torneio iniciado!', detail: 'Primeira rodada gerada.', life: 3000 })
  } else {
    toast.add({ severity: 'error', summary: 'Erro', detail: `O formato exige no mínimo ${playersPerTable.value} participantes ou ocorreu um erro.`, life: 4000 })
  }

  isProcessing.value = false
}
</script>

<style scoped>
.setup-container {
  max-width: 850px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

.setup-header {
  position: relative;
  text-align: center;
  margin-bottom: 2.5rem;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.players-section-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.player-count-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.player-count-badge.ready {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: #10b981;
}

.player-pool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 2rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.player-pool-grid::-webkit-scrollbar {
  width: 6px;
}

.player-pool-grid::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

.pool-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.pool-chip:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.pool-chip i {
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.pool-chip.selected {
  background: rgba(59, 130, 246, 0.05);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary);
}

.pool-chip.selected i {
  color: var(--accent-primary);
}

.empty-list.small {
  padding: 3rem 1rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md, 12px);
  margin-top: 1rem;
  border: 2px dashed var(--border-color);
  text-align: center;
  color: var(--text-secondary);
}

.empty-list.small i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

/* Decks Section Styles */
.decks-setup-section {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.start-tournament {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
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
  .back-btn {
    position: relative;
    margin-bottom: 1rem;
  }

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

  .players-section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .player-pool-grid,
  .decks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
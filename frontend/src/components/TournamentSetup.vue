<template>
  <div class="setup-container">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <div class="setup-header relative">
      <button
        class="ios-btn ios-btn-text back-btn"
        @click="goToLeague"
        title="Voltar à Liga"
      >
        <i class="pi pi-arrow-left"></i> Voltar à Liga
      </button>
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
            <label for="playersPerTable">Tamanho da Mesa (Jogadores)</label>
            <input
              id="playersPerTable"
              type="number"
              v-model.number="playersPerTable"
              min="2"
              max="10"
              class="ios-input ios-input-bordered"
            />
          </div>
          <div class="form-group rounds-group">
            <label for="roundCount">Nº de Rodadas</label>
            <input
              id="roundCount"
              type="number"
              v-model.number="roundCount"
              min="1"
              class="ios-input ios-input-bordered"
            />
          </div>
          <div class="form-group add-player-group">
            <label>Criar Novo Jogador</label>
            <div class="ios-input-group">
              <input
                type="text"
                v-model="newPlayerName"
                placeholder="Nome do novato..."
                @keydown.enter="handleAddPlayer"
                class="ios-input ios-input-bordered"
              />
              <button
                class="ios-btn ios-btn-primary"
                @click="handleAddPlayer"
                :disabled="!newPlayerName || isProcessing"
              >
                <i class="pi pi-plus"></i> Adicionar
              </button>
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
              class="deck-input-group"
            >
              <div class="deck-info">
                <span class="deck-player-name">{{ player.name }}</span>
                <span
                  v-if="player.deck_name"
                  class="deck-commander-name"
                >
                  ({{ player.deck_name }})
                </span>
              </div>
              <button
                class="ios-btn ios-btn-sm"
                :class="player.deck_name ? 'ios-btn-success-outlined' : 'ios-btn-secondary-outlined'"
                @click="openDeckInput(index)"
              >
                <i :class="player.deck_name ? 'pi pi-pencil' : 'pi pi-plus'"></i>
                {{ player.deck_name ? 'Editar' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </div>

        <div class="start-tournament">
          <button
            class="ios-btn ios-btn-primary ios-btn-lg start-button"
            @click="handleStartTournament"
            :disabled="players.length < playersPerTable || isProcessing"
          >
            <i class="pi pi-play"></i> Iniciar Etapa ({{ players.length }} Jogadores)
          </button>
          <small
            class="min-players-warning"
            v-if="players.length < playersPerTable"
          >
            <i class="pi pi-info-circle"></i> Mínimo de {{ playersPerTable }} jogadores para este formato
          </small>
        </div>
      </div>
    </div>

    <div
      v-if="showDeckInputModal"
      class="ios-modal-overlay"
      @click.self="showDeckInputModal = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">
          Deck de {{ currentEditingPlayerName }}
        </div>
        <div class="ios-modal-content">
          <div class="apple-form-section">
            <div class="apple-form-group">
              <div class="apple-form-row">
                <label>NOME DO COMANDANTE</label>
                <input
                  type="text"
                  v-model="tempDeckInfo.name"
                  placeholder="Ex: Atraxa, Praetors' Voice"
                  class="ios-input"
                />
              </div>
              <div class="apple-form-row">
                <label>LINK DA LISTA (OPCIONAL)</label>
                <input
                  type="text"
                  v-model="tempDeckInfo.url"
                  placeholder="Moxfield, Archidekt, etc."
                  class="ios-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex justify-content-between">
          <button
            class="ios-btn ios-btn-text text-red-500"
            @click="clearTempDeck"
          >
            <i class="pi pi-trash"></i> Limpar
          </button>
          <div class="flex gap-2">
            <button
              class="ios-btn ios-btn-text"
              @click="showDeckInputModal = false"
            >Cancelar</button>
            <button
              class="ios-btn ios-btn-primary"
              @click="saveDeckInput"
            >
              <i class="pi pi-check"></i> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTournament } from '../composables/useTournament'

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
  showToast({ severity: 'success', summary: 'Comandante Salvo', detail: 'Deck anexado ao jogador.', life: 2000 })
}

async function handleAddPlayer() {
  if (isProcessing.value || !newPlayerName.value.trim()) return
  isProcessing.value = true

  const success = await addPlayer(newPlayerName.value)
  if (success) {
    showToast({ severity: 'success', summary: 'Jogador Cadastrado', detail: `${newPlayerName.value} adicionado ao elenco e à etapa.`, life: 3000 })
    newPlayerName.value = ''
  } else {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Erro ao registar o jogador no servidor (nome duplicado?).', life: 3000 })
  }

  isProcessing.value = false
}

async function handleStartTournament() {
  if (isProcessing.value) return
  isProcessing.value = true

  const success = await startTournament()
  if (success) {
    showToast({ severity: 'success', summary: 'Torneio iniciado!', detail: 'Primeira rodada gerada.', life: 3000 })
    // Redireciona para a página de ActiveRound (assumindo que a rota é a mesma onde o setup é renderizado condicionalmente, ou mude a rota se for separada)
  } else {
    showToast({ severity: 'error', summary: 'Erro', detail: `O formato exige no mínimo ${playersPerTable.value} participantes ou ocorreu um erro.`, life: 4000 })
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

/* COMPONENTES HTML NATIVOS */
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

.ios-btn-secondary-outlined {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.ios-btn-secondary-outlined:hover:not(:disabled) {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.ios-btn-success-outlined {
  background: transparent;
  border: 1px solid #10b981;
  color: #10b981;
}

.ios-btn-success-outlined:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
}

.ios-btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.ios-btn-lg {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.ios-input {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  width: 100%;
}

.ios-input-bordered {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.ios-input-bordered:focus {
  border-color: var(--accent-primary);
}

.ios-input-group {
  display: flex;
  width: 100%;
}

.ios-input-group .ios-input-bordered {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
}

.ios-input-group .ios-btn {
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
  font-family: inherit;
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

.deck-input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.deck-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.deck-player-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.deck-commander-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
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
  border-radius: 50px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
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

/* MODAL APPLE HIG */
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
  max-width: 450px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: scaleUp 0.2s ease;
}

.ios-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-align: center;
}

.ios-modal-content {
  padding: 1.5rem;
  background: var(--bg-primary);
}

.ios-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.apple-form-section {
  display: flex;
  flex-direction: column;
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

.apple-form-row .ios-input {
  padding: 0.25rem 0 !important;
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
<template>
  <div class="setup-container max-w-content pb-5">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header class="ios-page-header px-3 pt-4 pb-2">
      <div class="flex justify-content-between align-items-center mb-2">
        <button
          class="ios-btn ios-btn-text p-0 m-0"
          @click="goToLeague"
        >
          <i class="pi pi-chevron-left"></i> Voltar
        </button>
      </div>
      <h1 class="ios-large-title">Configuração</h1>
      <p class="text-gray-500 text-sm mt-1">Defina o formato e convoque os jogadores.</p>
    </header>

    <div class="px-3">
      <div class="ios-grouped-section">
        <div class="ios-grouped-label">FORMATO DO TORNEIO</div>
        <div class="ios-grouped-list">
          <div class="ios-list-item">
            <span class="font-medium">Tamanho da Mesa</span>
            <input
              type="number"
              v-model.number="playersPerTable"
              min="2"
              max="10"
              class="ios-input text-right w-4rem text-blue-500 font-bold"
            />
          </div>
          <div class="ios-list-item">
            <span class="font-medium">Nº de Rodadas</span>
            <input
              type="number"
              v-model.number="roundCount"
              min="1"
              class="ios-input text-right w-4rem text-blue-500 font-bold"
            />
          </div>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label">NOVO JOGADOR</div>
        <div class="ios-grouped-list">
          <div class="ios-list-item pr-1">
            <input
              type="text"
              v-model="newPlayerName"
              placeholder="Nome do novato..."
              @keydown.enter="handleAddPlayer"
              class="ios-input"
            />
            <button
              class="ios-btn ios-btn-text p-2"
              @click="handleAddPlayer"
              :disabled="!newPlayerName || isProcessing"
            >Adicionar</button>
          </div>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label flex justify-content-between align-items-end">
          <span>ELENCO GERAL</span>
          <span
            :class="players.length >= playersPerTable ? 'text-blue-500' : 'text-orange-500'"
            style="text-transform: none; font-size: 0.75rem;"
          >
            {{ players.length }} Selecionados
          </span>
        </div>

        <div
          v-if="allAdminPlayers.length === 0"
          class="ios-grouped-list p-4 text-center text-gray-500 text-sm"
        >
          O elenco está vazio. Adicione acima.
        </div>
        <div
          v-else
          class="chips-grid"
        >
          <button
            v-for="player in allAdminPlayers"
            :key="player.id"
            class="ios-chip"
            :class="{ 'selected': isPlaying(player) }"
            @click="togglePlayer(player)"
          >
            <i :class="isPlaying(player) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
            <span>{{ player.name }}</span>
          </button>
        </div>
      </div>

      <div
        class="ios-grouped-section"
        v-if="players.length > 0"
      >
        <div class="ios-grouped-label">COMANDANTES (OPCIONAL)</div>
        <div class="ios-grouped-list">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            class="ios-list-item"
          >
            <div class="flex flex-column">
              <span class="font-medium">{{ player.name }}</span>
              <span
                v-if="player.deck_name"
                class="text-xs text-gray-500 mt-1"
              >{{ player.deck_name }}</span>
            </div>
            <button
              class="ios-btn ios-btn-text p-2 text-sm"
              @click="openDeckInput(index)"
            >
              {{ player.deck_name ? 'Editar' : 'Adicionar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 mb-4 flex flex-column align-items-center">
        <button
          class="ios-btn ios-btn-primary w-full py-3"
          style="font-size: 1.1rem; border-radius: 14px;"
          @click="handleStartTournament"
          :disabled="players.length < playersPerTable || isProcessing"
        >
          Iniciar Etapa ({{ players.length }} Jogadores)
        </button>
        <p
          class="text-orange-500 text-xs mt-2 font-medium"
          v-if="players.length < playersPerTable"
        >
          Mínimo de {{ playersPerTable }} jogadores para este formato.
        </p>
      </div>
    </div>

    <div
      v-if="showDeckInputModal"
      class="ios-modal-overlay"
      @click.self="showDeckInputModal = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">Deck de {{ currentEditingPlayerName }}</div>
        <div
          class="ios-modal-content p-0"
          style="background: var(--bg-primary);"
        >
          <div class="ios-grouped-section mt-4 mx-3">
            <div class="ios-grouped-list">
              <div class="ios-list-item">
                <input
                  type="text"
                  v-model="tempDeckInfo.name"
                  placeholder="Nome do Comandante"
                  class="ios-input"
                />
              </div>
              <div class="ios-list-item">
                <input
                  type="text"
                  v-model="tempDeckInfo.url"
                  placeholder="Link da Lista (Opcional)"
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
          >Limpar</button>
          <div class="flex gap-2">
            <button
              class="ios-btn ios-btn-text"
              @click="showDeckInputModal = false"
            >Cancelar</button>
            <button
              class="ios-btn ios-btn-primary"
              @click="saveDeckInput"
            >Salvar</button>
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

const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}

const {
  playersPerTable, roundCount, players, allAdminPlayers,
  addPlayer, togglePlayer, startTournament, fetchExistingPlayers
} = useTournament()

const newPlayerName = ref('')
const isProcessing = ref(false)

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
    showToast({ severity: 'success', summary: 'Jogador Cadastrado', detail: `${newPlayerName.value} adicionado.`, life: 3000 })
    newPlayerName.value = ''
  } else {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Erro ao registar o jogador.', life: 3000 })
  }
  isProcessing.value = false
}

async function handleStartTournament() {
  if (isProcessing.value) return
  isProcessing.value = true

  const success = await startTournament()
  if (success) {
    showToast({ severity: 'success', summary: 'Torneio iniciado!', detail: 'Primeira rodada gerada.', life: 3000 })
  } else {
    showToast({ severity: 'error', summary: 'Erro', detail: `O formato exige no mínimo ${playersPerTable.value} participantes.`, life: 4000 })
  }
  isProcessing.value = false
}
</script>

<style scoped>
.max-w-content {
  max-width: 600px;
  margin: 0 auto;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
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

.p-0 {
  padding: 0;
}

.m-0 {
  margin: 0;
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

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-5 {
  margin-bottom: 2.5rem;
}

.px-3 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.w-full {
  width: 100%;
}

.w-4rem {
  width: 4rem;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.85rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-gray-500 {
  color: var(--system-gray);
}

.text-blue-500 {
  color: var(--system-blue);
}

.text-orange-500 {
  color: var(--system-orange);
}

.text-red-500 {
  color: var(--system-red);
}

.bg-white {
  background: var(--bg-secondary);
}

.chips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
  padding: 1rem 0;
}

.ios-chip {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.ios-chip:hover {
  border-color: var(--system-blue);
}

.ios-chip.selected {
  background: rgba(0, 122, 255, 0.1);
  border-color: var(--system-blue);
  color: var(--system-blue);
}
</style>
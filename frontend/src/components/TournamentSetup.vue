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
          class="ios-btn ios-btn-text p-0 m-0"
          @click="goToLeague"
        >
          <i class="pi pi-chevron-left"></i> Voltar
        </button>
      </div>
      <h1 class="text-3xl font-bold tracking-tight">Configuração</h1>
      <p class="text-system-gray text-sm mt-1">Defina o formato e convoque os jogadores.</p>
    </header>

    <div class="px-4">
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
              class="ios-input text-right w-16 text-system-blue font-bold"
            />
          </div>
          <div class="ios-list-item">
            <span class="font-medium">Nº de Rodadas</span>
            <input
              type="number"
              v-model.number="roundCount"
              min="1"
              class="ios-input text-right w-16 text-system-blue font-bold"
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
        <div class="ios-grouped-label flex justify-between items-end">
          <span>ELENCO GERAL</span>
          <span
            :class="players.length >= playersPerTable ? 'text-system-blue' : 'text-system-orange'"
            class="normal-case text-xs"
          >
            {{ players.length }} Selecionados
          </span>
        </div>

        <div
          v-if="allAdminPlayers.length === 0"
          class="ios-grouped-list p-6 text-center text-system-gray text-sm"
        >
          O elenco está vazio. Adicione acima.
        </div>
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2"
        >
          <button
            v-for="player in allAdminPlayers"
            :key="player.id"
            class="bg-system-card dark:bg-system-cardDark border border-system-border dark:border-system-borderDark rounded-full px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
            :class="isPlaying(player) ? 'bg-system-blue/10 border-system-blue text-system-blue' : 'text-system-text hover:border-system-blue'"
            @click="togglePlayer(player)"
          >
            <i
              :class="isPlaying(player) ? 'pi pi-check-circle' : 'pi pi-circle'"
              class="text-lg"
            ></i>
            <span class="truncate">{{ player.name }}</span>
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
            <div class="flex flex-col">
              <span class="font-medium">{{ player.name }}</span>
              <span
                v-if="player.deck_name"
                class="text-xs text-system-gray mt-1"
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

      <div class="mt-6 mb-8 flex flex-col items-center">
        <button
          class="ios-btn ios-btn-primary w-full py-3.5 text-lg rounded-xl"
          @click="handleStartTournament"
          :disabled="players.length < playersPerTable || isProcessing"
        >
          Iniciar Torneio ({{ players.length }} Jogadores)
        </button>
        <p
          class="text-system-orange text-xs mt-2 font-medium"
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
        <div class="ios-modal-content p-0 bg-system-bg dark:bg-system-bgDark">
          <div class="ios-grouped-section mt-6 px-4">
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
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text text-system-red"
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
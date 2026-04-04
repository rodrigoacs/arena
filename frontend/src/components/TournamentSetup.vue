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
    </header>

    <div class="px-4">
      <div class="ios-grouped-section">
        <div class="ios-grouped-label">FORMATO DO TORNEIO</div>
        <div
          class="ios-grouped-list"
          style="display: flex; align-items: center; justify-content: space-around;"
        >
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
          class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2"
        >
          <button
            v-for="player in allAdminPlayers"
            :key="player.id"
            class="bg-system-card dark:bg-system-cardDark border border-system-border dark:border-system-borderDark rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 text-sm transition-all"
            :class="isPlaying(player) ? 'bg-system-blue/10 border-system-blue text-system-blue font-bold shadow-sm' : 'text-system-text hover:border-system-blue font-medium'"
            @click="togglePlayer(player)"
          >
            <div class="flex items-center gap-2 truncate">
              <i
                :class="isPlaying(player) ? 'pi pi-check-circle' : 'pi pi-circle'"
                class="text-lg shrink-0"
              ></i>
              <span class="truncate">{{ player.name }}</span>
            </div>
            <span class="text-[10px] font-mono opacity-50 shrink-0">#{{ shortId(player.id) }}</span>
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
              <span class="font-medium flex items-center">{{ player.name }} <span
                  class="text-[10px] text-system-gray ml-1.5 font-mono opacity-60"
                >#{{ shortId(player.id) }}</span></span>
              <span
                v-if="player.deck_name"
                class="text-xs text-system-gray mt-1"
              >{{ player.deck_name }}</span>
            </div>
            <button
              class="ios-btn ios-btn-text p-2 text-sm font-bold transition-colors"
              :class="player.deck_name ? 'text-system-orange' : 'text-system-blue'"
              @click="openDeckInput(index)"
            >
              <i :class="player.deck_name ? 'pi pi-pencil' : 'pi pi-plus'"></i>
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
          Iniciar Etapa ({{ players.length }} Jogadores)
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
      <div class="ios-modal !overflow-visible">
        <div class="ios-modal-header">Deck de {{ currentEditingPlayerName }}</div>
        <div class="ios-modal-content p-0 bg-system-bg dark:bg-system-bgDark !overflow-visible">
          <div class="ios-grouped-section mt-6 px-4">
            <div class="ios-grouped-list !overflow-visible">
              <div class="ios-list-item relative !overflow-visible">
                <input
                  type="text"
                  v-model="tempDeckInfo.name"
                  @input="handleScryfallSearch"
                  placeholder="Comandante (em inglês)"
                  class="ios-input font-bold text-system-blue"
                />

                <ul
                  v-if="scryfallSuggestions.length > 0"
                  class="absolute z-50 top-full left-0 w-full mt-2 bg-system-card dark:bg-system-cardDark border border-system-border dark:border-system-borderDark rounded-lg shadow-xl max-h-[200px] overflow-y-auto"
                >
                  <li
                    v-for="sug in scryfallSuggestions"
                    :key="sug"
                    @click="selectSuggestion(sug)"
                    class="px-4 py-3 text-sm border-b border-system-border dark:border-system-borderDark last:border-none cursor-pointer hover:bg-system-blue hover:text-white transition-colors"
                  >
                    {{ sug }}
                  </li>
                </ul>
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

function shortId(id) {
  return id ? String(id).split('-')[0].substring(0, 4).toUpperCase() : ''
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

/* Integração Scryfall (Busca Avançada) */
const scryfallSuggestions = ref([])
let searchApiTimeout = null

async function handleScryfallSearch() {
  const q = tempDeckInfo.value.name.trim()
  if (q.length < 3) {
    scryfallSuggestions.value = []
    return
  }
  if (searchApiTimeout) clearTimeout(searchApiTimeout)
  searchApiTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(q + ' is:commander')}`)
      if (!res.ok) {
        scryfallSuggestions.value = []
        return
      }
      const data = await res.json()
      if (data.data) {
        const uniqueNames = [...new Set(data.data.map(card => card.name))]
        scryfallSuggestions.value = uniqueNames.slice(0, 10)
      } else {
        scryfallSuggestions.value = []
      }
    } catch (e) {
      scryfallSuggestions.value = []
    }
  }, 300)
}

// ESTA FUNÇÃO HAVIA SIDO APAGADA NO SEU CÓDIGO
function selectSuggestion(name) {
  tempDeckInfo.value.name = name
  scryfallSuggestions.value = []
}

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
  scryfallSuggestions.value = []
  showDeckInputModal.value = true
}

function clearTempDeck() {
  tempDeckInfo.value = { name: '', url: '' }
  scryfallSuggestions.value = []
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
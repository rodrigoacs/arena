<template>
  <div class="min-h-screen pb-12">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header
      class="px-4 pt-6 pb-4 flex justify-between items-center w-full sticky top-0 z-50 bg-system-bg/80 dark:bg-system-bgDark/80 backdrop-blur-md border-b border-system-border dark:border-system-borderDark/50"
    >
      <div class="flex justify-between items-center w-full max-w-[800px] mx-auto">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight m-0">Painel Principal</h1>
          <button
            class="ios-icon-btn w-9 h-9"
            @click="toggleTheme"
          >
            <i :class="isDark ? 'pi pi-sun text-yellow-500' : 'pi pi-moon text-system-blue'"></i>
          </button>
        </div>
        <button
          class="ios-btn ios-btn-text text-system-red p-0"
          @click="handleLogout"
        >Sair</button>
      </div>
    </header>

    <main class="max-w-[800px] mx-auto px-4 py-6">
      <div class="ios-grouped-section">
        <div class="ios-grouped-label">Administração</div>
        <div class="ios-grouped-list">
          <div
            class="ios-list-item cursor-pointer"
            @click="openRosterModal"
          >
            <span class="flex items-center gap-2"><i class="pi pi-users text-system-blue"></i> Gerir
              Participantes</span>
            <i class="pi pi-chevron-right text-system-gray"></i>
          </div>
          <div
            class="ios-list-item cursor-pointer"
            @click="showCreateDialog = true"
          >
            <span class="flex items-center gap-2"><i class="pi pi-plus-circle text-system-green"></i> Criar Nova
              Liga</span>
            <i class="pi pi-chevron-right text-system-gray"></i>
          </div>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label">Minhas Ligas Ativas</div>
        <div
          v-if="isLoading"
          class="ios-grouped-list"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="ios-list-item animate-pulse"
          >
            <div class="flex flex-col gap-2 w-full">
              <div class="h-4 bg-system-gray/20 rounded w-1/3"></div>
              <div class="h-3 bg-system-gray/20 rounded w-1/4"></div>
            </div>
            <i class="pi pi-chevron-right text-system-gray/30"></i>
          </div>
        </div>

        <div
          v-else-if="leagues.length === 0"
          class="p-6 text-center text-system-gray bg-system-card rounded-xl border border-system-border shadow-sm"
        >
          Nenhuma liga encontrada.
        </div>

        <div
          v-else
          class="ios-grouped-list"
        >
          <div
            v-for="league in leagues"
            :key="league.id"
            class="ios-list-item cursor-pointer"
            @click="enterLeague(league.id)"
          >
            <div class="flex flex-col">
              <span class="font-bold text-lg">{{ league.name }}</span>
              <span
                class="text-xs text-system-gray mt-1"
                v-if="league.season"
              >Temporada: {{ league.season }}</span>
            </div>
            <i class="pi pi-chevron-right text-system-gray"></i>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="showCreateDialog"
      class="ios-modal-overlay"
      @click.self="showCreateDialog = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header">Nova Liga</div>
        <div class="ios-modal-content p-0 bg-system-bg dark:bg-system-bgDark">
          <div class="ios-grouped-section mt-6 px-4">
            <div class="ios-grouped-list">
              <div class="ios-list-item"><input
                  type="text"
                  v-model="newLeague.name"
                  placeholder="Nome da Liga"
                  class="ios-input"
                /></div>
              <div class="ios-list-item"><input
                  type="text"
                  v-model="newLeague.season"
                  placeholder="Temporada (Opcional)"
                  class="ios-input"
                /></div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showCreateDialog = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="handleCreateLeague"
            :disabled="!newLeague.name"
          >Criar</button>
        </div>
      </div>
    </div>

    <div
      v-if="showRosterModal"
      class="ios-modal-overlay"
      @click.self="showRosterModal = false"
    >
      <div class="ios-modal ios-modal-lg">
        <div class="ios-modal-header">Participantes Globais</div>
        <div class="ios-modal-content p-0">
          <div class="ios-grouped-section mt-6 px-4">
            <div class="ios-grouped-list">
              <div class="ios-list-item pr-2">
                <input
                  type="text"
                  v-model="newPlayerName"
                  placeholder="Adicionar jogador..."
                  @keydown.enter="handleAddPlayer"
                  class="ios-input"
                />
                <button
                  class="ios-btn ios-btn-text p-2 shrink-0"
                  @click="handleAddPlayer"
                  :disabled="!newPlayerName || isSavingPlayer"
                >Adicionar</button>
              </div>
            </div>
            <p class="text-xs text-system-gray mt-2 px-2">Este elenco estará disponível em todas as ligas.</p>
          </div>

          <div class="ios-grouped-section px-4">
            <div class="ios-grouped-label">Jogadores ({{ players.length }})</div>
            <div class="ios-grouped-list max-h-[40vh] overflow-y-auto">
              <div
                v-if="isLoadingPlayers"
                class="p-6 text-center text-system-gray"
              ><i class="pi pi-spin pi-spinner"></i></div>
              <div
                v-else-if="players.length === 0"
                class="p-6 text-center text-system-gray"
              >Nenhum jogador.</div>
              <div
                v-else
                v-for="player in players"
                :key="player.id"
                class="ios-list-item"
              >
                <div
                  v-if="editingPlayerId === player.id"
                  class="flex w-full items-center gap-2 bg-system-blue/10 border border-system-blue rounded-lg p-2 shadow-sm transition-all"
                >
                  <input
                    type="text"
                    v-model="editPlayerName"
                    class="ios-input font-bold text-system-blue flex-1"
                    @keydown.enter="saveEdit(player.id)"
                    autofocus
                  />
                  <button
                    class="ios-icon-btn bg-system-green text-white border-none w-8 h-8 shrink-0 shadow-md"
                    @click="saveEdit(player.id)"
                  ><i class="pi pi-check"></i></button>
                  <button
                    class="ios-icon-btn bg-system-gray text-white border-none w-8 h-8 shrink-0 shadow-md"
                    @click="cancelEdit"
                  ><i class="pi pi-times"></i></button>
                </div>
                <template v-else>
                  <span class="font-medium flex items-center">
                    {{ player.name }}
                    <span class="text-[10px] text-system-gray ml-1.5 font-mono opacity-60">#{{ shortId(player.id)
                      }}</span>
                  </span>
                  <div class="flex gap-4">
                    <i
                      class="pi pi-pencil text-system-blue cursor-pointer"
                      @click="startEdit(player)"
                    ></i>
                    <i
                      class="pi pi-trash text-system-red cursor-pointer"
                      @click="confirmDelete(player)"
                    ></i>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex-col p-4">
          <button
            class="ios-btn ios-btn-primary w-full"
            @click="showRosterModal = false"
          >Concluído</button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="ios-modal-overlay"
      @click.self="showDeleteConfirm = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header text-system-red">Confirmar Exclusão</div>
        <div class="ios-modal-content text-center">
          <p>Excluir <strong>{{ playerToDelete?.name }}</strong>?</p>
          <p class="text-xs text-system-red mt-2">O histórico em torneios será apagado.</p>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-text"
            @click="showDeleteConfirm = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-danger"
            @click="handleDeletePlayer"
            :disabled="isDeleting"
          >Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

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

const leagues = ref([])
const isLoading = ref(true)

const showCreateDialog = ref(false)
const newLeague = ref({ name: '', season: '' })

const showRosterModal = ref(false)
const players = ref([])
const isLoadingPlayers = ref(false)
const newPlayerName = ref('')
const isSavingPlayer = ref(false)
const editingPlayerId = ref(null)
const editPlayerName = ref('')
const showDeleteConfirm = ref(false)
const playerToDelete = ref(null)
const isDeleting = ref(false)

onMounted(loadLeagues)

async function loadLeagues() {
  isLoading.value = true
  try { leagues.value = await api.getAdminLeagues() }
  catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar ligas' }) }
  finally { isLoading.value = false }
}

async function handleCreateLeague() {
  try {
    await api.createLeague(newLeague.value.name, newLeague.value.season)
    showCreateDialog.value = false
    newLeague.value = { name: '', season: '' }
    await loadLeagues()
  } catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar liga' }) }
}

function enterLeague(id) { api.setLeague(id); router.push({ name: 'league' }) }
function handleLogout() { api.logout(); router.push({ name: 'login' }) }

async function openRosterModal() { showRosterModal.value = true; await loadPlayers() }
async function loadPlayers() {
  isLoadingPlayers.value = true
  try { players.value = await api.getPlayers() } catch (error) { } finally { isLoadingPlayers.value = false }
}

async function handleAddPlayer() {
  if (!newPlayerName.value.trim()) return
  isSavingPlayer.value = true
  try {
    await api.createPlayer(newPlayerName.value.trim())
    newPlayerName.value = ''
    await loadPlayers()
  } catch (error) { showToast({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado?' }) }
  finally { isSavingPlayer.value = false }
}

function startEdit(player) { editingPlayerId.value = player.id; editPlayerName.value = player.name }
function cancelEdit() { editingPlayerId.value = null; editPlayerName.value = '' }
async function saveEdit(id) {
  if (!editPlayerName.value.trim()) { cancelEdit(); return }
  try {
    await api.updatePlayer(id, editPlayerName.value.trim())
    cancelEdit()
    await loadPlayers()
  } catch (error) { }
}

function confirmDelete(player) { playerToDelete.value = player; showDeleteConfirm.value = true }
async function handleDeletePlayer() {
  isDeleting.value = true
  try {
    await api.deletePlayer(playerToDelete.value.id)
    showDeleteConfirm.value = false
    await loadPlayers()
  } catch (error) { } finally { isDeleting.value = false }
}
</script>
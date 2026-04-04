<template>
  <div class="dashboard-page">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <header class="ios-page-header">
      <div class="flex justify-content-between align-items-center max-w-content">
        <div class="flex align-items-center gap-3">
          <h1 class="ios-large-title m-0">Dashboard</h1>
          <button
            class="ios-icon-btn p-2"
            @click="toggleTheme"
            style="font-size: 1.2rem;"
          >
            <i :class="isDark ? 'pi pi-sun text-yellow-500' : 'pi pi-moon text-blue-500'"></i>
          </button>
        </div>
        <button
          class="ios-btn ios-btn-text text-red"
          @click="handleLogout"
        >Sair</button>
      </div>
    </header>

    <main class="max-w-content p-3">
      <div class="ios-grouped-section">
        <div class="ios-grouped-label">Administração</div>
        <div class="ios-grouped-list">
          <div
            class="ios-list-item cursor-pointer"
            @click="openRosterModal"
          >
            <span class="flex align-items-center gap-2"><i class="pi pi-users text-blue-500"></i> Gerir Elenco</span>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </div>
          <div
            class="ios-list-item cursor-pointer"
            @click="showCreateDialog = true"
          >
            <span class="flex align-items-center gap-2"><i class="pi pi-plus-circle text-green-500"></i> Nova
              Liga</span>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <div class="ios-grouped-section">
        <div class="ios-grouped-label">Minhas Ligas Ativas</div>
        <div
          v-if="isLoading"
          class="p-4 text-center text-gray-500"
        >A carregar...</div>
        <div
          v-else-if="leagues.length === 0"
          class="p-4 text-center text-gray-500"
        >Nenhuma liga encontrada.</div>

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
            <div class="flex flex-column gap-1">
              <span class="font-bold">{{ league.name }}</span>
              <span
                class="text-xs text-gray-500"
                v-if="league.season"
              >Temporada: {{ league.season }}</span>
            </div>
            <i class="pi pi-chevron-right text-gray-400"></i>
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
        <div
          class="ios-modal-content p-0"
          style="background: var(--bg-primary);"
        >
          <div class="ios-grouped-section mt-4">
            <div class="ios-grouped-list mx-3">
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
        <div class="ios-modal-header">Elenco Global</div>
        <div class="ios-modal-content p-0">
          <div class="ios-grouped-section mt-4 mx-3">
            <div class="ios-grouped-list">
              <div class="ios-list-item">
                <input
                  type="text"
                  v-model="newPlayerName"
                  placeholder="Adicionar jogador..."
                  @keydown.enter="handleAddPlayer"
                  class="ios-input"
                  style="flex: 1; min-width: 0;"
                />
                <button
                  class="ios-btn ios-btn-text p-0 flex-shrink-0"
                  @click="handleAddPlayer"
                  :disabled="!newPlayerName || isSavingPlayer"
                >Adicionar</button>
              </div>
            </div>
            <div class="ios-grouped-desc">Este elenco estará disponível em todas as ligas.</div>
          </div>

          <div class="ios-grouped-section mx-3">
            <div class="ios-grouped-label">Jogadores ({{ players.length }})</div>
            <div class="ios-grouped-list roster-list">
              <div
                v-if="isLoadingPlayers"
                class="p-3 text-center text-gray-500"
              >A carregar...</div>
              <div
                v-else-if="players.length === 0"
                class="p-3 text-center text-gray-500"
              >Nenhum jogador.</div>

              <div
                v-else
                v-for="player in players"
                :key="player.id"
                class="ios-list-item"
              >
                <div
                  v-if="editingPlayerId === player.id"
                  class="flex w-full align-items-center gap-2"
                >
                  <input
                    type="text"
                    v-model="editPlayerName"
                    class="ios-input"
                    @keydown.enter="saveEdit(player.id)"
                  />
                  <i
                    class="pi pi-check text-green-500 cursor-pointer"
                    @click="saveEdit(player.id)"
                  ></i>
                  <i
                    class="pi pi-times text-gray-400 cursor-pointer"
                    @click="cancelEdit"
                  ></i>
                </div>
                <template v-else>
                  <span>{{ player.name }}</span>
                  <div class="flex gap-3">
                    <i
                      class="pi pi-pencil text-blue-500 cursor-pointer"
                      @click="startEdit(player)"
                    ></i>
                    <i
                      class="pi pi-trash text-red-500 cursor-pointer"
                      @click="confirmDelete(player)"
                    ></i>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex-column p-3">
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
        <div class="ios-modal-header">Confirmar Exclusão</div>
        <div class="ios-modal-content text-center">
          <p>Excluir <strong>{{ playerToDelete?.name }}</strong>?</p>
          <p class="text-xs text-red-500 mt-2">O histórico em torneios será apagado.</p>
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

<style scoped>
.ios-page-header {
  padding: 3rem 1.5rem 1rem;
}

.ios-large-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.max-w-content {
  max-width: 800px;
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

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mx-3 {
  margin-left: 1rem;
  margin-right: 1rem;
}

.p-0 {
  padding: 0;
}

.p-3 {
  padding: 1rem;
}

.w-full {
  width: 100%;
}

.text-xs {
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-blue-500 {
  color: var(--system-blue);
}

.text-green-500 {
  color: var(--system-green);
}

.text-red-500 {
  color: var(--system-red);
}

.cursor-pointer {
  cursor: pointer;
}

.roster-list {
  max-height: 40vh;
  overflow-y: auto;
}
</style>
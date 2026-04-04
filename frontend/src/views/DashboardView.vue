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

    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <i class="pi pi-bolt"></i>
          <h1>Painel do Organizador</h1>
        </div>
        <button
          class="ios-btn ios-btn-text text-red-500"
          @click="handleLogout"
        >
          <i class="pi pi-sign-out"></i> Sair
        </button>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="leagues-section">
        <div class="section-header">
          <h2>Minhas Ligas</h2>
          <div class="header-actions">
            <button
              class="ios-btn ios-btn-secondary-outlined mr-2"
              @click="openRosterModal"
            >
              <i class="pi pi-users"></i> Gerenciar Elenco
            </button>
            <button
              class="ios-btn ios-btn-primary"
              @click="showCreateDialog = true"
            >
              <i class="pi pi-plus"></i> Nova Liga
            </button>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="loading-state"
        >
          <i
            class="pi pi-spin pi-spinner"
            style="font-size: 2rem"
          ></i>
          <p>A carregar as suas ligas...</p>
        </div>

        <div
          v-else-if="leagues.length === 0"
          class="empty-leagues"
        >
          <i class="pi pi-flag"></i>
          <h3>Nenhuma liga ativa</h3>
          <p>Crie a sua primeira liga para começar a gerir os torneios e rankings da sua comunidade.</p>
          <button
            class="ios-btn ios-btn-outlined"
            @click="showCreateDialog = true"
          >
            Criar Primeira Liga
          </button>
        </div>

        <div
          v-else
          class="leagues-grid"
        >
          <div
            v-for="league in leagues"
            :key="league.id"
            class="league-card"
            @click="enterLeague(league.id)"
          >
            <div class="league-icon">
              <i class="pi pi-trophy"></i>
            </div>
            <div class="league-info">
              <h3>{{ league.name }}</h3>
              <span
                class="season-badge"
                v-if="league.season"
              >Temp: {{ league.season }}</span>
            </div>
            <i class="pi pi-chevron-right enter-icon"></i>
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
        <div class="ios-modal-header text-center">Criar Nova Liga</div>
        <div class="ios-modal-content">
          <div class="apple-form-section">
            <div class="apple-form-group">
              <div class="apple-form-row">
                <label>NOME DA LIGA</label>
                <input
                  type="text"
                  v-model="newLeague.name"
                  placeholder="Ex: Laje Wars"
                  class="ios-input"
                />
              </div>
              <div class="apple-form-row">
                <label>TEMPORADA (OPCIONAL)</label>
                <input
                  type="text"
                  v-model="newLeague.season"
                  placeholder="Ex: 2026"
                  class="ios-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex justify-content-between">
          <button
            class="ios-btn ios-btn-text"
            @click="showCreateDialog = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-primary"
            @click="handleCreateLeague"
            :disabled="!newLeague.name"
          >
            <i class="pi pi-check"></i> Criar Liga
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showRosterModal"
      class="ios-modal-overlay"
      @click.self="showRosterModal = false"
    >
      <div class="ios-modal ios-modal-lg">
        <div class="ios-modal-header text-center">Gerir Elenco</div>
        <div
          class="ios-modal-content"
          style="background: var(--bg-primary);"
        >

          <div class="roster-workspace">
            <div class="flex gap-2 mb-4 mt-2 align-items-center">
              <input
                type="text"
                v-model="newPlayerName"
                placeholder="Adicionar novo jogador ao elenco..."
                @keydown.enter="handleAddPlayer"
                class="ios-input ios-input-bordered flex-1"
              />
              <button
                class="ios-btn ios-btn-success flex-shrink-0"
                @click="handleAddPlayer"
                :disabled="!newPlayerName || isSavingPlayer"
              >
                <i :class="isSavingPlayer ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"></i> Adicionar
              </button>
            </div>

            <div class="apple-form-section">
              <div class="apple-section-label">JOGADORES CADASTRADOS ({{ players.length }})</div>
              <div class="apple-form-group roster-list-container">

                <div
                  v-if="isLoadingPlayers"
                  class="text-center p-4 text-gray-500"
                >
                  <i class="pi pi-spin pi-spinner mr-2"></i> A carregar elenco...
                </div>

                <div
                  v-else-if="players.length === 0"
                  class="text-center p-4 text-gray-500"
                >
                  Nenhum jogador cadastrado no seu elenco.
                </div>

                <div
                  v-else
                  v-for="player in players"
                  :key="player.id"
                  class="apple-form-row align-items-center flex-row justify-content-between"
                  style="padding: 0.75rem 1rem;"
                >
                  <div
                    v-if="editingPlayerId === player.id"
                    class="flex gap-2 w-full align-items-center"
                  >
                    <input
                      type="text"
                      v-model="editPlayerName"
                      class="ios-input flex-1 border-1 surface-border border-round px-2 py-1"
                      @keydown.enter="saveEdit(player.id)"
                    />
                    <button
                      class="ios-icon-btn text-green-500"
                      @click="saveEdit(player.id)"
                      title="Salvar"
                    >
                      <i
                        class="pi pi-check-circle"
                        style="font-size: 1.2rem;"
                      ></i>
                    </button>
                    <button
                      class="ios-icon-btn text-gray-400"
                      @click="cancelEdit"
                      title="Cancelar"
                    >
                      <i
                        class="pi pi-times-circle"
                        style="font-size: 1.2rem;"
                      ></i>
                    </button>
                  </div>

                  <template v-else>
                    <span
                      class="font-semibold text-primary"
                      style="font-size: 0.95rem;"
                    >{{ player.name }}</span>
                    <div class="flex gap-1">
                      <button
                        class="ios-icon-btn text-blue-500"
                        @click="startEdit(player)"
                        title="Editar Nome"
                      >
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button
                        class="ios-icon-btn text-red-500"
                        @click="confirmDelete(player)"
                        title="Excluir"
                      >
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </template>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer">
          <button
            class="ios-btn ios-btn-primary w-full"
            @click="showRosterModal = false"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="ios-modal-overlay"
      @click.self="showDeleteConfirm = false"
    >
      <div class="ios-modal">
        <div class="ios-modal-header text-center">Confirmar Exclusão</div>
        <div class="ios-modal-content">
          <div class="flex align-items-center gap-4 py-3">
            <i
              class="pi pi-exclamation-triangle text-red-500"
              style="font-size: 2.5rem"
            ></i>
            <div>
              <p class="m-0 text-lg">Deseja realmente excluir <strong>{{ playerToDelete?.name }}</strong>?</p>
              <small class="text-red-500 font-bold block mt-2">Atenção: Todo o histórico deste jogador nos torneios será
                apagado!</small>
            </div>
          </div>
        </div>
        <div class="ios-modal-footer flex justify-content-between">
          <button
            class="ios-btn ios-btn-text"
            @click="showDeleteConfirm = false"
          >Cancelar</button>
          <button
            class="ios-btn ios-btn-danger"
            @click="handleDeletePlayer"
            :disabled="isDeleting"
          >
            <i :class="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"></i> Excluir Definitivamente
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

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

const leagues = ref([])
const isLoading = ref(true)

const showCreateDialog = ref(false)
const newLeague = ref({ name: '', season: '' })

// Estado do Elenco
const showRosterModal = ref(false)
const players = ref([])
const isLoadingPlayers = ref(false)
const newPlayerName = ref('')
const isSavingPlayer = ref(false)

// Estado de Edição
const editingPlayerId = ref(null)
const editPlayerName = ref('')

// Estado de Exclusão
const showDeleteConfirm = ref(false)
const playerToDelete = ref(null)
const isDeleting = ref(false)

onMounted(async () => {
  await loadLeagues()
})

async function loadLeagues() {
  isLoading.value = true
  try {
    leagues.value = await api.getAdminLeagues()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as ligas.', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleCreateLeague() {
  try {
    await api.createLeague(newLeague.value.name, newLeague.value.season)
    showToast({ severity: 'success', summary: 'Sucesso', detail: 'Liga criada com sucesso!', life: 3000 })
    showCreateDialog.value = false
    newLeague.value = { name: '', season: '' }
    await loadLeagues()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a liga.', life: 3000 })
  }
}

function enterLeague(leagueId) {
  api.setLeague(leagueId)
  router.push({ name: 'league' })
}

function handleLogout() {
  api.logout()
  router.push({ name: 'login' })
}

// --- Gestão do Elenco ---
async function openRosterModal() {
  showRosterModal.value = true
  await loadPlayers()
}

async function loadPlayers() {
  isLoadingPlayers.value = true
  try {
    players.value = await api.getPlayers()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar elenco.', life: 3000 })
  } finally {
    isLoadingPlayers.value = false
  }
}

async function handleAddPlayer() {
  if (!newPlayerName.value.trim()) return
  isSavingPlayer.value = true
  try {
    await api.createPlayer(newPlayerName.value.trim())
    showToast({ severity: 'success', summary: 'Sucesso', detail: 'Jogador adicionado ao elenco.', life: 3000 })
    newPlayerName.value = ''
    await loadPlayers()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado ou erro de servidor.', life: 3000 })
  } finally {
    isSavingPlayer.value = false
  }
}

function startEdit(player) {
  editingPlayerId.value = player.id
  editPlayerName.value = player.name
}

function cancelEdit() {
  editingPlayerId.value = null
  editPlayerName.value = ''
}

async function saveEdit(id) {
  if (!editPlayerName.value.trim()) {
    cancelEdit()
    return
  }
  try {
    await api.updatePlayer(id, editPlayerName.value.trim())
    showToast({ severity: 'success', summary: 'Atualizado', detail: 'Nome alterado com sucesso.', life: 3000 })
    cancelEdit()
    await loadPlayers()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o nome.', life: 3000 })
  }
}

function confirmDelete(player) {
  playerToDelete.value = player
  showDeleteConfirm.value = true
}

async function handleDeletePlayer() {
  if (!playerToDelete.value) return
  isDeleting.value = true
  try {
    await api.deletePlayer(playerToDelete.value.id)
    showToast({ severity: 'success', summary: 'Excluído', detail: 'Jogador e histórico removidos.', life: 3000 })
    showDeleteConfirm.value = false
    playerToDelete.value = null
    await loadPlayers()
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir o jogador.', life: 3000 })
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.dashboard-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.title-area i {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.title-area h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Leagues Grid */
.leagues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.league-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.league-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 20px rgba(59, 130, 246, 0.1);
}

.league-icon {
  width: 50px;
  height: 50px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-size: 1.5rem;
}

.league-info {
  flex: 1;
}

.league-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.season-badge {
  font-size: 0.8rem;
  background: var(--bg-primary);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 600;
}

.enter-icon {
  color: var(--text-secondary);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.league-card:hover .enter-icon {
  opacity: 1;
  color: var(--accent-primary);
}

.empty-leagues,
.loading-state {
  text-align: center;
  padding: 5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px dashed var(--border-color);
}

.empty-leagues i {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-leagues h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-leagues p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* COMPONENTES NATIVOS */
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

.ios-btn-danger {
  background: #ef4444;
  color: white;
}

.ios-btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.ios-btn-success {
  background: #10b981;
  color: white;
}

.ios-btn-success:hover:not(:disabled) {
  background: #059669;
}

.ios-btn-text {
  background: transparent;
  color: var(--text-secondary);
}

.ios-btn-text:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.ios-btn-outlined {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.ios-btn-outlined:hover:not(:disabled) {
  background: var(--bg-primary);
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

.ios-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.ios-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
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

.ios-input:focus {
  outline: none;
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

/* MODAIS NATIVOS E FORMS HIG */
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
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: scaleUp 0.2s ease;
}

.ios-modal-lg {
  max-width: 600px;
}

.ios-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.ios-modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.ios-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  background: var(--bg-primary);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
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

.apple-form-section {
  display: flex;
  flex-direction: column;
}

.apple-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  letter-spacing: 0.5px;
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

/* Estilos Específicos para a Lista de Elenco (Substitui DataTable) */
.roster-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.roster-list-container {
  max-height: 400px;
  overflow-y: auto;
}

.roster-list-container::-webkit-scrollbar {
  width: 6px;
}

.roster-list-container::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

@media (max-width: 600px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
<template>
  <div class="dashboard-page">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <i class="pi pi-bolt"></i>
          <h1>Painel do Organizador</h1>
        </div>
        <Button
          label="Sair"
          icon="pi pi-sign-out"
          class="p-button-text p-button-danger"
          @click="handleLogout"
        />
      </div>
    </header>

    <main class="dashboard-main">
      <div class="leagues-section">
        <div class="section-header">
          <h2>Minhas Ligas</h2>
          <div class="header-actions">
            <Button
              label="Gerenciar Elenco"
              icon="pi pi-users"
              class="p-button-outlined p-button-secondary mr-2"
              @click="openRosterModal"
            />
            <Button
              label="Nova Liga"
              icon="pi pi-plus"
              @click="showCreateDialog = true"
            />
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
          <p>Carregando as suas ligas...</p>
        </div>

        <div
          v-else-if="leagues.length === 0"
          class="empty-leagues"
        >
          <i class="pi pi-flag"></i>
          <h3>Nenhuma liga ativa</h3>
          <p>Crie sua primeira liga para começar a gerenciar os torneios e rankings da sua comunidade.</p>
          <Button
            label="Criar Primeira Liga"
            class="p-button-outlined"
            @click="showCreateDialog = true"
          />
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

    <Dialog
      v-model:visible="showCreateDialog"
      header="Criar Nova Liga"
      :style="{ width: '400px' }"
      modal
    >
      <div class="p-fluid">
        <div class="field mb-4">
          <label
            for="name"
            class="font-bold block mb-2"
          >Nome da Liga</label>
          <InputText
            id="name"
            v-model="newLeague.name"
            placeholder="Ex: Laje Wars"
          />
        </div>
        <div class="field mb-2">
          <label
            for="season"
            class="font-bold block mb-2"
          >Temporada (Opcional)</label>
          <InputText
            id="season"
            v-model="newLeague.season"
            placeholder="Ex: 2026"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2 w-full mt-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showCreateDialog = false"
            class="p-button-text"
          />
          <Button
            label="Criar Liga"
            icon="pi pi-check"
            @click="handleCreateLeague"
            :disabled="!newLeague.name"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showRosterModal"
      header="Gerenciar Elenco"
      :style="{ width: '600px', maxWidth: '95vw' }"
      modal
    >
      <div class="roster-workspace">

        <div class="flex gap-3 mb-4 mt-2">
          <InputText
            v-model="newPlayerName"
            placeholder="Adicionar novo jogador ao elenco..."
            @keydown.enter="handleAddPlayer"
            class="w-full"
          />
          <Button
            icon="pi pi-plus"
            label="Adicionar"
            class="p-button-success"
            @click="handleAddPlayer"
            :loading="isSavingPlayer"
            :disabled="!newPlayerName"
            style="white-space: nowrap;"
          />
        </div>

        <DataTable
          :value="players"
          :loading="isLoadingPlayers"
          stripedRows
          responsiveLayout="scroll"
          class="roster-table"
          scrollable
          scrollHeight="400px"
        >
          <template #empty>
            <div class="text-center p-4 text-gray-500">Nenhum jogador cadastrado no seu elenco.</div>
          </template>

          <Column
            field="name"
            header="Nome do Jogador"
          >
            <template #body="slotProps">
              <div
                v-if="editingPlayerId === slotProps.data.id"
                class="flex gap-2 w-full"
              >
                <InputText
                  v-model="editPlayerName"
                  class="p-inputtext-sm w-full"
                  @keydown.enter="saveEdit(slotProps.data.id)"
                />
                <Button
                  icon="pi pi-check"
                  class="p-button-success p-button-sm"
                  @click="saveEdit(slotProps.data.id)"
                  v-tooltip="'Salvar'"
                />
                <Button
                  icon="pi pi-times"
                  class="p-button-secondary p-button-sm"
                  @click="cancelEdit"
                  v-tooltip="'Cancelar'"
                />
              </div>
              <span
                v-else
                class="font-semibold"
              >{{ slotProps.data.name }}</span>
            </template>
          </Column>

          <Column
            header="Ações"
            style="width: 120px; text-align: center"
          >
            <template #body="slotProps">
              <div
                v-if="editingPlayerId !== slotProps.data.id"
                class="flex gap-2 justify-content-end"
              >
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-sm"
                  @click="startEdit(slotProps.data)"
                  v-tooltip="'Editar Nome'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-text p-button-sm"
                  @click="confirmDelete(slotProps.data)"
                  v-tooltip="'Excluir'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <template #footer>
        <div class="flex justify-content-end w-full pt-2">
          <Button
            label="Fechar Janela"
            icon="pi pi-times"
            @click="showRosterModal = false"
            class="p-button-text"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteConfirm"
      header="Confirmar Exclusão"
      :style="{ width: '450px' }"
      modal
    >
      <div class="confirmation-content flex align-items-center gap-4 py-3">
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
      <template #footer>
        <div class="flex justify-content-end gap-2 w-full mt-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showDeleteConfirm = false"
            class="p-button-text"
          />
          <Button
            label="Excluir Definitivamente"
            icon="pi pi-trash"
            class="p-button-danger"
            @click="handleDeletePlayer"
            :loading="isDeleting"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { api } from '../services/api'

const router = useRouter()
const toast = useToast()

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
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as ligas.', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleCreateLeague() {
  try {
    await api.createLeague(newLeague.value.name, newLeague.value.season)
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Liga criada com sucesso!', life: 3000 })
    showCreateDialog.value = false
    newLeague.value = { name: '', season: '' }
    await loadLeagues()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a liga.', life: 3000 })
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
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar elenco.', life: 3000 })
  } finally {
    isLoadingPlayers.value = false
  }
}

async function handleAddPlayer() {
  if (!newPlayerName.value.trim()) return
  isSavingPlayer.value = true
  try {
    await api.createPlayer(newPlayerName.value.trim())
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Jogador adicionado ao elenco.', life: 3000 })
    newPlayerName.value = ''
    await loadPlayers()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Nome duplicado ou erro de servidor.', life: 3000 })
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
    toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Nome alterado com sucesso.', life: 3000 })
    cancelEdit()
    await loadPlayers()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o nome.', life: 3000 })
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
    toast.add({ severity: 'success', summary: 'Excluído', detail: 'Jogador e histórico removidos.', life: 3000 })
    showDeleteConfirm.value = false
    playerToDelete.value = null
    await loadPlayers()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir o jogador.', life: 3000 })
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

/* Modal Roster Styles */
.roster-workspace {
  display: flex;
  flex-direction: column;
}

:deep(.roster-table .p-datatable-wrapper) {
  border: 1px solid var(--border-color);
  border-radius: 8px;
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
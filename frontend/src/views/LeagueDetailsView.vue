<template>
  <div class="league-details-page">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-area">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary p-button-rounded mr-2"
            @click="goBack"
          />
          <i class="pi pi-trophy"></i>
          <h1>Painel da Liga</h1>
        </div>
        <div class="header-actions">
          <Button
            label="Nova Etapa (Ao Vivo)"
            icon="pi pi-play"
            class="p-button-primary action-btn"
            @click="goToTournament"
          />
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="content-grid">
        <section class="ranking-section">
          <div class="section-header">
            <h2>🏆 Ranking Geral</h2>
            <div class="flex gap-2">
              <Button
                label="Exportar CSV"
                icon="pi pi-download"
                class="p-button-outlined p-button-success p-button-sm"
                @click="exportCSV"
              />
              <Button
                label="Copiar Link Público"
                icon="pi pi-link"
                class="p-button-outlined p-button-info p-button-sm"
                @click="copyPublicLink"
              />
              <Button
                label="Importar Histórico"
                icon="pi pi-upload"
                class="p-button-outlined p-button-secondary p-button-sm"
                @click="openImportModal"
              />
            </div>
          </div>

          <div class="card p-0">
            <DataTable
              :value="ranking"
              :loading="isLoading"
              stripedRows
              responsiveLayout="scroll"
            >
              <template #empty>
                <div class="p-4 text-center text-gray-500">Nenhum resultado registado ainda.</div>
              </template>

              <Column
                header="Pos"
                style="width: 70px"
              >
                <template #body="slotProps">
                  <div
                    class="rank-position"
                    :class="`pos-${slotProps.index + 1}`"
                  >
                    {{ slotProps.index + 1 }}º
                  </div>
                </template>
              </Column>

              <Column
                field="player_name"
                header="Jogador"
                class="font-bold"
              ></Column>

              <Column
                field="league_points"
                header="Pts"
                style="width: 70px"
                class="text-blue-500 font-bold"
              ></Column>

              <Column header="1º">
                <template #body="slotProps">
                  <span class="text-yellow-500 font-bold">{{ slotProps.data.total_golds }}</span>
                </template>
              </Column>

              <Column header="2º">
                <template #body="slotProps">
                  <span class="text-gray-400 font-bold">{{ slotProps.data.total_silvers }}</span>
                </template>
              </Column>

              <Column header="3º">
                <template #body="slotProps">
                  <span class="text-amber-700 font-bold">{{ slotProps.data.total_bronzes }}</span>
                </template>
              </Column>

              <Column
                field="avg_position"
                header="Média Pos."
                style="width: 100px"
              >
                <template #body="slotProps">
                  <span class="avg-badge">{{ slotProps.data.avg_position || '-' }}</span>
                </template>
              </Column>

              <Column
                field="tournaments_played"
                header="Etapas"
                style="width: 80px"
              ></Column>
            </DataTable>
          </div>
        </section>

        <section class="history-section">
          <div class="section-header">
            <h2>Últimos Torneios</h2>
          </div>

          <div class="tournaments-list">
            <div
              v-if="tournaments.length === 0 && !isLoading"
              class="p-4 text-center text-gray-500 card"
            >
              Nenhum torneio realizado.
            </div>

            <div
              v-for="tourney in tournaments"
              :key="tourney.id"
              class="tournament-card"
              :class="{ 'expanded': expandedTournaments[tourney.id] }"
            >
              <div
                class="tourney-header-clickable"
                @click="toggleTournament(tourney.id)"
              >
                <div class="tourney-info">
                  <h4>{{ tourney.name }}</h4>
                  <div class="tourney-meta">
                    <span><i class="pi pi-calendar"></i> {{ formatDate(tourney.tournament_date) }}</span>
                    <span
                      class="status-badge"
                      :class="tourney.status"
                    >
                      {{ formatStatus(tourney.status) }}
                    </span>
                  </div>
                </div>
                <div class="expand-icon">
                  <i
                    class="pi"
                    :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
                  ></i>
                </div>
              </div>

              <div
                v-if="expandedTournaments[tourney.id]"
                class="tourney-details-body"
              >
                <div
                  v-if="tourney.results.length === 0"
                  class="text-center text-gray-400 py-3 text-sm"
                >
                  Nenhum jogador pontuou nesta etapa.
                </div>
                <div
                  v-else
                  class="results-inner-list"
                >
                  <div
                    v-for="res in tourney.results"
                    :key="res.player_name"
                    class="result-inner-row"
                  >
                    <div
                      class="inner-pos"
                      :class="`medal-${res.final_position}`"
                    >{{ res.final_position }}º</div>

                    <div class="inner-player">
                      <span class="inner-name">{{ res.player_name }}</span>
                      <span
                        v-if="res.deck_name"
                        class="inner-deck-name"
                      >
                        ({{ res.deck_name }})
                      </span>
                      <a
                        v-if="res.deck_url"
                        :href="res.deck_url"
                        target="_blank"
                        class="inner-deck-link"
                      >
                        <i class="pi pi-external-link"></i>
                        Ver Lista
                      </a>
                    </div>

                    <div class="inner-pts">{{ res.total_points }} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Dialog
      v-model:visible="showDeckInputModal"
      :header="`Comandante - Posição ${currentEditingDeckIndex !== null ? currentEditingDeckIndex + 1 : ''}º`"
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
              label="Confirmar"
              icon="pi pi-check"
              class="p-button-primary"
              @click="saveDeckInput"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showImportModal"
      header="Importar Torneio Passado"
      :style="{ width: '95vw', maxWidth: '1000px' }"
      modal
      :closable="!isSaving"
      class="workspace-dialog"
    >
      <div class="import-workspace">
        <div class="workspace-sidebar">
          <div class="info-card">
            <i class="pi pi-info-circle info-icon"></i>
            <div class="info-text">
              <strong>Atenção ao Histórico:</strong>
              <p>Preencha apenas as posições dos jogadores presentes.</p>
            </div>
          </div>

          <div class="control-panel">
            <h3 class="panel-title">1. Dados do Evento</h3>
            <div class="field w-full mb-3">
              <label class="font-bold text-sm block mb-2">Nome do Torneio</label>
              <InputText
                v-model="importData.name"
                placeholder="Ex: Etapa Inverno 2025"
                class="w-full"
              />
            </div>
            <div class="field w-full mb-4">
              <label class="font-bold text-sm block mb-2">Data Realizado</label>
              <InputText
                type="date"
                v-model="importData.date"
                class="w-full"
              />
            </div>

            <div class="divider"></div>

            <div class="quick-add-header">
              <h3 class="panel-title m-0">2. Faltou alguém?</h3>
              <p class="text-sm text-gray-500 mt-1 mb-3">Escale um novato aqui.</p>
            </div>

            <div class="flex flex-column gap-2">
              <InputText
                v-model="quickPlayerName"
                placeholder="Nome completo..."
                @keydown.enter="handleQuickAddPlayer"
                class="w-full"
              />
              <Button
                icon="pi pi-user-plus"
                label="Cadastrar e Escalar"
                class="p-button-secondary w-full"
                @click="handleQuickAddPlayer"
                :loading="isCreatingPlayer"
                :disabled="!quickPlayerName"
              />
            </div>
          </div>
        </div>

        <div class="workspace-main">
          <div class="main-header">
            <h3 class="panel-title m-0">3. Classificação Final</h3>
            <Button
              label="Mais Posições"
              icon="pi pi-plus"
              class="p-button-outlined p-button-sm"
              @click="addPlacement"
            />
          </div>

          <div class="placements-list-container">
            <div class="placements-grid">
              <div
                v-for="(placement, index) in importData.placements"
                :key="index"
                class="placement-card"
              >
                <div
                  class="placement-medal"
                  :class="getMedalClass(placement.position)"
                >
                  {{ placement.position }}º
                </div>

                <div class="placement-input-area flex align-items-center gap-2 w-full">
                  <Dropdown
                    v-model="placement.player_id"
                    :options="allPlayers"
                    optionLabel="name"
                    optionValue="id"
                    filter
                    showClear
                    placeholder="Selecione o jogador..."
                    emptyFilterMessage="Sem jogadores."
                    class="workspace-dropdown flex-1"
                  />
                  <Button
                    icon="pi pi-list"
                    class="p-button-rounded p-button-sm flex-shrink-0"
                    :class="(placement.deck_name || placement.deck_url) ? 'p-button-success' : 'p-button-secondary p-button-outlined'"
                    @click="openDeckInput(index)"
                    v-tooltip="(placement.deck_name || placement.deck_url) ? 'Editar Comandante' : 'Adicionar Comandante'"
                  />
                </div>

                <div class="placement-actions">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-text p-button-sm action-icon ml-2"
                    @click="removePlacement(index)"
                    v-tooltip="'Remover Posição'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="workspace-footer">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            @click="showImportModal = false"
            class="p-button-text p-button-secondary"
            :disabled="isSaving"
          />
          <Button
            label="Gravar no Histórico"
            icon="pi pi-save"
            @click="handleImport"
            :loading="isSaving"
            :disabled="!isImportValid"
            class="p-button-primary p-button-lg ml-3"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { api } from '../services/api'

const router = useRouter()
const toast = useToast()

const ranking = ref([])
const tournaments = ref([])
const allPlayers = ref([])
const isLoading = ref(true)

const showImportModal = ref(false)
const isSaving = ref(false)

const quickPlayerName = ref('')
const isCreatingPlayer = ref(false)

const expandedTournaments = ref({})

// Estado da Edição do Deck (Modal de Input)
const showDeckInputModal = ref(false)
const currentEditingDeckIndex = ref(null)
const tempDeckInfo = ref({ name: '', url: '' })

const importData = ref({
  name: '',
  date: new Date().toISOString().split('T')[0],
  placements: []
})

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  isLoading.value = true
  try {
    const [rankData, tourneysData, playersData] = await Promise.all([
      api.getLeagueRanking(),
      api.getLeagueTournaments(),
      api.getPlayers()
    ])
    ranking.value = rankData
    tournaments.value = tourneysData
    allPlayers.value = playersData
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados da liga', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

function toggleTournament(id) {
  expandedTournaments.value[id] = !expandedTournaments.value[id]
}

function openDeckInput(index) {
  currentEditingDeckIndex.value = index
  tempDeckInfo.value = {
    name: importData.value.placements[index].deck_name || '',
    url: importData.value.placements[index].deck_url || ''
  }
  showDeckInputModal.value = true
}

function clearTempDeck() {
  tempDeckInfo.value = { name: '', url: '' }
}

function saveDeckInput() {
  if (currentEditingDeckIndex.value !== null) {
    importData.value.placements[currentEditingDeckIndex.value].deck_name = tempDeckInfo.value.name.trim()
    importData.value.placements[currentEditingDeckIndex.value].deck_url = tempDeckInfo.value.url.trim()
  }
  showDeckInputModal.value = false
  toast.add({ severity: 'success', summary: 'Comandante Salvo', detail: 'Adicionado à posição.', life: 2000 })
}

function goBack() {
  router.push({ name: 'dashboard' })
}

function goToTournament() {
  router.push({ name: 'tournament' })
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatStatus(status) {
  const map = {
    'active': 'Ao Vivo',
    'finished': 'Finalizado',
    'imported': 'Importado',
    'pending': 'Pendente'
  }
  return map[status] || status
}

function getMedalClass(pos) {
  if (pos === 1) return 'medal-1'
  if (pos === 2) return 'medal-2'
  if (pos === 3) return 'medal-3'
  return 'medal-other'
}

function openImportModal() {
  importData.value = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    placements: Array.from({ length: 16 }, (_, i) => ({ position: i + 1, player_id: null, deck_name: '', deck_url: '' }))
  }
  quickPlayerName.value = ''
  showImportModal.value = true
}

function addPlacement() {
  const nextPos = importData.value.placements.length + 1
  importData.value.placements.push({ position: nextPos, player_id: null, deck_name: '', deck_url: '' })
}

function removePlacement(index) {
  importData.value.placements.splice(index, 1)
  importData.value.placements.forEach((p, i) => {
    p.position = i + 1
  })
}

async function handleQuickAddPlayer() {
  if (!quickPlayerName.value.trim()) return
  isCreatingPlayer.value = true
  try {
    const newPlayer = await api.createPlayer(quickPlayerName.value.trim())
    allPlayers.value.push(newPlayer)

    toast.add({ severity: 'success', summary: 'Sucesso', detail: `${newPlayer.name} pronto para ser escalado.`, life: 3000 })

    const emptySlot = importData.value.placements.find(p => !p.player_id)
    if (emptySlot) {
      emptySlot.player_id = newPlayer.id
    }

    quickPlayerName.value = ''
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar. Verifique se o nome não é duplicado.', life: 4000 })
  } finally {
    isCreatingPlayer.value = false
  }
}

const isImportValid = computed(() => {
  const hasName = importData.value.name.trim().length > 0
  const hasDate = !!importData.value.date
  const hasValidPlacements = importData.value.placements.some(p => p.player_id)

  const selectedIds = importData.value.placements.map(p => p.player_id).filter(id => id)
  const hasDuplicates = new Set(selectedIds).size !== selectedIds.length

  return hasName && hasDate && hasValidPlacements && !hasDuplicates
})

function getPointsForPosition(position) {
  if (position === 1) return 3
  if (position === 2) return 2
  if (position === 3) return 1
  return 0
}

async function handleImport() {
  isSaving.value = true
  try {
    const tourney = await api.createTournament(importData.value.name, importData.value.date, 'imported')

    const results = importData.value.placements
      .filter(p => p.player_id)
      .map(p => ({
        player_id: p.player_id,
        final_position: p.position,
        total_points: getPointsForPosition(p.position),
        golds: p.position === 1 ? 1 : 0,
        silvers: p.position === 2 ? 1 : 0,
        bronzes: p.position === 3 ? 1 : 0,
        deck_name: p.deck_name || null,
        deck_url: p.deck_url || null
      }))

    await api.saveResults(tourney.id, results)

    toast.add({ severity: 'success', summary: 'Histórico Salvo', detail: 'O torneio foi importado e o ranking atualizado!', life: 4000 })
    showImportModal.value = false
    await loadDashboardData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro de Importação', detail: 'Ocorreu um erro ao salvar o histórico.', life: 4000 })
  } finally {
    isSaving.value = false
  }
}

function copyPublicLink() {
  const leagueId = api.getLeagueId()
  const url = `${window.location.origin}/l/${leagueId}`

  navigator.clipboard.writeText(url).then(() => {
    toast.add({ severity: 'info', summary: 'Link Copiado!', detail: 'Envie para a galera no WhatsApp.', life: 3000 })
  }).catch(() => {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao copiar o link.', life: 3000 })
  })
}

function exportCSV() {
  if (!ranking.value || ranking.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Não há dados para exportar.', life: 3000 })
    return
  }

  let csvContent = "data:text/csv;charset=utf-8,"
  csvContent += "Posição,Jogador,Pontos,1º Lugar,2º Lugar,3º Lugar,Média de Posição,Etapas Jogadas\n"

  ranking.value.forEach((row, index) => {
    const pos = index + 1
    const rowData = [
      pos,
      `"${row.player_name}"`,
      row.league_points,
      row.total_golds,
      row.total_silvers,
      row.total_bronzes,
      row.avg_position || '-',
      row.tournaments_played
    ]
    csvContent += rowData.join(",") + "\n"
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `ranking_liga_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.add({ severity: 'success', summary: 'Download Iniciado', detail: 'Arquivo CSV gerado com sucesso.', life: 3000 })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');

.league-details-page {
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
  max-width: 1400px;
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

.title-area h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.action-btn {
  font-weight: 700;
  border-radius: 8px;
}

.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.avg-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.rank-position {
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 800;
  color: var(--text-secondary);
  font-size: 1.1rem;
  letter-spacing: -0.5px;
}

.pos-1 {
  color: #f59e0b;
  font-size: 1.25rem;
}

.pos-2 {
  color: #94a3b8;
}

.pos-3 {
  color: #b45309;
}

/* Torneios - Cartão Expansível */
.tournaments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tournament-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
  overflow: hidden;
}

.tournament-card:hover {
  border-color: var(--accent-primary);
}

.tournament-card.expanded {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.tourney-header-clickable {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  background: var(--bg-secondary);
}

.tourney-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.tourney-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.expand-icon i {
  color: var(--text-secondary);
  font-size: 1.1rem;
  transition: color 0.2s;
}

.tournament-card:hover .expand-icon i {
  color: var(--accent-primary);
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-badge.finished {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.imported {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-badge.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tourney-details-body {
  background: var(--bg-primary);
  border-top: 1px dashed var(--border-color);
  padding: 1rem;
}

.results-inner-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-inner-row {
  display: flex;
  align-items: flex-start;
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  gap: 1rem;
}

.inner-pos {
  width: 32px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.medal-1 {
  color: #b45309;
}

.medal-2 {
  color: #475569;
}

.medal-3 {
  color: #92400e;
}

.inner-player {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.inner-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.inner-pts {
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 0.95rem;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.1rem;
}

/* Workspace Importação */
:deep(.workspace-dialog .p-dialog-content) {
  padding: 0;
  overflow: hidden;
}

.import-workspace {
  display: flex;
  flex-direction: row;
  height: 70vh;
  min-height: 550px;
  background: var(--bg-primary);
}

.workspace-sidebar {
  width: 360px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.info-icon {
  color: #3b82f6;
  font-size: 1.25rem;
  margin-top: 0.15rem;
}

.info-text strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.info-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.control-panel {
  flex: 1;
}

.panel-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 2rem 0;
}

.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.main-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.placements-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.placements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
}

.placements-list-container::-webkit-scrollbar,
.workspace-sidebar::-webkit-scrollbar {
  width: 6px;
}

.placements-list-container::-webkit-scrollbar-thumb,
.workspace-sidebar::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

.placement-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.placement-card:hover {
  border-color: var(--text-secondary);
}

.placement-medal {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.placement-medal.medal-1 {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #b45309;
}

.placement-medal.medal-2 {
  background: rgba(148, 163, 184, 0.15);
  border-color: #94a3b8;
  color: #475569;
}

.placement-medal.medal-3 {
  background: rgba(180, 83, 9, 0.15);
  border-color: #b45309;
  color: #92400e;
}

.placement-medal.medal-other {
  opacity: 0.8;
}

.placement-input-area {
  flex: 1;
  min-width: 0;
}

.workspace-dropdown {
  width: 100%;
  border: none;
  background: transparent;
  box-shadow: none;
}

.workspace-dropdown:hover,
.workspace-dropdown:focus {
  border: none;
  box-shadow: none;
}

.action-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  padding: 0 !important;
}

.workspace-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding-top: 1rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .import-workspace {
    flex-direction: column;
    height: auto;
    max-height: 80vh;
  }

  .workspace-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 350px;
  }

  .workspace-main {
    overflow: visible;
  }

  .placements-list-container {
    max-height: 40vh;
  }
}

@media (max-width: 768px) {
  .placements-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .dashboard-main {
    padding: 1.5rem 1rem;
  }

  .workspace-footer {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .workspace-footer .p-button {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
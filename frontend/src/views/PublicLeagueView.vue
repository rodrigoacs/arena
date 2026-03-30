<template>
  <div class="public-league-page">

    <div
      v-if="isLoading"
      class="loading-container"
    >
      <i
        class="pi pi-spin pi-spinner"
        style="font-size: 3rem; color: var(--accent-primary)"
      ></i>
      <p>A carregar o campo de batalha...</p>
    </div>

    <div
      v-else-if="error"
      class="error-container"
    >
      <i class="pi pi-exclamation-triangle"></i>
      <h2>{{ error }}</h2>
      <p>Verifique se o link está correto.</p>
    </div>

    <template v-else>
      <header class="public-header">
        <div class="header-content">
          <div class="logo-area">
            <div class="logo-circle">
              <i class="pi pi-bolt logo-icon"></i>
            </div>
            <div>
              <h1>{{ league.name }}</h1>
              <span
                v-if="league.season"
                class="season-badge"
              >Temporada {{ league.season }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="public-main">
        <div class="content-grid">
          <div class="ranking-card card">
            <div class="card-header">
              <h2>🏆 Classificação Oficial</h2>
              <p>Atualizado em tempo real</p>
            </div>

            <DataTable
              :value="ranking"
              stripedRows
              responsiveLayout="scroll"
              class="public-table"
            >
              <template #empty>
                <div class="p-4 text-center text-gray-500">Nenhuma batalha foi travada nesta liga ainda.</div>
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
                header="Comandante"
                class="font-bold text-lg"
              ></Column>

              <Column
                field="league_points"
                header="Pontos"
                style="width: 90px"
              >
                <template #body="slotProps">
                  <span class="points-badge">{{ slotProps.data.league_points }}</span>
                </template>
              </Column>

              <Column header="1º">
                <template #body="slotProps">
                  <span class="text-yellow-500 font-bold text-lg">{{ slotProps.data.total_golds }}</span>
                </template>
              </Column>

              <Column header="2º">
                <template #body="slotProps">
                  <span class="text-gray-400 font-bold text-lg">{{ slotProps.data.total_silvers }}</span>
                </template>
              </Column>

              <Column header="3º">
                <template #body="slotProps">
                  <span class="text-amber-700 font-bold text-lg">{{ slotProps.data.total_bronzes }}</span>
                </template>
              </Column>

              <Column
                field="avg_position"
                header="Média"
                style="width: 100px"
              >
                <template #body="slotProps">
                  <span class="avg-badge">{{ slotProps.data.avg_position || '-' }}</span>
                </template>
              </Column>

              <Column
                field="tournaments_played"
                header="Jogos"
                style="width: 80px"
                class="text-gray-500"
              ></Column>
            </DataTable>
          </div>

          <div class="history-section mt-5">
            <div class="section-header mb-3">
              <h2 class="text-xl font-bold m-0">Últimos Confrontos & Meta Game</h2>
            </div>

            <div class="tournaments-list">
              <div
                v-if="tournaments.length === 0"
                class="p-4 text-center text-gray-500 card"
              >
                Nenhum torneio registado.
              </div>

              <div
                v-for="tourney in tournaments"
                :key="tourney.id"
                class="tournament-card card"
                :class="{ 'expanded': expandedTournaments[tourney.id] }"
              >
                <div
                  class="tourney-header-clickable"
                  @click="toggleTournament(tourney.id)"
                >
                  <div class="tourney-info">
                    <h4 class="font-bold m-0 mb-1">{{ tourney.name }}</h4>
                    <div class="tourney-meta text-sm text-gray-500">
                      <span><i class="pi pi-calendar mr-1"></i> {{ formatDate(tourney.tournament_date) }}</span>
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
                        <span class="inner-name font-bold">{{ res.player_name }}</span>

                        <div
                          v-if="res.deck_name"
                          class="mt-1"
                        >
                          <Button
                            icon="pi pi-list"
                            label="Ver Lista do Deck"
                            class="p-button-text p-button-sm p-0 text-blue-500 hover:text-blue-700"
                            @click="openDeckView(res.player_name, res.deck_name)"
                          />
                        </div>
                      </div>
                      <div class="inner-pts">{{ res.total_points }} pts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="public-footer">
          <p>Powered by <strong>Arena Manager</strong></p>
        </footer>
      </main>

      <Dialog
        v-model:visible="showDeckViewModal"
        :header="`Lista: ${deckViewPlayer}`"
        modal
        :style="{ width: '90vw', maxWidth: '500px' }"
      >
        <div class="deck-viewer">
          <pre class="deck-content">{{ deckViewContent }}</pre>
        </div>
        <template #footer>
          <Button
            label="Fechar"
            icon="pi pi-times"
            class="p-button-text"
            @click="showDeckViewModal = false"
          />
        </template>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()
const isLoading = ref(true)
const error = ref(null)

const league = ref({})
const ranking = ref([])
const tournaments = ref([])

const expandedTournaments = ref({})

// Estado do Deck View Modal
const showDeckViewModal = ref(false)
const deckViewPlayer = ref('')
const deckViewContent = ref('')

onMounted(async () => {
  const leagueId = route.params.id
  if (!leagueId) {
    error.value = 'Link inválido.'
    isLoading.value = false
    return
  }

  try {
    const data = await api.getPublicLeagueData(leagueId)
    league.value = data.league
    ranking.value = data.ranking
    tournaments.value = data.tournaments || []
  } catch (err) {
    error.value = err.message || 'Erro ao carregar a liga.'
  } finally {
    isLoading.value = false
  }
})

function toggleTournament(id) {
  expandedTournaments.value[id] = !expandedTournaments.value[id]
}

function openDeckView(playerName, decklist) {
  deckViewPlayer.value = playerName
  deckViewContent.value = decklist
  showDeckViewModal.value = true
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');

.public-league-page {
  min-height: 100vh;
  background-color: var(--bg-primary, #f8f9fa);
  font-family: var(--font-family);
}

.loading-container,
.error-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.error-container i {
  font-size: 4rem;
  color: #ef4444;
}

.public-header {
  background-color: var(--bg-secondary, #ffffff);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.logo-icon {
  font-size: 1.8rem;
  color: var(--accent-primary, #3b82f6);
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.logo-area h1 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.season-badge {
  display: inline-block;
  background: var(--bg-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.public-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.card {
  background: var(--bg-secondary, #ffffff);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.01);
}

.card-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.card-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Tabela Estilizada Pública */
:deep(.public-table .p-datatable-thead > tr > th) {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1.25rem 1rem;
}

:deep(.public-table .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.rank-position {
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 800;
  color: var(--text-secondary);
  font-size: 1.2rem;
  letter-spacing: -0.5px;
}

.pos-1 {
  color: #f59e0b;
  font-size: 1.5rem;
}

.pos-2 {
  color: #94a3b8;
  font-size: 1.3rem;
}

.pos-3 {
  color: #b45309;
  font-size: 1.3rem;
}

.points-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 800;
  font-size: 1.1rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.avg-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
  border: 1px solid var(--border-color);
}

/* Estilos de Torneios Expansíveis */
.tournaments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tournament-card {
  transition: all 0.2s;
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

.inner-pts {
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 0.95rem;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.1rem;
}

/* Modal de Decks */
.deck-viewer {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.deck-content {
  margin: 0;
  color: #d4d4d4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.public-footer {
  text-align: center;
  margin-top: 3rem;
  padding-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .public-header {
    padding: 1.5rem 1rem;
  }

  .logo-area h1 {
    font-size: 1.5rem;
  }

  .public-main {
    padding: 1.5rem 1rem;
  }

  .card-header {
    padding: 1.5rem;
  }
}
</style>
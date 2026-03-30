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
              header="Jogador"
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

        <footer class="public-footer">
          <p>Powered by <strong>Arena Manager</strong></p>
        </footer>
      </main>
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
  } catch (err) {
    error.value = err.message || 'Erro ao carregar a liga.'
  } finally {
    isLoading.value = false
  }
})
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
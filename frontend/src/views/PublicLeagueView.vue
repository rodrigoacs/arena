<template>
  <div class="public-league-page">
    <div
      v-if="isLoading"
      class="flex flex-column align-items-center justify-content-center h-screen text-gray-500"
    >
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-3"></i>
      <p>A carregar o campo de batalha...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-column align-items-center justify-content-center h-screen text-gray-500"
    >
      <i class="pi pi-exclamation-triangle text-red-500 text-5xl mb-3"></i>
      <h2 class="text-xl font-bold">{{ error }}</h2>
      <p>Verifique se o link está correto.</p>
    </div>

    <template v-else>
      <header class="ios-page-header px-4 pt-5 pb-3 text-center border-bottom-1 surface-border bg-white">
        <i class="pi pi-bolt text-blue-500 text-4xl mb-2"></i>
        <h1 class="ios-large-title text-center m-0">{{ league.name }}</h1>
        <span
          v-if="league.season"
          class="text-gray-500 text-sm font-medium mt-1"
        >Temporada {{ league.season }}</span>
      </header>

      <main
        class="max-w-content px-3 py-4"
        style="max-width: 900px; margin: 0 auto;"
      >

        <div class="ios-grouped-section mb-5">
          <div class="ios-grouped-label">🏆 CLASSIFICAÇÃO OFICIAL</div>
          <div
            class="ios-grouped-list bg-white"
            style="overflow-x: auto;"
          >
            <div
              v-if="ranking.length === 0"
              class="p-4 text-center text-gray-500"
            >Nenhuma batalha travada ainda.</div>
            <table
              v-else
              class="w-full text-left border-collapse"
              style="min-width: 600px;"
            >
              <thead>
                <tr class="bg-gray-50 border-bottom-1 surface-border text-xs text-gray-500 uppercase">
                  <th class="p-3 text-center">Pos</th>
                  <th class="p-3">Comandante</th>
                  <th class="p-3 text-center">Pontos</th>
                  <th class="p-3 text-center">1º</th>
                  <th class="p-3 text-center">2º</th>
                  <th class="p-3 text-center">3º</th>
                  <th class="p-3 text-center">Média</th>
                  <th class="p-3 text-center">Jogos</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in ranking"
                  :key="row.player_name"
                  class="border-bottom-1 surface-border last:border-none"
                >
                  <td
                    class="p-3 text-center font-bold"
                    :class="'text-pos-' + (index + 1)"
                  >{{ index + 1 }}º</td>
                  <td class="p-3 font-bold text-lg">{{ row.player_name }}</td>
                  <td class="p-3 text-center"><span class="bg-blue-50 text-blue-500 px-2 py-1 border-round font-bold">{{
                      row.league_points }}</span></td>
                  <td class="p-3 text-center text-yellow-500 font-bold text-lg">{{ row.total_golds }}</td>
                  <td class="p-3 text-center text-gray-400 font-bold text-lg">{{ row.total_silvers }}</td>
                  <td class="p-3 text-center text-orange-600 font-bold text-lg">{{ row.total_bronzes }}</td>
                  <td class="p-3 text-center"><span
                      class="bg-gray-100 text-gray-600 px-2 py-1 border-round text-xs font-bold"
                    >{{ row.avg_position || '-' }}</span></td>
                  <td class="p-3 text-center text-gray-500">{{ row.tournaments_played }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ios-grouped-section">
          <div class="ios-grouped-label">ÚLTIMOS CONFRONTOS & META GAME</div>
          <div
            v-if="tournaments.length === 0"
            class="ios-grouped-list p-4 text-center text-gray-500"
          >Nenhum torneio registado.</div>
          <div
            v-else
            class="flex flex-column gap-3"
          >
            <div
              v-for="tourney in tournaments"
              :key="tourney.id"
              class="ios-grouped-list bg-white"
            >
              <div
                class="ios-list-item cursor-pointer"
                @click="toggleTournament(tourney.id)"
              >
                <div class="flex flex-column">
                  <span class="font-bold text-lg">{{ tourney.name }}</span>
                  <span class="text-xs text-gray-500 mt-1"><i class="pi pi-calendar mr-1"></i> {{
                    formatDate(tourney.tournament_date) }}</span>
                </div>
                <i
                  class="pi text-gray-400"
                  :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
                ></i>
              </div>

              <div
                v-if="expandedTournaments[tourney.id]"
                class="p-3 bg-gray-50 border-top-1 surface-border"
              >
                <div
                  v-if="tourney.results.length === 0"
                  class="text-center text-gray-400 text-sm"
                >Sem resultados.</div>
                <div
                  v-else
                  class="flex flex-column gap-2"
                >
                  <div
                    v-for="res in tourney.results"
                    :key="res.player_name"
                    class="flex align-items-center bg-white p-2 border-round border-1 surface-border"
                  >
                    <div
                      class="font-bold w-2rem text-center text-lg"
                      :class="'text-pos-' + res.final_position"
                    >{{ res.final_position }}º</div>
                    <div class="flex-1 px-2 flex flex-column">
                      <span class="font-bold text-sm">{{ res.player_name }}</span>
                      <a
                        v-if="res.deck_url"
                        :href="res.deck_url"
                        target="_blank"
                        class="text-xs text-blue-500 no-underline mt-1 font-medium"
                      ><i class="pi pi-external-link"></i> {{ res.deck_name || 'Ver Lista' }}</a>
                      <span
                        v-else-if="res.deck_name"
                        class="text-xs text-gray-500 mt-1"
                      ><i class="pi pi-id-card"></i> {{ res.deck_name }}</span>
                    </div>
                    <div class="font-bold text-blue-500 text-sm bg-blue-50 px-2 py-1 border-round">{{ res.total_points
                      }} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5 text-gray-400 text-sm pb-4">
          Powered by <strong class="text-gray-500">Arena Manager</strong>
        </div>
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
const tournaments = ref([])
const expandedTournaments = ref({})

onMounted(async () => {
  const leagueId = route.params.id
  if (!leagueId) { error.value = 'Link inválido.'; isLoading.value = false; return }
  try {
    const data = await api.getPublicLeagueData(leagueId)
    league.value = data.league; ranking.value = data.ranking; tournaments.value = data.tournaments || []
  } catch (err) { error.value = err.message || 'Erro ao carregar a liga.' }
  finally { isLoading.value = false }
})

function toggleTournament(id) { expandedTournaments.value[id] = !expandedTournaments.value[id] }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '' }
</script>

<style scoped>
.h-screen {
  height: 100vh;
}

.text-4xl {
  font-size: 2.25rem;
}

.text-5xl {
  font-size: 3rem;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.align-items-center {
  align-items: center;
}

.justify-content-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-5 {
  margin-bottom: 2rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-5 {
  margin-top: 2rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-3 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-4 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.pt-5 {
  padding-top: 2.5rem;
}

.pb-3 {
  padding-bottom: 1rem;
}

.pb-4 {
  padding-bottom: 1.5rem;
}

.text-blue-500 {
  color: var(--system-blue);
}

.text-red-500 {
  color: var(--system-red);
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-yellow-500 {
  color: #f59e0b;
}

.text-orange-600 {
  color: #ea580c;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-xl {
  font-size: 1.25rem;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-bottom-1 {
  border-bottom: 1px solid var(--border-color);
}

.border-top-1 {
  border-top: 1px solid var(--border-color);
}

.border-1 {
  border: 1px solid var(--border-color);
}

.border-round {
  border-radius: 6px;
}

.surface-border {
  border-color: var(--border-color) !important;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1;
}

.w-2rem {
  width: 2rem;
}

.uppercase {
  text-transform: uppercase;
}

.no-underline {
  text-decoration: none;
}

.cursor-pointer {
  cursor: pointer;
}

.text-pos-1 {
  color: #f59e0b;
}

.text-pos-2 {
  color: #94a3b8;
}

.text-pos-3 {
  color: #b45309;
}

.text-pos-4 {
  color: #6b7280;
}

.last\:border-none:last-child {
  border-bottom: none !important;
}
</style>
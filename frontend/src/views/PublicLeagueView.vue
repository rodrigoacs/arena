<template>
  <div class="min-h-screen">
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center h-screen text-system-gray"
    >
      <i class="pi pi-spin pi-spinner text-4xl text-system-blue mb-4"></i>
      <p>Carregando o campo de batalha...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center h-screen text-system-gray px-4 text-center"
    >
      <i class="pi pi-exclamation-triangle text-system-red text-5xl mb-4"></i>
      <h2 class="text-xl font-bold">{{ error }}</h2>
      <p class="mt-2">Verifique se o link está correto.</p>
    </div>

    <template v-else>
      <header
        class="pt-10 pb-6 px-4 text-center border-b border-system-border dark:border-system-borderDark bg-system-card dark:bg-system-cardDark"
      >
        <i class="pi pi-bolt text-system-blue text-4xl mb-3"></i>
        <h1 class="text-3xl font-bold tracking-tight m-0">{{ league.name }}</h1>
        <p
          v-if="league.season"
          class="text-system-gray text-sm font-medium mt-2"
        >Temporada {{ league.season }}</p>
      </header>

      <main class="max-w-[900px] mx-auto px-4 py-8">
        <div class="ios-grouped-section mb-10">
          <div class="ios-grouped-label">🏆 CLASSIFICAÇÃO OFICIAL</div>
          <div class="ios-grouped-list overflow-x-auto">
            <div
              v-if="ranking.length === 0"
              class="p-6 text-center text-system-gray"
            >Nenhuma batalha travada ainda.</div>
            <table
              v-else
              class="w-full text-left border-collapse min-w-[600px]"
            >
              <thead>
                <tr
                  class="bg-black/5 dark:bg-white/5 border-b border-system-border dark:border-system-borderDark text-xs text-system-gray uppercase tracking-wide"
                >
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
                  class="border-b border-system-border dark:border-system-borderDark last:border-none"
                >
                  <td
                    class="p-3 text-center font-bold"
                    :class="index === 0 ? 'text-foil text-2xl drop-shadow-md' : index === 1 ? 'text-system-gray text-lg' : index === 2 ? 'text-[#b45309] text-lg' : 'text-system-gray'"
                  >{{ index + 1 }}º</td>
                  <td
                    class="p-3 font-bold text-lg whitespace-nowrap"
                    :class="index === 0 ? 'text-foil' : ''"
                  >{{ row.player_name }}</td>
                  <td class="p-3 text-center"><span
                      class="bg-system-blue/10 text-system-blue px-2 py-1 rounded font-bold"
                    >{{ row.league_points }}</span></td>
                  <td class="p-3 text-center text-mythic font-bold text-lg">{{ row.total_golds }}</td>
                  <td class="p-3 text-center text-rare font-bold text-lg">{{ row.total_silvers }}</td>
                  <td class="p-3 text-center text-uncommon font-bold text-lg">{{ row.total_bronzes }}</td>
                  <td class="p-3 text-center"><span
                      class="bg-system-bg dark:bg-black/20 text-system-gray px-2 py-1 rounded text-xs font-bold"
                    >{{ row.avg_position || '-' }}</span></td>
                  <td class="p-3 text-center text-system-gray">{{ row.tournaments_played }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ios-grouped-section">
          <div class="ios-grouped-label">ÚLTIMOS CONFRONTOS E META GAME</div>
          <div
            v-if="tournaments.length === 0"
            class="ios-grouped-list p-6 text-center text-system-gray"
          >Nenhum torneio registrado.</div>
          <div
            v-else
            class="flex flex-col gap-4"
          >
            <div
              v-for="tourney in tournaments"
              :key="tourney.id"
              class="ios-grouped-list"
            >
              <div
                class="ios-list-item cursor-pointer"
                @click="toggleTournament(tourney.id)"
              >
                <div class="flex flex-col">
                  <span class="font-bold text-lg">{{ tourney.name }}</span>
                  <span class="text-xs text-system-gray mt-1"><i class="pi pi-calendar mr-1"></i> {{
                    formatDate(tourney.tournament_date) }}</span>
                </div>
                <i
                  class="pi text-system-gray"
                  :class="expandedTournaments[tourney.id] ? 'pi-chevron-up' : 'pi-chevron-down'"
                ></i>
              </div>

              <div
                v-if="expandedTournaments[tourney.id]"
                class="p-4 bg-black/5 dark:bg-white/5 border-t border-system-border dark:border-system-borderDark"
              >
                <div
                  v-if="tourney.results.length === 0"
                  class="text-center text-system-gray text-sm"
                >Sem resultados.</div>
                <div
                  v-else
                  class="flex flex-col gap-2"
                >
                  <div
                    v-for="res in tourney.results"
                    :key="res.player_name"
                    class="flex items-center bg-system-card dark:bg-system-cardDark p-3 rounded-lg border border-system-border dark:border-system-borderDark"
                  >
                    <div
                      class="font-bold w-8 text-center text-lg"
                      :class="res.final_position === 1 ? 'text-system-orange' : res.final_position === 2 ? 'text-system-gray' : res.final_position === 3 ? 'text-[#b45309]' : 'text-system-gray'"
                    >{{ res.final_position }}º</div>
                    <div class="avatar-circle shadow-sm">{{ res.player_name.charAt(0) }}</div>
                    <div class="flex-1 px-3 flex flex-col min-w-0">
                      <span class="font-bold text-sm truncate">{{ res.player_name }}</span>
                      <a
                        v-if="res.deck_url"
                        :href="res.deck_url"
                        target="_blank"
                        class="text-xs text-system-blue hover:text-blue-700 no-underline mt-1 font-medium truncate"
                      ><i class="pi pi-external-link"></i> {{ res.deck_name || 'Ver Lista' }}</a>
                      <span
                        v-else-if="res.deck_name"
                        class="text-xs text-system-gray mt-1 truncate"
                      ><i class="pi pi-id-card"></i> {{ res.deck_name }}</span>
                    </div>
                    <div class="font-bold text-system-blue text-sm bg-system-blue/10 px-2 py-1 rounded">{{
                      res.total_points }} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-10 text-system-gray text-sm pb-8">
          Powered by <strong>Arena Manager</strong>
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
<template>
  <aside class="ios-ranking-drawer">
    <div class="ios-drawer-header">
      <h3>Classificação Ao Vivo</h3>
    </div>

    <div
      v-if="players.length === 0"
      class="ios-empty-state"
    >
      <div class="empty-icon-wrapper"><i class="pi pi-users"></i></div>
      <p>Adicione jogadores para ver o ranking</p>
    </div>

    <div
      v-else
      class="ios-rankings-content"
    >
      <div
        class="ios-grouped-list"
        style="border-radius: 8px;"
      >
        <div
          class="ios-list-item bg-gray-50 text-xs text-gray-500 font-bold uppercase"
          style="padding: 0.5rem 1rem;"
        >
          <span style="width: 30px; text-align: center;">#</span>
          <span class="flex-1 px-2">Jogador</span>
          <span
            class="font-bold"
            style="width: 35px; text-align: right;"
          >Pts</span>
          <span style="min-width: 70px; text-align: right;"><i
              class="pi pi-sort-alt"
              title="Desempates"
            ></i></span>
        </div>

        <div
          v-for="(player, index) in sortedPlayers"
          :key="player.id"
          class="ios-list-item"
        >
          <div
            class="font-bold text-center text-sm"
            :class="'text-pos-' + (index + 1)"
            style="width: 30px;"
          >{{ index + 1 }}</div>
          <div
            class="flex-1 px-2 font-medium text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis"
            :title="player.name"
            style="min-width: 0;"
          >{{ player.name }}</div>
          <div
            class="font-bold text-blue-500"
            style="width: 35px; text-align: right;"
          >{{ player.points || 0 }}</div>
          <div
            class="flex gap-2 justify-content-end text-xs font-bold text-gray-500"
            style="min-width: 70px;"
          >
            <span :title="`1º Lugares: ${(player.matches || []).filter(m => m.position === 1).length}`"><i
                class="pi pi-star-fill text-yellow-500 text-xs mr-1"
              ></i>{{(player.matches || []).filter(m => m.position === 1).length}}</span>
            <span :title="`2º Lugares: ${(player.matches || []).filter(m => m.position === 2).length}`"><i
                class="pi pi-star-fill text-gray-400 text-xs mr-1"
              ></i>{{(player.matches || []).filter(m => m.position === 2).length}}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useTournament } from '../composables/useTournament'
const { players, sortedPlayers } = useTournament()
</script>

<style scoped>
.ios-ranking-drawer {
  width: 350px;
  flex-shrink: 0;
  background-color: var(--bg-primary);
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
}

.ios-drawer-header {
  padding: 1.25rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.ios-drawer-header h3 {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  margin: 0;
  color: var(--text-primary);
}

.ios-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  flex: 1;
}

.empty-icon-wrapper {
  width: 70px;
  height: 70px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.empty-icon-wrapper i {
  font-size: 2rem;
  color: #9ca3af;
}

.ios-empty-state p {
  font-size: 0.9rem;
  font-weight: 500;
}

.ios-rankings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.ios-rankings-content::-webkit-scrollbar {
  width: 6px;
}

.ios-rankings-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
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

.justify-content-end {
  justify-content: flex-end;
}

.gap-2 {
  gap: 0.5rem;
}

.p-0 {
  padding: 0;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.m-0 {
  margin: 0;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.uppercase {
  text-transform: uppercase;
}

.text-center {
  text-align: center;
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

.text-yellow-500 {
  color: #f59e0b;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.white-space-nowrap {
  white-space: nowrap;
}

.overflow-hidden {
  overflow: hidden;
}

.text-overflow-ellipsis {
  text-overflow: ellipsis;
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

@media (max-width: 1024px) {
  .ios-ranking-drawer {
    width: 300px;
  }
}

@media (max-width: 992px) {
  .ios-ranking-drawer {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
    box-shadow: 20px 0 40px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 400px) {
  .ios-ranking-drawer {
    width: 85vw;
  }
}
</style>
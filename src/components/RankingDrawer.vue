<template>
  <aside class="ranking-drawer">
    <div class="drawer-header">
      <h3>Classificação</h3>
    </div>
    <div
      v-if="players.length === 0"
      class="empty-list"
    >
      <i class="pi pi-users"></i>
      <p>Adicione jogadores para ver o ranking</p>
    </div>
    <div
      v-else
      class="rankings-list"
    >
      <div class="ranking-item header">
        <span class="pos">#</span>
        <span class="name">Jogador</span>
        <span class="points">Pts</span>
        <span class="tiebreaks"><i
            class="pi pi-sort-alt"
            title="Critérios de Desempate (1º, 2º, 3º)"
          ></i></span>
      </div>
      <div
        v-for="(player, index) in sortedPlayers"
        :key="player.id"
        class="ranking-item"
      >
        <div class="pos">{{ index + 1 }}</div>
        <div
          class="name"
          :title="player.name"
        >{{ player.name }}</div>
        <div class="points">{{ player.points || 0 }}</div>
        <div class="tiebreaks">
          <span :title="`1º Lugares: ${(player.matches || []).filter(m => m.position === 1).length}`">
            <i class="pi pi-star-fill gold"></i> {{(player.matches || []).filter(m => m.position === 1).length}}
          </span>
          <span :title="`2º Lugares: ${(player.matches || []).filter(m => m.position === 2).length}`">
            <i class="pi pi-star-fill silver"></i> {{(player.matches || []).filter(m => m.position === 2).length}}
          </span>
          <span :title="`3º Lugares: ${(player.matches || []).filter(m => m.position === 3).length}`">
            <i class="pi pi-star-fill bronze"></i> {{(player.matches || []).filter(m => m.position === 3).length}}
          </span>
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
.ranking-drawer {
  width: 420px;
  flex-shrink: 0;
  background-color: var(--bg-secondary, #ffffff);
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color, #e5e7eb);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
  box-shadow: var(--shadow-sm);
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--bg-card, #ffffff);
}

.drawer-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  margin: 0;
  color: var(--text-primary);
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary, #6b7280);
  flex: 1;
}

.empty-list i {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.rankings-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.ranking-item:hover {
  background-color: var(--bg-primary);
}

.ranking-item.header {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
  z-index: 10;
  border-bottom: 2px solid var(--border-color);
  padding: 0.75rem 1.25rem;
}

.ranking-item .pos {
  font-weight: 800;
  font-size: 1.15rem;
  width: 35px;
  text-align: center;
  color: var(--text-secondary);
}

.ranking-item:nth-child(2) .pos {
  color: #f59e0b;
}

.ranking-item:nth-child(3) .pos {
  color: #94a3b8;
}

.ranking-item:nth-child(4) .pos {
  color: #b45309;
}

.ranking-item .name {
  flex: 1;
  font-weight: 600;
  padding: 0 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-item .points {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--accent-primary, #3b82f6);
  width: 50px;
  text-align: right;
}

.ranking-item .tiebreaks {
  display: flex;
  gap: 0.5rem;
  min-width: 110px;
  justify-content: flex-end;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.ranking-item .tiebreaks span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.tiebreaks .gold {
  color: #f59e0b;
}

.tiebreaks .silver {
  color: #94a3b8;
}

.tiebreaks .bronze {
  color: #b45309;
}

@media (max-width: 1024px) {
  .ranking-drawer {
    width: 340px;
  }
}

@media (max-width: 992px) {
  .ranking-drawer {
    position: fixed;
    top: 0;
    left: 0;
    width: 340px;
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 20px 0 40px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 400px) {
  .ranking-drawer {
    width: 85vw;
  }
}
</style>
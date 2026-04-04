<template>
  <aside class="ios-ranking-drawer">
    <div class="ios-drawer-header">
      <h3>Classificação</h3>
    </div>

    <div
      v-if="players.length === 0"
      class="ios-empty-state"
    >
      <div class="empty-icon-wrapper">
        <i class="pi pi-users"></i>
      </div>
      <p>Adicione jogadores para ver o ranking</p>
    </div>

    <div
      v-else
      class="ios-rankings-content"
    >
      <div class="apple-list-card">

        <div class="apple-list-header">
          <span class="col-pos">#</span>
          <span class="col-name">Jogador</span>
          <span class="col-pts">Pts</span>
          <span class="col-tiebreaks">
            <i
              class="pi pi-sort-alt"
              title="Critérios de Desempate (1º, 2º, 3º)"
            ></i>
          </span>
        </div>

        <div
          v-for="(player, index) in sortedPlayers"
          :key="player.id"
          class="apple-list-row"
        >
          <div
            class="col-pos"
            :class="`medal-${index + 1}`"
          >{{ index + 1 }}</div>

          <div
            class="col-name"
            :title="player.name"
          >
            {{ player.name }}
          </div>

          <div class="col-pts">{{ player.points || 0 }}</div>

          <div class="col-tiebreaks">
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
    </div>
  </aside>
</template>

<script setup>
import { useTournament } from '../composables/useTournament'

const { players, sortedPlayers } = useTournament()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800&display=swap');

.ios-ranking-drawer {
  width: 400px;
  flex-shrink: 0;
  background-color: var(--bg-primary, #f2f2f7);
  /* Fundo cinza claro típico da Apple */
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color, #e5e7eb);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
}

/* Cabeçalho com efeito de vidro (Blur) */
.ios-drawer-header {
  padding: 1.25rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  position: sticky;
  top: 0;
  z-index: 10;
}

.ios-drawer-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  margin: 0;
  color: var(--text-primary);
}

/* Estado Vazio Elegante */
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
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.empty-icon-wrapper i {
  font-size: 2.5rem;
  color: var(--text-tertiary, #9ca3af);
}

.ios-empty-state p {
  font-size: 0.95rem;
  font-weight: 500;
}

/* Container do Ranking */
.ios-rankings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Cartão da Lista Agrupada (Apple Inset Grouped List) */
.apple-list-card {
  background-color: var(--bg-secondary, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

/* Cabeçalho das Colunas */
.apple-list-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Linha de cada Jogador */
.apple-list-row {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.apple-list-row:last-child {
  border-bottom: none;
}

.apple-list-row:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

/* Sistema de Colunas */
.col-pos {
  width: 32px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-secondary);
}

.col-name {
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  padding: 0 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-pts {
  width: 45px;
  text-align: right;
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--accent-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  margin-right: 0.5rem;
}

.col-tiebreaks {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  min-width: 90px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.col-tiebreaks span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: help;
}

/* Estilos das Medalhas e Ícones */
.medal-1 {
  color: #f59e0b;
  font-size: 1.15rem;
}

.medal-2 {
  color: #94a3b8;
  font-size: 1.05rem;
}

.medal-3 {
  color: #b45309;
  font-size: 1.05rem;
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

/* Customização da Scrollbar para ficar invisível/elegante (estilo macOS) */
.ios-rankings-content::-webkit-scrollbar {
  width: 6px;
}

.ios-rankings-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

/* Responsividade */
@media (max-width: 1024px) {
  .ios-ranking-drawer {
    width: 340px;
  }
}

@media (max-width: 992px) {
  .ios-ranking-drawer {
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
  .ios-ranking-drawer {
    width: 85vw;
  }
}
</style>
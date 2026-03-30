<template>
  <div
    class="tournament-page"
    :class="{ 'drawer-open': isDrawerOpen }"
  >
    <Button
      icon="pi pi-bars"
      class="drawer-toggle p-button-rounded p-button-secondary p-button-outlined"
      @click="isDrawerOpen = !isDrawerOpen"
    />
    <div
      class="drawer-overlay"
      @click="isDrawerOpen = false"
    ></div>

    <RankingDrawer />

    <main class="main-content">
      <TournamentSetup v-if="!tournamentStarted" />
      <ActiveRound v-else />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTournament } from '../composables/useTournament'
import RankingDrawer from '../components/RankingDrawer.vue'
import TournamentSetup from '../components/TournamentSetup.vue'
import ActiveRound from '../components/ActiveRound.vue'

const isDrawerOpen = ref(false)
const { tournamentStarted } = useTournament()
</script>

<style scoped>
.tournament-page {
  --radius-lg: 20px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.12);
  --glass-bg: rgba(255, 255, 255, 0.7);

  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--bg-primary, #f8f9fa);
  color: var(--text-primary, #1f2937);
  font-family: inherit;
}

@media (prefers-color-scheme: dark) {
  .tournament-page {
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.4);
    --glass-bg: rgba(30, 30, 30, 0.8);
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 3rem;
  height: 100vh;
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background-color: var(--bg-card);
}

.drawer-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  height: 100%;
  flex: 1;
}

.empty-list i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: var(--border-color);
}

.empty-list p {
  font-size: 1rem;
}

.empty-list.small {
  height: auto;
  padding: 1.5rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  margin-top: 1.5rem;
  border: 1px dashed var(--border-color);
}

.empty-list.small p {
  font-size: 0.9rem;
}

.rankings-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.15s ease-out;
}

.ranking-item:hover {
  background-color: var(--bg-card);
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item.header {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
  z-index: 10;
  border-bottom: 2px solid var(--border-color);
}

.ranking-item .pos {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
  width: 45px;
  text-align: center;
  flex-shrink: 0;
}

.ranking-item.header .pos {
  font-size: 0.8rem;
  font-weight: 600;
}

.ranking-item .name {
  flex: 1;
  font-weight: 500;
  padding: 0 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-item .points {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-primary);
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.ranking-item.header .points {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.ranking-item .tiebreaks {
  display: flex;
  gap: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 125px;
  justify-content: flex-end;
  flex-shrink: 0;
  align-items: center;
}

.ranking-item .tiebreaks span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 30px;
  justify-content: flex-end;
}

.ranking-item .tiebreaks i {
  font-size: 0.85rem;
}

.ranking-item .tiebreaks .gold {
  color: #f59e0b;
}

.ranking-item .tiebreaks .silver {
  color: #a0aec0;
}

.ranking-item .tiebreaks .bronze {
  color: #cd7f32;
}

.ranking-item.header .tiebreaks {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  justify-content: center;
}

.ranking-item.header .tiebreaks i {
  cursor: help;
}

.setup-container {
  max-width: 900px;
  margin: 0 auto;
}

.setup-header {
  text-align: center;
  margin-bottom: 3rem;
}

.setup-header h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.setup-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.setup-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-card);
}

.card-header h2 {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  padding: 1.75rem;
}

.setup-controls {
  display: flex;
  gap: 1.75rem;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px dashed var(--border-color);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.p-inputgroup {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  align-items: center;
  gap: 1rem;
}

.p-inputgroup .p-button {
  border-radius: 0 8px 8px 0 !important;
}

.p-inputgroup .p-inputtext,
.p-inputgroup .p-inputnumber {
  border-radius: 8px 0 0 8px !important;
}

.add-player-group {
  flex-grow: 1;
}

.setup-controls .p-inputgroup .p-inputtext,
.setup-controls .p-inputgroup .p-inputnumber {
  width: 100%;
}

.setup-controls .p-inputgroup .p-button {
  flex-shrink: 0;
}

.setup-divider {
  display: none;
}

.setup-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
}

.player-list-container {
  max-height: 450px;
  overflow-y: auto;
  margin-bottom: 2.5rem;
}

:deep(.player-list-container .p-datatable .action-button) {
  color: var(--status-danger) !important;
}

:deep(.player-list-container .p-datatable .action-button:hover) {
  background-color: rgba(239, 68, 68, 0.1) !important;
}

.start-tournament {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.start-button {
  padding: 1rem 2.5rem;
  font-size: 1.15rem;
}

.start-tournament small {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.active-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.active-header h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.active-header h1 .round-total {
  background: none;
  -webkit-text-fill-color: var(--text-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 1.5rem;
}

.tournament-stats {
  display: flex;
  gap: 1.75rem;
  background-color: var(--bg-secondary);
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.tournament-stats span {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.tournament-stats span i {
  color: var(--accent-primary);
  font-size: 1.1rem;
}

.round-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

@keyframes pulse-orange {
  0% {
    box-shadow: 0 0 0 0 var(--accent-primary-glow);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(232, 93, 41, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(232, 93, 41, 0);
  }
}

.next-round-button:not(:disabled) {
  animation: pulse-orange 2s infinite;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
}

.table-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.25s ease-out;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.table-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 25px var(--accent-primary-glow);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-card);
}

.table-card-header h4 {
  font-size: 1.2rem;
  font-weight: 600;
}

.table-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.table-card.completed .table-status {
  color: var(--status-success);
  background-color: rgba(34, 197, 94, 0.1);
}

.table-card.pending .table-status {
  color: var(--status-warning);
  background-color: rgba(245, 158, 11, 0.1);
}

.table-card-players {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
  flex: 1;
}

.player-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-card);
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.player-chip span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-chip:hover {
  transform: scale(1.03);
  border-color: var(--text-secondary);
}

.player-chip i {
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.player-chip.winner {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  font-weight: 600;
  box-shadow: 0 0 10px var(--accent-primary-glow);
}

.player-chip.winner i {
  color: var(--accent-primary);
}

.player-pos {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--accent-primary);
  color: var(--accent-primary-text);
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-bottom-left-radius: 8px;
  border-top-right-radius: 8px;
}

.table-card-actions {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-card);
}

.table-card-actions .p-button {
  width: 100%;
}

.register-result-button:not(:disabled) {
  animation: pulse-orange 2s infinite 0.5s;
}

.edit-result-button {
  width: 100%;
}

.tournament-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-color);
}

.results-info {
  text-align: center;
  margin-bottom: 2rem;
}

.results-info strong {
  font-size: 1.35rem;
  font-weight: 600;
  display: block;
  color: var(--text-primary);
}

.results-info p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 0.35rem;
}

.results-dialog .field {
  margin-bottom: 1rem;
}

.results-dialog .p-inputgroup-addon {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.results-dialog .p-inputgroup-addon.player-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
}

.results-dialog .p-dropdown {
  flex: 0 0 130px;
}

.results-error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--status-warning);
  background-color: rgba(245, 158, 11, 0.1);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  text-align: left;
  margin-top: 2rem;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid var(--status-warning);
}

.results-error-message i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.confirmation-content {
  display: flex;
  align-items: center;
  text-align: left;
}

.confirmation-content i {
  font-size: 1.5rem !important;
  margin-right: 1rem;
  flex-shrink: 0;
}

.confirmation-content span {
  line-height: 1.5;
  color: var(--text-secondary);
}

:deep(.p-dialog[header="Confirmar Reinício"]) .confirmation-content i {
  color: var(--status-danger);
}

:deep(.p-dialog[header="Confirmar Finalização"]) .confirmation-content i {
  color: var(--accent-primary);
}

.final-results-content {
  text-align: center;
}

.winner-announcement {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.winner-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.winner-name .pi-crown {
  font-size: 1.5rem;
  color: #f59e0b;
}

.final-results-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.final-rankings-list {
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
}

.final-ranking-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.final-ranking-item:last-child {
  border-bottom: none;
}

.final-ranking-item.top-player {
  background-color: rgba(255, 255, 255, 0.03);
}

.final-pos {
  font-weight: 600;
  color: var(--text-secondary);
  width: 40px;
  flex-shrink: 0;
}

.final-name {
  flex: 1;
  color: var(--text-primary);
  padding: 0 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.final-points {
  font-weight: 500;
  color: var(--accent-primary);
}

.drawer-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: var(--bg-card, #ffffff) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color, #e5e7eb) !important;
  box-shadow: var(--shadow-md);
  width: 44px;
  height: 44px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 1024px) {
  .main-content {
    padding: 2rem;
  }
}

@media (max-width: 992px) {
  .tournament-page {
    display: block;
  }

  .main-content {
    padding: 1.5rem;
    padding-top: 5rem;
    height: auto;
    min-height: 100vh;
  }

  .drawer-toggle {
    display: flex;
  }

  .drawer-open .drawer-toggle {
    transform: translateX(350px);
  }

  .drawer-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--glass-bg);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .drawer-open .drawer-overlay {
    display: block;
    opacity: 1;
  }
}

@media (max-width: 400px) {
  .drawer-open .drawer-toggle {
    transform: translateX(calc(85vw + 10px));
  }

  .main-content {
    padding: 1rem;
    padding-top: 5rem;
  }
}
</style>
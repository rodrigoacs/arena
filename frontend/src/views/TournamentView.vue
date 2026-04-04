<template>
  <div
    class="tournament-page"
    :class="{ 'drawer-open': isDrawerOpen }"
  >
    <button
      class="drawer-toggle ios-icon-btn"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <i class="pi pi-bars"></i>
    </button>

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

/* COMPONENTES NATIVOS GERAIS PARA O APP */
:deep(.ios-icon-btn) {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  color: var(--text-primary);
}

:deep(.ios-icon-btn:hover) {
  background: rgba(0, 0, 0, 0.05);
}

.drawer-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-md);
  width: 44px;
  height: 44px;
  font-size: 1.2rem;
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
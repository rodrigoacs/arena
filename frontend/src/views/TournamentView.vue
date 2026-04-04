<template>
  <div
    class="tournament-page"
    :class="{ 'drawer-open': isDrawerOpen }"
  >
    <button
      class="drawer-toggle ios-icon-btn"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <i class="pi pi-bars text-xl text-blue-500"></i>
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
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  height: 100vh;
}

.drawer-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  width: 44px;
  height: 44px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-blue-500 {
  color: var(--system-blue);
}

.text-xl {
  font-size: 1.25rem;
}

@media (max-width: 992px) {
  .tournament-page {
    display: block;
  }

  .drawer-toggle {
    display: flex;
  }

  .drawer-open .drawer-toggle {
    transform: translateX(300px);
  }

  .drawer-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 39;
    opacity: 0;
    transition: opacity 0.3s;
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
}
</style>
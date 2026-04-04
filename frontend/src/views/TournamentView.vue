<template>
  <div class="flex w-full h-screen text-system-text overflow-hidden relative">

    <button
      class="lg:hidden absolute top-4 left-4 z-[1001] ios-icon-btn w-11 h-11 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md shadow-md"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <i class="pi pi-bars text-xl text-system-blue"></i>
    </button>

    <div
      v-if="isDrawerOpen"
      class="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[39] transition-opacity"
      @click="isDrawerOpen = false"
    ></div>

    <div
      :class="isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed lg:relative z-40 transition-transform duration-300 h-full w-[100vw] sm:w-[350px]"
    >
      <RankingDrawer />
    </div>

    <main class="flex-1 overflow-y-auto p-4 lg:p-10 pt-20 lg:pt-10 h-screen">
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
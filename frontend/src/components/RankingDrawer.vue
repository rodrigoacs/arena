<template>
  <aside
    class="w-full lg:w-[350px] shrink-0 bg-system-bg h-full flex flex-col border-r border-system-border dark:border-system-borderDark"
  >
    <div
      class="p-5 bg-system-card/80 dark:bg-system-cardDark/80 backdrop-blur-md border-b border-system-border dark:border-system-borderDark sticky top-0 z-10"
    >
      <h3 class="text-base font-bold uppercase tracking-wide text-center m-0 text-system-text">Classificação Ao Vivo
      </h3>
    </div>

    <div
      v-if="players.length === 0"
      class="flex flex-col items-center justify-center text-center p-12 text-system-gray flex-1"
    >
      <div
        class="w-[70px] h-[70px] bg-system-card dark:bg-system-cardDark rounded-full flex items-center justify-center mb-4 border border-system-border dark:border-system-borderDark"
      >
        <i class="pi pi-users text-3xl"></i>
      </div>
      <p class="text-sm font-medium">Adicione jogadores para ver o ranking</p>
    </div>

    <div
      v-else
      class="flex-1 overflow-y-auto p-4"
    >
      <div class="ios-grouped-list">
        <div class="ios-list-item bg-black/5 dark:bg-white/5 text-xs text-system-gray font-bold uppercase py-2">
          <span class="w-8 text-center">#</span>
          <span class="flex-1 px-2">Jogador</span>
          <span class="font-bold w-10 text-right">Pts</span>
          <span class="min-w-[70px] text-right"><i
              class="pi pi-sort-alt"
              title="Desempates"
            ></i></span>
        </div>

        <div
          v-for="(player, index) in sortedPlayers"
          :key="player.id"
          class="ios-list-item py-3"
        >
          <div
            class="font-bold text-center text-sm w-8"
            :class="index === 0 ? 'text-system-orange' : index === 1 ? 'text-system-gray' : index === 2 ? 'text-[#b45309]' : 'text-system-gray'"
          >{{ index + 1 }}</div>
          <div
            class="flex-1 px-2 font-medium text-sm truncate min-w-0"
            :title="player.name"
          >{{ player.name }}</div>
          <div class="font-bold text-system-blue w-10 text-right">{{ player.points || 0 }}</div>
          <div class="flex gap-2 justify-end text-xs font-bold text-system-gray min-w-[70px]">
            <span :title="`1º Lugares: ${(player.matches || []).filter(m => m.position === 1).length}`"><i
                class="pi pi-star-fill text-yellow-500 text-[10px] mr-1"
              ></i>{{(player.matches || []).filter(m => m.position === 1).length}}</span>
            <span :title="`2º Lugares: ${(player.matches || []).filter(m => m.position === 2).length}`"><i
                class="pi pi-star-fill text-system-gray text-[10px] mr-1"
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
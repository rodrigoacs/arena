<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition
        name="page-fade"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
useTheme()
</script>

<style>
.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
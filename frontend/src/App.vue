<template>
  <div class="app">
    <router-view />
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
</style>
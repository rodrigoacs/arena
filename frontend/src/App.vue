<template>
  <div class="app">
    <router-view />
    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
</script>

<style>
.app {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
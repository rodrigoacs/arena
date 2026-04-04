<template>
  <div class="login-page">
    <div
      v-if="toastMessage"
      class="ios-toast-container"
      :class="toastMessage.severity"
    >
      <div class="ios-toast-summary">{{ toastMessage.summary }}</div>
      <div class="ios-toast-detail">{{ toastMessage.detail }}</div>
    </div>

    <div class="login-container">
      <div class="login-header">
        <i
          class="pi pi-bolt text-blue-500"
          style="font-size: 3rem;"
        ></i>
        <h1>Arena Manager</h1>
        <p>Acesso Restrito</p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="ios-grouped-section"
      >
        <div class="ios-grouped-list">
          <div class="ios-list-item">
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="E-mail de acesso"
              required
              class="ios-input"
            />
          </div>
          <div class="ios-list-item">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Senha"
              required
              class="ios-input"
            />
          </div>
        </div>

        <button
          type="submit"
          class="ios-btn ios-btn-primary w-full mt-4"
          :disabled="isLoading"
        >
          <i
            v-if="isLoading"
            class="pi pi-spin pi-spinner"
          ></i>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()
const toastMessage = ref(null)
let toastTimeout = null

function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return
  isLoading.value = true
  try {
    await api.login(email.value, password.value)
    showToast({ severity: 'success', summary: 'Sucesso', detail: 'Sessão iniciada', life: 1000 })
    setTimeout(() => router.push({ name: 'dashboard' }), 500)
  } catch (error) {
    showToast({ severity: 'error', summary: 'Erro', detail: error.message || 'Credenciais inválidas' })
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
}

.login-container {
  width: 100%;
  max-width: 360px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.5rem 0 0.2rem;
  letter-spacing: -0.5px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.w-full {
  width: 100%;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
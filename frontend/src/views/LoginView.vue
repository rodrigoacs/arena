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

    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <i class="pi pi-bolt logo-icon"></i>
        </div>
        <h1>Arena Manager</h1>
        <p>Acesse o seu painel de organizador</p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <div class="form-group">
          <label for="email">E-mail</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope input-icon"></i>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@lajewars.com"
              required
              class="full-width-input ios-native-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Senha secreta</label>
          <div class="input-wrapper">
            <i class="pi pi-lock input-icon"></i>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="full-width-input ios-native-input"
            />
          </div>
        </div>

        <button
          type="submit"
          class="ios-btn ios-btn-primary login-btn"
          :disabled="isLoading"
        >
          <i
            v-if="isLoading"
            class="pi pi-spin pi-spinner"
          ></i>
          <i
            v-else
            class="pi pi-sign-in"
          ></i>
          <span v-if="!isLoading">Entrar na Arena</span>
          <span v-else>Entrando...</span>
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

// --- SISTEMA DE TOAST NATIVO ---
const toastMessage = ref(null)
let toastTimeout = null
function showToast(options) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = options
  toastTimeout = setTimeout(() => { toastMessage.value = null }, options.life || 3000)
}
// --------------------------------

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return

  isLoading.value = true
  try {
    await api.login(email.value, password.value)
    showToast({ severity: 'success', summary: 'Acesso Liberado', detail: 'Bem-vindo de volta!', life: 2000 })

    // Pequeno atraso para o organizador ler a mensagem de sucesso antes de mudar de ecrã
    setTimeout(() => {
      router.push({ name: 'dashboard' })
    }, 600)
  } catch (error) {
    showToast({ severity: 'error', summary: 'Acesso Negado', detail: error.message || 'Credenciais inválidas', life: 4000 })
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ==========================================================================
   LAYOUT GERAL
   ========================================================================== */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary, #f8f9fa);
  background-image: radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.08), transparent 60%);
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-secondary, #ffffff);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color, #e5e7eb);
}

/* ==========================================================================
   CABEÇALHO
   ========================================================================== */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-circle {
  width: 72px;
  height: 72px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.logo-icon {
  font-size: 2rem;
  color: var(--accent-primary, #3b82f6);
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.login-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #1f2937);
  letter-spacing: -0.5px;
}

.login-header p {
  color: var(--text-secondary, #6b7280);
  font-size: 1rem;
  margin: 0;
}

/* ==========================================================================
   FORMULÁRIO E INPUTS NATIVOS
   ========================================================================== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary, #374151);
  margin-left: 0.2rem;
}

.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  color: var(--text-secondary, #9ca3af);
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 2;
  transition: color 0.2s ease;
}

.ios-native-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
}

.full-width-input {
  width: 100%;
  padding-left: 3rem !important;
  padding-right: 1rem;
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.full-width-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.full-width-input:focus+.input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--accent-primary, #3b82f6);
}

/* ==========================================================================
   BOTÃO DE LOGIN NATIVO
   ========================================================================== */
.ios-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  font-family: inherit;
  cursor: pointer;
}

.ios-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ios-btn-primary {
  background: var(--accent-primary);
  color: white;
}

.ios-btn-primary:hover:not(:disabled) {
  filter: brightness(0.9);
}

.login-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.9rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
}

.login-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* ==========================================================================
   TOAST NATIVO
   ========================================================================== */
.ios-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--accent-primary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid var(--border-color);
  border-left-width: 4px;
}

.ios-toast-container.success {
  border-left-color: #10b981;
}

.ios-toast-container.error {
  border-left-color: #ef4444;
}

.ios-toast-summary {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.ios-toast-detail {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsividade Básica */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .ios-toast-container {
    left: 20px;
    right: 20px;
    top: 20px;
  }
}
</style>
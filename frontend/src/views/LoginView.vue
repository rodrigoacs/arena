<template>
  <div class="login-page">
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
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@lajewars.com"
              required
              class="full-width-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Senha secreta</label>
          <div class="input-wrapper">
            <i class="pi pi-lock input-icon"></i>
            <InputText
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="full-width-input"
            />
          </div>
        </div>

        <Button
          type="submit"
          label="Entrar na Arena"
          icon="pi pi-sign-in"
          class="p-button-lg login-btn"
          :loading="isLoading"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { api } from '../services/api'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()
const toast = useToast()

async function handleLogin() {
  if (!email.value || !password.value) return

  isLoading.value = true
  try {
    await api.login(email.value, password.value)
    toast.add({ severity: 'success', summary: 'Acesso Liberado', detail: 'Bem-vindo de volta!', life: 3000 })
    router.push({ name: 'dashboard' })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Acesso Negado', detail: error.message, life: 4000 })
  } finally {
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
   FORMULÁRIO E INPUTS BLINDADOS
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

/* Wrapper que segura o input e o ícone juntos */
.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* O ícone fica posicionado de forma absoluta dentro do wrapper */
.input-icon {
  position: absolute;
  left: 1.25rem;
  /* Distância da borda esquerda */
  color: var(--text-secondary, #9ca3af);
  font-size: 1.1rem;
  pointer-events: none;
  /* Permite clicar "através" do ícone para focar no input */
  z-index: 2;
  transition: color 0.2s ease;
}

/* O Input ocupa 100% do wrapper e empurra o texto para não ficar em cima do ícone */
.full-width-input {
  width: 100%;
  padding-left: 3rem !important;
  /* Espaço para o ícone respirar */
  padding-right: 1rem;
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* Efeito ao focar no input (muda a cor do ícone também) */
.full-width-input:focus+.input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--accent-primary, #3b82f6);
}

/* ==========================================================================
   BOTÃO DE LOGIN
   ========================================================================== */
.login-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.9rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

/* Responsividade Básica */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
}
</style>
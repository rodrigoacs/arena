import { ref, watchEffect } from 'vue'

const isDark = ref(false)
let initialized = false

export function useTheme() {
  if (!initialized) {
    const stored = localStorage.getItem('arena_theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    initialized = true

    watchEffect(() => {
      if (isDark.value) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('arena_theme', 'dark')
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('arena_theme', 'light')
      }
    })
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
}
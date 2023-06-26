import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppTheme } from '~/theme/theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<AppTheme | undefined>(undefined)
  const darkMode = ref(false)

  function setTheme(newTheme: AppTheme | undefined) {
    theme.value = newTheme
  }

  function setDarkMode(isDarkMode: boolean) {
    darkMode.value = isDarkMode
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  return {
    theme,
    darkMode,
    setTheme,
    setDarkMode,
    toggleDarkMode,
  }
})

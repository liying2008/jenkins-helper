import { defineStore } from 'pinia'
import type { AppTheme } from '~/theme'

export interface ThemeState {
  theme: AppTheme
  darkMode: boolean
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: undefined,
    darkMode: false,
  } as unknown as ThemeState),
  getters: {
  },
  actions: {
  },
})

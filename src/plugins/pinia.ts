import type { App } from 'vue'
import { createPinia } from 'pinia'

export function usePinia(app: App) {
  const pinia = createPinia()
  app.use(pinia)
}

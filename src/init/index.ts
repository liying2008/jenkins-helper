import { initTheme } from '@/theme'

export function initialize() {
  return Promise.all([initTheme()])
}

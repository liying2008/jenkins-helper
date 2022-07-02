import { initTheme } from '~/theme'

export function initialize() {
  return Promise.all([initTheme('default', false)])
  // TODO
  // return Promise.all([initTheme()])
}

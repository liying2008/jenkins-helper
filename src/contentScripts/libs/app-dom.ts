import { BUILD_SUBPAGE_INJECTOR_DOM_ID } from '../constants'

export function getRoot() {
  return document.querySelector(`#${BUILD_SUBPAGE_INJECTOR_DOM_ID}`)
}

export function getAppDiv() {
  const root = getRoot()
  if (!root) {
    return null
  }
  return root.querySelector('div[data-v-app]')
}

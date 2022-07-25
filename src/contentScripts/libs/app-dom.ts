import { BUILD_SUBPAGE_INJECTOR_DOM_ID } from '../constants'

export function getShadowRoot() {
  return document.querySelector(`#${BUILD_SUBPAGE_INJECTOR_DOM_ID}`)?.shadowRoot
}

export function getAppDiv() {
  const shadowRoot = getShadowRoot()
  if (!shadowRoot) {
    return null
  }
  return shadowRoot.querySelector('body div[data-v-app]')
}

import { onMounted } from 'vue'
import { getShadowRoot } from '~/contentScripts/libs/app-dom'

export function useMoveStyle() {
  onMounted(() => {
    const head = document.head
    const styles = head.querySelectorAll('style[cssr-id]')
    const shadowRoot = getShadowRoot()
    if (!shadowRoot) {
      return
    }
    const appHead = shadowRoot!.querySelector('head')!
    styles.forEach((style) => {
      const clone = style.cloneNode(true)
      appHead.appendChild(clone)
    })
    styles.forEach((style) => {
      style.remove()
    })
    // 移除 naive ui 向 body 注入的样式
    const bodyStyle = document.body.getAttribute('style') || ''
    const appBody = shadowRoot!.querySelector('body')!
    appBody.setAttribute('style', bodyStyle)
    document.body.setAttribute('style', '')
  })
}

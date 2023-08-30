export class BrowserUtils {
  /**
   * get current active tab
   * @returns current active tab
   */
  static async getCurrentTab() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    return tabs.length ? tabs[0] : null
  }

  /**
   * 获取元素相对于屏幕的坐标
   * @param e HTMLElement
   * @returns { x: number, y: number }
   */
  static getElementCoordinate(e: HTMLElement) {
    let actualLeft = e.offsetLeft
    let actualTop = e.offsetTop
    let current = e.offsetParent as HTMLElement | null
    while (current !== null) {
      actualLeft += (current.offsetLeft + current.clientLeft)
      actualTop += (current.offsetTop + current.clientTop)
      current = current.offsetParent as HTMLElement | null
    }
    return {
      x: actualLeft,
      y: actualTop,
    }
  }
}

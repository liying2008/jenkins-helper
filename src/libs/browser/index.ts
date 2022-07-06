export class BrowserUtils {
  static async getCurrentTab() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    return tabs.length ? tabs[0] : null
  }
}

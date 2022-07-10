// t is alias for browser.i18n.getMessage
export function t(messageName: string, substitutions?: string | string[] | undefined) {
  return browser.i18n.getMessage(messageName, substitutions)
}

// t is alias for chrome.i18n.getMessage
export function t(messageName: string, substitutions?: string | string[] | undefined) {
  return chrome.i18n.getMessage(messageName, substitutions)
}

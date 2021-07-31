import vuetify from '@/plugins/vuetify'

export interface Theme {
  // 主题名称
  name: string
  // 明亮配色
  light: ModeColor
  // 黑暗配色
  dark: ModeColor
}

export interface ModeColor {
  primary: string
  secondary: string
  accent: string
  success: string
  error: string
  warning: string
  info: string
  notbuilt: string
  aborted: string
  disabled: string
  title: string
  subtitle: string
  link: string
  buildingline: string
  disabledline: string
  offlineline: string
  monitoredline: string

  [name: string]: string
}

export function applyTheme(theme: Theme) {
  for (const key in theme.light) {
    vuetify.framework.theme.themes.light[key] = theme.light[key]
  }
  for (const key in theme.dark) {
    vuetify.framework.theme.themes.dark[key] = theme.dark[key]
  }
}

export function setDarkMode(darkMode: boolean) {
  vuetify.framework.theme.dark = darkMode
}

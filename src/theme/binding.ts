import type { GlobalThemeOverrides } from 'naive-ui'
import { useThemeStore } from '~/store'

export interface CustomTheme {
  custom: {
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
  }
}

export type AppTheme = GlobalThemeOverrides & CustomTheme

export interface Theme {
  // 主题名称
  name: string
  // 明亮配色
  light: AppTheme
  // 黑暗配色
  dark: AppTheme
}

export function applyTheme(theme: Theme, darkMode: boolean) {
  const themeStore = useThemeStore()

  if (darkMode) {
    for (const key in theme.dark.common) {
      document.documentElement.style.setProperty(`--jk-${key}`, theme.dark.common[key])
    }
    for (const key in theme.dark.custom) {
      document.documentElement.style.setProperty(`--jk-${key}`, theme.dark.custom[key])
    }
    themeStore.theme = theme.dark
  } else {
    for (const key in theme.light.common) {
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.common[key])
    }
    for (const key in theme.light.custom) {
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.custom[key])
    }
    themeStore.theme = theme.light
  }
  themeStore.darkMode = darkMode
}

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
    kbdColor: string
    kbdBgColor: string
    kbdBorderColor: string
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
  // console.log('applyTheme::theme=', theme, 'darkMode=', darkMode)
  const themeStore = useThemeStore()

  if (darkMode) {
    for (const key in theme.dark.common) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.dark.common[key])
    }
    for (const key in theme.dark.custom) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.dark.custom[key])
    }
    themeStore.theme = theme.dark
  } else {
    for (const key in theme.light.common) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.common[key])
    }
    for (const key in theme.light.custom) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.custom[key])
    }
    themeStore.theme = theme.light
  }
  themeStore.darkMode = darkMode
}

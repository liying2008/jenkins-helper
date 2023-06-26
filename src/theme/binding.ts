import type { Theme } from './theme'
import { useThemeStore } from '~/store'


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
    themeStore.setTheme(theme.dark)
  } else {
    for (const key in theme.light.common) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.common[key])
    }
    for (const key in theme.light.custom) {
      // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
      document.documentElement.style.setProperty(`--jk-${key}`, theme.light.custom[key])
    }
    themeStore.setTheme(theme.light)
  }
  themeStore.setDarkMode(darkMode)
}

export function applyThemeForContentScripts(theme: Theme) {
  for (const key in theme.light.common) {
    // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
    document.documentElement.style.setProperty(`--jk-${key}`, theme.light.common[key])
  }
  for (const key in theme.light.custom) {
    // @ts-expect-error subpressing No index signature with a parameter of type 'string' was found on type error
    document.documentElement.style.setProperty(`--jk-${key}`, theme.light.custom[key])
  }
}

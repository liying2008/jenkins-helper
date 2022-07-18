import type { Theme } from './theme'
import { applyTheme } from './binding'
import { coffeeTheme } from './theme_coffee'
import { defaultTheme } from './theme_default'
import { perillaTheme } from './theme_perilla'
import { sapphireTheme } from './theme_sapphire'
import type { Options } from '~/models/option'
import { StorageService } from '~/libs/storage'

// 当前支持的主题
const supportThemes = new Map<string, Theme>()
supportThemes.set(defaultTheme.name, defaultTheme)
supportThemes.set(sapphireTheme.name, sapphireTheme)
supportThemes.set(perillaTheme.name, perillaTheme)
supportThemes.set(coffeeTheme.name, coffeeTheme)

export async function initTheme(themeName?: string, enableDarkMode?: boolean) {
  let options: Options | undefined
  if (!themeName) {
    // console.time('initTheme:getOption')
    options = await StorageService.getOptions()
    // console.timeEnd('initTheme:getOption')
    themeName = options.currentTheme
  }
  // console.log('themeName', themeName)
  if (enableDarkMode === undefined) {
    if (options === undefined) {
      options = await StorageService.getOptions()
    }
    enableDarkMode = options.enableDarkMode
  }
  // console.log('enableDarkMode', enableDarkMode)

  // console.time('initTheme:applyTheme')
  const theme = supportThemes.get(themeName) || defaultTheme
  applyTheme(theme, enableDarkMode)
  // console.timeEnd('initTheme:applyTheme')
}

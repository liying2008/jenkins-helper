import { StorageService } from '@/libs/storage'
import { Options } from '@/models/option'
import { applyTheme, setDarkMode, Theme } from './binding'
import { defaultTheme } from './theme_default'

// 当前支持的主题
const supportThemes = new Map<string, Theme>()
supportThemes.set(defaultTheme.name, defaultTheme)

export async function initTheme(themeName?: string, enableDarkMode?: boolean) {
  let options: Options | undefined = undefined
  if (!themeName) {
    console.time('initTheme:getOption')
    options = await StorageService.getOptions()
    console.timeEnd('initTheme:getOption')
    console.time('initTheme:applyTheme')
    themeName = options.currentTheme
  }
  console.log('themeName', themeName)
  applyTheme(supportThemes.get(themeName) || defaultTheme)

  if (enableDarkMode === undefined) {
    if (options === undefined) {
      options = await StorageService.getOptions()
    }
    enableDarkMode = options.enableDarkMode
  }
  console.log('enableDarkMode', enableDarkMode)
  setDarkMode(enableDarkMode)
  console.timeEnd('initTheme:applyTheme')
}

import { StorageService } from '@/libs/storage'
import { applyTheme, setDarkMode, Theme } from './binding'
import { defaultTheme } from './theme_default'

// 当前支持的主题
const supportThemes = new Map<string, Theme>()
supportThemes.set(defaultTheme.name, defaultTheme)

export async function initTheme() {
  console.time('initTheme:getOption')
  const options = await StorageService.getOptions()
  console.timeEnd('initTheme:getOption')
  console.time('initTheme:applyTheme')
  const currentTheme = options.currentTheme
  console.log('currentTheme', currentTheme)
  applyTheme(supportThemes.get(currentTheme) || defaultTheme)

  const enableDarkMode = options.enableDarkMode
  console.log('enableDarkMode', enableDarkMode)
  setDarkMode(enableDarkMode)
  console.timeEnd('initTheme:applyTheme')
}

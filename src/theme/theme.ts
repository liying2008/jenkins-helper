import type { GlobalThemeOverrides } from 'naive-ui'

export interface CustomTheme {
  success: string
  error: string
  warning: string
  notbuilt: string
  aborted: string
  disabled: string
  title: string
  subtitle: string
  subtitle2: string
  link: string
  buildingline: string
  disabledline: string
  offlineline: string
  monitoredline: string
  kbdColor: string
  kbdBgColor: string
  kbdBorderColor: string
}

export type AppTheme = GlobalThemeOverrides & { custom: Partial<CustomTheme> }

export interface Theme {
  // 主题名称
  name: string
  // 明亮配色
  light: AppTheme
  // 黑暗配色
  dark: AppTheme
}

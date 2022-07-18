import rfdc from 'rfdc'
import type { GlobalThemeOverrides } from 'naive-ui'
import type { CustomTheme, Theme } from './theme'
import colors from './colors'

export interface BaseTheme {
  // 明亮配色
  light: GlobalThemeOverrides & { custom: CustomTheme }
  // 黑暗配色
  dark: GlobalThemeOverrides & { custom: CustomTheme }
}


export const baseTheme: BaseTheme = {
  light: {
    common: {
      infoColor: colors.blue.base,
      infoColorHover: colors.blue.lighten1,
      infoColorPressed: colors.blue.darken1,
      infoColorSuppl: colors.blue.lighten1,
      successColor: colors.green.base,
      successColorHover: colors.green.lighten1,
      successColorPressed: colors.green.darken1,
      successColorSuppl: colors.green.lighten1,
      warningColor: colors.orange.base,
      warningColorHover: colors.orange.lighten1,
      warningColorPressed: colors.orange.darken1,
      warningColorSuppl: colors.orange.lighten1,
      errorColor: colors.red.base,
      errorColorHover: colors.red.lighten1,
      errorColorPressed: colors.red.darken1,
      errorColorSuppl: colors.red.lighten1,
    },
    DataTable: {
      thFontWeight: '600',
      fontSizeSmall: '13px',
      lineHeight: '1.4',
      thPaddingSmall: '6px',
      tdPaddingSmall: '6px',
      sorterSize: '13px',
      filterSize: '13px',
    },
    custom: {
      notbuilt: colors.blue.base,
      aborted: colors.brown.base,
      disabled: colors.grey.base,
      title: colors.grey.darken4,
      subtitle: colors.grey.base,
      link: colors.teal.base,
      buildingline: '#b0e0e6',
      disabledline: '#e6e6e6',
      offlineline: '#e6e6e6',
      monitoredline: '#d2e7ca',
      kbdColor: '#24292f',
      kbdBgColor: '#f6f8fa',
      kbdBorderColor: 'rgb(175 184 193 / 20%)',
    },
  },
  dark: {
    common: {
      infoColor: colors.blue.darken3,
      infoColorHover: colors.blue.darken2,
      infoColorPressed: colors.blue.darken4,
      infoColorSuppl: colors.blue.darken2,
      successColor: colors.green.darken3,
      successColorHover: colors.green.darken2,
      successColorPressed: colors.green.darken4,
      successColorSuppl: colors.green.darken2,
      warningColor: colors.orange.darken3,
      warningColorHover: colors.orange.darken2,
      warningColorPressed: colors.orange.darken4,
      warningColorSuppl: colors.orange.darken2,
      errorColor: colors.red.darken3,
      errorColorHover: colors.red.darken2,
      errorColorPressed: colors.red.darken4,
      errorColorSuppl: colors.red.darken2,
    },
    DataTable: {
      thFontWeight: '600',
      fontSizeSmall: '13px',
      lineHeight: '1.4',
      thPaddingSmall: '6px',
      tdPaddingSmall: '6px',
      sorterSize: '13px',
      filterSize: '13px',
    },
    custom: {
      notbuilt: colors.blue.darken4,
      aborted: colors.brown.darken1,
      disabled: colors.grey.darken1,
      title: colors.grey.lighten1,
      subtitle: colors.grey.darken1,
      link: '#0a756b',
      buildingline: '#2d4e52',
      disabledline: '#3e3e3e',
      offlineline: '#404040',
      monitoredline: '#1f3b12',
      kbdColor: '#c9d1d9',
      kbdBgColor: '#161b22',
      kbdBorderColor: 'rgb(110 118 129 / 40%)',
    },
  },
}


export function extend(newProps: Theme) {
  const clone = rfdc()
  const cloned = clone(baseTheme) as Theme
  for (const k1 in newProps) {
    if (k1 === 'name') {
      cloned[k1] = newProps[k1]
    } else if (k1 === 'light' || k1 === 'dark') {
      for (const k2 in newProps[k1]) {
        // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'AppTheme'.
        for (const k3 in newProps[k1][k2]) {
          // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'AppTheme'.
          cloned[k1][k2][k3] = newProps[k1][k2][k3]
        }
      }
    }
  }
  // console.log('cloned', cloned)
  return cloned
}

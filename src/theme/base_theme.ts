import rfdc from 'rfdc'
import type { GlobalThemeOverrides } from 'naive-ui'
import type { CustomTheme, Theme } from './theme'

export interface BaseTheme {
  // 明亮配色
  light: GlobalThemeOverrides & { custom: CustomTheme }
  // 黑暗配色
  dark: GlobalThemeOverrides & { custom: CustomTheme }
}


export const baseTheme: BaseTheme = {
  light: {
    common: {
      primaryColor: '#18a058',
      primaryColorHover: '#36ad6a',
      primaryColorPressed: '#0c7a43',
      primaryColorSuppl: '#36ad6a',
      infoColor: '#2080f0',
      infoColorHover: '#4098fc',
      infoColorPressed: '#1060c9',
      infoColorSuppl: '#4098fc',
      successColor: '#18a058',
      successColorHover: '#36ad6a',
      successColorPressed: '#0c7a43',
      successColorSuppl: '#36ad6a',
      warningColor: '#f0a020',
      warningColorHover: '#fcb040',
      warningColorPressed: '#c97c10',
      warningColorSuppl: '#fcb040',
      errorColor: '#d03050',
      errorColorHover: '#de576d',
      errorColorPressed: '#ab1f3f',
      errorColorSuppl: '#de576d',
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
      success: '#18a058',
      error: '#d03050',
      warning: '#f0a020',
      notbuilt: '#2080f0',
      aborted: '#a9735f',
      disabled: '#8b8b8b',
      title: '#262626',
      subtitle: '#9e9e9e',
      link: '#1f9258',
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
      primaryColor: '#63e2b7',
      primaryColorHover: '#36ad6a',
      primaryColorPressed: '#5acea7',
      primaryColorSuppl: '#2a947d',
      infoColor: '#70c0e8',
      infoColorHover: '#8acbec',
      infoColorPressed: '#66afd3',
      infoColorSuppl: '#3889c5',
      successColor: '#63e2b7',
      successColorHover: '#7fe7c4',
      successColorPressed: '#5acea7',
      successColorSuppl: '#2a947d',
      warningColor: '#f2c97d',
      warningColorHover: '#f5d599',
      warningColorPressed: '#e6c260',
      warningColorSuppl: '#f08a00',
      errorColor: '#e88080',
      errorColorHover: '#e98b8b',
      errorColorPressed: '#e57272',
      errorColorSuppl: '#d03a52',
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
      success: '#248766',
      error: '#c14141',
      warning: '#b78323',
      notbuilt: '#2160a1',
      aborted: '#855748',
      disabled: '#686868',
      title: '#bdbdbd',
      subtitle: '##757575',
      link: '#4dbc96',
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

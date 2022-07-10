import type { Theme } from './binding'
import colors from './colors'

export const defaultTheme: Theme = {
  name: 'default',
  light: {
    common: {
      primaryColor: colors.teal.base,
      primaryColorHover: colors.teal.lighten1,
      primaryColorPressed: colors.teal.darken1,
      primaryColorSuppl: colors.teal.lighten1,
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
    },
  },
  dark: {
    common: {
      primaryColor: colors.teal.darken2,
      primaryColorHover: colors.teal.darken1,
      primaryColorPressed: colors.teal.darken3,
      primaryColorSuppl: colors.teal.darken1,
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
    custom: {
      notbuilt: colors.blue.darken4,
      aborted: colors.brown.darken1,
      disabled: colors.grey.darken1,
      title: colors.grey.lighten1,
      subtitle: colors.grey.darken1,
      link: colors.teal.base,
      buildingline: '#2d4e52',
      disabledline: '#3e3e3e',
      offlineline: '#404040',
      monitoredline: '#1f3b12',
    },
  },
}

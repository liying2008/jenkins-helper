import type { Theme } from './binding'
import colors from './colors'

export const perillaTheme: Theme = {
  name: 'perilla',
  light: {
    common: {
      primaryColor: colors.purple.base,
      primaryColorHover: colors.purple.lighten1,
      primaryColorPressed: colors.purple.darken2,
      primaryColorSuppl: colors.purple.lighten1,
      infoColor: colors.blue.darken2,
      infoColorHover: colors.blue.darken1,
      infoColorPressed: colors.blue.darken3,
      infoColorSuppl: colors.blue.darken1,
      successColor: colors.green.darken2,
      successColorHover: colors.green.darken1,
      successColorPressed: colors.green.darken3,
      successColorSuppl: colors.green.darken1,
      warningColor: colors.orange.darken2,
      warningColorHover: colors.orange.darken1,
      warningColorPressed: colors.orange.darken3,
      warningColorSuppl: colors.orange.darken1,
      errorColor: colors.red.darken2,
      errorColorHover: colors.red.darken1,
      errorColorPressed: colors.red.darken3,
      errorColorSuppl: colors.red.darken1,
    },
    custom: {
      notbuilt: colors.blue.darken2,
      aborted: colors.brown.base,
      disabled: colors.grey.darken1,
      title: colors.grey.darken4,
      subtitle: colors.grey.base,
      link: colors.brown.base,
      buildingline: '#b0e0e6',
      disabledline: '#d6d6d6',
      offlineline: '#d6d6d6',
      monitoredline: '#dff0d8',
    },
  },
  dark: {
    common: {
      primaryColor: colors.purple.darken3,
      primaryColorHover: colors.purple.darken2,
      primaryColorPressed: colors.purple.darken4,
      primaryColorSuppl: colors.purple.darken2,
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
      link: colors.brown.base,
      buildingline: '#2d4e52',
      disabledline: '#4a4a4a',
      offlineline: '#404040',
      monitoredline: '#174802',
    },
  },
}

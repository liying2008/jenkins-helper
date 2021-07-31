import { colors } from 'vuetify/lib'
import { Theme } from './binding'

// Coffee Theme
export const coffeeTheme: Theme = {
  name: 'coffee',
  light: {
    primary: colors.brown.base,
    secondary: colors.brown.lighten4,
    accent: colors.brown.lighten4,
    success: colors.green.darken2,
    error: colors.red.darken2,
    warning: colors.orange.darken2,
    info: colors.blue.darken2,
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
  dark: {
    primary: colors.brown.darken4,
    secondary: colors.brown.lighten2,
    accent: colors.brown.lighten1,
    success: colors.green.darken4,
    error: colors.red.darken4,
    warning: colors.orange.darken4,
    info: colors.blue.darken4,
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
  }
}

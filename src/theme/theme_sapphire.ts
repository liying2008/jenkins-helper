import type { Theme } from './theme'
import colors from './colors'
import { extend } from './base_theme'

export const sapphireTheme: Theme = extend({
  name: 'sapphire',
  light: {
    common: {
      primaryColor: colors.blue.base,
      primaryColorHover: colors.blue.lighten1,
      primaryColorPressed: colors.blue.darken2,
      primaryColorSuppl: colors.blue.lighten1,
    },
    custom: {
      link: colors.blue.base,
    },
  },
  dark: {
    common: {
      primaryColor: colors.blue.darken3,
      primaryColorHover: colors.blue.darken2,
      primaryColorPressed: colors.blue.darken4,
      primaryColorSuppl: colors.blue.darken2,
    },
    custom: {
      link: '#1872bb',
    },
  },
})

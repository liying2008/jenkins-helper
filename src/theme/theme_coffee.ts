import type { Theme } from './theme'
import colors from './colors'
import { extend } from './base_theme'

export const coffeeTheme: Theme = extend({
  name: 'coffee',
  light: {
    common: {
      primaryColor: colors.brown.base,
      primaryColorHover: colors.brown.lighten1,
      primaryColorPressed: colors.brown.darken2,
      primaryColorSuppl: colors.brown.lighten1,
    },
    custom: {
      link: colors.brown.base,
    },
  },
  dark: {
    common: {
      primaryColor: colors.brown.darken3,
      primaryColorHover: colors.brown.darken2,
      primaryColorPressed: colors.brown.darken4,
      primaryColorSuppl: colors.brown.darken2,
    },
    custom: {
      link: colors.brown.base,
    },
  },
})

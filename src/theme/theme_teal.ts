import type { Theme } from './theme'
import colors from './colors'
import { extend } from './base_theme'

export const tealTheme: Theme = extend({
  name: 'teal',
  light: {
    common: {
      primaryColor: colors.teal.base,
      primaryColorHover: colors.teal.lighten1,
      primaryColorPressed: colors.teal.darken1,
      primaryColorSuppl: colors.teal.lighten1,
    },
    custom: {
      link: colors.teal.base,
    },
  },
  dark: {
    common: {
      primaryColor: colors.teal.darken2,
      primaryColorHover: colors.teal.darken1,
      primaryColorPressed: colors.teal.darken3,
      primaryColorSuppl: colors.teal.darken1,
    },
    custom: {
      link: '#0a756b',
    },
  },
})

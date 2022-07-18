import type { Theme } from './theme'
import colors from './colors'
import { extend } from './base_theme'

export const perillaTheme: Theme = extend({
  name: 'perilla',
  light: {
    common: {
      primaryColor: colors.purple.base,
      primaryColorHover: colors.purple.lighten1,
      primaryColorPressed: colors.purple.darken2,
      primaryColorSuppl: colors.purple.lighten1,
    },
    custom: {
      link: colors.purple.base,
    },
  },
  dark: {
    common: {
      primaryColor: colors.purple.darken3,
      primaryColorHover: colors.purple.darken2,
      primaryColorPressed: colors.purple.darken4,
      primaryColorSuppl: colors.purple.darken2,
    },
    custom: {
      link: '#7e278d',
    },
  },
})

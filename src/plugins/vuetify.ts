import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: colors.teal.base,
        secondary: colors.teal.lighten4,
        accent: colors.teal.accent1,
        success: colors.green.darken2,
        error: colors.red.darken2,
        warning: colors.orange.darken2,
        info: colors.blue.darken2,
      },
      dark: {
        primary: colors.teal.base,
        secondary: colors.teal.lighten4,
        accent: colors.teal.accent1,
        success: colors.green.darken2,
        error: colors.red.darken2,
        warning: colors.orange.darken2,
        info: colors.blue.darken2,
      }
    }
  }
})

export default vuetify

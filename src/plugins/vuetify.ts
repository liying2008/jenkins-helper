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
    dark: false,
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
        primary: colors.teal.darken3,
        secondary: colors.teal.lighten2,
        accent: colors.teal.accent3,
        success: colors.green.darken3,
        error: colors.red.darken3,
        warning: colors.orange.darken3,
        info: colors.blue.darken3,
      }
    }
  }
})

export default vuetify

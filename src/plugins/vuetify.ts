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
        title: colors.grey.darken4,
        subtitle: colors.grey.base,
        link: colors.teal.base,
        buildingline: '#b0e0e6',
        disabledline: '#d6d6d6',
      },
      dark: {
        primary: colors.teal.darken4,
        secondary: colors.teal.lighten2,
        accent: colors.teal.accent3,
        success: colors.green.darken4,
        error: colors.red.darken4,
        warning: colors.orange.darken4,
        info: colors.blue.darken4,
        title: colors.grey.lighten1,
        subtitle: colors.grey.darken1,
        link: colors.teal.base,
        buildingline: '#2d4e52',
        disabledline: '#4a4a4a',
      }
    },
    options: {
      customProperties: true
    }
  }
})

export default vuetify

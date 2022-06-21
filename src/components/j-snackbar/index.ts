import type { App } from 'vue'
import JSnackbarComponent from './JSnackbar.vue'

const JSnackbar = {
  install(app: App) {
    app.component('JSnackbar', JSnackbarComponent)
  },
}

export default JSnackbar

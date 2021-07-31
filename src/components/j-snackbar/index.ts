import { VueConstructor } from 'vue'
import JSnackbarComponent from './JSnackbar.vue'


const JSnackbar = {
  install: function (Vue: VueConstructor) {
    Vue.component('j-snackbar', JSnackbarComponent)
  }
}

export default JSnackbar

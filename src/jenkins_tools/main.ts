import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'
import '@/plugins/j-snackbar'
import { initialize } from '@/init'

Vue.config.productionTip = false

initialize().then(() => {
  new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App)
  }).$mount('#app')
})

import Vue from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify'
import { initialize } from '@/init'

Vue.config.productionTip = false

initialize().then(() => {
  new Vue({
    vuetify,
    render: (h) => h(App)
  }).$mount('#app')
})

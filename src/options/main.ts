import { createApp } from 'vue'
import App from './Options.vue'
import router from './router'
import { initialize } from '~/init'
import { usePinia } from '~/plugins/pinia'

import '../styles'

const app = createApp(App)
usePinia(app)
app.use(router)

initialize().then(() => {
  app.mount('#app')
})

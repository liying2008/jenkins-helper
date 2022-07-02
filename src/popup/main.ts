import { createApp } from 'vue'
import router from './router'
import App from './Popup.vue'
import '../styles'
import { initialize } from '~/init'
import { usePinia } from '~/plugins/pinia'

const app = createApp(App)
usePinia(app)
app.use(router)

initialize().then(() => {
  app.mount('#app')
})

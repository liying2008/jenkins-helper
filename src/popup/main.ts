import { createApp } from 'vue'
import router from './router'
import App from './Popup.vue'
import '../styles'
import { initialize } from '~/init'

initialize().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})

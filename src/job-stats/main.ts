import { createApp } from 'vue'
import { initialize } from '~/init'
import { usePinia } from '~/plugins/pinia'
import App from './App.vue'
import '../styles'

const app = createApp(App)
usePinia(app)

initialize().then(() => {
  app.mount('#app')
})

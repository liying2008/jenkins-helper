import { createApp } from 'vue'
import App from './App.vue'
import '../styles'
import { initialize } from '~/init'
import { usePinia } from '~/plugins/pinia'

const app = createApp(App)
usePinia(app)

initialize().then(() => {
  app.mount('#app')
})

import { createApp } from 'vue'
import vuetify from '../plugins/vuetify'
import router from './router'
import App from './Popup.vue'

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')

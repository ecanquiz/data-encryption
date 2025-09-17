import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'; // Importa el archivo CSS con las directivas de Tailwind

const app = createApp(App)

app.use(router)

app.mount('#app')

import { createApp } from 'vue'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'  // ✅ Global
import { Toaster } from 'vue-sonner'

const app = createApp(App)

// ✅ Provide composable global (Vue 3 pattern)
app.provide('auth', useAuth())

app.use(router)
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

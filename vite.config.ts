import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/frontend-docu-cloud/',  // ← Esto era lo que faltaba
  plugins: [vue()]
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({  // ← Esto era lo que faltaba
  plugins: [vue()]
})

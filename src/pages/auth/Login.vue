<template>
  <section class="container mx-auto py-10 px-6 md:px-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 shadow-lg overflow-hidden">
        <div class="p-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border-b border-primary/10">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Iniciar sesión</h1>
          <p class="text-sm text-muted-foreground mt-2">Accede a tu cuenta para gestionar documentos</p>
        </div>
        <div class="p-8">
          <form class="grid gap-5" @submit.prevent="submit">
            <div class="grid gap-2">
              <label class="text-sm font-semibold text-foreground">Email</label>
              <div class="relative group">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input type="email" v-model="email" required placeholder="tu@email.com" class="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <div class="grid gap-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-foreground">Contraseña</label>
                <router-link to="/auth/reset" class="text-xs text-primary hover:underline">¿Olvidaste?</router-link>
              </div>
              <div class="relative group">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input :type="showPassword ? 'text' : 'password'" v-model="password" required placeholder="Tu contraseña" class="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L6.404 6.404m0 0A3.375 3.375 0 006.404 6.404" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="error" class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">{{ error }}</p>
            <button :disabled="loading" class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-input" /></div>
              <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground font-medium">O continúa con</span></div>
            </div>
            <div ref="googleButtonContainer" class="w-full"></div>
            <p class="text-sm text-muted-foreground text-center">¿No tienes cuenta? <router-link to="/auth/registro" class="text-primary font-semibold hover:underline transition-colors">Regístrate</router-link></p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

declare global {
  interface Window {
    google: any
  }
}

const { login, loginWithGoogle } = useAuth()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const showPassword = ref(false)
const googleButtonContainer = ref<HTMLElement | null>(null)

async function submit() {
  error.value = null; loading.value = true
  const res = await login({ email: email.value, password: password.value })
  loading.value = false
  if (!res.ok) error.value = res.error
  else router.replace('/')
}

async function handleGoogleCallback(response: any) {
  error.value = null; loading.value = true
  const res = await loginWithGoogle(response.credential)
  loading.value = false
  if (!res.ok) error.value = res.error
  else router.replace('/')
}

onMounted(() => {
  if (window.google && googleButtonContainer.value) {
    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: handleGoogleCallback
    })
    window.google.accounts.id.renderButton(
      googleButtonContainer.value,
      { theme: 'outline', size: 'large', width: '100%' }
    )
  }
})
</script>

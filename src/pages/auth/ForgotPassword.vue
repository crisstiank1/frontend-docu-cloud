<template>
  <section class="container mx-auto py-10 px-6 md:px-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 shadow-lg overflow-hidden">
        <div class="p-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border-b border-primary/10">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recuperar contraseña</h1>
          <p class="text-sm text-muted-foreground mt-2">Te ayudaremos a acceder a tu cuenta</p>
        </div>
        <div class="p-8">
          <form v-if="!submitted" class="grid gap-5" @submit.prevent="submit">
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
              <p class="text-xs text-muted-foreground">Ingresa el email asociado a tu cuenta</p>
            </div>
            <p v-if="error" class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">{{ error }}</p>
            <button :disabled="loading" class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
            </button>
            <div class="relative">
              <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-input" /></div>
              <div class="relative flex justify-center text-xs"><span class="bg-background px-2 text-muted-foreground">O</span></div>
            </div>
            <router-link to="/auth/login" class="inline-flex items-center justify-center rounded-lg h-11 px-6 border border-input bg-background hover:bg-accent text-foreground font-semibold transition-colors">
              Volver a iniciar sesión
            </router-link>
          </form>
          <div v-else class="grid gap-6">
            <div class="text-center">
              <div class="mb-4 flex justify-center">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 class="text-lg font-semibold mb-2">Verifica tu email</h2>
              <p class="text-sm text-muted-foreground mb-4">Hemos enviado un enlace de recuperación a:</p>
              <p class="text-sm font-medium bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">{{ email }}</p>
              <p class="text-xs text-muted-foreground mb-6">
                Sigue las instrucciones en tu correo para restablecer tu contraseña. Si no ves el correo, revisa tu carpeta de spam.
              </p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm text-blue-900">
                <strong>Para desarrollo:</strong> Como esta es una versión de demostración sin backend real, puedes usar el formulario de inicio de sesión para ingresar directamente o registrarte con un nuevo email.
              </p>
            </div>
            <button @click="submitted = false" class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
              Intentar con otro email
            </button>
            <router-link to="/auth/login" class="inline-flex items-center justify-center rounded-lg h-11 px-6 border border-input bg-background hover:bg-accent text-foreground font-semibold transition-colors">
              Volver a iniciar sesión
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const submitted = ref(false)

async function submit() {
  error.value = null
  const emailNorm = email.value.trim().toLowerCase()
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    error.value = 'Por favor ingresa un email válido'
    return
  }
  
  loading.value = true
  
  try {
    const users = JSON.parse(localStorage.getItem('docucloud_users_v1') || '{}')
    if (!users[emailNorm]) {
      error.value = 'No existe una cuenta asociada a este email'
      loading.value = false
      return
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    submitted.value = true
  } catch {
    error.value = 'Ocurrió un error. Intenta nuevamente'
    loading.value = false
  }
}
</script>

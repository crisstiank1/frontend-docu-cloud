<template>
  <section class="min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6">
    <div class="w-full max-w-md">
      <div class="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 shadow-lg overflow-hidden">

        <div class="p-5 sm:p-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border-b border-primary/10">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nueva contraseña
          </h1>
          <p class="text-sm text-muted-foreground mt-2">Escribe tu nueva contraseña</p>
        </div>

        <div class="p-5 sm:p-8">

          <!-- Token inválido o ausente -->
          <div v-if="!token" class="grid gap-6 text-center">
            <div class="flex justify-center">
              <div class="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Enlace inválido</h2>
              <p class="text-sm text-muted-foreground">
                Este enlace no es válido o ha expirado. Solicita uno nuevo.
              </p>
            </div>
            <router-link
              to="/auth/reset"
              class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold transition-all"
            >
              Solicitar nuevo enlace
            </router-link>
          </div>

          <!-- Formulario nueva contraseña -->
          <form v-else-if="!submitted" class="grid gap-5" @submit.prevent="submit">

            <!-- Nueva contraseña -->
            <div class="grid gap-2">
              <label class="text-sm font-semibold text-foreground">Nueva contraseña</label>
              <div class="relative group">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="newPassword"
                  required
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                  class="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L6.404 6.404" />
                  </svg>
                </button>
              </div>
              <div v-if="newPassword" class="flex gap-1 mt-1">
                <div
                  v-for="i in 4" :key="i"
                  class="h-1 flex-1 rounded-full transition-colors"
                  :class="passwordStrength >= i ? strengthColor : 'bg-muted'"
                />
              </div>
              <p v-if="newPassword" class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
            </div>

            <!-- Confirmar contraseña -->
            <div class="grid gap-2">
              <label class="text-sm font-semibold text-foreground">Confirmar contraseña</label>
              <div class="relative group">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="confirmPassword"
                  required
                  placeholder="Repite la nueva contraseña"
                  class="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  @click="showConfirm = !showConfirm"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                  :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <svg v-if="!showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L6.404 6.404" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- reCAPTCHA -->
            <div class="flex justify-center overflow-hidden">
              <div class="scale-[0.85] sm:scale-100 origin-center">
                <VueRecaptcha
                  ref="recaptchaRef"
                  :sitekey="siteKey"
                  theme="light"
                  size="normal"
                  :loading-timeout="30000"
                  @verify="onCaptchaVerify"
                  @expire="onCaptchaExpired"
                  @fail="onCaptchaFail"
                  @error="onCaptchaError"
                />
              </div>
            </div>

            <!-- Error -->
            <p v-if="error" class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {{ error }}
            </p>

            <!-- Botón submit -->
            <button
              type="submit"
              :disabled="loading || !captchaToken"
              class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
            >
              {{ loading ? 'Guardando...' : 'Guardar nueva contraseña' }}
            </button>

          </form>

          <!-- Pantalla de éxito -->
          <div v-else class="grid gap-6 text-center">
            <div class="flex justify-center">
              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">¡Contraseña actualizada!</h2>
              <p class="text-sm text-muted-foreground">
                Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión.
              </p>
            </div>
            <router-link
              to="/auth/login"
              class="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Ir al login
            </router-link>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiResetPassword } from '../../services/authService'
import VueRecaptcha from 'vue3-recaptcha2'

const route   = useRoute()
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string

const token = ref(
  (route.query.token as string) ||
  new URLSearchParams(window.location.search).get('token') ||
  ''
)

const newPassword     = ref('')
const confirmPassword = ref('')
const showPassword    = ref(false)
const showConfirm     = ref(false)
const error           = ref<string | null>(null)
const loading         = ref(false)
const submitted       = ref(false)
const captchaToken    = ref<string | null>(null)
const recaptchaRef    = ref<any>(null)

const passwordStrength = computed(() => {
  const p = newPassword.value
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return colors[passwordStrength.value - 1] ?? 'bg-red-500'
})

const strengthTextColor = computed(() => {
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600']
  return colors[passwordStrength.value - 1] ?? 'text-red-500'
})

const strengthLabel = computed(() => {
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Segura']
  return labels[passwordStrength.value - 1] ?? 'Muy débil'
})

function onCaptchaVerify(captchaValue: string) {
  captchaToken.value = captchaValue
  error.value = null
}

function onCaptchaExpired() {
  captchaToken.value = null
  recaptchaRef.value?.reset?.()
}

function onCaptchaFail() {
  captchaToken.value = null
  error.value = 'Falló el reCAPTCHA (conexión). Intenta de nuevo.'
}

function onCaptchaError() {
  captchaToken.value = null
  error.value = 'No se pudo cargar el reCAPTCHA. Recarga la página.'
}

async function submit() {
  error.value = null

  if (!captchaToken.value) {
    error.value = 'Por favor completa el reCAPTCHA'
    return
  }

  if (newPassword.value.length < 8 || !/[A-Z]/.test(newPassword.value) || !/\d/.test(newPassword.value)) {
    error.value = 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  try {
    await apiResetPassword({
      token: token.value,
      newPassword: newPassword.value
    })
    submitted.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error
              || err.response?.data?.message
              || 'El enlace expiró o no es válido. Solicita uno nuevo'
    captchaToken.value = null
    recaptchaRef.value?.reset?.()
  } finally {
    loading.value = false
  }
}
</script>
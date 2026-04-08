<template>
  <Toaster position="bottom-right" rich-colors :duration="3000" closeButton />

  <!-- Pantalla de carga inicial -->
  <div v-if="!appReady" class="min-h-dvh flex items-center justify-center bg-background">
    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>

  <!-- APP AUTENTICADA -->
  <div v-else-if="isAuthenticated" class="flex min-h-dvh bg-background overflow-hidden">

    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-64">
      <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur h-16 px-4 md:px-6 flex items-center gap-3">

        <!-- Botón hamburguesa — solo móvil -->
        <button
          class="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent/10 transition-colors shrink-0"
          aria-label="Abrir menú"
          @click="sidebarOpen = true"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav class="flex items-center gap-2 text-sm min-w-0 flex-1 overflow-hidden">
          <svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getPageIcon()" />
          </svg>
          <span class="font-semibold text-primary truncate">{{ getPageTitle() }}</span>
        </nav>
      </header>

      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>

  <!-- LANDING PÚBLICA -->
  <div v-else class="min-h-dvh grid grid-rows-[auto_1fr_auto]">
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 gap-4">

        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 shrink-0">
          <img src="/Logo.png" alt="DocuCloud" class="h-8 w-8 object-contain" />
          <span class="font-extrabold tracking-tight text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DocuCloud
          </span>
        </router-link>

        <!-- Nav links — solo desktop -->
        <nav class="hidden md:flex items-center gap-8 text-sm flex-1 ml-8">
          <a href="/#inicio" class="text-foreground/80 hover:text-foreground transition-colors">Inicio</a>
          <a href="/#caracteristicas" class="text-foreground/80 hover:text-foreground transition-colors">Características</a>
        </nav>

        <div class="flex items-center gap-2 shrink-0">
          <router-link
            to="/auth/login"
            class="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-9 px-4 text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/auth/register"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 sm:px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all"
          >
            Registrarse
          </router-link>

          <!-- Hamburguesa móvil para landing -->
          <button
            class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent/10 transition-colors"
            aria-label="Abrir menú"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menú móvil desplegable (landing) -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t bg-background/95 backdrop-blur px-4 py-4 flex flex-col gap-1">
        <a href="/#inicio" class="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors" @click="mobileMenuOpen = false">
          Inicio
        </a>
        <a href="/#caracteristicas" class="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors" @click="mobileMenuOpen = false">
          Características
        </a>
        <router-link to="/auth/login" class="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors" @click="mobileMenuOpen = false">
          Iniciar sesión
        </router-link>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="border-t bg-background">
      <div class="container mx-auto py-8 md:py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <p>© {{ new Date().getFullYear() }} DocuCloud · Medellín, Antioquia</p>
        <div class="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          <a href="mailto:hello@docucloud.co" class="hover:text-foreground transition-colors">Soporte</a>
          <a href="#" class="hover:text-foreground transition-colors">Documentación</a>
          <a href="#" class="hover:text-foreground transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import { useToast } from './composables/useToast'
import Sidebar from './components/Sidebar.vue'
import { Toaster } from 'vue-sonner'

const route   = useRoute()
const router  = useRouter()
const { initTheme } = useTheme()
const { warning }   = useToast()
const auth = useAuth()

const appReady        = ref(false)
const isAuthenticated = computed(() => !!auth.user.value)
const sidebarOpen     = ref(false)
const mobileMenuOpen  = ref(false)

watch(() => route.path, () => {
  sidebarOpen.value    = false
  mobileMenuOpen.value = false
})

// ─── Inactividad ──────────────────────────────────────────────────────────────
const INACTIVITY_MS = Number(import.meta.env.VITE_INACTIVITY_TIMEOUT_MS ?? 1800000)
let inactivityTimer: number | null = null
let expiringSession = false

const activityEvents: (keyof WindowEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click',
]

function isPublicRoute(path: string): boolean {
  return ['/', '/auth/login', '/auth/register', '/auth/reset', '/auth/reset-password', '/oauth/callback'].includes(path)
}

function clearInactivityTimer() {
  if (inactivityTimer !== null) { window.clearTimeout(inactivityTimer); inactivityTimer = null }
}

async function handleInactivityTimeout() {
  if (expiringSession || !isAuthenticated.value) return
  expiringSession = true
  clearInactivityTimer()
  await auth.logout()
  warning('Tu sesión se cerró por inactividad')
  await router.replace('/')
  expiringSession = false
}

function startInactivityTimer() {
  clearInactivityTimer()
  if (!isAuthenticated.value || isPublicRoute(route.path)) return
  inactivityTimer = window.setTimeout(() => { void handleInactivityTimeout() }, INACTIVITY_MS)
}

function resetInactivityTimer() {
  if (!isAuthenticated.value || isPublicRoute(route.path)) return
  startInactivityTimer()
}

onMounted(async () => {
  initTheme()
  await auth.initialize()
  appReady.value = true
  activityEvents.forEach(e => window.addEventListener(e, resetInactivityTimer))
  startInactivityTimer()
})

onBeforeUnmount(() => {
  clearInactivityTimer()
  activityEvents.forEach(e => window.removeEventListener(e, resetInactivityTimer))
})

watch(() => [isAuthenticated.value, route.path], () => {
  clearInactivityTimer()
  startInactivityTimer()
})

// ─── Títulos e íconos ─────────────────────────────────────────────────────────
function getPageTitle(): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Panel Principal', '/files': 'Mis Archivos',
    '/shared': 'Compartidos conmigo', '/classification': 'Clasificación Inteligente',
    '/users': 'Gestión usuarios', '/history': 'Auditoría', '/profile': 'Mi perfil',
  }
  return titles[route.path] || 'DocuCloud'
}

function getPageIcon(): string {
  const icons: Record<string, string> = {
    '/dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    '/files': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    '/shared': 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    '/classification': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    '/users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    '/history': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    '/profile': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  }
  return icons[route.path] || 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
}
</script>
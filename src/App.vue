<template>
  <Toaster position="top-right" rich-colors />

  <!-- Pantalla de carga inicial -->
  <div v-if="!appReady" class="h-screen flex items-center justify-center bg-background">
    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>

  <!-- APP AUTENTICADA -->
  <div v-else-if="isAuthenticated" class="flex h-screen bg-background">
    <Sidebar />
    <div class="flex-1 flex flex-col ml-64">
      <header class="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div class="h-16 px-6 md:px-8 flex items-center">
          <h1 class="text-lg font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {{ getPageTitle() }}
          </h1>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>

  <!-- LANDING PÚBLICA -->
  <div v-else class="min-h-screen grid grid-rows-[auto_1fr_auto]">
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/Logo.png" alt="DocuCloud" class="h-8 w-8 object-contain" />
          <span class="font-extrabold tracking-tight text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DocuCloud
          </span>
        </router-link>

        <nav class="hidden md:flex items-center gap-8 text-sm flex-1 ml-12">
          <router-link to="/#inicio" class="text-foreground/80 hover:text-foreground transition-colors">Inicio</router-link>
          <router-link to="/#caracteristicas" class="text-foreground/80 hover:text-foreground transition-colors">Características</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <router-link
            to="/auth/login"
            class="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium px-4 py-2 hover:bg-accent/10 rounded-lg"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/auth/registro"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all"
          >
            Registrarse
          </router-link>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="border-t bg-background">
      <div class="container mx-auto py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8">
        <p>© {{ new Date().getFullYear() }} DocuCloud · Medellín, Antioquia</p>
        <div class="flex items-center gap-6">
          <a href="mailto:hello@docucloud.co" class="hover:text-foreground transition-colors">Soporte</a>
          <a href="#" class="hover:text-foreground transition-colors">Documentación</a>
          <a href="#" class="hover:text-foreground transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import Sidebar from './components/Sidebar.vue'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const { initTheme } = useTheme()
const auth = useAuth()

const appReady = ref(false)
const isAuthenticated = computed(() => !!auth.user.value)

onMounted(async () => {
  initTheme()
  await auth.initialize()
  appReady.value = true
})

function getPageTitle(): string {
  const titles: Record<string, string> = {
    '/dashboard':     'Dashboard',
    '/documents':     'Mis Archivos',
    '/compartidos':   'Compartidos conmigo',
    '/clasificacion': 'Clasificación IA',
    '/usuarios':      'Gestión usuarios',
    '/historial':     'Auditoría',
    '/perfil':        'Mi perfil'
  }
  return titles[route.path] || 'DocuCloud'
}
</script>

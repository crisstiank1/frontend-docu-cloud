<template>
  <div v-if="user" class="flex h-screen">
    <Sidebar />
    <div class="flex-1 flex flex-col ml-64">
      <header class="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div class="h-16 px-6 md:px-8 flex items-center justify-between">
          <h1 class="text-lg font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {{ getPageTitle() }}
          </h1>
          <div class="flex items-center gap-3"></div>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>

  <div v-else class="min-h-screen grid grid-rows-[auto_1fr_auto]">
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/Logo.png" alt="DocuCloud" class="h-8 w-8 object-contain" />
          <span class="font-extrabold tracking-tight text-xl">DocuCloud</span>
        </router-link>
        <nav class="hidden md:flex items-center gap-8 text-sm flex-1 ml-12">
          <router-link to="/#inicio" class="text-foreground/80 hover:text-foreground transition-colors">Inicio</router-link>
          <router-link to="/#caracteristicas" class="text-foreground/80 hover:text-foreground transition-colors">Características</router-link>
        </nav>
        <div class="flex items-center gap-3">
          <router-link to="/auth/login" class="text-foreground/80 hover:text-foreground transition-colors text-sm">Iniciar sesión</router-link>
          <router-link to="/auth/registro" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground">Registrarse</router-link>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
    <footer class="border-t bg-background">
      <div class="container mx-auto py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8">
        <p>© {{ new Date().getFullYear() }} DocuCloud · Medellín</p>
        <div class="flex items-center gap-4">
          <a href="mailto:hola@docucloud.local" class="hover:text-foreground">Soporte</a>
          <a href="https://builder.io/c/docs/projects" target="_blank" rel="noreferrer" class="hover:text-foreground">Docs</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import Sidebar from './components/Sidebar.vue'

const { user, loadUserFromStorage } = useAuth()
const route = useRoute()
const { initTheme } = useTheme()

// ← Carga sesión antes de renderizar
loadUserFromStorage()

onMounted(() => {
  initTheme()
})

function getPageTitle(): string {
  const titles: Record<string, string> = {
    '/dashboard':     'Dashboard',
    '/documents':     'Mis Archivos',
    '/compartidos':   'Compartidos Conmigo',
    '/clasificacion': 'Clasificación Inteligente',
    '/usuarios':      'Gestión de Usuarios',
    '/historial':     'Historial y Auditoría',
    '/perfil':        'Mi Perfil'
  }
  return titles[route.path] || 'DocuCloud'
}
</script>

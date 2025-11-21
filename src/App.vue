<template>
  <div class="min-h-screen grid grid-rows-[auto_1fr_auto]">
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/public/Logo.png" alt="Logo DocuCloud" class="h-10 w-10" />
          <span class="font-extrabold tracking-tight text-xl">DocuCloud</span>
        </router-link>
        <nav class="hidden md:flex items-center gap-8 text-sm flex-1 ml-12">
          <router-link to="/#inicio" class="text-foreground/80 hover:text-foreground transition-colors">Inicio</router-link>
          <router-link to="/#caracteristicas" class="text-foreground/80 hover:text-foreground transition-colors">Características</router-link>
          <router-link to="/demo" class="text-foreground/80 hover:text-foreground transition-colors">Prueba Ahora</router-link>
        </nav>
        <div class="flex items-center gap-3">
          <template v-if="user">
            <router-link to="/perfil" class="text-foreground/80 hover:text-foreground transition-colors text-sm">{{ user.name }}</router-link>
            <button @click="handleLogout" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              Cerrar sesión
            </button>
          </template>
          <template v-else>
            <router-link to="/auth/login" class="text-foreground/80 hover:text-foreground transition-colors text-sm">Iniciar sesión</router-link>
            <router-link to="/auth/registro" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground">Registrarse</router-link>
          </template>
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
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.replace('/auth/login')
}
</script>

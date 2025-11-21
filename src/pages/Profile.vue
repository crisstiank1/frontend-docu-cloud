<template>
  <section class="container mx-auto py-10 px-6 md:px-8">
    <div class="max-w-md mx-auto rounded-lg border">
      <div class="p-6 border-b">
        <h1 class="text-xl font-semibold">Mi Perfil</h1>
        <p class="text-sm text-muted-foreground">Información de tu cuenta</p>
      </div>
      <div class="p-6">
        <div v-if="user" class="grid gap-6">
          <div class="grid gap-1">
            <label class="text-sm font-medium text-muted-foreground">Nombre</label>
            <p class="text-sm font-medium">{{ user.name }}</p>
          </div>
          <div class="grid gap-1">
            <label class="text-sm font-medium text-muted-foreground">Email</label>
            <p class="text-sm font-medium">{{ user.email }}</p>
          </div>
          <div class="grid gap-1">
            <label class="text-sm font-medium text-muted-foreground">ID de Usuario</label>
            <p class="text-xs font-mono text-muted-foreground break-all">{{ user.id }}</p>
          </div>
          <button @click="handleLogout" class="inline-flex items-center justify-center rounded-md h-10 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
            Cerrar sesión
          </button>
          <router-link to="/" class="inline-flex items-center justify-center rounded-md h-10 px-4 border border-input bg-background hover:bg-accent text-sm">
            Volver al inicio
          </router-link>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-sm text-muted-foreground mb-4">No estás autenticado</p>
          <router-link to="/auth/login" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground">
            Iniciar sesión
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.replace('/auth/login')
}
</script>

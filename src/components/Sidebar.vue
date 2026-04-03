<template>
  <aside
    class="w-64 bg-gradient-to-b from-background to-muted border-r fixed left-0 top-0 h-screen overflow-y-auto z-30 flex flex-col"
  >
    <!-- Logo -->
    <div class="p-6 border-b">
      <div class="flex items-center gap-2">
        <router-link
          to="/dashboard"
          class="flex items-center gap-2 flex-1 min-w-0"
        >
          <img
            src="/Logo.png"
            alt="DocuCloud"
            class="h-8 w-8 object-contain flex-shrink-0"
          />
          <span
            class="font-extrabold tracking-tight text-xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent truncate"
          >
            DocuCloud
          </span>
        </router-link>
        <button
          @click="toggleTheme"
          class="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          :title="isDark ? 'Modo claro' : 'Modo oscuro'"
        >
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Navegación -->
    <nav class="p-4 space-y-1 flex-1">

      <router-link
        to="/dashboard"
        active-class="bg-primary/10 text-primary border-l-2 border-primary"
        class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Panel Principal</span>
      </router-link>

      <!-- ✅ /documents → /files -->
      <router-link
        to="/files"
        active-class="bg-primary/10 text-primary border-l-2 border-primary"
        class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Mis Archivos</span>
      </router-link>

      <!-- ✅ /compartidos → /shared -->
      <router-link
        to="/shared"
        active-class="bg-primary/10 text-primary border-l-2 border-primary"
        class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Compartidos</span>
      </router-link>

      <!-- ✅ /clasificacion → /classification -->
      <router-link
        to="/classification"
        active-class="bg-primary/10 text-primary border-l-2 border-primary"
        class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>Clasificación</span>
      </router-link>

      <!-- Sección Admin -->
      <div v-if="user?.roles?.includes('ADMIN')" class="pt-4 mt-4 border-t">
        <p class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
          Administración
        </p>

        <!-- ✅ /usuarios → /users -->
        <router-link
          to="/users"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a4 4 0 00-5.477-3.764M9 20H4v-2a4 4 0 015.477-3.764M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Gestión de Usuarios</span>
        </router-link>

        <!-- ✅ /historial → /history -->
        <router-link
          to="/history"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Historial</span>
        </router-link>
      </div>
    </nav>

    <!-- Usuario + Logout -->
    <div class="p-4 border-t bg-background">

      <!-- ✅ /perfil → /profile -->
      <router-link
        to="/profile"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors mb-2"
      >
        <div
          class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0"
        >
          {{ (user?.name || user?.email || "U").charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">
            {{ user?.name || user?.email?.split("@")[0] }}
          </p>
          <p class="text-xs text-muted-foreground truncate">
            {{ user?.email }}
          </p>
        </div>
      </router-link>

      <button
        @click="handleLogout"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";

const { user, logout } = useAuth();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();

async function handleLogout() {
  await router.replace("/auth/login");
  await logout();
}
</script>
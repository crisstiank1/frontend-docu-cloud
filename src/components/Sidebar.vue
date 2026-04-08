<template>
  <!-- Overlay oscuro en móvil cuando el sidebar está abierto -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <aside
      v-show="isOpen || isDesktop"
      class="w-64 bg-gradient-to-b from-background to-muted border-r fixed left-0 top-0 h-[100dvh] z-50 flex flex-col lg:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Logo -->
      <div class="p-6 border-b">
        <div class="flex items-center gap-2">
          <router-link
            to="/dashboard"
            class="flex items-center gap-2 flex-1 min-w-0"
            @click="emit('close')"
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
            :aria-label="
              isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
            "
          >
            <svg
              v-if="isDark"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              />
            </svg>
          </button>
          <!-- Botón cerrar — solo visible en móvil -->
          <button
            @click="emit('close')"
            class="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="p-4 space-y-1 flex-1 overflow-y-auto min-h-0">
        <router-link
          to="/dashboard"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
          @click="emit('close')"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Panel Principal</span>
        </router-link>

        <router-link
          to="/files"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
          @click="emit('close')"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Mis Archivos</span>
        </router-link>

        <router-link
          to="/shared"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
          @click="emit('close')"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Compartidos</span>
        </router-link>

        <router-link
          to="/classification"
          active-class="bg-primary/10 text-primary border-l-2 border-primary"
          class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
          @click="emit('close')"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span>Clasificación</span>
        </router-link>

        <div v-if="user?.roles?.includes('ADMIN')" class="pt-4 mt-4 border-t">
          <p
            class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase"
          >
            Administración
          </p>

          <router-link
            to="/users"
            active-class="bg-primary/10 text-primary border-l-2 border-primary"
            class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
            @click="emit('close')"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a4 4 0 00-5.477-3.764M9 20H4v-2a4 4 0 015.477-3.764M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Gestión de Usuarios</span>
          </router-link>

          <router-link
            to="/history"
            active-class="bg-primary/10 text-primary border-l-2 border-primary"
            class="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors"
            @click="emit('close')"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Historial</span>
          </router-link>
        </div>
      </nav>

      <!-- Usuario + Logout -->
      <div class="p-4 border-t bg-background">
        <router-link
          to="/profile"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors mb-2"
          @click="emit('close')"
        >
          <div
            class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/20"
          >
            <img
              v-if="user?.photoUrl && !avatarError"
              :src="user.photoUrl"
              :alt="user?.name || 'Avatar'"
              class="w-full h-full object-cover"
              @error="avatarError = true"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-xs font-bold text-primary"
            >
              {{ (user?.name || user?.email || "U").charAt(0).toUpperCase() }}
            </div>
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
          :disabled="isLoggingOutLocal"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="!isLoggingOutLocal"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ isLoggingOutLocal ? "Cerrando sesión..." : "Cerrar sesión" }}
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";
import { isLoggingOut } from "../composables/useAuth";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { user, logout } = useAuth();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();

const avatarError = ref(false);
const isLoggingOutLocal = ref(false);
const isDesktop = ref(false);

function checkDesktop() {
  isDesktop.value = window.innerWidth >= 1024;
}

onMounted(() => {
  checkDesktop();
  window.addEventListener("resize", checkDesktop);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkDesktop);
});

watch(
  () => user.value?.photoUrl,
  () => {
    avatarError.value = false;
  },
  { immediate: true },
);

async function handleLogout() {
  if (isLoggingOutLocal.value) return;

  isLoggingOutLocal.value = true;
  isLoggingOut.value = true;

  try {
    await logout();
    await router.replace("/auth/login");
  } catch {
    isLoggingOut.value = false;
    isLoggingOutLocal.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>

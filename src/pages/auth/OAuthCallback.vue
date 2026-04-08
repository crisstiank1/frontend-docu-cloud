<template>
  <section class="min-h-dvh flex items-center justify-center">
    <div class="flex flex-col items-center gap-4 text-center px-4">
      <svg class="w-10 h-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p class="text-muted-foreground font-medium">
        Autenticando con Google...
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { saveOAuthSession } from "../../services/authService";
import { useAuth } from "../../composables/useAuth";

const router = useRouter();
const { reinitialize, isAuthenticated, user } = useAuth();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refreshToken = params.get("refreshToken") ?? undefined;

  if (!token) {
    console.error("\u274c No se encontró token en la URL");
    router.replace("/auth/login?error=Token+no+encontrado");
    return;
  }

  saveOAuthSession(token, refreshToken);

  try {
    await reinitialize();
    if (isAuthenticated.value) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login?error=Error+al+iniciar+sesión");
    }
  } catch (e) {
    console.error("\u274c Error en reinitialize:", e);
    router.replace("/auth/login?error=Error+al+iniciar+sesión");
  }
});
</script>
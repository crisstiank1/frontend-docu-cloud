<template>
  <section class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-4 text-center">
      <svg
        class="w-10 h-10 animate-spin text-primary"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
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

// ✅ Una sola instancia de useAuth para todo el componente
const { reinitialize, isAuthenticated, user } = useAuth();

onMounted(async () => {
  // ✅ FIX: Lee los tokens directamente de window.location.search
  // en lugar de route.query, para evitar timing issues con el router de Vue
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refreshToken = params.get("refreshToken") ?? undefined;


  if (!token) {
    console.error("❌ No se encontró token en la URL");
    router.replace("/auth/login?error=Token+no+encontrado");
    return;
  }

  // ✅ Guarda el token ANTES de cualquier otra operación
  saveOAuthSession(token, refreshToken);
  console.log("✅ Token guardado en localStorage:", localStorage.getItem("authToken"));

  try {
    await reinitialize();
    console.log("✅ reinitialize OK, isAuthenticated:", isAuthenticated.value);
    console.log("Usuario en estado:", user.value);

    if (isAuthenticated.value) {
      router.replace("/dashboard");
    } else {
      console.error("❌ reinitialize completó pero isAuthenticated es false");
      router.replace("/auth/login?error=Error+al+iniciar+sesión");
    }
  } catch (e) {
    console.error("❌ Error en reinitialize:", e);
    router.replace("/auth/login?error=Error+al+iniciar+sesión");
  }
});
</script>
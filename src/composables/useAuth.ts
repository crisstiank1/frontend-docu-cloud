import { reactive, computed } from "vue";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken,
  apiGetMe,
} from "../services/authService";
import { apiUpdateProfile, apiChangePassword } from "../services/userService";
import type { UpdateProfilePayload } from "../services/userService";
import { STORAGE_KEYS } from "@/config/storageKeys";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  enabled: boolean;
  roles: string[];
  name: string;
  provider?: string;
  hasPassword?: boolean;
  photoUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapToAuthUser(raw: Record<string, any>): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    enabled: raw.enabled ?? true,
    roles: raw.roles ?? [],
    name: raw.name,
    provider: raw.provider,
    hasPassword: raw.hasPassword,
    photoUrl: raw.photoUrl,
  };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as any;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    if (status === 429) {
      return data?.message ?? "Demasiados intentos. Intenta más tarde.";
    }

    if (status === 403) {
      return data?.message ?? "Tu cuenta ha sido bloqueada. Contacta al administrador.";
    }

    if (status === 401) {
      return data?.message ?? data?.error ?? "Correo o contraseña incorrectos";
    }

    if (status === 500) {
      return data?.message ?? data?.error ?? fallback;
    }

    return data?.message ?? data?.error ?? fallback;
  }

  if (err instanceof Error) return err.message;
  return fallback;
}

// ─── State (singleton module-level) ──────────────────────────────────────────

const state = reactive<AuthState>({
  user: null,
  loading: false,
  error: null,
  initialized: false,
});

let initPromise: Promise<void> | null = null;

// ─── Composable ───────────────────────────────────────────────────────────────

export function useAuth() {
  // ── withLoading ─────────────────────────────────────────────────────────────
  async function withLoading<T>(
    operation: () => Promise<T>,
    errorFallback: string,
  ): Promise<T> {
    state.loading = true;
    state.error = null;
    try {
      return await operation();
    } catch (err: unknown) {
      state.error = extractErrorMessage(err, errorFallback);
      throw err;
    } finally {
      state.loading = false;
    }
  }

  // ── initialize ──────────────────────────────────────────────────────────────
  async function initialize(): Promise<void> {
    if (state.initialized) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        state.initialized = true;
        initPromise = null;
        return;
      }
      try {
        const raw = await apiGetMe();
        state.user = mapToAuthUser(raw);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          state.user = null;
        } else {
          // Error de red — reintentar una vez antes de rendirse
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const raw = await apiGetMe();
            state.user = mapToAuthUser(raw);
          } catch {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            state.user = null;
          }
        }
      } finally {
        state.initialized = true;
        initPromise = null;
      }
    })();

    return initPromise;
  }

  // ── reinitialize ─────────────────────────────────────────────────────────────
  async function reinitialize(): Promise<void> {
    state.initialized = false;
    initPromise = null;
    await initialize();
  }

  // ── login ───────────────────────────────────────────────────────────────────
  async function login(
    email: string,
    password: string,
    recaptchaToken?: string,
  ): Promise<void> {
    await withLoading(async () => {
      await apiLogin({ email, password, recaptchaToken });
      const raw = await apiGetMe();
      state.user = mapToAuthUser(raw);
      state.initialized = true;
    }, "Correo o contraseña incorrectos");
  }

  // ── register ────────────────────────────────────────────────────────────────
  async function register(
    name: string,
    email: string,
    password: string,
    recaptchaToken?: string,
  ): Promise<void> {
    await withLoading(async () => {
      await apiRegister({ name, email, password, recaptchaToken });
    }, "Error al registrar la cuenta");
  }

  // ── logout ──────────────────────────────────────────────────────────────────
async function logout(): Promise<void> {
  state.loading = true;

  try {
    // ✅ 1. Notificar al backend PRIMERO — el token todavía está en localStorage
    await apiLogout();
  } catch {
    // silencioso
  } finally {
    // ✅ 2. Limpiar sesión local DESPUÉS
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    state.user = null;
    state.initialized = true;
    state.error = null;
    initPromise = null;
    state.loading = false;
  }
}

  // ── refreshToken ────────────────────────────────────────────────────────────
  // ✅ FUNCIÓN RESTAURADA — estaba en el return pero no definida en el cuerpo
  async function refreshToken(): Promise<void> {
    try {
      await apiRefreshToken();
      const raw = await apiGetMe();
      state.user = mapToAuthUser(raw);
    } catch {
      // Si el refresh falla, cerrar sesión completamente
      await logout();
    }
  }

  // ── updateProfile ───────────────────────────────────────────────────────────
  async function updateProfile(data: UpdateProfilePayload): Promise<void> {
    await withLoading(async () => {
      const updated = await apiUpdateProfile(data);
      if (state.user) {
        state.user = {
          ...state.user,
          name: updated.name,
          email: updated.email,
        };
      }
    }, "Error al actualizar el perfil");
  }

  // ── changePassword ──────────────────────────────────────────────────────────
async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw new Error("La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número");
  }
  await withLoading(async () => {
    await apiChangePassword({ currentPassword, newPassword });
  }, "Contraseña actual incorrecta");
}

  // ── clearError ──────────────────────────────────────────────────────────────
  function clearError(): void {
    state.error = null;
  }

  // ─── Computed ───────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!state.user);
  const isAdmin = computed(() => state.user?.roles.includes("ADMIN") ?? false);
  const isUser = computed(() => state.user?.roles.includes("USER") ?? false);

  // ─── Public API ──────────────────────────────────────────────────────────────

  return {
    user: computed(() => state.user),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    initialized: computed(() => state.initialized),
    isAuthenticated,
    isAdmin,
    isUser,
    initialize,
    reinitialize,
    login,
    register,
    logout,
    refreshToken, // ✅ ahora sí está definida arriba
    updateProfile,
    changePassword,
    clearError,
  };
}

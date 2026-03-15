import { reactive, computed } from "vue";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken,
  apiGetMe,
  apiGoogleLogin,
} from "../services/authService";
import { apiUpdateProfile, apiChangePassword } from "../services/userService";
import type { UpdateProfilePayload } from "../services/userService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  enabled: boolean;
  roles: string[];
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normaliza la respuesta del backend a AuthUser.
 * Punto único de mapeo: si el backend cambia, solo se edita aquí.
 */
function mapToAuthUser(raw: Record<string, any>): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    enabled: raw.enabled ?? true,
    roles: raw.roles ?? [],
    name: raw.name,
  };
}

/**
 * Extrae el mensaje de error de una respuesta Axios o un Error nativo.
 * Prioriza mensajes del backend sobre mensajes genéricos.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as any;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    if (status === 401 || status === 500) return fallback;
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
  // ── Utilidad interna: envuelve operaciones con loading/error ────────────────
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
      const token = localStorage.getItem("authToken");
      if (!token) {
        state.initialized = true;
        initPromise = null;
        return;
      }
      try {
        const raw = await apiGetMe();
        state.user = mapToAuthUser(raw);
      } catch {
        localStorage.removeItem("authToken");
        state.user = null;
      } finally {
        state.initialized = true;
        initPromise = null;
      }
    })();

    return initPromise;
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

  // ── loginWithGoogle ─────────────────────────────────────────────────────────
  async function loginWithGoogle(credential: string): Promise<void> {
    await withLoading(async () => {
      await apiGoogleLogin(credential);
      const raw = await apiGetMe();
      state.user = mapToAuthUser(raw);
      state.initialized = true;
    }, "Error al autenticar con Google");
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
      await apiLogout();
    } catch {
      // logout silencioso: aunque el backend falle, limpiamos el estado local
    } finally {
      state.user = null;
      state.initialized = false;
      state.error = null;
      initPromise = null;
      localStorage.removeItem("authToken");
      state.loading = false;
    }
  }

  // ── refreshToken ────────────────────────────────────────────────────────────
  async function refreshToken(): Promise<void> {
    try {
      await apiRefreshToken();
      const raw = await apiGetMe();
      state.user = mapToAuthUser(raw);
    } catch {
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
    // State (readonly via computed)
    user: computed(() => state.user),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    initialized: computed(() => state.initialized),
    // Computed
    isAuthenticated,
    isAdmin,
    isUser,
    // Actions
    initialize,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    clearError,
  };
}

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { STORAGE_KEYS } from "./storageKeys";

// ─── Base URL ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "";

// URL explícita para navegación directa del browser (OAuth2 redirect)
export const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── Instancia Axios ──────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

const IGNORED_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/logout", // ✅ logout no debe disparar redirección por 401
]);

let isRedirecting = false;

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    const rawUrl = error.config?.url ?? "";
    const pathname = rawUrl.split("?")[0];

    const isIgnored = IGNORED_PATHS.has(pathname);
    const isOAuthCallback = window.location.pathname === "/oauth/callback";

    // ✅ Solo hay sesión expirada REAL si el token existe en este momento.
    // Si no hay token es porque logout ya lo eliminó → 401 esperado, ignorar.
    const tokenPresente = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (
      error.response?.status === 401 &&
      !isIgnored &&
      !isRedirecting &&
      !isOAuthCallback &&
      tokenPresente // ← condición clave: solo actuar si había sesión activa
    ) {
      isRedirecting = true;

      // Limpiar sesión
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      // ✅ Usar router de Vue en lugar de window.location.href
      // para no recargar la página y respetar el ciclo de vida de Vue
      import("../router").then(({ default: router }) => {
        router.replace("/auth/login?expired=true").finally(() => {
          isRedirecting = false;
        });
      });
    }

    return Promise.reject(error);
  },
);

// ─── Tipos según DTOs del backend ─────────────────────────────────────────────

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  roles: string[];
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface MessageResponse {
  message: string;
}

export interface MeResponse {
  id: number;
  email: string;
  name: string;
  photoUrl: string | null;
  provider: "LOCAL" | "GOOGLE";
  hasPassword: boolean;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  maxFolders: number;
  maxTags: number;
  maxFavorites: number;
}

// ─── Contratos de request ─────────────────────────────────────────────────────

export const API = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      name?: string;
      recaptchaToken?: string;
    }) => api.post<MessageResponse>("/api/auth/register", data),

    login: (data: {
      email: string;
      password: string;
      recaptchaToken?: string;
    }) => api.post<JwtResponse>("/api/auth/login", data),

    logout: () => api.post<void>("/api/auth/logout"),

    refresh: (refreshToken: string) =>
      api.post<TokenRefreshResponse>("/api/auth/refresh", { refreshToken }),

    forgotPassword: (data: { email: string; recaptchaToken?: string }) =>
      api.post<MessageResponse>("/api/auth/forgot-password", data),

    resetPassword: (data: { token: string; newPassword: string }) =>
      api.post<MessageResponse>("/api/auth/reset-password", data),

    me: () =>
      api.get<MeResponse>("/api/users/me", {
        params: { _t: Date.now() },
      }),
  },
};

export default api;

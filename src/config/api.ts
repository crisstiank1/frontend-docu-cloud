import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { STORAGE_KEYS } from "./storageKeys";
import { isLoggingOut } from "./logoutFlag";
// ─── Base URL ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "";

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
  "/api/auth/logout",
]);

//  MEJORA: Usar un AbortController-style flag con cleanup automático
//    para evitar que isRedirecting quede en true indefinidamente si el
//    router.replace() falla o la promesa nunca se resuelve.
let isRedirecting = false;

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,

  (error: AxiosError): Promise<never> => {
    const rawUrl = error.config?.url ?? "";
    const pathname = rawUrl.split("?")[0];

    const isIgnored = IGNORED_PATHS.has(pathname);
    const isOAuthCallback = window.location.pathname === "/oauth/callback";
    const tokenPresente = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    //  CORRECCIÓN PRINCIPAL: Agregar isLoggingOut como condición de salida.
    //    Si el usuario está en proceso de logout intencional, cualquier
    //    request en vuelo que devuelva 401 (porque el token fue invalidado
    //    en el backend) debe ignorarse completamente — no redirigir, no notificar.
    if (isLoggingOut.value) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !isIgnored &&
      !isRedirecting &&
      !isOAuthCallback &&
      tokenPresente
    ) {
      isRedirecting = true;

      // Limpiar sesión
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      // Usar router de Vue para respetar el ciclo de vida de la app
      import("../router")
        .then(({ default: router }) => {
          //  MEJORA: Pasar expired=true para que el Login pueda mostrar
          //    un mensaje específico de "Tu sesión expiró, inicia sesión nuevamente"
          //    diferenciándolo visualmente de un logout voluntario.
          return router.replace("/auth/login?expired=true");
        })
        .finally(() => {
          //   MEJORA: Cleanup garantizado en finally — antes solo se ejecutaba
          //    en .finally() del router.replace(), pero si el import() fallaba,
          //    isRedirecting quedaba true para siempre, bloqueando futuras
          //    redirecciones por sesión expirada.
          isRedirecting = false;
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

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// ✅ Vacío en dev usa el proxy de Vite; en prod usa la URL real del .env
const BASE_URL = import.meta.env.VITE_API_URL || "";
console.log("🌐 BASE_URL:", JSON.stringify(BASE_URL));

// ✅ URL explícita para navegación directa del browser (OAuth2 redirect)
export const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

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
    const token = localStorage.getItem("authToken");
    console.log("🔐 Request a:", config.url, "Token presente:", !!token);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Authorization:", config.headers.Authorization);
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
]);

let isRedirecting = false;

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    const rawUrl = error.config?.url ?? "";
    const pathname = rawUrl.split("?")[0];
    const isIgnored = IGNORED_PATHS.has(pathname);

    // ✅ FIX: No redirigir si estamos procesando el callback de OAuth2.
    // Durante el flujo OAuth, el token se acaba de guardar y puede haber
    // peticiones en vuelo que aún no lo tienen — no son sesiones expiradas.
    const isOAuthCallback = window.location.pathname === "/oauth/callback";

    if (
      error.response?.status === 401 &&
      !isIgnored &&
      !isRedirecting &&
      !isOAuthCallback
    ) {
      isRedirecting = true;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/login?expired=true";
      // ✅ Resetea para no bloquear futuros 401 tras nueva sesión
      setTimeout(() => {
        isRedirecting = false;
      }, 3000);
    }

    return Promise.reject(error);
  },
);

// ── Tipos según DTOs del backend ──────────────────────────────────────────────

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

// ── Contratos de request ──────────────────────────────────────────────────────

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

    // googleLogin eliminado — flujo migrado a OAuth2 redirect de Spring Security

    me: () =>
      api.get<MeResponse>("/api/users/me", {
        params: { _t: Date.now() },
      }),
  },
};

export default api;

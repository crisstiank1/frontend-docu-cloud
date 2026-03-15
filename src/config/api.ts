import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// ✅ Vacío en dev usa el proxy de Vite; en prod usa la URL real del .env
const BASE_URL = import.meta.env.VITE_API_URL || "";

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
    const token = localStorage.getItem("authToken"); // ← key unificada
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
]);

let isRedirecting = false;

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    const rawUrl = error.config?.url ?? "";
    const pathname = rawUrl.split("?")[0];
    const isIgnored = IGNORED_PATHS.has(pathname);

    if (error.response?.status === 401 && !isIgnored && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/login?expired=true";
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

// ✅ Completo — coincide exactamente con record UserResponse.java
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

    googleLogin: (credential: string) =>
      api.post<JwtResponse>("/api/auth/google-login", { credential }),

    me: () =>
      api.get<MeResponse>("/api/users/me", {
        params: { _t: Date.now() },
      }),
  },
};

export default api;

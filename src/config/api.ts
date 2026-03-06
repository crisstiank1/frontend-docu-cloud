import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    const ignoredPaths = ['/api/auth/register','/api/auth/login','/api/auth/forgot-password','/api/auth/reset-password'
  ]
    const isIgnored = ignoredPaths.some(path =>
      error.config?.url?.includes(path)
    )
    if (error.response?.status === 401 && !isIgnored) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/auth/login?expired=true'
    }
    return Promise.reject(error)
  }
)

// ── Tipos exactos según DTOs del backend ──────────────────────────────────────

export interface JwtResponse {
  accessToken: string
  refreshToken: string
  tokenType: string   // siempre "Bearer"
  userId: number      // Long en Java → number en TS
  email: string
  roles: string[]     // Set<String> → string[]
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface MessageResponse {
  message: string
}

export interface MeResponse {
  id: number
  email: string
  enabled: boolean
}

// ── Contratos de request exactos según DTOs del backend ──────────────────────

export const API = {
  auth: {
    register: (data: {
      email: string
      password: string
      name?: string
      recaptchaToken?: string
    }) => api.post<MessageResponse>('/api/auth/register', data),

    login: (data: {
      email: string
      password: string
      recaptchaToken?: string
    }) => api.post<JwtResponse>('/api/auth/login', data),

    logout: () => api.post<void>('/api/auth/logout'),

    refresh: (refreshToken: string) =>
      api.post<TokenRefreshResponse>('/api/auth/refresh', { refreshToken }),

    forgotPassword: (data: {
      email: string
      recaptchaToken?: string
    }) => api.post<MessageResponse>('/api/auth/forgot-password', data),

    resetPassword: (data: {
      token: string
      newPassword: string
    }) => api.post<MessageResponse>('/api/auth/reset-password', data),

    googleLogin: (credential: string) =>
      api.post<JwtResponse>('/api/auth/google-login', { credential }),

    me: () => api.get<MeResponse>('/api/users/me')
  }
}

export default api

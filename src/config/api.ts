// URL base del backend según el entorno
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const API = {
  auth: {
    register:       `${BASE}/auth/register`,
    login:          `${BASE}/auth/login`,
    logout:         `${BASE}/auth/logout`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword:  `${BASE}/auth/reset-password`,
    refresh:        `${BASE}/auth/refresh`,
    me:             `${BASE}/users/me`,
  }
}

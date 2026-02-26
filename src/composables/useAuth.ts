import { reactive, computed } from 'vue'
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken
} from '../services/authService'

interface AuthUser {
  id: number
  email: string
  roles: string[]
}

const state = reactive<{
  user: AuthUser | null
  loading: boolean
  error: string | null
}>({
  user: null,
  loading: false,
  error: null
})

export function useAuth() {

  function loadUserFromStorage() {
    const token = localStorage.getItem('access_token')
    const email = localStorage.getItem('user_email')
    const id    = localStorage.getItem('user_id')
    const roles = localStorage.getItem('user_roles')

    if (token && email && id) {
      state.user = {
        id:    Number(id),
        email: email,
        roles: roles ? JSON.parse(roles) : []
      }
    }
  }

  // Login — ahora recibe captchaToken
  async function login(email: string, password: string, captchaToken?: string) {
    state.loading = true
    state.error   = null
    try {
      const json = await apiLogin({ email, password, captchaToken })
      state.user = {
        id:    json.userId,
        email: json.email,
        roles: json.roles
      }
    } catch (err: any) {
      state.error = err.message
    } finally {
      state.loading = false
    }
  }

  async function register(name: string, email: string, password: string) {
    state.loading = true
    state.error   = null
    try {
      await apiRegister({ name, email, password })
    } catch (err: any) {
      state.error = err.message
    } finally {
      state.loading = false
    }
  }

  // Logout — ahora limpia localStorage
  async function logout() {
    state.loading = true
    state.error   = null
    try {
      await apiLogout()
    } catch (err: any) {
      state.error = err.message
    } finally {
      state.user    = null
      state.loading = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_roles')
    }
  }

  async function refreshToken() {
    try {
      await apiRefreshToken()
    } catch {
      state.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_roles')
    }
  }

  function clearError() {
    state.error = null
  }

  const isAuthenticated = computed(() => !!state.user)
  const isAdmin         = computed(() => state.user?.roles.includes('ADMIN') ?? false)
  const isUser          = computed(() => state.user?.roles.includes('USER') ?? false)

  return {
    user:            computed(() => state.user),
    loading:         computed(() => state.loading),
    error:           computed(() => state.error),
    isAuthenticated,
    isAdmin,
    isUser,
    login,
    register,
    logout,
    refreshToken,
    loadUserFromStorage,
    clearError
  }
}

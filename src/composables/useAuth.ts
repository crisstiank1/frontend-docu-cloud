import { reactive, computed } from 'vue'
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken,
  apiGetMe,
  apiGoogleLogin
} from '../services/authService'

interface AuthUser {
  id: number
  email: string
  enabled: boolean
  roles: string[]
  name: string
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
    const token = localStorage.getItem('authToken')
    const email = localStorage.getItem('user_email')
    const id    = localStorage.getItem('user_id')
    const roles = localStorage.getItem('user_roles')
    const name  = localStorage.getItem('user_name')

    if (token && email && id) {
      state.user = {
        id: Number(id),
        email,
        enabled: true,
        roles: roles ? JSON.parse(roles) : [],
        name: name || email.split('@')[0]
      }
    }
  }

  async function login(email: string, password: string, recaptchaToken?: string) {
    state.loading = true
    state.error = null
    try {
      await apiLogin({ email, password, recaptchaToken })
      const me = await apiGetMe()
      state.user = {
        id: me.id,
        email: me.email,
        enabled: me.enabled,
        roles: JSON.parse(localStorage.getItem('user_roles') || '[]'),
        name: localStorage.getItem('user_name') || me.email.split('@')[0]
      }
    } catch (err: any) {
      const status = err.response?.status
      const backendError = err.response?.data?.error || err.response?.data?.message

      if (status === 500 || status === 401) {
        state.error = 'Correo o contraseña incorrectos'
      } else {
        state.error = backendError || err.message || 'Error de autenticación'
      }
      throw err
    } finally {
      state.loading = false
    }
  }

  async function loginWithGoogle(credential: string) {
    state.loading = true
    state.error = null
    try {
      const data = await apiGoogleLogin(credential)
      const me = await apiGetMe()
      state.user = {
        id: me.id,
        email: me.email,
        enabled: me.enabled,
        roles: data.roles,
        name: localStorage.getItem('user_name') || me.email.split('@')[0]
      }
    } catch (err: any) {
      state.error = err.response?.data?.message || err.message || 'Error con Google'
      throw err
    } finally {
      state.loading = false
    }
  }

  async function register(name: string, email: string, password: string, recaptchaToken?: string) {
    state.loading = true
    state.error = null
    try {
      await apiRegister({ name, email, password, recaptchaToken })
    } catch (err: any) {
      state.error = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al registrar'
      throw err
    } finally {
      state.loading = false
    }
  }

  async function logout() {
    state.loading = true
    try {
      await apiLogout()
    } catch (err: any) {
      state.error = err.message
    } finally {
      state.user = null
      state.loading = false
    }
  }

  async function refreshToken() {
    try {
      await apiRefreshToken()
      loadUserFromStorage()
    } catch {
      await logout()
    }
  }

  function clearError() {
    state.error = null
  }

  const isAuthenticated = computed(() => !!state.user)
  const isAdmin = computed(() => state.user?.roles.includes('ADMIN') ?? false)
  const isUser  = computed(() => state.user?.roles.includes('USER')  ?? false)

  async function initialize() {
    loadUserFromStorage()
    if (state.user && localStorage.getItem('authToken')) {
      await refreshToken()
    }
  }

  // ─── Cambiar rol (solo testing) ───────────────────────────────────
  function switchRole(role: string) {
    if (!state.user) return
    const roleMap: Record<string, string> = {
      admin:    'ADMIN',
      standard: 'USER',
      guest:    'GUEST'
    }
    const backendRole = roleMap[role] || role.toUpperCase()
    state.user = { ...state.user, roles: [backendRole] }
    localStorage.setItem('user_roles', JSON.stringify([backendRole]))
  }

  // ─── Actualizar perfil ────────────────────────────────────────────
  async function updateProfile(data: { name: string; email: string }) {
    state.loading = true
    state.error = null
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al actualizar perfil')
      }
      if (state.user) {
        state.user = { ...state.user, name: data.name, email: data.email }
        localStorage.setItem('user_name', data.name)
        localStorage.setItem('user_email', data.email)
      }
    } catch (err: any) {
      state.error = err.message
      throw err
    } finally {
      state.loading = false
    }
  }

  // ─── Cambiar contraseña ───────────────────────────────────────────
  async function changePassword(currentPassword: string, newPassword: string) {
    state.loading = true
    state.error = null
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Contraseña actual incorrecta')
      }
    } catch (err: any) {
      state.error = err.message
      throw err
    } finally {
      state.loading = false
    }
  }

  return {
    user:            computed(() => state.user),
    loading:         computed(() => state.loading),
    error:           computed(() => state.error),
    isAuthenticated,
    isAdmin,
    isUser,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshToken,
    loadUserFromStorage,
    clearError,
    initialize,
    switchRole,
    updateProfile,
    changePassword
  }
}

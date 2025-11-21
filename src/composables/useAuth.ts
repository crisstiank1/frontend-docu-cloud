import { reactive, toRefs } from 'vue'

const SESSION_KEY = 'docucloud_session_v1'
const TOKEN_KEY = 'docucloud_access_token'
const REFRESH_KEY = 'docucloud_refresh_token'

const state = reactive<{ user: any, loading: boolean, error: string | null }>({
  user: null,
  loading: false,
  error: null
})

try {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) state.user = JSON.parse(raw)
} catch {}

export function useAuth() {
  async function register({ name, email, password }: { name: string, email: string, password: string }) {
    state.loading = true; state.error = null
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        state.error = data.error ?? data.message ?? 'Error'
        return { ok: false, error: state.error }
      }
      return { ok: true, message: data.message }
    }
    catch (e) { state.error = 'Error de red'; return { ok: false, error: state.error } }
    finally { state.loading = false }
  }

  async function login({ email, password }: { email: string, password: string }) {
    state.loading = true; state.error = null
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        state.error = data.error ?? data.message ?? 'Error'
        return { ok: false, error: state.error }
      }
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_KEY, data.refreshToken)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: data.userId, email: data.email, roles: data.roles }))
      state.user = { userId: data.userId, email: data.email, roles: data.roles }
      return { ok: true }
    }
    catch (e) { state.error = 'Error de red'; return { ok: false, error: state.error } }
    finally { state.loading = false }
  }

  async function loginWithGoogle(googleToken: string) {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken })
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.error ?? data.message ?? 'Error' }
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: data.userId, email: data.email, roles: data.roles }))
    state.user = { userId: data.userId, email: data.email, roles: data.roles }
    return { ok: true }
  }

  async function fetchUser() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    const res = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const user = await res.json()
    state.user = user
    return user
  }

  async function refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) return null
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    const data = await res.json()
    if (!res.ok) { logout(); return null }
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    return data
  }

  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(SESSION_KEY)
    state.user = null
  }

  return {
    ...toRefs(state),
    register,
    login,
    loginWithGoogle,
    fetchUser,
    refreshToken,
    logout
  }
}

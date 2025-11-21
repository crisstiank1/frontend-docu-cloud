import { reactive, toRefs } from 'vue'
import { sha256 } from '../utils/crypto'

const USERS_KEY = 'docucloud_users_v1'
const SESSION_KEY = 'docucloud_session_v1'

function loadUsers(): Record<string, { id: string; name: string; email: string; pass?: string }> {
  try { const raw = localStorage.getItem(USERS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}
function saveUsers(users: Record<string, { id: string; name: string; email: string; pass?: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function decodeGoogleToken(token: string): { name: string; email: string; picture?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = JSON.parse(atob(parts[1]))
    return { name: decoded.name, email: decoded.email, picture: decoded.picture }
  } catch {
    return null
  }
}

const state = reactive<{ user: { id: string; name: string; email: string } | null }>({ user: null })
try { const raw = localStorage.getItem(SESSION_KEY); if (raw) state.user = JSON.parse(raw) } catch {}

export function useAuth() {
  async function register({ name, email, password }: { name: string; email: string; password: string }) {
    const emailNorm = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) return { ok: false, error: 'Email inválido' } as const
    if (password.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' } as const
    if (!name.trim()) return { ok: false, error: 'Ingresa tu nombre' } as const
    const users = loadUsers()
    if (users[emailNorm]) return { ok: false, error: 'Ya existe un usuario con este email' } as const
    const id = crypto.randomUUID(); const pass = await sha256(password)
    users[emailNorm] = { id, name: name.trim(), email: emailNorm, pass }
    saveUsers(users)
    const u = { id, name: name.trim(), email: emailNorm }
    localStorage.setItem(SESSION_KEY, JSON.stringify(u)); state.user = u
    return { ok: true } as const
  }
  async function login({ email, password }: { email: string; password: string }) {
    const users = loadUsers(); const u = users[email.trim().toLowerCase()]
    if (!u) return { ok: false, error: 'Usuario no encontrado' } as const
    const pass = await sha256(password)
    if (u.pass !== pass) return { ok: false, error: 'Credenciales inválidas' } as const
    const session = { id: u.id, name: u.name, email: u.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session)); state.user = session
    return { ok: true } as const
  }
  async function loginWithGoogle(googleToken: string) {
    const decoded = decodeGoogleToken(googleToken)
    if (!decoded) return { ok: false, error: 'Token inválido' } as const
    const emailNorm = decoded.email.trim().toLowerCase()
    const users = loadUsers()
    let userId = users[emailNorm]?.id
    if (!users[emailNorm]) {
      userId = crypto.randomUUID()
      users[emailNorm] = { id: userId, name: decoded.name, email: emailNorm }
      saveUsers(users)
    }
    const session = { id: userId, name: decoded.name, email: emailNorm }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session)); state.user = session
    return { ok: true } as const
  }
  function logout() { localStorage.removeItem(SESSION_KEY); state.user = null }
  return { ...toRefs(state), register, login, loginWithGoogle, logout }
}

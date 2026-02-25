import { reactive, toRefs } from 'vue'
import { useAuditLog } from './useAuditLog'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export type UserRole = 'admin' | 'standard' | 'guest'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  pass?: string
  blocked?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

const USERS_KEY = 'docucloud_users_v1'
const SESSION_KEY = 'docucloud_session_v1'
const DEFAULT_ADMIN_EMAIL = 'admin@docucloud.local'

const TEST_USERS: Array<{ email: string; name: string; role: UserRole }> = [
  { email: 'standard@test.local', name: 'Standard User', role: 'standard' },
  { email: 'guest@test.local', name: 'Guest User', role: 'guest' }
]

const DEFAULT_TEST_PASSWORD = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'

function seedTestUsers() {
  const users = loadUsers()
  TEST_USERS.forEach(testUser => {
    if (!users[testUser.email]) {
      const testId = crypto.randomUUID()
      const now = new Date().toISOString()
      users[testUser.email] = {
        id: testId,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        pass: DEFAULT_TEST_PASSWORD,
        createdAt: now,
        updatedAt: now
      }
    }
  })
  saveUsers(users)
}

function initializeDefaultAdmin() {
  const users = loadUsers()
  if (!users[DEFAULT_ADMIN_EMAIL]) {
    const adminId = crypto.randomUUID()
    users[DEFAULT_ADMIN_EMAIL] = {
      id: adminId,
      name: 'Admin',
      email: DEFAULT_ADMIN_EMAIL,
      role: 'admin',
      pass: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveUsers(users)
  }
  seedTestUsers()
}

function loadUsers(): Record<string, User> {
  try { const raw = localStorage.getItem(USERS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}

function saveUsers(users: Record<string, User>) {
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

const state = reactive<{ user: SessionUser | null }>({ user: null })
try { const raw = localStorage.getItem(SESSION_KEY); if (raw) state.user = JSON.parse(raw) } catch {}

initializeDefaultAdmin()

export function useAuth() {
  const { addLog } = useAuditLog()

  async function register({ name, email, password }: { name: string; email: string; password: string }) {
    const emailNorm = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) return { ok: false, error: 'Email inválido' } as const
    if (password.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' } as const
    if (!name.trim()) return { ok: false, error: 'Ingresa tu nombre' } as const
    const users = loadUsers()
    if (users[emailNorm]) return { ok: false, error: 'Ya existe un usuario con este email' } as const
    const id = crypto.randomUUID()
    const pass = await sha256(password)
    const now = new Date().toISOString()
    users[emailNorm] = { id, name: name.trim(), email: emailNorm, role: 'standard', pass, createdAt: now, updatedAt: now }
    saveUsers(users)
    const u: SessionUser = { id, name: name.trim(), email: emailNorm, role: 'standard' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    state.user = u

    addLog({ action: 'user_created', userId: id, userName: name.trim(), userEmail: emailNorm })

    return { ok: true } as const
  }

  async function login({ email, password }: { email: string; password: string }) {
    const users = loadUsers()
    const u = users[email.trim().toLowerCase()]
    if (!u) return { ok: false, error: 'Usuario no encontrado' } as const
    if (u.blocked) return { ok: false, error: 'Usuario bloqueado' } as const
    const pass = await sha256(password)
    if (u.pass !== pass) return { ok: false, error: 'Credenciales inválidas' } as const
    const session: SessionUser = { id: u.id, name: u.name, email: u.email, role: u.role }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    state.user = session

    addLog({ action: 'login', userId: u.id, userName: u.name, userEmail: u.email })

    return { ok: true } as const
  }

  async function loginWithGoogle(googleToken: string) {
    const decoded = decodeGoogleToken(googleToken)
    if (!decoded) return { ok: false, error: 'Token inválido' } as const
    const emailNorm = decoded.email.trim().toLowerCase()
    const users = loadUsers()
    let userId = users[emailNorm]?.id
    const userRole: string = users[emailNorm]?.role || 'standard'
    if (!users[emailNorm]) {
      userId = crypto.randomUUID()
      const now = new Date().toISOString()
      users[emailNorm] = { id: userId, name: decoded.name, email: emailNorm, role: 'standard', createdAt: now, updatedAt: now }
      saveUsers(users)
    }
    const session: SessionUser = { id: userId, name: decoded.name, email: emailNorm, role: userRole }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    state.user = session

    addLog({ action: 'login', userId: userId, userName: decoded.name, userEmail: emailNorm, details: { provider: 'google' } })

    return { ok: true } as const
  }

  function logout() {
    if (state.user) {
      addLog({ action: 'logout', userId: state.user.id, userName: state.user.name, userEmail: state.user.email })
    }
    localStorage.removeItem(SESSION_KEY)
    state.user = null
  }

  function hasRole(roles: UserRole | UserRole[]): boolean {
    if (!state.user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role as UserRole)
  }

  function getAllUsers(): User[] {
    const users = loadUsers()
    return Object.values(users).sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  }

  function updateUser(email: string, updates: Partial<User>): boolean {
    const users = loadUsers()
    const emailNorm = email.toLowerCase()
    if (!users[emailNorm]) return false
    users[emailNorm] = { ...users[emailNorm], ...updates, updatedAt: new Date().toISOString() }
    saveUsers(users)

    if (updates.role && state.user) {
      addLog({
        action: 'user_role_changed',
        userId: state.user.id,
        userName: state.user.name,
        userEmail: state.user.email,
        details: { targetEmail: emailNorm, newRole: updates.role }
      })
    }

    if (state.user?.email === emailNorm && updates.role) {
      state.user.role = updates.role
      localStorage.setItem(SESSION_KEY, JSON.stringify(state.user))
    }
    return true
  }

  function deleteUser(email: string): boolean {
    const users = loadUsers()
    const emailNorm = email.toLowerCase()
    if (!users[emailNorm] || emailNorm === DEFAULT_ADMIN_EMAIL) return false

    const deletedUser = users[emailNorm]
    delete users[emailNorm]
    saveUsers(users)

    if (state.user) {
      addLog({
        action: 'user_deleted',
        userId: state.user.id,
        userName: state.user.name,
        userEmail: state.user.email,
        details: { deletedEmail: emailNorm, deletedName: deletedUser.name }
      })
    }
    return true
  }

  function switchRole(newRole: UserRole): boolean {
    if (!state.user) return false
    state.user = { ...state.user, role: newRole }
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.user))
    return true
  }

  // ─────────────────────────────────────────────────────────────────
  // ✅ NUEVO: Actualizar nombre y/o email del perfil propio
  // ─────────────────────────────────────────────────────────────────
  async function updateProfile(data: { name: string; email: string }): Promise<void> {
    if (!state.user) throw new Error('No hay sesión activa.')

    const newName  = data.name.trim()
    const newEmail = data.email.trim().toLowerCase()

    // Validaciones frontend (espejo del backend)
    if (!newName) throw new Error('El nombre no puede estar vacío.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw new Error('El email no es válido.')

    const users     = loadUsers()
    const oldEmail  = state.user.email.toLowerCase()

    // Si el email cambia, verificar que no esté ocupado por otro usuario
    if (newEmail !== oldEmail && users[newEmail]) {
      throw new Error('Este correo ya está registrado. Usa otro.')
    }

    const existingUser = users[oldEmail]
    if (!existingUser) throw new Error('Usuario no encontrado.')

    const now = new Date().toISOString()

    // Si el email cambia: crear nueva clave y borrar la anterior
    if (newEmail !== oldEmail) {
      users[newEmail] = { ...existingUser, name: newName, email: newEmail, updatedAt: now }
      delete users[oldEmail]
    } else {
      users[oldEmail] = { ...existingUser, name: newName, updatedAt: now }
    }

    saveUsers(users)

    // Actualizar sesión reactiva
    state.user = { ...state.user, name: newName, email: newEmail }
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.user))

    addLog({
      action: 'user_profile_updated',
      userId: state.user.id,
      userName: newName,
      userEmail: newEmail,
      details: {
        previousName:  existingUser.name,
        previousEmail: oldEmail
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────
  // ✅ NUEVO: Cambiar contraseña del usuario autenticado
  // ─────────────────────────────────────────────────────────────────
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!state.user) throw new Error('No hay sesión activa.')

    // Validar fortaleza de la nueva contraseña (igual que el registro)
    if (newPassword.length < 8)          throw new Error('La contraseña debe tener al menos 8 caracteres.')
    if (!/[A-Z]/.test(newPassword))      throw new Error('La contraseña debe tener al menos una mayúscula.')
    if (!/[0-9]/.test(newPassword))      throw new Error('La contraseña debe tener al menos un número.')

    const users     = loadUsers()
    const emailNorm = state.user.email.toLowerCase()
    const stored    = users[emailNorm]

    if (!stored) throw new Error('Usuario no encontrado.')

    // Verificar contraseña actual
    const currentHash = await sha256(currentPassword)
    if (stored.pass !== currentHash) throw new Error('La contraseña actual es incorrecta.')

    // Guardar nueva contraseña hasheada
    const newHash = await sha256(newPassword)
    users[emailNorm] = { ...stored, pass: newHash, updatedAt: new Date().toISOString() }
    saveUsers(users)

    addLog({
      action: 'user_password_changed',
      userId: state.user.id,
      userName: state.user.name,
      userEmail: emailNorm
    })

    // El componente se encarga del logout y redirect tras llamar esta función
  }

  return {
    ...toRefs(state),
    register,
    login,
    loginWithGoogle,
    logout,
    hasRole,
    getAllUsers,
    updateUser,
    deleteUser,
    switchRole,
    updateProfile,   // ✅ nuevo
    changePassword   // ✅ nuevo
  }
}

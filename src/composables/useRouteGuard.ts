import { useRouter } from 'vue-router'
import { useAuth, type UserRole } from './useAuth'

export function useRouteGuard() {
  const { user } = useAuth()
  const router = useRouter()

  function requireAuth() {
    if (!user.value) {
      router.replace('/auth/login')
      return false
    }
    return true
  }

  function requireRole(requiredRoles: UserRole | UserRole[]) {
    if (!requireAuth()) return false
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    if (!rolesArray.includes(user.value!.role)) {
      router.replace('/dashboard') // ✅ Cambiado de '/' a '/dashboard'
      return false
    }
    return true
  }

  function requireAdmin() {
    return requireRole('admin')
  }

  return { requireAuth, requireRole, requireAdmin }
}

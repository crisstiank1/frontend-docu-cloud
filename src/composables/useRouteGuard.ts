import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'

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

  function requireRole(requiredRoles: string | string[]) {
  if (!requireAuth()) return false
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  if (!user.value!.roles.some(r => rolesArray.includes(r))) {
    router.replace('/dashboard')
    return false
  }
  return true
  }

  function requireAdmin() {
    return requireRole('admin')
  }

  return { requireAuth, requireRole, requireAdmin }
}

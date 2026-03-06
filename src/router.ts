import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Login from './pages/auth/Login.vue'
import Register from './pages/auth/Register.vue'
import ForgotPassword from './pages/auth/ForgotPassword.vue'
import ResetPassword from './pages/auth/ResetPassword.vue'
import Profile from './pages/Profile.vue'
import Dashboard from './pages/Dashboard.vue'
import Documents from './pages/documents/Documents.vue'
import DocumentViewer from './pages/documents/DocumentViewer.vue'
import Users from './pages/users/Users.vue'
import SharedWithMe from './pages/collaboration/SharedWithMe.vue'
import History from './pages/history/History.vue'
import Classification from './pages/classification/Classification.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Rutas públicas
    { path: '/',                    component: Home },
    { path: '/auth/login',          component: Login,          meta: { guestOnly: true } },
    { path: '/auth/registro',       component: Register,       meta: { guestOnly: true } },
    { path: '/auth/reset',          component: ForgotPassword, meta: { guestOnly: true } },
    { path: '/auth/nueva-password', component: ResetPassword,  meta: { guestOnly: true } },

    // Rutas privadas
    { path: '/perfil',        component: Profile,        meta: { requiresAuth: true } },
    { path: '/dashboard',     component: Dashboard,      meta: { requiresAuth: true } },
    { path: '/documents',     component: Documents,      meta: { requiresAuth: true } },
    { path: '/documents/:id', component: DocumentViewer, meta: { requiresAuth: true } },
    { path: '/compartidos',   component: SharedWithMe,   meta: { requiresAuth: true } },
    { path: '/clasificacion', component: Classification, meta: { requiresAuth: true } },

    // Rutas solo ADMIN
    { path: '/usuarios', component: Users,   meta: { requiresAuth: true, requiresRole: 'ADMIN' } },
    { path: '/historial', component: History, meta: { requiresAuth: true, requiresRole: 'ADMIN' } },

    // Fallback
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  // ✅ 'authToken' y 'user_id' — coinciden con lo que guarda useAuth
  const token          = localStorage.getItem('authToken')
  const userId         = localStorage.getItem('user_id')
  const isAuthenticated = !!token && !!userId

  // Reconstruye roles desde localStorage
  const roles: string[] = JSON.parse(localStorage.getItem('user_roles') || '[]')

  // 1. Ruta privada sin sesión → redirige al login guardando el destino
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/auth/login', query: { redirect: to.fullPath } })
    return
  }

  // 2. Ruta de solo ADMIN sin el rol → redirige al dashboard
  if (to.meta.requiresRole && !roles.includes(to.meta.requiresRole as string)) {
    next('/dashboard')
    return
  }

  // 3. Ruta de invitado (login/registro) con sesión activa → redirige al dashboard
  if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: string
    guestOnly?: boolean
  }
}

export default router

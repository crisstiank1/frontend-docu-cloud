import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth'
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
    { path: '/',               component: Home },
    { path: '/auth/login',     component: Login },
    { path: '/auth/registro',  component: Register },
    { path: '/auth/reset',     component: ForgotPassword },
    { path: '/auth/nueva-password', component: ResetPassword },

    // Rutas privadas (cualquier usuario autenticado)
    { path: '/perfil',             component: Profile,        meta: { requiresAuth: true } },
    { path: '/dashboard',          component: Dashboard,      meta: { requiresAuth: true } },
    { path: '/documents',          component: Documents,      meta: { requiresAuth: true } },
    { path: '/documents/:id',      component: DocumentViewer, meta: { requiresAuth: true } },
    { path: '/compartidos',        component: SharedWithMe,   meta: { requiresAuth: true } },
    { path: '/clasificacion',      component: Classification,  meta: { requiresAuth: true } },

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
  const { user } = useAuth()

  // Redirige al login si la ruta requiere autenticación y no hay sesión
  if (to.meta.requiresAuth && !user.value) {
    next('/auth/login')
    return
  }

  // Redirige al dashboard si la ruta requiere un rol que el usuario no tiene
  if (to.meta.requiresRole && !user.value?.roles.includes(to.meta.requiresRole)) {
    next('/dashboard')
    return
  }

  // Redirige al dashboard si ya está autenticado e intenta ir al login o registro
  if ((to.path === '/auth/login' || to.path === '/auth/registro') && user.value) {
    next('/dashboard')
    return
  }

  next()
})

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: string
  }
}

export default router

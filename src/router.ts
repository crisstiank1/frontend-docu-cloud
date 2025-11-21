import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Demo from './pages/Demo.vue'
import Login from './pages/auth/Login.vue'
import Register from './pages/auth/Register.vue'
import ForgotPassword from './pages/auth/ForgotPassword.vue'
import Share from './pages/Share.vue'
import Profile from './pages/Profile.vue'

// Rutas privadas (requieren login/token)
const protectedRoutes = ['/demo', '/perfil']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/demo', component: Demo },
    { path: '/auth/login', component: Login },
    { path: '/auth/registro', component: Register },
    { path: '/auth/reset', component: ForgotPassword },
    { path: '/perfil', component: Profile },
    { path: '/share/:id', component: Share },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

// Guard global: protege rutas privadas
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('docucloud_access_token')
  if (protectedRoutes.includes(to.path)) {
    if (!accessToken) {
      // Si no hay token, redirige a login
      return next('/auth/login')
    }
  }
  next()
})

export default router

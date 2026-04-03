import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/auth/Login.vue";
import Register from "./pages/auth/Register.vue";
import ForgotPassword from "./pages/auth/ForgotPassword.vue";
import ResetPassword from "./pages/auth/ResetPassword.vue";
import Profile from "./pages/Profile.vue";
import Dashboard from "./pages/Dashboard.vue";
import Documents from "./pages/documents/Documents.vue";
import Users from "./pages/users/Users.vue";
import SharedWithMe from "./pages/collaboration/SharedWithMe.vue";
import History from "./pages/history/History.vue";
import Classification from "./pages/classification/Classification.vue";
import OAuthCallback from "./pages/auth/OAuthCallback.vue";
import { useAuth } from "./composables/useAuth";

// ─── Declaración de tipos para meta ──────────────────────────────────────────
declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresRole?: string;
    guestOnly?: boolean;
  }
}

// ─── Rutas ────────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Públicas ──────────────────────────────────────────────────────────────
    { path: "/", component: Home },
    { path: "/auth/login", component: Login, meta: { guestOnly: true } },
    { path: "/auth/register", component: Register, meta: { guestOnly: true } },
    {
      path: "/auth/reset",
      component: ForgotPassword,
      meta: { guestOnly: true },
    },
    {
      path: "/auth/reset-password",
      component: ResetPassword,
      meta: { guestOnly: true },
    },

    // ── OAuth callback — sin meta, el guard lo bypasea explícitamente ─────────
    { path: "/oauth/callback", component: OAuthCallback },

    // ── Privadas ──────────────────────────────────────────────────────────────
    { path: "/profile", component: Profile, meta: { requiresAuth: true } },
    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/files", component: Documents, meta: { requiresAuth: true } },
    { path: "/shared", component: SharedWithMe, meta: { requiresAuth: true } },
    {
      path: "/classification",
      component: Classification,
      meta: { requiresAuth: true },
    },

    // ── Solo ADMIN ────────────────────────────────────────────────────────────
    {
      path: "/users",
      component: Users,
      meta: { requiresAuth: true, requiresRole: "ADMIN" },
    },
    {
      path: "/history",
      component: History,
      meta: { requiresAuth: true, requiresRole: "ADMIN" },
    },

    // ── Fallback ──────────────────────────────────────────────────────────────
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],

  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

// ─── Guard global ─────────────────────────────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  // 1. El callback de OAuth nunca pasa por el guard — maneja su propio flujo
  if (to.path === "/oauth/callback") {
    return next();
  }

  // 2. Una sola instancia de useAuth (singleton reactivo)
  const auth = useAuth();

  // 3. Esperar inicialización si aún no ocurrió (primera carga o post-logout)
  if (!auth.initialized.value) {
    await auth.initialize();
  }

  // 4. Leer valores una sola vez (evita doble declaración)
  const authenticated = auth.isAuthenticated.value;
  const roles = auth.user.value?.roles ?? [];
  const requiredRole = to.meta.requiresRole;

  // 5. Ruta con error OAuth → dejar pasar siempre (mostrar mensaje al usuario)
  if (to.path === "/auth/login" && to.query.error) {
    return next();
  }

  // 6. Ruta privada sin sesión → login (guarda la ruta destino para redirigir tras login)
  if (to.meta.requiresAuth && !authenticated) {
    return next({ path: "/auth/login", query: { redirect: to.fullPath } });
  }

  // 7. Ruta con rol requerido pero el usuario no lo tiene → dashboard
  if (requiredRole && !roles.includes(requiredRole)) {
    return next("/dashboard");
  }

  // 8. Ruta de invitado con sesión activa → dashboard
  if (to.meta.guestOnly && authenticated) {
    return next("/dashboard");
  }

  // 9. Todo OK
  return next();
});

export default router;

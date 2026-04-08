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
import { useAuth, isLoggingOut } from "./composables/useAuth";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresRole?: string;
    guestOnly?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    {
      path: "/auth/login",
      name: "login",
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: "/auth/register",
      name: "register",
      component: Register,
      meta: { guestOnly: true },
    },
    {
      path: "/auth/reset",
      name: "forgot-password",
      component: ForgotPassword,
    },
    {
      path: "/auth/reset-password",
      name: "reset-password",
      component: ResetPassword,
    },
    { path: "/oauth/callback", component: OAuthCallback },
    { path: "/profile", component: Profile, meta: { requiresAuth: true } },
    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/files", component: Documents, meta: { requiresAuth: true } },
    { path: "/shared", component: SharedWithMe, meta: { requiresAuth: true } },
    {
      path: "/classification",
      component: Classification,
      meta: { requiresAuth: true },
    },
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
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

router.beforeEach(async (to, _from, next) => {
  if (to.path === "/oauth/callback") {
    return next();
  }

  if (isLoggingOut.value) {
    isLoggingOut.value = false;
    return next();
  }

  const auth = useAuth();

  if (!auth.initialized.value) {
    await auth.initialize();
  }

  const authenticated = auth.isAuthenticated.value;
  const roles = auth.user.value?.roles ?? [];
  const requiredRole = to.meta.requiresRole;

  if (to.path === "/auth/login" && to.query.error) {
    return next();
  }

  if (to.meta.requiresAuth && !authenticated) {
    return next({ path: "/auth/login", query: { redirect: to.fullPath } });
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return next("/dashboard");
  }

  if (to.meta.guestOnly && authenticated) {
    return next("/dashboard");
  }

  return next();
});

export default router;
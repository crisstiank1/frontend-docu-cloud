import { ref, computed } from "vue";
import {
  apiGetAllUsers,
  apiUpdateRole,
  apiToggleStatus,
  apiDeleteUser,
  apiUpdateLimits,
  type UserResponse,
  type UserLimits,
} from "@/services/userService";
import { useToast } from "@/composables/useToast";

export function useAdminUsers() {
  const toast = useToast(); // ✅ minúscula consistente en todo el archivo

  const users = ref<UserResponse[]>([]);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const currentPage = ref(0);
  const isLoading = ref(false);
  const search = ref("");

  // ── Carga paginada ─────────────────────────────────────────────────────────
  async function fetchUsers(page?: number, size?: number) {
    isLoading.value = true;
    // Si vienen parámetros los usa, si no usa los valores del estado
    if (page !== undefined) currentPage.value = page;
    try {
      const data = await apiGetAllUsers({
        page: currentPage.value,
        size: size ?? 10, // ← usa el size que le pasen, o 10 por defecto
        search: search.value || undefined,
      });
      users.value = data.content;
      totalPages.value = data.totalPages;
      totalItems.value = data.totalElements;
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Error al cargar usuarios");
    } finally {
      isLoading.value = false;
    }
  }

  // ── Acciones ───────────────────────────────────────────────────────────────
  async function changeRole(id: number, role: "USER" | "ADMIN") {
    try {
      sync(await apiUpdateRole(id, role));
      toast.success("Rol actualizado");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Error al cambiar rol");
    }
  }

  async function toggleStatus(id: number) {
    try {
      const updated = await apiToggleStatus(id);
      sync(updated);
      toast.success(`Usuario ${updated.enabled ? "activado" : "desactivado"}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Error al cambiar estado");
    }
  }

  async function removeUser(id: number) {
    try {
      await apiDeleteUser(id);
      users.value = users.value.filter((u: UserResponse) => u.id !== id);
      totalItems.value--;
      toast.success("Usuario eliminado");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Error al eliminar");
    }
  }

  async function saveLimits(id: number, limits: UserLimits) {
    try {
      sync(await apiUpdateLimits(id, limits));
      toast.success("Límites guardados");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Error al guardar límites");
    }
  }

  // ── Paginación y búsqueda ──────────────────────────────────────────────────
  function goToPage(page: number) {
    currentPage.value = page;
    fetchUsers();
  }

  function setSearch(q: string) {
    search.value = q;
    currentPage.value = 0;
    fetchUsers();
  }

  // Actualiza un usuario en lista local sin recargar todo
  function sync(updated: UserResponse) {
    const i = users.value.findIndex((u: UserResponse) => u.id === updated.id);
    if (i !== -1) users.value[i] = updated;
  }

  return {
    users: computed(() => users.value),
    totalPages: computed(() => totalPages.value),
    totalItems: computed(() => totalItems.value),
    currentPage: computed(() => currentPage.value),
    isLoading: computed(() => isLoading.value),
    fetchUsers,
    changeRole,
    toggleStatus,
    removeUser,
    saveLimits,
    goToPage,
    setSearch,
  };
}

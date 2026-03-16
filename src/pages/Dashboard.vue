<template>
  <section class="p-6 space-y-6">
    <WelcomeSection :user-name="user?.name || 'Usuario'" />
    <!-- ===== LOADING ===== -->
    <div
      v-if="loading || loadingStats"
      class="flex items-center justify-center py-20"
    >
      <div
        class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
      />
    </div>

    <template v-else>
      <!-- ===== STATS CARDS ===== -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total de Archivos"
          :value="totalElements"
          unit="archivos"
          :trend="totalElements > 3 ? 'up' : 'stable'"
          :change="3"
        />
        <StatsCard
          label="Compartidos"
          :value="sharedWithMe.length"
          unit="archivos"
          :trend="sharedWithMe.length > 1 ? 'up' : 'stable'"
          :change="1"
        />
        <StatsCard
          v-if="user?.roles?.includes('ADMIN')"
          label="Usuarios Activos"
          :value="totalUsers"
          unit="usuarios"
          trend="up"
          :change="2"
        />
        <StatsCard
          v-else
          label="Carpetas"
          :value="totalFolders"
          unit="carpetas"
          trend="stable"
        />
        <StatsCard
          label="Espacio Utilizado"
          :value="storageMB"
          unit="MB"
          :trend="storageMB > 100 ? 'up' : 'stable'"
          :progress="storagePercent"
          progressMax="1 GB"
        />
      </div>

      <!-- ===== DASHBOARD CARDS ===== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Mis Archivos"
          description="Ver y gestionar tus archivos"
          :count="totalElements"
          countLabel="archivos"
          to="/documents"
          icon-color="#6366f1"
          icon-bg-color="#6366f130"
        >
          <template #icon>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="color: #6366f1; stroke-width: 1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Clasificación"
          description="Organiza tus categorías"
          :count="categories.length"
          countLabel="categorías"
          to="/clasificacion"
          icon-color="#10b981"
          icon-bg-color="#10b98130"
        >
          <template #icon>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="color: #10b981; stroke-width: 1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Compartidos"
          description="Archivos compartidos contigo"
          :count="sharedWithMe.length"
          countLabel="archivos"
          to="/compartidos"
          icon-color="#ec4899"
          icon-bg-color="#ec489930"
        >
          <template #icon>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="color: #ec4899; stroke-width: 1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 12H9m0 0l3-3m-3 3l-3-3m3 3l3 3"
              />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.roles?.includes('ADMIN')"
          title="Usuarios"
          description="Gestiona los usuarios del sistema"
          :count="totalUsers"
          countLabel="usuarios"
          to="/usuarios"
          icon-color="#f59e0b"
          icon-bg-color="#f59e0b30"
        >
          <template #icon>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="color: #f59e0b; stroke-width: 1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.roles?.includes('ADMIN')"
          title="Historial"
          description="Auditoría y registro de acciones"
          :count="totalLogs"
          countLabel="registros"
          to="/historial"
          icon-color="#8b5cf6"
          icon-bg-color="#8b5cf630"
        >
          <template #icon>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="color: #8b5cf6; stroke-width: 1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </template>
        </DashboardCard>
      </div>

      <!-- ===== BOTTOM GRID ===== -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- ===== ACTIVIDAD RECIENTE ===== -->
        <div class="lg:col-span-2">
          <!-- ✅ Bug 1 corregido: pasar recentLogs en lugar de [] -->
          <RecentActivityWidget
            :activities="recentLogs"
            :can-view-history="user?.roles?.includes('ADMIN') ?? false"
          />
        </div>

        <!-- Sidebar derecho -->
        <div class="space-y-4">
          <!-- Tips -->
          <div
            class="p-5 rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20"
          >
            <h3 class="font-semibold mb-3 flex items-center gap-2 text-sm">
              <svg
                class="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Consejos y Ayuda
            </h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2">
                <span class="text-primary font-bold flex-shrink-0">•</span
                ><span>Organiza tus archivos con categorías</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold flex-shrink-0">•</span
                ><span>Comparte archivos de forma segura</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold flex-shrink-0">•</span
                ><span>Usa búsqueda avanzada para encontrar rápido</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold flex-shrink-0">•</span
                ><span>Revisa el historial de cambios regularmente</span>
              </li>
            </ul>
          </div>

          <!-- Acciones rápidas -->
          <div class="p-5 rounded-xl border bg-card">
            <h3 class="font-semibold mb-3 flex items-center gap-2 text-sm">
              <svg
                class="w-4 h-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Acciones Rápidas
            </h3>
            <div class="space-y-1">
              <router-link
                to="/documents"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors"
              >
                <span class="text-primary">+</span> Subir Archivo
              </router-link>
              <router-link
                to="/clasificacion"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors"
              >
                <span class="text-primary">+</span> Nueva Categoría
              </router-link>
              <router-link
                v-if="user?.roles?.includes('ADMIN')"
                to="/usuarios"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors"
              >
                <span class="text-primary">+</span> Agregar Usuario
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "../composables/useAuth";
import { useAudit } from "../composables/useAudit";
import { useDocuments } from "../composables/useDocuments";
import { useAdminUsers } from "../composables/useAdminUsers";
import DashboardCard from "../components/DashboardCard.vue";
import StatsCard from "../components/StatsCard.vue";
import RecentActivityWidget from "../components/RecentActivityWidget.vue";
import WelcomeSection from "../components/WelcomeSection.vue";
import api from "@/config/api";

const { user } = useAuth();
const {
  categories,
  folders,
  loading,
  totalElements,
  getSharedWithMe,
  fetchDocuments,
} = useDocuments();
const { logs, totalElements: totalLogs, fetchLogs, fetchMyLogs } = useAudit();

// ✅ Bug 1 corregido: totalItems en lugar de users.value.length
const { totalItems, fetchUsers } = useAdminUsers();
const totalUsers = computed(() => totalItems.value);

const loadingStats = ref(false);
const userMap = ref<Record<number, string>>({});

onMounted(async () => {
  loadingStats.value = true;
  try {
    await fetchDocuments(0, 20);
    storageMB.value = await fetchStorageUsed();

    if (user.value?.roles?.includes("ADMIN")) {
      await fetchUsers();
      await fetchLogs({}, 0, 10);
      const { data } = await api.get("/api/users", {
        params: { size: 200, page: 0 },
      });
      const list = Array.isArray(data) ? data : (data.content ?? []);
      list.forEach((u: any) => {
        userMap.value[u.id] = u.name ?? u.email ?? `Usuario ${u.id}`;
      });
    } else {
      await fetchMyLogs(10); // ✅ una sola línea
      if (user.value?.id) {
        userMap.value[user.value.id] =
          user.value.name ?? user.value.email ?? "Tú";
      }
    }
  } catch (e: any) {
    console.warn("[Dashboard] Error cargando datos:", e?.message);
  } finally {
    loadingStats.value = false;
  }
});

const recentLogs = computed(() =>
  logs.value
    .filter((log) => log.action !== "HTTP_REQUEST")
    .slice(0, 10)
    .map((log) => {
      const uri = log.details?.uri ?? "";
      const method = log.details?.method ?? "";
      const action = log.action ?? "";

      let normalizedAction = "view";
      if (action.includes("LOGIN")) normalizedAction = "login";
      else if (action.includes("LOGOUT")) normalizedAction = "login";
      else if (
        action.includes("UPLOAD") ||
        (method === "POST" && uri.includes("/documents"))
      )
        normalizedAction = "upload";
      else if (action.includes("DELETE") || method === "DELETE")
        normalizedAction = "delete";
      else if (action.includes("DOWNLOAD") || uri.includes("/download"))
        normalizedAction = "download";
      else if (action.includes("SHARE") || uri.includes("/share"))
        normalizedAction = "share";
      else if (
        action.includes("FOLDER") ||
        (method === "POST" && uri.includes("/folders"))
      )
        normalizedAction = "create";
      else if (method === "PATCH" || method === "PUT")
        normalizedAction = "update";

      return {
        id: String(log.id),
        action: normalizedAction,
        timestamp: log.createdAt,
        userName: log.userId
          ? (userMap.value[log.userId] ?? `Usuario ${log.userId}`)
          : "Sistema",
        documentName: log.resourceType ?? undefined,
      };
    }),
);

const sharedWithMe = computed(() => getSharedWithMe());
const totalFolders = computed(
  () =>
    Object.values(folders.value).filter(
      (f: any) => f.ownerId === String(user.value?.id ?? ""),
    ).length,
);
const storageMB = ref(0);
const storagePercent = computed(() =>
  Math.min(Math.round((storageMB.value / 1024) * 100), 100),
);

async function fetchStorageUsed(): Promise<number> {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/documents/storage", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return parseFloat(((data.usedBytes ?? 0) / (1024 * 1024)).toFixed(1));
  } catch {
    return 0;
  }
}
</script>

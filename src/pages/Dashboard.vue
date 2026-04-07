<template>
  <section class="p-6 space-y-6">
    <WelcomeSection :user-name="user?.name || 'Usuario'" />

    <!-- SKELETON LOADING -->
    <template v-if="loading || loadingStats">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="p-4 rounded-lg border bg-card animate-pulse">
          <div class="flex justify-between mb-3">
            <div class="h-3 bg-muted rounded w-20"></div>
            <div class="w-8 h-8 bg-muted rounded"></div>
          </div>
          <div class="h-7 bg-muted rounded w-14 mb-1"></div>
          <div class="h-3 bg-muted rounded w-10"></div>
        </div>
      </div>
      <div class="p-5 rounded-xl border bg-card animate-pulse">
        <div class="h-4 bg-muted rounded w-36 mb-4"></div>
        <div class="grid grid-cols-5 gap-3">
          <div v-for="i in 5" :key="i" class="flex flex-col items-center gap-2 p-3 rounded-lg border">
            <div class="w-10 h-10 bg-muted rounded-lg"></div>
            <div class="h-3 bg-muted rounded w-full"></div>
            <div class="h-3 bg-muted rounded w-10"></div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- ALERTA ARCHIVOS SIN CLASIFICAR -->
      <div
        v-if="unclassifiedCount > 0"
        class="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10"
      >
        <span class="text-xl flex-shrink-0">🤖</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">
            Tienes {{ unclassifiedCount }}
            {{ unclassifiedCount === 1 ? "archivo sin clasificar" : "archivos sin clasificar" }}
          </p>
          <p class="text-xs text-muted-foreground">El clasificador IA puede organizarlos automáticamente</p>
        </div>
        <router-link
          to="/classification"
          class="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors text-amber-700 dark:text-amber-400"
        >
          Clasificar →
        </router-link>
      </div>

      <!-- STATS CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard label="Total de Archivos" :value="totalElements" unit="archivos" trend="stable" accentColor="#6366f1">
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          label="Compartidos conmigo"
          :value="sharedWithMeCount"
          unit="archivos"
          trend="stable"
          accentColor="#ec4899"
          :subtitle="sharedWithMeCount === 0 ? 'Nadie ha compartido contigo aún' : undefined"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="#ec4899" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          v-if="user?.roles?.includes('ADMIN')"
          label="Usuarios Activos"
          :value="totalUsers"
          unit="usuarios"
          trend="stable"
          accentColor="#f59e0b"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a4 4 0 00-5.477-3.764M9 20H4v-2a4 4 0 015.477-3.764M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </StatsCard>
        <StatsCard v-else label="Carpetas" :value="totalFolders" unit="carpetas" trend="stable" accentColor="#8b5cf6">
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          label="Favoritos"
          :value="favoritesCount"
          unit="archivos"
          trend="stable"
          accentColor="#10b981"
          :subtitle="favoritesCount === 0 ? 'Marca archivos para acceso rápido' : undefined"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          label="Espacio Utilizado"
          :value="storageMB"
          unit="MB"
          :trend="storagePercent > 80 ? 'down' : storagePercent > 50 ? 'stable' : 'up'"
          :accentColor="storagePercent > 80 ? '#ef4444' : storagePercent > 50 ? '#f59e0b' : '#10b981'"
          :progress="storagePercent"
          :progressMax="storageLimitLabel"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none"
              :stroke="storagePercent > 80 ? '#ef4444' : storagePercent > 50 ? '#f59e0b' : '#10b981'"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16" />
            </svg>
          </template>
        </StatsCard>
      </div>

      <!-- ARCHIVOS RECIENTES -->
      <RecentFilesWidget :files="recentFiles" @open="openFilePreview" />

      <!-- DASHBOARD CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Mis Archivos" description="Ver y gestionar tus archivos"
          :count="totalElements" countLabel="archivos" to="/files"
          icon-color="#6366f1" icon-bg-color="#6366f130"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #6366f1; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Clasificación" description="Organiza tus categorías"
          :count="categories.length" countLabel="categorías" to="/classification"
          icon-color="#10b981" icon-bg-color="#10b98130"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #10b981; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Compartidos" description="Archivos compartidos contigo"
          :count="sharedWithMeCount" countLabel="archivos" to="/shared"
          icon-color="#ec4899" icon-bg-color="#ec489930"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #ec4899; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 12H9m0 0l3-3m-3 3l-3-3m3 3l3 3" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.roles?.includes('ADMIN')"
          title="Usuarios" description="Gestiona los usuarios del sistema"
          :count="totalUsers" countLabel="usuarios" to="/users"
          icon-color="#f59e0b" icon-bg-color="#f59e0b30"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #f59e0b; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.roles?.includes('ADMIN')"
          title="Historial" description="Auditoría y registro de acciones"
          :count="totalLogs" countLabel="registros" to="/history"
          icon-color="#8b5cf6" icon-bg-color="#8b5cf630"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #8b5cf6; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </DashboardCard>
      </div>

      <!-- BOTTOM GRID -->
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <RecentActivityWidget
            :activities="recentLogs"
            :can-view-history="user?.roles?.includes('ADMIN') ?? false"
          />
        </div>

        <div class="space-y-4">
          <!-- SPARKLINE -->
          <div class="p-5 rounded-xl border bg-card">
            <h3 class="font-semibold mb-3 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Actividad (7 días)
            </h3>
            <div class="flex items-end gap-1.5 h-14">
              <div
                v-for="(bar, i) in sparklineBars" :key="i"
                class="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                :style="{ height: `${bar.heightPct}%`, backgroundColor: 'hsl(var(--primary) / 0.7)' }"
                :title="`${bar.label}: ${bar.count} acciones`"
              />
            </div>
            <div class="flex justify-between mt-1">
              <span v-for="(bar, i) in sparklineBars" :key="i"
                class="flex-1 text-center text-xs text-muted-foreground">
                {{ bar.label }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground text-right mt-1">
              {{ totalWeekActivity }} acciones esta semana
            </p>
          </div>

          <!-- Tips -->
          <div class="p-5 rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h3 class="font-semibold mb-3 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consejos y Ayuda
            </h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2"><span class="text-primary font-bold flex-shrink-0">•</span><span>Organiza tus archivos con categorías</span></li>
              <li class="flex gap-2"><span class="text-primary font-bold flex-shrink-0">•</span><span>Comparte archivos de forma segura</span></li>
              <li class="flex gap-2"><span class="text-primary font-bold flex-shrink-0">•</span><span>Usa búsqueda avanzada para encontrar rápido</span></li>
              <li class="flex gap-2"><span class="text-primary font-bold flex-shrink-0">•</span><span>Revisa el historial de cambios regularmente</span></li>
            </ul>
          </div>

          <!-- Acciones rápidas -->
          <div class="p-5 rounded-xl border bg-card">
            <h3 class="font-semibold mb-3 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h3>
            <div class="space-y-1">
              <router-link to="/files"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors">
                <span class="text-primary">+</span> Subir Archivo
              </router-link>
              <router-link to="/classification"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors">
                <span class="text-primary">+</span> Nueva Categoría
              </router-link>
              <router-link v-if="user?.roles?.includes('ADMIN')" to="/users"
                class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors">
                <span class="text-primary">+</span> Agregar Usuario
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- MODAL VISOR -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="recentFiles"
      :preview-url="currentPreviewUrl"
      @close="viewingDocument = null; currentPreviewUrl = null"
      @navigate="navigateRecentDocument"
      @download="downloadRecentDoc"
      @request-preview="handleRequestPreview"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue" // ✅ agregado onUnmounted
import { useAuth, isLoggingOut } from "../composables/useAuth" // ✅ importar bandera
import { useAudit } from "../composables/useAudit"
import { useDocuments } from "../composables/useDocuments"
import { useAdminUsers } from "../composables/useAdminUsers"
import { useDashboardStats } from "../composables/useDashboardStats"
import DashboardCard from "../components/DashboardCard.vue"
import StatsCard from "../components/StatsCard.vue"
import RecentActivityWidget from "../components/RecentActivityWidget.vue"
import RecentFilesWidget from "../components/RecentFilesWidget.vue"
import WelcomeSection from "../components/WelcomeSection.vue"
import DocumentViewerModal from "../components/DocumentViewerModal.vue"
import { documentService } from "../services/documentService"
import type { ActivityItem } from "../components/RecentActivityWidget.vue"
import api from "@/config/api"

const { user } = useAuth()

const {
  categories, folders, loading, totalElements,
  getSharedWithMe, getUnclassifiedDocuments, getFavoriteDocuments,
  fetchDocuments, fetchRecent,
} = useDocuments()

const { logs, totalElements: totalLogs, fetchLogs, fetchMyLogs } = useAudit()
const { users, totalItems, fetchUsers } = useAdminUsers()
const totalUsers = computed(() => totalItems.value)

const { storageMB, storagePercent, storageLimitLabel, loadingStats, loadStats } = useDashboardStats()

const userMap = ref<Record<number, string>>({})
const sharedWithMeCount = ref(0)
const unclassifiedCount = ref(0)
const favoritesCount = ref(0)
const recentFiles = ref<any[]>([])
const viewingDocument = ref<any | null>(null)
const currentPreviewUrl = ref<string | null>(null)

// ✅ Flag para cancelar operaciones async cuando el componente se desmonta
let isMounted = true

const totalFolders = computed(
  () => Object.values(folders.value).filter(
    (f: any) => f.ownerId === String(user.value?.id ?? "")
  ).length
)

const sparklineBars = computed(() => {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return {
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("es-ES", { weekday: "short" }).charAt(0).toUpperCase(),
    }
  })
  const counts = days.map(({ date }) =>
    logs.value.filter(
      (log) => log.createdAt.startsWith(date) && log.action !== "HTTP_REQUEST"
    ).length
  )
  const max = Math.max(...counts, 1)
  return days.map(({ label }, i) => ({
    label,
    count: counts[i],
    heightPct: counts[i] === 0 ? 8 : Math.max(8, Math.round((counts[i] / max) * 100)),
  }))
})

const totalWeekActivity = computed(() =>
  sparklineBars.value.reduce((sum, b) => sum + b.count, 0)
)

const ACTION_MAP: Record<string, string> = {
  LOGIN:                   'login',
  AUTH_LOGIN_GOOGLE:       'login',
  LOGIN_FAILED:            'login_failed',
  LOGIN_BLOCKED:           'login_blocked',
  LOGOUT:                  'logout',
  REGISTER:                'register',
  FORGOT_PASSWORD:         'password_change',
  RESET_PASSWORD:          'password_change',
  UPLOAD_DOCUMENT:         'upload',
  DOWNLOAD_DOCUMENT:       'download',
  DELETE_DOCUMENT:         'delete',
  UPDATE_DOCUMENT:         'profile_update',
  SHARE_DOCUMENT:          'share',
  REVOKE_SHARE:            'share_revoke',
  UPDATE_SHARE_PERMISSION: 'share_update',
  CREATE_FOLDER:           'folder_create',
  DELETE_FOLDER:           'folder_delete',
  RENAME_FOLDER:           'folder_rename',
  CREATE_CATEGORY:         'category_create',
  UPDATE_CATEGORY:         'category_update',
  DELETE_CATEGORY:         'category_delete',
  CREATE_TAG:              'tag_add',
  DELETE_TAG:              'tag_remove',
  UPDATE_USER:             'profile_update',
  DELETE_USER:             'delete',
  CHANGE_USER_ROLE:        'role_change',
  FAVORITE_ADD:            'favorite',
  FAVORITE_REMOVE:         'unfavorite',
}

const FILTERED_ACTIONS = new Set(['HTTP_REQUEST'])

function normalizeAction(action: string): string {
  if (!action) return 'view'
  if (ACTION_MAP[action]) return ACTION_MAP[action]
  const upper = action.toUpperCase()
  const match = Object.keys(ACTION_MAP)
    .sort((a, b) => b.length - a.length)
    .find(key => upper.includes(key))
  return match ? ACTION_MAP[match] : 'view'
}

function extractResourceName(log: any): string | undefined {
  const d = log.details ?? {}
  return d.name ?? d.fileName ?? d.folderName ?? d.categoryName ?? d.query ?? undefined
}

const recentLogs = computed((): ActivityItem[] =>
  logs.value
    .filter(log => !FILTERED_ACTIONS.has(log.action))
    .slice(0, 8)
    .map(log => ({
      id: String(log.id),
      action: normalizeAction(log.action),
      timestamp: log.createdAt,
      isSuccessful: log.isSuccessful,
      userName: log.userId ? (userMap.value[log.userId] ?? '—') : 'Sistema',
      resourceName: extractResourceName(log),
    }))
)

async function loadRecentThumbnails(docs: any[]): Promise<void> {
  // ✅ No cargar thumbnails si hay logout en curso o el componente ya se desmontó
  if (isLoggingOut.value || !isMounted) return

  await Promise.allSettled(
    docs
      .filter(doc => doc.type.startsWith("image/") && !doc.thumbnailUrl && doc.backendId)
      .map(async (doc) => {
        try {
          // ✅ Verificar bandera antes de cada request individual
          if (isLoggingOut.value || !isMounted) return
          const { data } = await api.get(`/api/documents/${doc.backendId}/preview`)
          if (isMounted) doc.thumbnailUrl = data.downloadUrl ?? undefined
        } catch { /* silencioso */ }
      })
  )
}

async function openFilePreview(file: any) {
  viewingDocument.value = file
  currentPreviewUrl.value = null
  await handleRequestPreview(file)
}

async function handleRequestPreview(doc: any) {
  currentPreviewUrl.value = null
  try {
    const { data } = await documentService.getPreviewUrl(doc.backendId!)
    currentPreviewUrl.value = data.downloadUrl
  } catch {
    currentPreviewUrl.value = null
  }
}

function navigateRecentDocument(direction: "prev" | "next") {
  if (!viewingDocument.value) return
  const idx = recentFiles.value.findIndex((d: any) => d.id === viewingDocument.value!.id)
  if (direction === "prev" && idx > 0)
    viewingDocument.value = recentFiles.value[idx - 1]
  if (direction === "next" && idx < recentFiles.value.length - 1)
    viewingDocument.value = recentFiles.value[idx + 1]
}

async function downloadRecentDoc(doc: any) {
  try {
    const { data } = await documentService.getPreviewUrl(doc.backendId!)
    const blob = await fetch(data.downloadUrl).then(r => r.blob())
    const blobUrl = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement("a"), { href: blobUrl, download: doc.name })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    console.error("Error al descargar el archivo")
  }
}

onMounted(async () => {
  // ✅ Verificar bandera antes de arrancar — edge case: logout muy rápido
  if (isLoggingOut.value) return

  await Promise.all([fetchDocuments(0, 20), loadStats()])

  // ✅ Verificar después de cada await por si el logout ocurrió mientras esperábamos
  if (!isMounted || isLoggingOut.value) return

  sharedWithMeCount.value = getSharedWithMe().length
  unclassifiedCount.value = getUnclassifiedDocuments().length
  favoritesCount.value = getFavoriteDocuments().length

  const recent = await fetchRecent(5)

  if (!isMounted || isLoggingOut.value) return

  await loadRecentThumbnails(recent)
  if (isMounted) recentFiles.value = recent

  if (user.value?.roles?.includes("ADMIN")) {
    if (!isMounted || isLoggingOut.value) return
    await Promise.all([fetchUsers(0, 200), fetchLogs({}, 0, 20)])
    if (isMounted) {
      users.value.forEach((u: any) => {
        userMap.value[u.id] = u.name ?? u.email ?? `#${u.id}`
      })
    }
  } else {
    if (!isMounted || isLoggingOut.value) return
    await fetchMyLogs(20)
    if (isMounted && user.value?.id) {
      userMap.value[user.value.id] = user.value.name ?? user.value.email ?? "Tú"
    }
  }
})

// ✅ CRÍTICO: Marcar el componente como desmontado para cancelar
//    cualquier operación async que siga corriendo tras la navegación.
//    Esto cubre el caso donde el AbortController no alcanza a cancelar
//    un await que ya estaba en progreso.
onUnmounted(() => {
  isMounted = false
})
</script>
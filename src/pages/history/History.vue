<template>
  <section class="p-6 md:p-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Historial y Auditoría
        </h1>
        <p class="text-muted-foreground mt-1">
          Registro de todas las acciones realizadas en el sistema
        </p>
      </div>

      <!-- Filtros -->
      <div class="grid md:grid-cols-5 gap-4">  <!-- ✅ 4 → 5 -->
        <div>
          <label class="text-sm font-semibold mb-1 block">Tipo de Acción</label>
          <select
            v-model="selectedFilter"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Todas las acciones</option>
            <option value="LOGIN_BLOCKED">Acceso bloqueado por intentos fallidos</option>
            <option value="REVOKE_SHARE">Acceso compartido revocado</option>
            <option value="UPLOAD_DOCUMENT">Archivo subido</option>
            <option value="CREATE_CATEGORY">Categoría creada</option>
            <option value="UPDATE_CATEGORY">Categoría actualizada</option>
            <option value="DELETE_CATEGORY">Categoría eliminada</option>
            <option value="CHANGE_USER_ROLE">Cambio de rol de usuario</option>
            <option value="LOGOUT">Cierre de sesión</option>
            <option value="RESET_PASSWORD">Contraseña restablecida</option>
            <option value="DOWNLOAD_DOCUMENT">Descarga de documento</option>
            <option value="SHARE_DOCUMENT">Documento compartido</option>
            <option value="FAVORITE_ADD">Documento marcado como favorito</option>
            <option value="FAVORITE_REMOVE">Documento eliminado de favoritos</option>
            <option value="CREATE_TAG">Etiqueta creada</option>
            <option value="DELETE_TAG">Etiqueta eliminada</option>
            <option value="DELETE_DOCUMENT">Eliminación de documento</option>
            <option value="DELETE_USER">Eliminación de usuario</option>
            <option value="LOGIN">Inicio de sesión</option>
            <option value="LOGIN_FAILED">Intento de acceso fallido</option>
            <option value="CREATE_FOLDER">Carpeta creada</option>
            <option value="DELETE_FOLDER">Carpeta eliminada</option>
            <option value="RENAME_FOLDER">Carpeta renombrada</option>
            <option value="UPDATE_SHARE_PERMISSION">Permiso de compartir actualizado</option>
            <option value="FORGOT_PASSWORD">Recuperación de contraseña</option>
            <option value="REGISTER">Registro de usuario</option>
            <option value="UPDATE_USER">Usuario actualizado</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Desde</label>
          <input v-model="filters.from" type="date"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Hasta</label>
          <input v-model="filters.to" type="date"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Usuario</label>
          <select
            v-model="filters.userId"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option :value="undefined">Todos los usuarios</option>
            <option v-for="(info, id) in userMap" :key="id" :value="String(id)">
              {{ info.name }} — {{ info.email }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Estado</label>
          <select
            v-model="filters.success"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option :value="undefined">Todos</option>
            <option :value="true">Exitoso</option>
            <option :value="false">Fallido</option>
          </select>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex flex-wrap items-center gap-2">
        <button @click="applyFilters"
          class="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow transition-all">
          Aplicar filtros
        </button>
        <button @click="clearFilters"
          class="h-10 px-5 rounded-lg border text-sm hover:bg-accent transition-colors">
          Limpiar
        </button>
      </div>

      <!-- Error -->
      <div v-if="error"
        class="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
        <button @click="applyFilters" class="ml-auto underline font-medium">Reintentar</button>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Fecha</th>
              <th class="text-left px-6 py-3 font-semibold">Acción</th>
              <th class="text-left px-6 py-3 font-semibold">Usuario</th>
              <th class="text-left px-6 py-3 font-semibold">Recurso</th>
              <th class="text-left px-6 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 8" :key="n" class="border-b">
              <td class="px-6 py-4"><div class="h-3 bg-muted rounded animate-pulse w-28" /></td>
              <td class="px-6 py-4"><div class="h-5 bg-muted rounded-full animate-pulse w-32" /></td>
              <td class="px-6 py-4">
                <div class="h-3 bg-muted rounded animate-pulse w-28 mb-1" />
                <div class="h-2.5 bg-muted rounded animate-pulse w-36" />
              </td>
              <td class="px-6 py-4"><div class="h-3 bg-muted rounded animate-pulse w-24" /></td>
              <td class="px-6 py-4"><div class="h-5 bg-muted rounded-full animate-pulse w-16" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla -->
      <div v-else class="border rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b">
            <tr>
              <th class="text-left px-6 py-3 font-semibold w-44">Fecha</th>
              <th class="text-left px-6 py-3 font-semibold w-52">Acción</th>
              <th class="text-left px-6 py-3 font-semibold w-52">Usuario</th>
              <th class="text-left px-6 py-3 font-semibold w-44">Recurso</th>
              <th class="text-left px-6 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs" :key="log.id"
              class="border-b hover:bg-muted/50 transition-colors"
              :class="!log.isSuccessful ? 'bg-red-50/40 dark:bg-red-950/10' : ''"
            >
              <td class="px-6 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="getActionColor(log.action, log.isSuccessful)"
                >
                  <component :is="getActionIcon(log.action)" class="w-3 h-3" />
                  {{ describeAction(log.action) }}
                </span>
              </td>
              <td class="px-6 py-3">
                <p class="text-sm font-medium leading-tight truncate">
                  {{ log.userId === null
                      ? 'Anónimo'
                      : (userMap[log.userId]?.name ?? 'Usuario eliminado') }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ log.userId === null
                      ? 'Sin sesión iniciada'
                      : (userMap[log.userId]?.email ?? `ID: ${log.userId}`) }}
                </p>
              </td>

              <!-- Columna Recurso -->
              <td class="px-6 py-3">
                <span
                  v-if="getResourceName(log) !== '—'"
                  class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground
                         bg-muted px-2 py-0.5 rounded-md max-w-[180px] truncate"
                  :title="getResourceName(log)"
                >
                  {{ getResourceName(log) }}
                </span>
                <span v-else class="text-xs text-muted-foreground/40">—</span>
              </td>

              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="log.isSuccessful
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-destructive/10 text-destructive'"
                >
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="log.isSuccessful ? 'bg-green-500' : 'bg-destructive'" />
                  {{ log.isSuccessful ? 'Exitoso' : 'Fallido' }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredLogs.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-muted-foreground">
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                         a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay registros que coincidan con los filtros</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex items-center justify-between flex-wrap gap-2">
        <p class="text-sm text-muted-foreground">
          Página <span class="font-semibold">{{ currentPage + 1 }}</span> de {{ totalPages }} —
          <span class="font-semibold">{{ totalElements.toLocaleString('es-ES') }}</span> registros
        </p>
        <div class="flex gap-2">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 0 || loading"
            class="h-9 px-4 rounded-lg border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed">
            ← Anterior
          </button>
          <button v-for="p in visiblePages" :key="p" @click="goToPage(p)"
            :class="p === currentPage
              ? 'h-9 w-9 rounded-lg bg-primary text-primary-foreground text-sm font-bold'
              : 'h-9 w-9 rounded-lg border text-sm hover:bg-accent'">
            {{ p + 1 }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages - 1 || loading"
            class="h-9 px-4 rounded-lg border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed">
            Siguiente →
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="p-4 rounded-lg bg-muted/50 border">
        <div class="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Total de registros</p>
            <p class="text-2xl font-bold">{{ totalElements.toLocaleString('es-ES') }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Usuarios únicos</p>
            <p class="text-2xl font-bold">{{ totalUniqueUsers.toLocaleString('es-ES') }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Acciones fallidas</p>
            <p class="text-2xl font-bold" :class="totalFailedCount > 0 ? 'text-destructive' : ''">
              {{ totalFailedCount.toLocaleString('es-ES') }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useAudit } from '../../composables/useAudit'
import api from '../../config/api'

const { logs, loading, error, totalElements, totalPages, fetchLogs } = useAudit()

const filteredLogs = computed(() =>
  logs.value.filter(l => l.action !== 'HTTP_REQUEST')
)

const currentPage = ref(0)
const PAGE_SIZE = 20

const selectedFilter = ref('')
const filters = ref<{ userId?: string | number; from?: string; to?: string; success?: boolean }>({
  userId: undefined,
  from: undefined,
  to: undefined,
  success: undefined,
})

const userMap = ref<Record<number, { name: string; email: string }>>({})
const totalUniqueUsers = ref(0)
const totalFailedCount = ref(0)

// ── Recurso ────────────────────────────────────────────────────────────────

function getResourceName(log: any): string {
  if (!log.details) return '—'
  return log.details.name
      ?? log.details.email
      ?? log.details.recipient
      ?? '—'
}

// ── Filtros → parámetros backend ───────────────────────────────────────────

function buildFilterParams(): { action?: string; success?: boolean } {
  const params: { action?: string; success?: boolean } = {}
  if (selectedFilter.value) params.action = selectedFilter.value
  if (filters.value.success !== undefined) params.success = filters.value.success
  return params
}

// ── Labels ─────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  LOGIN:                   'Inicio de sesión',
  LOGIN_FAILED:            'Intento de acceso fallido',
  LOGIN_BLOCKED:           'Acceso bloqueado por intentos fallidos',
  LOGOUT:                  'Cierre de sesión',
  REGISTER:                'Registro de usuario',
  FORGOT_PASSWORD:         'Recuperación de contraseña',
  RESET_PASSWORD:          'Contraseña restablecida',
  AUTH_LOGIN_GOOGLE:       'Inicio de sesión con Google',     // ✅
  UPLOAD_DOCUMENT:         'Archivo subido',
  DOWNLOAD_DOCUMENT:       'Descarga de documento',
  DELETE_DOCUMENT:         'Eliminación de documento',
  UPDATE_DOCUMENT:         'Documento actualizado',
  SHARE_DOCUMENT:          'Documento compartido',
  REVOKE_SHARE:            'Acceso compartido revocado',
  UPDATE_SHARE_PERMISSION: 'Permiso de compartir actualizado',
  CREATE_FOLDER:           'Carpeta creada',
  DELETE_FOLDER:           'Carpeta eliminada',
  RENAME_FOLDER:           'Carpeta renombrada',
  CREATE_CATEGORY:         'Categoría creada',
  UPDATE_CATEGORY:         'Categoría actualizada',
  DELETE_CATEGORY:         'Categoría eliminada',
  CREATE_TAG:              'Etiqueta creada',
  DELETE_TAG:              'Etiqueta eliminada',
  UPDATE_USER:             'Usuario actualizado',
  DELETE_USER:             'Eliminación de usuario',
  CHANGE_USER_ROLE:        'Cambio de rol de usuario',
  FAVORITE_ADD:            'Documento marcado como favorito',
  FAVORITE_REMOVE:         'Documento eliminado de favoritos',
}

function describeAction(action?: string): string {
  if (!action) return 'Acción del sistema'
  if (ACTION_LABELS[action]) return ACTION_LABELS[action]
  // ✅ Fallback para AUTH_LOGIN_* futuros (GitHub, Facebook, etc.)
  if (action.startsWith('AUTH_LOGIN_')) {
    const provider = action.replace('AUTH_LOGIN_', '')
    return `Inicio de sesión con ${provider.charAt(0) + provider.slice(1).toLowerCase()}`
  }
  return action
}

// ── Colores ────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  LOGIN:                   'bg-green-500/10 text-green-700 dark:text-green-400',
  REGISTER:                'bg-green-500/10 text-green-700 dark:text-green-400',
  LOGOUT:                  'bg-slate-500/10 text-slate-600',
  LOGIN_FAILED:            'bg-destructive/10 text-destructive',
  LOGIN_BLOCKED:           'bg-destructive/10 text-destructive',
  FORGOT_PASSWORD:         'bg-yellow-500/10 text-yellow-700',
  RESET_PASSWORD:          'bg-yellow-500/10 text-yellow-700',
  AUTH_LOGIN_GOOGLE:       'bg-blue-500/10 text-blue-700',    // ✅
  UPLOAD_DOCUMENT:         'bg-green-500/10 text-green-700 dark:text-green-400',
  DOWNLOAD_DOCUMENT:       'bg-blue-500/10 text-blue-700',
  DELETE_DOCUMENT:         'bg-destructive/10 text-destructive',
  UPDATE_DOCUMENT:         'bg-yellow-500/10 text-yellow-700',
  SHARE_DOCUMENT:          'bg-teal-500/10 text-teal-700',
  REVOKE_SHARE:            'bg-orange-500/10 text-orange-700',
  UPDATE_SHARE_PERMISSION: 'bg-yellow-500/10 text-yellow-700',
  CREATE_FOLDER:           'bg-teal-500/10 text-teal-700',
  DELETE_FOLDER:           'bg-destructive/10 text-destructive',
  RENAME_FOLDER:           'bg-yellow-500/10 text-yellow-700',
  CREATE_CATEGORY:         'bg-orange-500/10 text-orange-700',
  UPDATE_CATEGORY:         'bg-yellow-500/10 text-yellow-700',
  DELETE_CATEGORY:         'bg-destructive/10 text-destructive',
  CREATE_TAG:              'bg-pink-500/10 text-pink-700',
  DELETE_TAG:              'bg-destructive/10 text-destructive',
  UPDATE_USER:             'bg-indigo-500/10 text-indigo-700',
  DELETE_USER:             'bg-destructive/10 text-destructive',
  CHANGE_USER_ROLE:        'bg-purple-500/10 text-purple-700',
  FAVORITE_ADD:            'bg-yellow-500/10 text-yellow-700',
  FAVORITE_REMOVE:         'bg-slate-500/10 text-slate-600',
}

function getActionColor(action?: string, success?: boolean): string {
  if (!success) return 'bg-destructive/10 text-destructive'
  // ✅ Fallback para AUTH_LOGIN_* futuros
  if (action?.startsWith('AUTH_LOGIN_')) return 'bg-blue-500/10 text-blue-700'
  return ACTION_COLORS[action ?? ''] ?? 'bg-muted text-muted-foreground'
}

// ── Iconos ─────────────────────────────────────────────────────────────────

function getActionIcon(action?: string) {
  const cls = 'w-3 h-3'
  const svg = (d: string) =>
    h('svg', { class: cls, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d })])

  if (!action) return h('span')

  if (['LOGIN', 'REGISTER'].includes(action))
    return svg('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')

  if (action === 'LOGOUT')
    return svg('M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1')

  if (['LOGIN_FAILED', 'LOGIN_BLOCKED'].includes(action))
    return svg('M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z')

  if (['FORGOT_PASSWORD', 'RESET_PASSWORD'].includes(action))
    return svg('M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z')

  // ✅ AUTH_LOGIN_* → icono de globo/OAuth (cubre Google y futuros providers)
  if (action.startsWith('AUTH_LOGIN_'))
    return svg('M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9')

  if (action === 'UPLOAD_DOCUMENT')
    return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12')

  if (action === 'DOWNLOAD_DOCUMENT')
    return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4')

  if (['DELETE_DOCUMENT', 'DELETE_FOLDER', 'DELETE_CATEGORY', 'DELETE_TAG', 'DELETE_USER'].includes(action))
    return svg('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16')

  if (action === 'SHARE_DOCUMENT')
    return svg('M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z')

  if (action === 'REVOKE_SHARE')
    return svg('M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636')

  if (['UPDATE_SHARE_PERMISSION', 'UPDATE_DOCUMENT', 'UPDATE_CATEGORY', 'RENAME_FOLDER'].includes(action))
    return svg('M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z')

  if (action === 'CREATE_FOLDER')
    return svg('M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z')

  if (['FAVORITE_ADD', 'FAVORITE_REMOVE'].includes(action))
    return svg('M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z')

  if (action.includes('CATEGORY') || action.includes('TAG'))
    return svg('M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z')

  if (action.includes('USER') || action === 'CHANGE_USER_ROLE')
    return svg('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z')

  return svg('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z')
}

// ── Paginación ─────────────────────────────────────────────────────────────

const visiblePages = computed(() => {
  const cur = currentPage.value, total = totalPages.value
  const start = Math.max(0, cur - 2), end = Math.min(total - 1, cur + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// ── Ciclo de vida ──────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const { data } = await api.get('/api/users', { params: { size: 200, page: 0 } })
    const users = Array.isArray(data) ? data : (data.content ?? [])
    users.forEach((u: any) => {
      userMap.value[u.id] = { name: u.name, email: u.email }
    })
  } catch (e: any) {
    console.warn('[History] No se pudo cargar userMap:', e?.response?.status)
  }

  try {
    const { data } = await api.get('/api/admin/audit/stats')
    totalUniqueUsers.value = data.totalUniqueUsers ?? 0
    totalFailedCount.value = data.totalFailed ?? 0
  } catch (e) {
    console.warn('[History] No se pudieron cargar stats')
  }

  applyFilters()
})

// ── Acciones ───────────────────────────────────────────────────────────────

async function applyFilters() {
  currentPage.value = 0
  await fetchLogs(
    { ...buildFilterParams(), userId: filters.value.userId, from: filters.value.from, to: filters.value.to, success: filters.value.success },
    0,
    PAGE_SIZE
  )
}

async function goToPage(page: number) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  await fetchLogs(
    { ...buildFilterParams(), userId: filters.value.userId, from: filters.value.from, to: filters.value.to, success: filters.value.success },
    page,
    PAGE_SIZE
  )
}

function clearFilters() {
  selectedFilter.value = ''
  filters.value = { userId: undefined, from: undefined, to: undefined, success: undefined }
  applyFilters()
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>
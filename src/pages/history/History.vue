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
      <div class="grid md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-semibold mb-1 block">Tipo de Acción</label>
          <select
            v-model="filters.uriPattern"
            class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Todas las acciones</option>
            <option value="auth/login">Inicio de sesión</option>
            <option value="auth/logout">Cierre de sesión</option>
            <option value="documents/upload">Carga de documento</option>
            <option value="documents/download">Descarga de documento</option>
            <option value="documents/preview">Visualización</option>
            <option value="documents/share">Compartir</option>
            <option value="__DELETE_DOCS__">Eliminación de documento</option>
            <option value="folders">Carpetas</option>
            <option value="users">Usuarios</option>
            <option value="__PROFILE__">Perfil</option>
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
                  :class="getActionColor(log.details?.uri, log.details?.method, log.isSuccessful, log.action)"
                >
                  <component :is="getActionIcon(log.details?.uri, log.details?.method, log.action)" class="w-3 h-3" />
                  {{ describeAction(log.details?.uri, log.details?.method, log.action) }}
                </span>
              </td>
              <td class="px-6 py-3">
                <p class="text-sm font-medium leading-tight truncate">
                  {{ log.userId === null ? 'Anónimo' : (userMap[log.userId]?.name ?? `Usuario ${log.userId}`) }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ log.userId === null ? 'Sin sesión iniciada' : (userMap[log.userId]?.email ?? '—') }}
                </p>
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
              <td colspan="4" class="px-6 py-16 text-center text-muted-foreground">
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
            <p class="text-muted-foreground">
              Usuarios únicos <span class="text-xs opacity-60">(esta página)</span>
            </p>
            <p class="text-2xl font-bold">{{ uniqueUsers }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">
              Acciones fallidas <span class="text-xs opacity-60">(esta página)</span>
            </p>
            <p class="text-2xl font-bold" :class="failedCount > 0 ? 'text-destructive' : ''">
              {{ failedCount }}
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
import type { AuditFilters } from '../../composables/useAudit'
import api from '../../config/api'

const { logs, loading, error, totalElements, totalPages, fetchLogs } = useAudit()

const currentPage = ref(0)
const PAGE_SIZE   = 20

const filters = ref<AuditFilters & { uriPattern?: string }>({
  userId: undefined, from: undefined, to: undefined, uriPattern: undefined,
})

const userMap = ref<Record<number, { name: string; email: string }>>({})

const NAVIGATION_NOISE = new Set([
  '/api/documents', '/api/folders', '/api/categories', '/api/tags',
  '/api/users/me', '/api/admin/audit/logs', '/api/admin/users',
  '/api/auth/me', '/api/auth/refresh',
])

// ✅ Login/LOGOUT con action backend → servidor filtra
// Carpetas/Usuarios/Perfil/Preview → null → client-side
const PATTERN_TO_ACTION: Record<string, string | null> = {
  'auth/login':         'LOGIN',
  'auth/logout':        'LOGOUT',
  'documents/upload':   'UPLOAD',
  'documents/download': 'DOWNLOAD',
  'documents/preview':  null,
  'documents/share':    'SHARE',
  '__DELETE_DOCS__':    'DELETE',
  'folders':            null,
  'users':              null,
  '__PROFILE__':        null,
}

const filteredLogs = computed(() => {
  const pattern = filters.value.uriPattern  // ← mover esta línea arriba

  let result = logs.value.filter(l => {
    const uri    = l.details?.uri    ?? ''
    const method = l.details?.method ?? ''
    const action = l.action          ?? ''

    // ✅ Solo deduplicar si NO hay filtro activo de tipo de acción
    if (!pattern) {
      if (l.userId === null && (action.includes('LOGIN') || uri.includes('/auth/login'))) return false
      if (!uri && action.includes('LOGOUT')) return false

    }

    if (method !== 'GET') return true
    if (uri.match(/\/documents\/\d+\/preview/))  return true
    if (uri.match(/\/documents\/\d+\/download/)) return true
    if (uri.includes('/documents/search'))        return true
    return !NAVIGATION_NOISE.has(uri)
  })

  // Solo filtra client-side si el patrón no fue enviado al backend (null)
  if (!pattern || PATTERN_TO_ACTION[pattern] !== null) return result

  if (pattern === '__DELETE_DOCS__')
    return result.filter(l =>
      (l.details?.uri?.includes('/documents') && l.details?.method === 'DELETE') ||
      l.action?.includes('DELETE')
    )
  if (pattern === '__PROFILE__')
    return result.filter(l =>
      l.details?.uri?.includes('/users/me') || l.action?.includes('PROFILE')
    )

  const ACTION_KEYWORDS: Record<string, string[]> = {
    'documents/preview': ['PREVIEW'],
    'folders':           ['FOLDER'],
    'users':             ['USER'],
  }
  const keywords = ACTION_KEYWORDS[pattern] ?? []

  return result.filter(l => {
    const uri = l.details?.uri?.toLowerCase() ?? ''
    if (uri.includes(pattern.toLowerCase())) return true
    return keywords.some(k => l.action?.includes(k))
  })
})

const uniqueUsers = computed(() => new Set(logs.value.map(l => l.userId)).size)
const failedCount = computed(() => logs.value.filter(l => !l.isSuccessful).length)

const visiblePages = computed(() => {
  const cur = currentPage.value, total = totalPages.value
  const start = Math.max(0, cur - 2), end = Math.min(total - 1, cur + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

onMounted(async () => {
  try {
    const { data } = await api.get('/api/users', { params: { size: 200, page: 0 } })
    const users = Array.isArray(data) ? data : (data.content ?? [])
    users.forEach((u: any) => {
      userMap.value[u.id] = { name: u.name, email: u.email }
    })
  } catch (e: any) {
    console.warn('[History] No se pudo cargar userMap:', e?.response?.status, e?.config?.url, e?.message)
  }
  applyFilters()
})

async function applyFilters() {
  currentPage.value = 0
  const actionParam = PATTERN_TO_ACTION[filters.value.uriPattern ?? '']
  await fetchLogs(
    {
      userId: filters.value.userId,
      from:   filters.value.from,
      to:     filters.value.to,
      action: actionParam ?? undefined,
    },
    0,
    PAGE_SIZE
  )
}

async function goToPage(page: number) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  const actionParam = PATTERN_TO_ACTION[filters.value.uriPattern ?? '']
  await fetchLogs(
    {
      userId: filters.value.userId,
      from:   filters.value.from,
      to:     filters.value.to,
      action: actionParam ?? undefined,
    },
    page,
    PAGE_SIZE
  )
}

function clearFilters() {
  filters.value = { userId: undefined, from: undefined, to: undefined, uriPattern: undefined }
  applyFilters()
}

function describeAction(uri?: string, method?: string, action?: string): string {
  if (!uri || uri.trim() === '') {
    if (action?.includes('LOGIN'))    return 'Inicio de sesión'
    if (action?.includes('LOGOUT'))   return 'Cierre de sesión'
    if (action?.includes('REGISTER')) return 'Registro de usuario'
    if (action?.includes('UPLOAD'))   return 'Archivo subido'
    if (action?.includes('DOWNLOAD')) return 'Descarga de documento'
    if (action?.includes('DELETE'))   return 'Eliminación de documento'
    if (action?.includes('SHARE'))    return 'Archivo compartido'
    if (action?.includes('FOLDER'))   return 'Gestión de carpeta'
    if (action?.includes('CATEGORY')) return 'Gestión de categoría'
    if (action?.includes('USER'))     return 'Gestión de usuario'
    if (action?.includes('PROFILE'))  return 'Perfil actualizado'
    if (action?.includes('PASSWORD')) return 'Contraseña cambiada'
    if (!method) return 'Acción del sistema'
    if (method.includes('initUpload'))     return 'Inicio de subida'
    if (method.includes('completeUpload')) return 'Archivo subido'
    if (method.includes('softDelete'))     return 'Eliminación de documento'
    if (method.includes('getDownloadUrl')) return 'Descarga solicitada'
    return method.replace(/\(.*\)/, '').split('.').pop() ?? 'Acción del sistema'
  }
  if (uri.includes('/auth/login'))    return 'Inicio de sesión'
  if (uri.includes('/auth/logout'))   return 'Cierre de sesión'
  if (uri.includes('/auth/register')) return 'Registro de usuario'
  if (uri.includes('/auth/refresh'))  return 'Sesión renovada'
  if (uri.includes('/auth/me'))       return 'Verificación de sesión'
  if (uri.includes('/auth/forgot'))   return 'Recuperación de contraseña'
  if (uri.includes('/auth/reset'))    return 'Contraseña restablecida'
  if (uri.match(/\/documents\/\d+\/upload\/complete/)) return 'Archivo subido'
  if (uri.includes('/documents/upload/init'))          return 'Inicio de subida'
  if (uri.match(/\/documents\/\d+\/preview/))          return 'Vista previa'
  if (uri.match(/\/documents\/\d+\/download/))         return 'Descarga de documento'
  if (uri.match(/\/documents\/\d+\/folder/) && method === 'PATCH')  return 'Documento movido de carpeta'
  if (uri.match(/\/documents\/\d+\/folder/) && method === 'DELETE') return 'Documento removido de carpeta'
  if (uri.match(/\/documents\/\d+\/category/) && method === 'PATCH')  return 'Categoría asignada'
  if (uri.match(/\/documents\/\d+\/category/) && method === 'DELETE') return 'Categoría removida'
  if (uri.includes('/documents/search'))               return 'Búsqueda de documentos'
  if (uri.match(/\/documents\/\d+/) && method === 'DELETE') return 'Eliminación de documento'
  if (uri.match(/\/documents\/\d+/) && method === 'PATCH')  return 'Edición de documento'
  if (uri.includes('/documents') && method === 'POST') return 'Subida de archivo'
  if (uri.includes('/documents') && method === 'GET')  return 'Consulta de documentos'
  if (uri.match(/\/folders\/\d+/) && method === 'DELETE') return 'Carpeta eliminada'
  if (uri.match(/\/folders\/\d+/) && method === 'PATCH')  return 'Carpeta renombrada'
  if (uri.includes('/folders') && method === 'POST')   return 'Carpeta creada'
  if (uri.includes('/folders') && method === 'GET')    return 'Consulta de carpetas'
  if (uri.match(/\/categories\/\d+\/documents\/\d+/) && method === 'PATCH')  return 'Categoría asignada'
  if (uri.match(/\/categories\/documents\/\d+/) && method === 'DELETE')      return 'Categoría removida'
  if (uri.match(/\/categories\/\d+/) && method === 'DELETE') return 'Categoría eliminada'
  if (uri.includes('/categories') && method === 'POST') return 'Categoría creada'
  if (uri.includes('/categories') && method === 'GET')  return 'Consulta de categorías'
  if (uri.includes('/users/me') && method === 'PUT')   return 'Perfil actualizado'
  if (uri.includes('/users/me'))                       return 'Consulta de perfil'
  if (uri.includes('/admin/users'))                    return 'Gestión de usuarios'
  if (uri.includes('/users') && method === 'GET')      return 'Consulta de usuarios'
  if (uri.includes('/admin/audit'))                    return 'Consulta de auditoría'
  if (uri.includes('/tags'))                           return 'Etiquetas'
  return 'Acción del sistema'
}

function getActionColor(uri?: string, method?: string, success?: boolean, action?: string): string {
  if (!success) return 'bg-destructive/10 text-destructive'
  if (!uri || uri.trim() === '') {
    if (action?.includes('LOGIN') || action?.includes('REGISTER'))
      return 'bg-green-500/10 text-green-700 dark:text-green-400'
    if (action?.includes('LOGOUT'))   return 'bg-slate-500/10 text-slate-600'
    if (action?.includes('DELETE'))   return 'bg-destructive/10 text-destructive'
    if (action?.includes('UPLOAD'))   return 'bg-green-500/10 text-green-700 dark:text-green-400'
    if (action?.includes('DOWNLOAD')) return 'bg-blue-500/10 text-blue-700'
    if (action?.includes('SHARE'))    return 'bg-teal-500/10 text-teal-700'
    if (action?.includes('FOLDER'))   return 'bg-teal-500/10 text-teal-700'
    if (action?.includes('CATEGORY')) return 'bg-orange-500/10 text-orange-700'
    if (action?.includes('USER'))     return 'bg-indigo-500/10 text-indigo-700'
    if (method?.includes('softDelete'))     return 'bg-destructive/10 text-destructive'
    if (method?.includes('completeUpload')) return 'bg-green-500/10 text-green-700 dark:text-green-400'
    if (method?.includes('getDownloadUrl')) return 'bg-blue-500/10 text-blue-700'
    return 'bg-slate-500/10 text-slate-600'
  }
  if (uri.includes('/auth/login') || uri.includes('/auth/register'))
    return 'bg-green-500/10 text-green-700 dark:text-green-400'
  if (uri.includes('/auth/logout') || uri.includes('/auth/refresh'))
    return 'bg-slate-500/10 text-slate-600'
  if (method === 'DELETE')                    return 'bg-destructive/10 text-destructive'
  if (method === 'POST')                      return 'bg-green-500/10 text-green-700 dark:text-green-400'
  if (method === 'PATCH' || method === 'PUT') return 'bg-yellow-500/10 text-yellow-700'
  if (uri.includes('/admin'))      return 'bg-purple-500/10 text-purple-700'
  if (uri.includes('/users'))      return 'bg-indigo-500/10 text-indigo-700'
  if (uri.includes('/documents'))  return 'bg-blue-500/10 text-blue-700'
  if (uri.includes('/folders'))    return 'bg-teal-500/10 text-teal-700'
  if (uri.includes('/categories')) return 'bg-orange-500/10 text-orange-700'
  if (uri.includes('/tags'))       return 'bg-pink-500/10 text-pink-700'
  return 'bg-muted text-muted-foreground'
}

function getActionIcon(uri?: string, method?: string, action?: string) {
  const cls = 'w-3 h-3'
  const svg = (d: string) =>
    h('svg', { class: cls, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d })])

  if (!uri || uri.trim() === '') {
    if (action?.includes('LOGIN') || action?.includes('REGISTER'))
      return svg('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')
    if (action?.includes('LOGOUT'))
      return svg('M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1')
    if (action?.includes('DELETE'))
      return svg('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16')
    if (action?.includes('UPLOAD'))
      return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12')
    if (action?.includes('DOWNLOAD'))
      return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4')
    return h('span')
  }
  if (uri.includes('/auth/login') || uri.includes('/auth/register'))
    return svg('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')
  if (method === 'DELETE')
    return svg('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16')
  if (method === 'POST')
    return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12')
  if (uri.match(/\/documents\/\d+\/download/) || uri.match(/getDownloadUrl/))
    return svg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4')
  if (uri.match(/\/documents\/\d+\/preview/))
    return svg('M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z')
  return svg('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z')
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

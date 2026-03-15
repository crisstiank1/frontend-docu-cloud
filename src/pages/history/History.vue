<template>
  <section class="p-6 md:p-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Historial y Auditoría
        </h1>
        <p class="text-muted-foreground mt-1">Registro detallado de todas las acciones del sistema</p>
      </div>

      <!-- Filtros -->
      <div class="grid md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-semibold mb-1 block">Tipo de Acción</label>
          <select v-model="filters.action" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
            <option value="">Todas las acciones</option>
            <option value="upload">Carga de documento</option>
            <option value="download">Descarga de documento</option>
            <option value="view">Visualización</option>
            <option value="delete">Eliminación</option>
            <option value="share">Compartir</option>
            <option value="revoke">Revocar acceso</option>
            <option value="edit">Edición</option>
            <option value="login">Inicio de sesión</option>
            <option value="logout">Cierre de sesión</option>
            <option value="user_created">Usuario creado</option>
            <option value="user_deleted">Usuario eliminado</option>
            <option value="user_role_changed">Rol cambiado</option>
            <option value="user_profile_updated">Perfil actualizado</option>
            <option value="user_password_changed">Contraseña cambiada</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Desde</label>
          <input v-model="filters.from" type="date" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Hasta</label>
          <input v-model="filters.to" type="date" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-1 block">Usuario ID</label>
          <input v-model="filters.userId" type="text" placeholder="Filtrar por ID..." class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="applyFilters" class="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow transition-all">
          Aplicar filtros
        </button>
        <button @click="clearFilters" class="h-10 px-5 rounded-lg border text-sm hover:bg-accent transition-colors">
          Limpiar
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Tabla -->
      <div v-else class="border rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b">
            <tr>
              <th class="text-left px-6 py-3 font-semibold w-40">Fecha</th>
              <th class="text-left px-6 py-3 font-semibold w-44">Acción</th>
              <th class="text-left px-6 py-3 font-semibold w-28">Usuario</th>
              <th class="text-left px-6 py-3 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="border-b hover:bg-muted/50 transition-colors"
              :class="log.details?.status >= 400 ? 'bg-red-50/40 dark:bg-red-950/10' : ''"
            >
              <!-- Fecha -->
              <td class="px-6 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {{ formatDateTime(log.createdAt) }}
              </td>

              <!-- Acción — interpretada desde el URI -->
              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getUriColor(log.details?.method, log.details?.status)"
                >
                  {{ describeUri(log.details?.uri, log.details?.method) }}
                </span>
              </td>

              <!-- Usuario -->
              <td class="px-6 py-3 font-medium">ID {{ log.userId }}</td>

              <!-- Detalles limpios -->
              <td class="px-6 py-3 text-muted-foreground text-xs">
                <span class="font-mono text-foreground">{{ log.details?.uri }}</span>
                <div class="flex items-center gap-3 mt-1">
                  <span v-if="log.details?.method" class="font-bold text-foreground">
                    {{ log.details.method }}
                  </span>
                  <span
                    v-if="log.details?.status"
                    class="font-bold"
                    :class="log.details.status >= 500 ? 'text-destructive' : log.details.status >= 400 ? 'text-orange-600' : 'text-green-600'"
                  >
                    {{ log.details.status }}
                  </span>
                  <span v-if="log.details?.durationMs">{{ log.details.durationMs }}ms</span>
                </div>
              </td>
            </tr>

            <tr v-if="logs.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                No hay registros que coincidan con los filtros
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          Página <span class="font-semibold">{{ currentPage + 1 }}</span> de {{ totalPages }} —
          <span class="font-semibold">{{ totalElements }}</span> registros en total
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 0 || loading"
            class="h-9 px-4 rounded-lg border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >← Anterior</button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1 || loading"
            class="h-9 px-4 rounded-lg border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >Siguiente →</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="p-4 rounded-lg bg-muted/50 border">
        <div class="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Total de registros</p>
            <p class="text-2xl font-bold">{{ totalElements }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Usuarios únicos</p>
            <p class="text-2xl font-bold">{{ uniqueUsers }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">En esta página</p>
            <p class="text-2xl font-bold">{{ logs.length }}</p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAudit, type AuditFilters } from '../../composables/useAudit'

const { logs, loading, totalElements, totalPages, fetchLogs } = useAudit()

const currentPage = ref(0)
const PAGE_SIZE = 20

const filters = ref<AuditFilters & { userId?: string }>({
  action:       undefined,
  resourceType: undefined,
  from:         undefined,
  to:           undefined,
  userId:       undefined
})

const uniqueUsers = computed(() => new Set(logs.value.map(l => l.userId)).size)

onMounted(() => applyFilters())

async function applyFilters() {
  currentPage.value = 0
  await fetchLogs({ ...filters.value }, 0, PAGE_SIZE)
}

async function goToPage(page: number) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  await fetchLogs({ ...filters.value }, page, PAGE_SIZE)
}

function clearFilters() {
  filters.value = { action: undefined, resourceType: undefined, from: undefined, to: undefined, userId: undefined }
  applyFilters()
}

// Convierte el URI en una acción legible
function describeUri(uri: string, method: string): string {
  if (!uri) return 'Acción'
  if (uri.includes('/auth/login'))                             return 'Inicio de sesión'
  if (uri.includes('/auth/logout'))                            return 'Cierre de sesión'
  if (uri.includes('/auth/refresh'))                           return 'Renovar sesión'
  if (uri.includes('/documents') && uri.includes('/preview'))  return 'Vista previa'
  if (uri.includes('/documents') && uri.includes('/download')) return 'Descarga'
  if (uri.includes('/documents') && uri.includes('/share'))    return 'Compartir doc.'
  if (uri.includes('/documents') && method === 'POST')         return 'Subida de archivo'
  if (uri.includes('/documents') && method === 'DELETE')       return 'Eliminación'
  if (uri.includes('/documents') && method === 'PATCH')        return 'Edición doc.'
  if (uri.includes('/documents') && method === 'GET')          return 'Consulta docs'
  if (uri.includes('/folders')   && method === 'POST')         return 'Crear carpeta'
  if (uri.includes('/folders')   && method === 'DELETE')       return 'Eliminar carpeta'
  if (uri.includes('/folders')   && method === 'PATCH')        return 'Renombrar carpeta'
  if (uri.includes('/users')     && method === 'GET')          return 'Consulta usuarios'
  if (uri.includes('/users')     && method === 'POST')         return 'Crear usuario'
  if (uri.includes('/users')     && method === 'DELETE')       return 'Eliminar usuario'
  if (uri.includes('/users')     && method === 'PATCH')        return 'Editar usuario'
  if (uri.includes('/admin/audit'))                            return 'Ver auditoría'
  if (uri.includes('/tags'))                                   return 'Etiquetas'
  if (uri.includes('/profile'))                                return 'Perfil'
  return uri.split('/').filter(Boolean).slice(-2).join('/')
}

function getUriColor(method: string, status: number): string {
  if (status >= 500) return 'bg-destructive/10 text-destructive'
  if (status >= 400) return 'bg-orange-500/10 text-orange-700'
  if (method === 'DELETE') return 'bg-destructive/10 text-destructive'
  if (method === 'POST')   return 'bg-green-500/10 text-green-700'
  if (method === 'PUT' || method === 'PATCH') return 'bg-yellow-500/10 text-yellow-700'
  return 'bg-blue-500/10 text-blue-700'
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Historial y Auditoría</h1>
          <p class="text-muted-foreground mt-1">Registro detallado de todas las acciones del sistema</p>
        </div>
        <button
          @click="showClearConfirm = true"
          class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-4 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar Log
        </button>
      </div>

      <!-- Filtros -->
      <div class="grid md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-semibold mb-1 block">Tipo de Acción</label>
          <select v-model="filter.action" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
            <option value="">Todas las acciones</option>
            <option value="upload">Carga de documento</option>
            <option value="download">Descarga de documento</option>
            <option value="view">Visualización</option>
            <option value="delete">Eliminación de documento</option>
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
          <input v-model="filter.startDate" type="date" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>

        <div>
          <label class="text-sm font-semibold mb-1 block">Hasta</label>
          <input v-model="filter.endDate" type="date" class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>

        <div>
          <label class="text-sm font-semibold mb-1 block">Usuario</label>
          <input v-model="filter.userId" type="text" placeholder="Filtrar por usuario..." class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
        </div>
      </div>

      <!-- Tabla -->
      <div class="border rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b sticky top-0">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Timestamp</th>
              <th class="text-left px-6 py-3 font-semibold">Acción</th>
              <th class="text-left px-6 py-3 font-semibold">Usuario</th>
              <th class="text-left px-6 py-3 font-semibold">Email</th>
              <th class="text-left px-6 py-3 font-semibold">Documento</th>
              <th class="text-left px-6 py-3 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="border-b hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-3 text-muted-foreground">{{ formatDateTime(log.timestamp) }}</td>
              <td class="px-6 py-3">
                <span
                  :class="getActionColor(log.action)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td class="px-6 py-3 font-medium">{{ log.userName }}</td>
              <td class="px-6 py-3 text-muted-foreground text-xs">{{ log.userEmail }}</td>
              <td class="px-6 py-3 text-muted-foreground">{{ log.documentName || '-' }}</td>
              <td class="px-6 py-3 text-muted-foreground">
                <div v-if="log.details" class="text-xs space-y-1">
                  <div v-for="(v, k) in log.details" :key="k">
                    <span class="font-medium">{{ k }}:</span> {{ formatDetail(v) }}
                  </div>
                </div>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="filteredLogs.length === 0" class="text-center py-12 text-muted-foreground">
        <p>No hay registros que coincidan con los filtros</p>
      </div>

      <!-- Stats -->
      <div class="p-4 rounded-lg bg-muted/50 border">
        <div class="grid md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Total de registros</p>
            <p class="text-2xl font-bold">{{ logs.length }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Registros mostrados</p>
            <p class="text-2xl font-bold">{{ filteredLogs.length }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Archivos procesados</p>
            <p class="text-2xl font-bold">{{ uniqueDocuments }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Usuarios activos</p>
            <p class="text-2xl font-bold">{{ uniqueUsers }}</p>
          </div>
        </div>
      </div>

      <!-- ✅ Modal de confirmación inline — sin confirm() -->
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="showClearConfirm = false"
      >
        <div class="bg-background rounded-2xl w-full max-w-sm p-6 border shadow-2xl">
          <h2 class="text-lg font-semibold mb-2">Limpiar historial</h2>
          <p class="text-muted-foreground mb-6">
            ¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-3">
            <button
              @click="showClearConfirm = false"
              class="flex-1 h-10 rounded-lg border hover:bg-accent transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="confirmClearLog"
              class="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition-all font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuditLog, type AuditAction } from '../../composables/useAuditLog'

const { logs, filter, clearLogs, getFilteredLogs } = useAuditLog()

const showClearConfirm = ref(false)

const filteredLogs = computed(() => getFilteredLogs())
const uniqueDocuments = computed(() => new Set(filteredLogs.value.filter(l => l.documentId).map(l => l.documentId)).size)
const uniqueUsers = computed(() => new Set(filteredLogs.value.map(l => l.userId)).size)

// ✅ Incluye 'view'
const actionLabels: Record<AuditAction, string> = {
  upload: 'Carga',
  download: 'Descarga',
  view: 'Visualización',
  delete: 'Eliminación',
  share: 'Compartir',
  revoke: 'Revocar',
  edit: 'Edición',
  login: 'Login',
  logout: 'Logout',
  user_created: 'Usr. Creado',
  user_deleted: 'Usr. Eliminado',
  user_role_changed: 'Rol Cambiado',
  user_profile_updated:  'Perfil Actualizado',  
  user_password_changed: 'Contraseña Cambiada' 
}

// ✅ Incluye 'view'
const actionColors: Record<AuditAction, string> = {
  upload: 'bg-blue-500/10 text-blue-700',
  download: 'bg-green-500/10 text-green-700',
  view: 'bg-cyan-500/10 text-cyan-700',
  delete: 'bg-destructive/10 text-destructive',
  share: 'bg-purple-500/10 text-purple-700',
  revoke: 'bg-orange-500/10 text-orange-700',
  edit: 'bg-yellow-500/10 text-yellow-700',
  login: 'bg-teal-500/10 text-teal-700',
  logout: 'bg-slate-500/10 text-slate-700',
  user_created: 'bg-green-500/10 text-green-700',
  user_deleted: 'bg-destructive/10 text-destructive',
  user_role_changed: 'bg-blue-500/10 text-blue-700',
  user_profile_updated:  'bg-indigo-500/10 text-indigo-700',  
  user_password_changed: 'bg-amber-500/10 text-amber-700'     
}

function getActionLabel(action: AuditAction): string {
  return actionLabels[action] || action
}

function getActionColor(action: AuditAction): string {
  return actionColors[action] || 'bg-muted text-muted-foreground'
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDetail(value: unknown): string {
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// ✅ Sin confirm()
function confirmClearLog() {
  clearLogs()
  showClearConfirm.value = false
}
</script>

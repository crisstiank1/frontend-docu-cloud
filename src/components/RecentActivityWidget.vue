<template>
  <div class="p-6 rounded-lg border bg-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Actividad Reciente
      </h3>
      <router-link 
        v-if="canViewHistory" 
        to="/historial" 
        class="text-sm text-primary hover:underline"
      >
        Ver todas →
      </router-link>
    </div>

    <!-- ✅ Estado vacío -->
    <div v-if="!activities || activities.length === 0" class="text-center py-12">
      <span class="text-6xl block mb-4">📭</span>
      <p class="text-muted-foreground font-medium mb-2">Aún no hay actividad</p>
      <p class="text-sm text-muted-foreground">Sube tu primer archivo para comenzar</p>
    </div>

    <!-- ✅ Lista de actividades mejorada -->
    <div v-else class="space-y-1">
      <div
        v-for="activity in activities.slice(0, 5)"
        :key="activity.id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors duration-200 group"
      >
        <!-- ✅ Icono según tipo de acción -->
        <span class="text-xl flex-shrink-0">
          {{ getActivityIcon(activity.action) }}
        </span>

        <!-- ✅ Texto descriptivo -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">
            {{ getActivityText(activity) }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ activity.userName || 'Sistema' }}
          </p>
        </div>

        <!-- ✅ Tiempo relativo -->
        <span class="text-xs text-muted-foreground whitespace-nowrap">
          {{ formatTimeAgo(activity.timestamp) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activities: Array<{
    id: string
    action: string
    userName?: string
    userEmail?: string
    documentName?: string
    timestamp: string
  }>
  canViewHistory: boolean
}>()

// ✅ Helper: Obtener ícono según tipo de acción
function getActivityIcon(action: string): string {
  const icons: Record<string, string> = {
    login: '🔐',
    upload: '📤',
    download: '📥',
    edit: '✏️',
    delete: '🗑️',
    share: '🔗',
    view: '👁️',
    create: '✨',
    update: '♻️',
    favorite: '⭐'
  }
  return icons[action] || '📄'
}

// ✅ Helper: Texto descriptivo de la acción
function getActivityText(activity: any): string {
  const actions: Record<string, string> = {
    login: 'Inicio de sesión',
    upload: `Subió ${activity.documentName || 'un archivo'}`,
    download: `Descargó ${activity.documentName || 'un archivo'}`,
    edit: `Editó ${activity.documentName || 'un archivo'}`,
    delete: `Eliminó ${activity.documentName || 'un archivo'}`,
    share: `Compartió ${activity.documentName || 'un archivo'}`,
    view: `Visualizó ${activity.documentName || 'un archivo'}`,
    create: `Creó ${activity.documentName || 'un elemento'}`,
    update: `Actualizó ${activity.documentName || 'un elemento'}`,
    favorite: `Marcó como favorito ${activity.documentName || 'un archivo'}`
  }
  return actions[activity.action] || `${activity.action} en el sistema`
}

// ✅ Helper: Tiempo relativo (Hace 5m, Hace 1h, etc.)
function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short' 
  })
}
</script>

<template>
  <div class="p-6 rounded-lg border bg-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Actividad Reciente
      </h3>
    </div>

    <!-- Estado vacío -->
    <div v-if="!activities || activities.length === 0" class="text-center py-12">
      <span class="text-6xl block mb-4">📭</span>
      <p class="text-muted-foreground font-medium mb-2">Aún no hay actividad</p>
      <p class="text-sm text-muted-foreground">Sube tu primer archivo para comenzar</p>
    </div>

    <!-- Lista de actividades -->
    <div v-else class="space-y-1">
      <div
        v-for="activity in activities.slice(0, 8)"
        :key="activity.id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors duration-200 group"
      >
        <!-- Ícono según acción -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
          :class="getIconBg(activity.action, activity.isSuccessful)"
        >
          {{ getActivityIcon(activity.action) }}
        </div>

        <!-- Texto descriptivo -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">
            {{ getActivityText(activity) }}
          </p>
          <p class="text-xs text-muted-foreground truncate">
            {{ activity.userName || 'Sistema' }}
            <span v-if="!activity.isSuccessful" class="text-destructive ml-1">· falló</span>
          </p>
        </div>

        <!-- Tiempo relativo -->
        <span class="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {{ formatTimeAgo(activity.timestamp) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ActivityItem {
  id: string
  action: string          // acción original del backend (ej: DOC_UPLOAD_COMPLETE)
  userName?: string
  resourceName?: string   // nombre del archivo/carpeta/categoría
  timestamp: string
  isSuccessful: boolean
}

defineProps<{
  activities: ActivityItem[]
  canViewHistory: boolean
}>()

// ── Íconos por acción ─────────────────────────────────────────────────────────
function getActivityIcon(action: string): string {
  // Auth
  if (action === 'login')                        return '🔐'
  if (action === 'logout')                       return '🚪'
  // Documentos
  if (action === 'upload')                       return '📤'
  if (action === 'download')                     return '📥'
  if (action === 'delete')                       return '🗑️'
  if (action === 'preview')                      return '👁️'
  if (action === 'share')                        return '🔗'
  if (action === 'share_revoke')                 return '🔒'
  if (action === 'share_update')                 return '🔄'
  if (action === 'favorite')                     return '⭐'
  if (action === 'unfavorite')                   return '☆'
  // Carpetas
  if (action === 'folder_create')                return '📁'
  if (action === 'folder_delete')                return '🗂️'
  if (action === 'folder_rename')                return '✏️'
  if (action === 'folder_move')                  return '📦'
  // Categorías
  if (action === 'category_create')              return '🏷️'
  if (action === 'category_delete')              return '🗑️'
  if (action === 'category_update')              return '🏷️'
  if (action === 'category_assign')              return '📌'
  if (action === 'category_remove')              return '📌'
  // Clasificación IA
  if (action === 'classify')                     return '🤖'
  // Perfil
  if (action === 'profile_update')               return '👤'
  if (action === 'password_change')              return '🔑'
  // Búsqueda
  if (action === 'search')                       return '🔍'
  // Tags
  if (action === 'tag_add')                      return '🏷️'
  if (action === 'tag_remove')                   return '🏷️'
  return '📄'
}

// ── Color de fondo del ícono ──────────────────────────────────────────────────
function getIconBg(action: string, isSuccessful: boolean): string {
  if (!isSuccessful) return 'bg-destructive/10'
  if (['login', 'logout', 'password_change'].includes(action)) return 'bg-blue-500/10'
  if (['upload', 'download', 'preview'].includes(action))      return 'bg-primary/10'
  if (['delete', 'folder_delete', 'category_delete'].includes(action)) return 'bg-destructive/10'
  if (['share', 'share_update'].includes(action))              return 'bg-pink-500/10'
  if (action === 'share_revoke')                               return 'bg-orange-500/10'
  if (['folder_create', 'folder_rename', 'folder_move'].includes(action)) return 'bg-amber-500/10'
  if (action.startsWith('category'))                           return 'bg-green-500/10'
  if (action === 'classify')                                   return 'bg-purple-500/10'
  if (['favorite', 'unfavorite'].includes(action))             return 'bg-yellow-500/10'
  return 'bg-muted'
}

// ── Texto descriptivo completo ────────────────────────────────────────────────
function getActivityText(activity: ActivityItem): string {
  const r = activity.resourceName ? `"${activity.resourceName}"` : ''

  switch (activity.action) {
    // Auth
    case 'login':           return 'Inició sesión'
    case 'logout':          return 'Cerró sesión'
    case 'password_change': return 'Cambió su contraseña'
    case 'profile_update':  return 'Actualizó su perfil'
    // Documentos
    case 'upload':          return r ? `Subió ${r}` : 'Subió un archivo'
    case 'download':        return r ? `Descargó ${r}` : 'Descargó un archivo'
    case 'preview':         return r ? `Previsualizó ${r}` : 'Previsualización de archivo'
    case 'delete':          return r ? `Eliminó ${r}` : 'Eliminó un archivo'
    case 'share':           return r ? `Compartió ${r}` : 'Compartió un archivo'
    case 'share_revoke':    return r ? `Revocó acceso a ${r}` : 'Revocó acceso a un archivo'
    case 'share_update':    return r ? `Actualizó permisos de ${r}` : 'Actualizó permisos de compartir'
    case 'favorite':        return r ? `Marcó ${r} como favorito` : 'Marcó un archivo como favorito'
    case 'unfavorite':      return r ? `Quitó ${r} de favoritos` : 'Quitó un archivo de favoritos'
    // Carpetas
    case 'folder_create':   return r ? `Creó la carpeta ${r}` : 'Creó una carpeta'
    case 'folder_delete':   return r ? `Eliminó la carpeta ${r}` : 'Eliminó una carpeta'
    case 'folder_rename':   return r ? `Renombró la carpeta ${r}` : 'Renombró una carpeta'
    case 'folder_move':     return r ? `Movió la carpeta ${r}` : 'Movió una carpeta'
    // Categorías
    case 'category_create': return r ? `Creó la categoría ${r}` : 'Creó una categoría'
    case 'category_delete': return r ? `Eliminó la categoría ${r}` : 'Eliminó una categoría'
    case 'category_update': return r ? `Actualizó la categoría ${r}` : 'Actualizó una categoría'
    case 'category_assign': return r ? `Clasificó ${r}` : 'Clasificó un archivo'
    case 'category_remove': return r ? `Quitó categoría de ${r}` : 'Quitó clasificación de archivo'
    // IA
    case 'classify':        return r ? `IA clasificó ${r}` : 'Clasificación automática'
    // Tags
    case 'tag_add':         return r ? `Etiquetó ${r}` : 'Añadió etiqueta a un archivo'
    case 'tag_remove':      return r ? `Quitó etiqueta de ${r}` : 'Quitó etiqueta de un archivo'
    // Búsqueda
    case 'search':          return r ? `Buscó "${activity.resourceName}"` : 'Realizó una búsqueda'
    // Fallback
    default:                return r ? `${activity.action} en ${r}` : `${activity.action} en el sistema`
  }
}

// ── Tiempo relativo ───────────────────────────────────────────────────────────
function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)

  if (minutes < 1)  return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24)   return `Hace ${hours}h`
  if (days < 7)     return `Hace ${days}d`
  return new Date(timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
</script>
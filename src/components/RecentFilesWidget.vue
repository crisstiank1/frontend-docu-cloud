<template>
  <div class="p-5 rounded-xl border bg-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Archivos Recientes
      </h3>
    </div>

    <!-- Vacío -->
    <div v-if="files.length === 0" class="text-center py-6">
      <span class="text-4xl block mb-2">📂</span>
      <p class="text-sm text-muted-foreground">Aún no has subido archivos</p>
    </div>

    <!-- Lista -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div
        v-for="file in files"
        :key="file.id"
        @click="emit('open', file)"
        class="flex flex-col items-center gap-2 p-3 rounded-lg border
               hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm
               transition-all cursor-pointer group"
        :title="file.name"
      >
        <!-- Miniatura -->
        <div class="w-12 h-12 rounded-lg flex items-center justify-center
                    overflow-hidden flex-shrink-0 bg-muted
                    group-hover:scale-105 transition-transform">
          <img
            v-if="file.type.startsWith('image/') && file.thumbnailUrl"
            :src="file.thumbnailUrl"
            :alt="file.name"
            class="w-full h-full object-cover rounded-lg"
          />
          <span v-else-if="file.type.startsWith('image/')" class="text-2xl">🖼️</span>
          <img
            v-else-if="getIconUrl(file.type)"
            :src="getIconUrl(file.type)"
            :alt="file.type"
            class="w-9 h-9 object-contain"
          />
          <span v-else class="text-2xl">{{ getFallbackIcon(file.type) }}</span>
        </div>

        <!-- Nombre -->
        <p class="text-xs font-medium text-center truncate w-full leading-snug
                  group-hover:text-primary transition-colors">
          {{ file.name }}
        </p>

        <!-- Tamaño -->
        <p class="text-xs text-muted-foreground">{{ formatSize(file.size) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ✅ backendId agregado — lo necesita documentService.getPreviewUrl()
interface FileItem {
  id: string
  backendId?: string
  name: string
  type: string
  size: number
  thumbnailUrl?: string
  uploadedAt: string
}

defineProps<{
  files: FileItem[]
}>()

// ✅ emit definido — avisa al padre qué archivo se clickeó
const emit = defineEmits<{
  open: [file: FileItem]
}>()

const FILE_ICON_URLS: Record<string, string> = {
  pdf:        'https://img.icons8.com/fluency/96/pdf.png',
  word:       'https://img.icons8.com/color/96/microsoft-word-2019--v2.png',
  excel:      'https://img.icons8.com/color/96/microsoft-excel-2019--v1.png',
  powerpoint: 'https://img.icons8.com/color/96/microsoft-powerpoint-2019--v1.png',
}

function getIconUrl(mimeType: string): string | undefined {
  if (mimeType === 'application/pdf')                                          return FILE_ICON_URLS.pdf
  if (mimeType.includes('word') || mimeType.includes('document'))             return FILE_ICON_URLS.word
  if (mimeType.includes('excel') || mimeType.includes('sheet'))               return FILE_ICON_URLS.excel
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))   return FILE_ICON_URLS.powerpoint
  return undefined
}

function getFallbackIcon(mimeType: string): string {
  if (mimeType.startsWith('video/'))                              return '🎬'
  if (mimeType.startsWith('audio/'))                              return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('rar'))       return '📦'
  if (mimeType.startsWith('text/'))                               return '📃'
  return '📁'
}

function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
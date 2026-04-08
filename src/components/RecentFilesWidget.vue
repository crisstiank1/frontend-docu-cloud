<template>
  <div class="p-4 sm:p-5 rounded-xl border bg-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    <!-- CORRECCIÓN: grid-cols-2 en xs, 3 en sm, 4 en md, 5 en lg -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      <div
        v-for="file in files"
        :key="file.id"
        @click="emit('open', file)"
        class="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg border hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
        :title="file.name"
      >
        <!-- Miniatura -->
        <!-- CORRECCIÓN: tamaño del ícono responsivo w-10 sm:w-12 -->
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-muted group-hover:scale-105 transition-transform">
          <img
            v-if="file.type.startsWith('image/') && file.thumbnailUrl"
            :src="file.thumbnailUrl"
            :alt="file.name"
            class="w-full h-full object-cover rounded-lg"
          />
          <span v-else-if="file.type.startsWith('image/')" class="text-xl sm:text-2xl">🖼️</span>
          <img
            v-else-if="getIconUrl(file.type)"
            :src="getIconUrl(file.type)"
            :alt="file.type"
            class="w-7 h-7 sm:w-9 sm:h-9 object-contain"
          />
          <span v-else class="text-xl sm:text-2xl">{{ getFallbackIcon(file.type) }}</span>
        </div>

        <!-- Nombre -->
        <p class="text-xs font-medium text-center truncate w-full leading-snug group-hover:text-primary transition-colors">
          {{ file.name }}
        </p>

        <!-- Tamaño -->
        <p class="text-xs text-muted-foreground">{{ formatSize(file.size) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const emit = defineEmits<{
  open: [file: FileItem]
}>()

const FILE_ICON: Record<string, string> = {
  pdf: '/icons/pdf.png',
  word: '/icons/word.png',
  excel: '/icons/excel.png',
  powerpoint: '/icons/powerpoint.png',
}

function getIconUrl(mimeType: string): string | undefined {
  if (mimeType === 'application/pdf') return FILE_ICON.pdf
  if (mimeType.includes('word') || mimeType.includes('document')) return FILE_ICON.word
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return FILE_ICON.excel
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return FILE_ICON.powerpoint
  return undefined
}

function getFallbackIcon(mimeType: string): string {
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
  if (mimeType.startsWith('text/')) return '📃'
  return '📁'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
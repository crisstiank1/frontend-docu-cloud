<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">

      <!-- Header con controles -->
      <div class="absolute top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div class="flex-1 min-w-0">
          <h2 class="text-white font-semibold truncate">{{ document.name }}</h2>
          <p class="text-white/60 text-sm">{{ formatFileSize(document.size) }} • {{ getFileType(document.type) }}</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Anterior -->
          <button
            v-if="canNavigatePrev"
            @click="emit('navigate', 'prev')"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Anterior (←)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Siguiente -->
          <button
            v-if="canNavigateNext"
            @click="emit('navigate', 'next')"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Siguiente (→)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Descargar -->
          <button
            @click="downloadFile"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Descargar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- Cerrar -->
          <button
            @click="emit('close')"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white ml-2"
            title="Cerrar (Esc)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Área de contenido -->
      <div class="w-full h-full flex items-center justify-center pt-16" @click.self="emit('close')">

        <!-- VISOR DE IMÁGENES -->
        <div v-if="isImage && !hasError" class="max-w-7xl max-h-full p-4">
          <img
            :src="filePreviewUrl"
            :alt="document.name"
            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            @error="handleImageError"
          />
        </div>

        <!-- VISOR DE PDF -->
        <div v-else-if="isPDF && !hasError" class="w-full h-full max-w-7xl mx-auto p-4">
          <iframe
            :src="filePreviewUrl"
            class="w-full h-[85vh] rounded-lg shadow-2xl bg-white"
            @error="handlePDFError"
          />
        </div>

        <!-- VISOR DE TEXTO -->
        <div v-else-if="isText && !hasError" class="w-full max-w-4xl max-h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden">
          <div class="p-8 overflow-y-auto h-full">
            <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800">{{ textContent }}</pre>
          </div>
        </div>

        <!-- TIPO NO SOPORTADO -->
        <div v-else-if="!hasError" class="text-center max-w-md">
          <div class="text-8xl mb-6">{{ getFileIcon(document.type) }}</div>
          <h3 class="text-2xl font-bold text-white mb-3">Vista previa no disponible</h3>
          <p class="text-white/70 mb-6">
            Los archivos {{ getFileType(document.type) }} no se pueden previsualizar en el navegador.
          </p>
          <button
            @click="downloadFile"
            class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Archivo
          </button>
        </div>

        <!-- ERROR -->
        <div v-if="hasError" class="text-center max-w-md">
          <div class="text-8xl mb-6">⚠️</div>
          <h3 class="text-2xl font-bold text-white mb-3">Error al cargar archivo</h3>
          <p class="text-white/70 mb-6">No se pudo mostrar el contenido del archivo.</p>
          <button
            @click="downloadFile"
            class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Descargar en su lugar
          </button>
        </div>
      </div>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Document } from '../composables/useDocuments'

interface Props {
  document: Document
  allDocuments: Document[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  navigate: [direction: 'prev' | 'next']
}>()

// Estado
const filePreviewUrl = ref('')
const textContent = ref('')
const hasError = ref(false)

// Computed
const isImage = computed(() => props.document.type.startsWith('image/'))
const isPDF = computed(() => props.document.type.includes('pdf'))
const isText = computed(() => props.document.type.includes('text/plain'))

const currentIndex = computed(() =>
  props.allDocuments.findIndex(d => d.id === props.document.id)
)

const canNavigatePrev = computed(() => currentIndex.value > 0)
const canNavigateNext = computed(() => currentIndex.value < props.allDocuments.length - 1)

// Funciones
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getFileType(type: string): string {
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('wordprocessingml')) return 'Word'
  if (type.includes('text')) return 'Texto'
  if (type.startsWith('image')) return 'Imagen'
  return type.split('/')[1]?.toUpperCase() || 'Archivo'
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📕'
  if (type.includes('word') || type.includes('wordprocessingml')) return '📘'
  if (type.includes('text')) return '📄'
  if (type.startsWith('image')) return '🖼️'
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📊'
  return '📎'
}

function downloadFile() {
  // ✅ Sin alert — descarga directa si hay URL disponible
  if (filePreviewUrl.value && filePreviewUrl.value !== '#') {
    const link = window.document.createElement('a')
    link.href = filePreviewUrl.value
    link.download = props.document.name
    link.click()
  }
  // En producción: llamar al endpoint /api/documents/:id/download
}

function handleImageError() {
  hasError.value = true
}

function handlePDFError() {
  hasError.value = true
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'ArrowLeft' && canNavigatePrev.value) {
    emit('navigate', 'prev')
  } else if (e.key === 'ArrowRight' && canNavigateNext.value) {
    emit('navigate', 'next')
  }
}

onMounted(() => {
  if (isImage.value) {
    // ✅ Placeholder más confiable (placehold.co reemplaza via.placeholder.com)
    filePreviewUrl.value = `https://placehold.co/800x600/3b82f6/ffffff?text=${encodeURIComponent(props.document.name)}`
  } else if (isPDF.value) {
    // En producción: `/api/documents/${props.document.id}/preview`
    filePreviewUrl.value = ''
  } else if (isText.value) {
    // ✅ Usa contenido real si existe, sino mensaje informativo
    textContent.value = props.document.content ||
      `Vista previa no disponible.\n\nEn producción, aquí se mostraría el contenido real del archivo desde el servidor.`
  }

  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

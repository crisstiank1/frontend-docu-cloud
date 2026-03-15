<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">

      <!-- Header con controles -->
      <div class="absolute top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div class="flex-1 min-w-0">
          <h2 class="text-white font-semibold truncate">{{ doc.name }}</h2>
          <p class="text-white/60 text-sm">{{ formatFileSize(doc.size) }} • {{ getFileType(doc.type) }}</p>
        </div>

        <div class="flex items-center gap-2">
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

          <button
            @click="downloadFile"
            :disabled="downloading"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white disabled:opacity-50"
            title="Descargar"
          >
            <svg v-if="!downloading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </button>

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

        <!-- Loading inicial -->
        <div v-if="loadingPreview" class="text-center">
          <svg class="w-12 h-12 animate-spin text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p class="text-white/60">Cargando vista previa...</p>
        </div>

        <!-- VISOR DE IMÁGENES -->
        <div v-else-if="isImage && !hasError && filePreviewUrl" class="max-w-7xl max-h-full p-4">
          <img
            :src="filePreviewUrl"
            :alt="document.name"
            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            @error="hasError = true"
          />
        </div>

        <!-- VISOR DE PDF -->
        <div v-else-if="isPDF && !hasError && filePreviewUrl" class="w-full h-full max-w-7xl mx-auto p-4">
          <iframe
            :src="filePreviewUrl"
            class="w-full h-[85vh] rounded-lg shadow-2xl bg-white"
            @error="hasError = true"
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
          <div class="text-8xl mb-6">{{ getFileIcon(doc.type) }}</div>
          <h3 class="text-2xl font-bold text-white mb-3">Vista previa no disponible</h3>
          <p class="text-white/70 mb-6">
            Los archivos {{ getFileType(doc.type) }} no se pueden previsualizar en el navegador.
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
import type { Document } from '../../composables/useDocuments'
import { useDocuments } from '../../composables/useDocuments'

interface Props {
  document: Document
  allDocuments: Document[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  navigate: [direction: 'prev' | 'next']
}>()

// Alias para evitar conflicto con window.document
const doc = computed(() => props.document)

const { downloadDocument, previewDocument } = useDocuments()

// Estado
const filePreviewUrl = ref('')
const textContent = ref('')
const hasError = ref(false)
const loadingPreview = ref(true)
const downloading = ref(false)

// Computed
const isImage = computed(() => doc.value.type.startsWith('image/'))
const isPDF = computed(() => doc.value.type.includes('pdf'))
const isText = computed(() => doc.value.type.includes('text/plain'))

const currentIndex = computed(() =>
  props.allDocuments.findIndex(d => d.id === doc.value.id)
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

async function downloadFile() {
  downloading.value = true
  try {
    const url = await downloadDocument(doc.value.id)
    if (!url) return
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = blobUrl
    a.download = doc.value.name
    a.click()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(await downloadDocument(doc.value.id) ?? '', '_blank')
  } finally {
    downloading.value = false
  }
}


async function loadPreview() {
  hasError.value = false
  filePreviewUrl.value = ''

  if (isText.value) {
    textContent.value = 'Vista previa no disponible.\n\nDescarga el archivo para ver su contenido.'
    loadingPreview.value = false  // ← fix: texto no entra al if de abajo
    return
  }

  if (isImage.value || isPDF.value) {
    loadingPreview.value = true
    try {
      const url = await previewDocument(doc.value.id)
      if (!url) { hasError.value = true; return }
      filePreviewUrl.value = url
    } catch {
      hasError.value = true
    } finally {
      loadingPreview.value = false
    }
  } else {
    loadingPreview.value = false  // ← fix: tipos no soportados (Word, Excel...)
  }
}




function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft' && canNavigatePrev.value) emit('navigate', 'prev')
  else if (e.key === 'ArrowRight' && canNavigateNext.value) emit('navigate', 'next')
}

onMounted(() => {
  loadPreview()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>



<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="handleClose"
  >
    <div
      class="bg-background rounded-2xl w-full max-w-lg p-6 border shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Subir Archivos</h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Drop Zone -->
      <div
        class="relative rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60
               transition-all p-12 text-center cursor-pointer"
        :class="isDragging && 'border-primary bg-primary/5'"
        @click="fileInput?.click()"
        @drop.prevent="onDrop"
        @dragover.prevent
        @dragenter="isDragging = true"
        @dragleave="isDragging = false"
      >
        <div class="text-5xl mb-4">📁</div>
        <p class="font-semibold text-lg mb-2">Arrastra archivos aquí</p>
        <p class="text-sm text-muted-foreground mb-4">o haz clic para seleccionar</p>
        <p class="text-xs text-muted-foreground">Máximo {{ MAX_SIZE_MB }} MB por archivo</p>
        <input
          type="file"
          ref="fileInput"
          multiple
          @change="onFileChange"
          class="hidden"
        />
      </div>

      <!-- ✅ Errores de tamaño — aparece debajo del drop zone -->
      <div v-if="sizeErrors.length > 0" class="mt-3 space-y-1">
        <div
          v-for="err in sizeErrors"
          :key="err"
          class="flex items-start gap-2 text-xs text-destructive bg-destructive/10
                 border border-destructive/20 rounded-lg px-3 py-2"
        >
          <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ err }} supera el límite de {{ MAX_SIZE_MB }} MB y fue omitido</span>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">Subiendo...</span>
          <span class="text-sm font-semibold text-primary">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          />
        </div>
      </div>

      <!-- Lista de archivos seleccionados -->
      <div v-if="uploadedFiles.length > 0" class="mt-6 space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="(file, index) in uploadedFiles"
          :key="index"
          class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
        >
          <!-- Miniatura real para imágenes -->
          <img
            v-if="previewUrls.get(file)"
            :src="previewUrls.get(file)"
            :alt="file.name"
            class="w-10 h-10 object-cover rounded flex-shrink-0"
          />
          <!-- Icono para tipos conocidos -->
          <img
            v-else-if="getFileIconUrl(file.type)"
            :src="getFileIconUrl(file.type)!"
            :alt="file.type"
            class="w-10 h-10 object-contain rounded flex-shrink-0"
          />
          <!-- Fallback genérico -->
          <div
            v-else
            class="w-10 h-10 rounded flex-shrink-0 bg-muted flex items-center justify-center text-xl"
          >
            📎
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ file.name }}</p>
            <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
          </div>
          <button
            @click="removeFile(index)"
            class="p-1 hover:bg-destructive/10 text-destructive rounded flex-shrink-0"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          v-if="uploadedFiles.length > 0"
          @click="confirmUpload"
          :disabled="isUploading"
          class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground
                 hover:shadow-lg transition-all font-medium disabled:opacity-50"
        >
          Subir {{ uploadedFiles.length }} archivo{{ uploadedFiles.length !== 1 ? 's' : '' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  modelValue: boolean
  currentFolderId?: string | null
  uploadFn?: (file: File, folderId?: string | null) => Promise<unknown>
}

const props = withDefaults(defineProps<Props>(), {
  currentFolderId: null,
  uploadFn: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  uploaded: []
}>()

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_SIZE_MB    = 10                        // ✅ fuente única de verdad
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024 // 10 485 760 bytes

// ─── Estado ───────────────────────────────────────────────────────────────────

const fileInput      = ref<HTMLInputElement | null>(null)
const uploadedFiles  = ref<File[]>([])
const uploadProgress = ref(0)
const isUploading    = ref(false)
const isDragging     = ref(false)
const previewUrls    = ref<Map<File, string>>(new Map())
const sizeErrors     = ref<string[]>([])          // ✅ archivos rechazados por tamaño

// ─── Iconos ───────────────────────────────────────────────────────────────────

const FILE_ICON = {
  pdf:        '/icons/pdf.png',
  word:       '/icons/word.png',
  excel:      '/icons/excel.png',
  powerpoint: '/icons/powerpoint.png',
}

function getFileIconUrl(type: string): string | null {
  if (type.includes('pdf'))                                          return FILE_ICON.pdf
  if (type.includes('word') || type.includes('wordprocessingml'))   return FILE_ICON.word
  if (type.includes('excel') || type.includes('spreadsheet'))       return FILE_ICON.excel
  if (type.includes('powerpoint') || type.includes('presentation')) return FILE_ICON.powerpoint
  return null
}

// ─── Preview de imágenes ──────────────────────────────────────────────────────

function generatePreview(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrls.value = new Map(previewUrls.value).set(file, e.target?.result as string)
  }
  reader.readAsDataURL(file)
}

// ─── Validación de tamaño ─────────────────────────────────────────────────────

// ✅ Separa archivos válidos de los que superan el límite
// y actualiza sizeErrors para mostrar feedback al usuario
function validateAndAdd(files: File[]) {
  sizeErrors.value = []
  const valid:     File[]   = []
  const oversized: string[] = []

  files.forEach(file => {
    if (file.size > MAX_SIZE_BYTES) {
      oversized.push(`"${file.name}" (${formatFileSize(file.size)})`)
    } else {
      valid.push(file)
    }
  })

  if (oversized.length > 0) {
    sizeErrors.value = oversized
  }

  valid.forEach(generatePreview)
  uploadedFiles.value.push(...valid)
}

// ─── Manejo de archivos ───────────────────────────────────────────────────────

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  validateAndAdd(Array.from(files))
  // ✅ Reset del input para permitir seleccionar el mismo archivo de nuevo
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (!e.dataTransfer?.files) return
  validateAndAdd(Array.from(e.dataTransfer.files))
}

function removeFile(index: number) {
  const file = uploadedFiles.value[index]
  previewUrls.value.delete(file)
  previewUrls.value = new Map(previewUrls.value)
  uploadedFiles.value.splice(index, 1)
}

// ─── Subida ───────────────────────────────────────────────────────────────────

async function confirmUpload() {
  if (!uploadedFiles.value.length || isUploading.value) return

  isUploading.value    = true
  uploadProgress.value = 10
  sizeErrors.value     = [] // limpiar errores al iniciar subida

  const step = Math.floor(80 / uploadedFiles.value.length)

  try {
    for (const file of uploadedFiles.value) {
      if (props.uploadFn) {
        await props.uploadFn(file, props.currentFolderId)
      }
      uploadProgress.value = Math.min(uploadProgress.value + step, 90)
    }

    uploadProgress.value = 100
    emit('uploaded')
    setTimeout(() => resetModal(), 500)
  } catch (err) {
    console.error('Error al subir archivos:', err)
  } finally {
    isUploading.value = false
  }
}

// ─── Cierre y reset ───────────────────────────────────────────────────────────

function resetModal() {
  uploadedFiles.value  = []
  uploadProgress.value = 0
  previewUrls.value    = new Map()
  sizeErrors.value     = [] // ✅ limpiar errores al cerrar
  emit('update:modelValue', false)
}

function handleClose() {
  if (isUploading.value) return
  resetModal()
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k     = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}
</script>
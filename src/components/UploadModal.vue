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
        <p class="text-xs text-muted-foreground">Máximo 10 MB por archivo</p>
        <input
          type="file"
          ref="fileInput"
          multiple
          @change="onFileChange"
          class="hidden"
        />
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

// ─── Estado ───────────────────────────────────────────────────────────────────

const fileInput      = ref<HTMLInputElement | null>(null)
const uploadedFiles  = ref<File[]>([])
const uploadProgress = ref(0)
const isUploading    = ref(false)
const isDragging     = ref(false)
const previewUrls    = ref<Map<File, string>>(new Map())

// ─── Iconos ───────────────────────────────────────────────────────────────────

const FILE_ICON = {
  pdf:        '/icons/pdf.png',
  word:       '/icons/word.png',
  excel:      '/icons/excel.png',
  powerpoint: '/icons/powerpoint.png',
}

function getFileIconUrl(type: string): string | null {
  if (type.includes('pdf'))                                               return FILE_ICON.pdf
  if (type.includes('word') || type.includes('wordprocessingml'))        return FILE_ICON.word
  if (type.includes('excel') || type.includes('spreadsheet'))            return FILE_ICON.excel
  if (type.includes('powerpoint') || type.includes('presentation'))      return FILE_ICON.powerpoint
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

// ─── Manejo de archivos ───────────────────────────────────────────────────────

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const arr = Array.from(files)
  arr.forEach(generatePreview)
  uploadedFiles.value.push(...arr)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (!e.dataTransfer?.files) return
  const arr = Array.from(e.dataTransfer.files)
  arr.forEach(generatePreview)
  uploadedFiles.value.push(...arr)
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
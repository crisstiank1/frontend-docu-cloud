<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">
    <!-- ===== HEADER ===== -->
    <header class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="h-full max-w-full px-4 flex items-center gap-4">
        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar en archivos compartidos..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-10 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
              :class="(permissionFilter || typeFilter) ? 'border-primary text-primary' : ''"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
              <span v-if="permissionFilter || typeFilter" class="w-2 h-2 rounded-full bg-primary" />
            </button>

            <div v-if="showFilters" @click.stop class="absolute right-0 top-12 w-72 bg-card border rounded-lg shadow-xl p-4 z-50">
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium mb-1 block">Permiso</label>
                  <select v-model="permissionFilter" class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="READ">Solo lectura</option>
                    <option value="WRITE">Lectura y escritura</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Tipo de archivo</label>
                  <select v-model="typeFilter" class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="application/pdf">PDF</option>
                    <option value="wordprocessingml">Word</option>
                    <option value="spreadsheet">Excel</option>
                    <option value="text/plain">Texto</option>
                    <option value="image/">Imágenes</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Ordenar por</label>
                  <select v-model="sortBy" class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="date">Más recientes</option>
                    <option value="name">Nombre (A-Z)</option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button @click="clearFilters(); showFilters = false" class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent">Limpiar</button>
                  <button @click="showFilters = false" class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg">Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="viewMode = viewMode === 'table' ? 'gallery' : 'table'"
            class="h-10 w-10 rounded-lg border hover:bg-accent transition-colors hidden sm:flex items-center justify-center"
            :title="viewMode === 'table' ? 'Vista galería' : 'Vista tabla'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="viewMode === 'table'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        <span class="ml-auto text-sm text-muted-foreground flex-shrink-0">
          {{ filteredDocuments.length }} archivo{{ filteredDocuments.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </header>

    <!-- ===== CONTENIDO ===== -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto p-6 space-y-6">

        <!-- Stats -->
        <div v-if="sharedDocuments.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Total Compartidos</p>
            <p class="text-2xl font-bold text-primary">{{ totalShared }}</p>
            <p class="text-xs text-muted-foreground mt-1">archivo{{ totalShared !== 1 ? 's' : '' }} contigo</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Solo Lectura</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ readCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de solo ver</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Con Edición</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ writeCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de escritura</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-muted animate-pulse" />
        </div>

        <template v-else>
          <!-- Vista Galería -->
          <div v-if="viewMode === 'gallery' && filteredDocuments.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <div v-for="doc in filteredDocuments" :key="doc.id" class="group relative">
              <div
                @click="viewDocument(doc)"
                class="aspect-square rounded-xl border-2 bg-gradient-to-br from-card to-muted/20 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer p-4 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div class="text-5xl mb-2 w-28 h-28 flex items-center justify-center">
                  <img v-if="doc.type.startsWith('image/') && doc.thumbnailUrl" :src="doc.thumbnailUrl" :alt="doc.name" class="w-full h-full object-cover rounded-lg" />
                  <img v-else-if="getFileIconUrl(doc.type)" :src="getFileIconUrl(doc.type)!" :alt="getFileType(doc.type)" class="w-20 h-20 object-contain" />
                  <span v-else class="text-7xl">{{ getFileIcon(doc.type) }}</span>
                </div>

                <div class="absolute top-2 left-2">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="getMyPermission(doc) === 'WRITE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                  >
                    {{ getMyPermission(doc) === 'WRITE' ? '✏️ Editar' : '👁️ Ver' }}
                  </span>
                </div>

                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button @click.stop="viewDocument(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Previsualizar">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click.stop="handleDownload(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Descargar">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button v-if="getMyPermission(doc) === 'WRITE'" @click.stop="triggerVersionUpload(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Subir nueva versión">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button @click.stop="handleRemoveShared(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Eliminar de compartidos">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-2 px-1">
                <p class="text-sm font-medium truncate" :title="doc.name">{{ doc.name }}</p>
                <p class="text-xs text-muted-foreground truncate">Por {{ doc.ownerName || doc.ownerEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Vista Tabla -->
          <div v-else-if="viewMode === 'table' && filteredDocuments.length > 0" class="border rounded-xl overflow-hidden bg-card">
            <table class="w-full text-sm">
              <thead class="bg-muted/50 border-b sticky top-0">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Compartido por</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-24">Tipo</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-44">Permiso</th>
                  <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32">Fecha</th>
                  <th class="text-right px-4 py-3 font-semibold w-36">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="hover:bg-accent/30 transition-colors group cursor-pointer"
                  @click="viewDocument(doc)"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <img v-if="doc.type.startsWith('image/') && doc.thumbnailUrl" :src="doc.thumbnailUrl" :alt="doc.name" class="w-8 h-8 object-cover rounded" />
                        <img v-else-if="getFileIconUrl(doc.type)" :src="getFileIconUrl(doc.type)!" :alt="getFileType(doc.type)" class="w-7 h-7 object-contain" />
                        <span v-else class="text-2xl">{{ getFileIcon(doc.type) }}</span>
                      </div>
                      <span class="font-medium text-foreground group-hover:text-primary transition-colors">{{ doc.name }}</span>
                    </div>
                  </td>

                  <td class="px-4 py-3 hidden lg:table-cell">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-bold text-primary uppercase">
                          {{ (doc.ownerName || doc.ownerEmail || '?').charAt(0) }}
                        </span>
                      </div>
                      <span class="text-sm truncate max-w-[140px]" :title="doc.ownerEmail">
                        {{ doc.ownerName || doc.ownerEmail }}
                      </span>
                    </div>
                  </td>

                  <td class="px-4 py-3 text-muted-foreground hidden md:table-cell">{{ getFileType(doc.type) }}</td>

                  <td class="px-4 py-3 hidden md:table-cell">
                    <span
                      class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      :class="getMyPermission(doc) === 'WRITE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="getMyPermission(doc) === 'WRITE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ getMyPermission(doc) === 'WRITE' ? 'Lectura y escritura' : 'Solo lectura' }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{{ formatDate(doc.uploadedAt) }}</td>

                  <td class="px-4 py-3 text-right" @click.stop>
                    <div class="flex justify-end gap-1 items-center">
                      <button @click="viewDocument(doc)" class="p-2 hover:bg-primary/10 rounded text-primary" title="Previsualizar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button @click="handleDownload(doc)" class="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded text-indigo-600" title="Descargar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button v-if="getMyPermission(doc) === 'WRITE'" @click="triggerVersionUpload(doc)" class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600" title="Subir nueva versión">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                      <button @click="handleRemoveShared(doc)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500" title="Eliminar de compartidos">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Estado vacío -->
          <div v-if="filteredDocuments.length === 0" class="flex flex-col items-center justify-center py-20">
            <div class="text-7xl mb-4">🤝</div>
            <h3 class="text-xl font-semibold mb-2">
              {{ searchTerm || permissionFilter || typeFilter ? 'Sin resultados' : 'Nada compartido aún' }}
            </h3>
            <p class="text-sm text-muted-foreground text-center max-w-sm">
              {{ searchTerm || permissionFilter || typeFilter
                ? 'Intenta con otros términos o elimina los filtros'
                : 'Cuando alguien comparta un documento contigo, aparecerá aquí' }}
            </p>
            <button v-if="searchTerm || permissionFilter || typeFilter" @click="clearFilters" class="mt-6 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium">
              Limpiar filtros
            </button>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal Visor -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="filteredDocuments"
      :preview-url="currentPreviewUrl"
      @close="viewingDocument = null; currentPreviewUrl = undefined"
      @navigate="navigateDocument"
      @download="handleDownload"
      @request-preview="handleRequestPreview"
    />

    <!-- Input oculto para subir nueva versión -->
    <input ref="versionInput" type="file" class="hidden" @change="handleVersionUpload" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import { documentService } from '../../services/documentService'
import DocumentViewerModal from '../../components/DocumentViewerModal.vue'
import { toast } from 'vue-sonner'

const { user } = useAuth()
const {
  loading,
  fetchSharedWithMe,
  sharedWithMeDocs,
  removeSharedWithMe,
  uploadNewVersion,
} = useDocuments()

// ─── Estado ───────────────────────────────────────────────────────────────────

const searchTerm       = ref('')
const permissionFilter = ref('')
const typeFilter       = ref('')
const sortBy           = ref('date')
const viewMode         = ref<'table' | 'gallery'>('table')
const showFilters      = ref(false)
const viewingDocument  = ref<Document | null>(null)
const versionInput     = ref<HTMLInputElement | null>(null)
const uploadingDoc     = ref<Document | null>(null)
const currentPreviewUrl = ref<string | null | undefined>(undefined)

onMounted(async () => {
  await fetchSharedWithMe()
})

// ─── Computed ─────────────────────────────────────────────────────────────────

const sharedDocuments = computed(() => sharedWithMeDocs.value)
const totalShared     = computed(() => sharedDocuments.value.length)

const readCount  = computed(() =>
  sharedDocuments.value.filter(d => getMyPermission(d) === 'READ').length
)
const writeCount = computed(() =>
  sharedDocuments.value.filter(d => getMyPermission(d) === 'WRITE').length
)

const filteredDocuments = computed(() => {
  let docs = [...sharedDocuments.value]

  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    docs = docs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.ownerName || '').toLowerCase().includes(q) ||
      (d.ownerEmail || '').toLowerCase().includes(q)
    )
  }

  if (permissionFilter.value) {
    docs = docs.filter(d => getMyPermission(d) === permissionFilter.value)
  }

  if (typeFilter.value) {
    docs = docs.filter(d => d.type.includes(typeFilter.value))
  }

  docs.sort((a, b) =>
    sortBy.value === 'date'
      ? new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      : a.name.localeCompare(b.name)
  )

  return docs
})

// ─── Funciones ────────────────────────────────────────────────────────────────

function clearFilters() {
  searchTerm.value = ''
  permissionFilter.value = ''
  typeFilter.value = ''
}

function getMyPermission(doc: Document): 'READ' | 'WRITE' {
  const share = doc.sharedWith?.find(s => s.email === user.value?.email)
  const p = share?.permission as string | undefined
  return p === 'WRITE' ? 'WRITE' : 'READ'
}

function viewDocument(doc: Document) {
  currentPreviewUrl.value = undefined
  viewingDocument.value = doc
}

function navigateDocument(direction: 'prev' | 'next') {
  if (!viewingDocument.value) return
  const idx = filteredDocuments.value.findIndex(d => d.id === viewingDocument.value!.id)
  if (direction === 'prev' && idx > 0)
    viewingDocument.value = filteredDocuments.value[idx - 1]
  else if (direction === 'next' && idx < filteredDocuments.value.length - 1)
    viewingDocument.value = filteredDocuments.value[idx + 1]
  currentPreviewUrl.value = undefined
}

async function handleDownload(doc: Document) {
  if (!doc.backendId) return
  try {
    const { data } = await documentService.getDownloadUrl(doc.backendId)
    const blob = await fetch(data.downloadUrl).then(r => r.blob())
    const blobUrl = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = blobUrl
    a.download = doc.name
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    toast.error('Error al descargar el archivo')
  }
}

async function handleRequestPreview(doc: Document) {
  if (!doc.backendId) {
    currentPreviewUrl.value = null
    return
  }
  try {
    const { data } = await documentService.getPreviewUrl(doc.backendId)
    currentPreviewUrl.value = data.downloadUrl
  } catch {
    currentPreviewUrl.value = null
    toast.error('No se pudo cargar la vista previa')
  }
}

async function handleRemoveShared(doc: Document) {
  await removeSharedWithMe(doc.id)
}

function triggerVersionUpload(doc: Document) {
  uploadingDoc.value = doc
  versionInput.value?.click()
}

async function handleVersionUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !uploadingDoc.value) return
  await uploadNewVersion(uploadingDoc.value.id, file)
  uploadingDoc.value = null
  if (versionInput.value) versionInput.value.value = ''
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function getFileIconUrl(type: string): string | null {
  if (type.includes('pdf')) return 'https://img.icons8.com/fluency/96/pdf.png'
  if (type.includes('word') || type.includes('wordprocessingml')) return 'https://img.icons8.com/color/96/microsoft-word-2019--v2.png'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'https://img.icons8.com/color/96/microsoft-excel-2019--v1.png'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'https://img.icons8.com/color/96/microsoft-powerpoint-2019--v1.png'
  return null
}

function getFileType(type: string): string {
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('wordprocessingml')) return 'Word'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel'
  if (type.includes('text')) return 'Texto'
  if (type.startsWith('image')) return 'Imagen'
  return type.split('/')[1]?.toUpperCase() || 'Archivo'
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📕'
  if (type.includes('word') || type.includes('wordprocessingml')) return '📘'
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📊'
  if (type.includes('text')) return '📄'
  if (type.startsWith('image')) return '🖼️'
  return '📎'
}

function formatDate(date: string): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>
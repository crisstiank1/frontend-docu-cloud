<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">

    <!-- ===== HEADER ===== -->
    <header class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="h-full max-w-full px-4 flex items-center gap-4">

        <!-- Búsqueda -->
        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar en documentos compartidos..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">

          <!-- Filtros dropdown -->
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
                    <option value="view">Solo lectura</option>
                    <option value="edit">Lectura y escritura</option>
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

          <!-- Toggle vista -->
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

        <!-- ===== STATS CARDS (conservadas de tu versión) ===== -->
        <div v-if="sharedDocuments.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Total Compartidos</p>
            <p class="text-2xl font-bold text-primary">{{ totalShared }}</p>
            <p class="text-xs text-muted-foreground mt-1">documento{{ totalShared !== 1 ? 's' : '' }} contigo</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Solo Lectura</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ viewCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de solo ver</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Con Edición</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ editCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de escritura</p>
          </div>
        </div>

        <!-- ===== LOADING SKELETON ===== -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-muted animate-pulse" />
        </div>

        <template v-else>

          <!-- ===== VISTA GALERÍA ===== -->
          <div
            v-if="viewMode === 'gallery' && filteredDocuments.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            <div v-for="doc in filteredDocuments" :key="doc.id" class="group relative">
              <div
                @click="viewDocument(doc)"
                class="aspect-square rounded-xl border-2 bg-gradient-to-br from-card to-muted/20 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer p-4 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <!-- Icono -->
                <div class="text-5xl mb-2 w-28 h-28 flex items-center justify-center">
                  <img
                    v-if="doc.type.startsWith('image/') && doc.thumbnailUrl"
                    :src="doc.thumbnailUrl"
                    :alt="doc.name"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <img
                    v-else-if="getFileIconUrl(doc.type)"
                    :src="getFileIconUrl(doc.type)!"
                    :alt="getFileType(doc.type)"
                    class="w-20 h-20 object-contain"
                  />
                  <span v-else class="text-7xl">{{ getFileIcon(doc.type) }}</span>
                </div>

                <!-- Badge permiso -->
                <div class="absolute top-2 left-2">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="getMyPermission(doc) === 'edit'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                  >
                    {{ getMyPermission(doc) === 'edit' ? '✏️ Editar' : '👁️ Ver' }}
                  </span>
                </div>

                <!-- Hover overlay -->
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
                </div>
              </div>

              <div class="mt-2 px-1">
                <p class="text-sm font-medium truncate" :title="doc.name">{{ doc.name }}</p>
                <p class="text-xs text-muted-foreground truncate">Por {{ doc.ownerName || doc.ownerEmail }}</p>
              </div>
            </div>
          </div>

          <!-- ===== VISTA TABLA ===== -->
          <div v-else-if="viewMode === 'table' && filteredDocuments.length > 0" class="border rounded-xl overflow-hidden bg-card">
            <table class="w-full text-sm">
              <thead class="bg-muted/50 border-b sticky top-0">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Compartido por</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-24">Tipo</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-44">Permiso</th>
                  <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32">Fecha</th>
                  <th class="text-right px-4 py-3 font-semibold w-28">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="hover:bg-accent/30 transition-colors group cursor-pointer"
                  @click="viewDocument(doc)"
                >
                  <!-- Nombre -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <img
                          v-if="doc.type.startsWith('image/') && doc.thumbnailUrl"
                          :src="doc.thumbnailUrl" :alt="doc.name"
                          class="w-8 h-8 object-cover rounded"
                        />
                        <img
                          v-else-if="getFileIconUrl(doc.type)"
                          :src="getFileIconUrl(doc.type)!" :alt="getFileType(doc.type)"
                          class="w-7 h-7 object-contain"
                        />
                        <span v-else class="text-2xl">{{ getFileIcon(doc.type) }}</span>
                      </div>
                      <span class="font-medium text-foreground group-hover:text-primary transition-colors">
                        {{ doc.name }}
                      </span>
                    </div>
                  </td>

                  <!-- Compartido por -->
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

                  <!-- Tipo -->
                  <td class="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {{ getFileType(doc.type) }}
                  </td>

                  <!-- Permiso badge -->
                  <td class="px-4 py-3 hidden md:table-cell">
                    <span
                      class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      :class="getMyPermission(doc) === 'edit'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="getMyPermission(doc) === 'edit'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ getMyPermission(doc) === 'edit' ? 'Lectura y escritura' : 'Solo lectura' }}
                    </span>
                  </td>

                  <!-- Fecha -->
                  <td class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">
                    {{ formatDate(doc.uploadedAt) }}
                  </td>

                  <!-- Acciones -->
                  <td class="px-4 py-3 text-right" @click.stop>
                    <div class="flex justify-end gap-1 items-center">
                      <button
                        @click="viewDocument(doc)"
                        class="p-2 hover:bg-primary/10 rounded text-primary"
                        title="Previsualizar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        @click="handleDownload(doc)"
                        class="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded text-indigo-600"
                        title="Descargar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== ESTADO VACÍO ===== -->
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
            <button
              v-if="searchTerm || permissionFilter || typeFilter"
              @click="clearFilters"
              class="mt-6 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
            >
              Limpiar filtros
            </button>
          </div>

        </template>
      </main>
    </div>

    <!-- ===== MODAL VISOR ===== -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="filteredDocuments"
      @close="viewingDocument = null"
      @navigate="navigateDocument"
    />

  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import DocumentViewerModal from '../../components/DocumentViewerModal.vue'
import { toast } from 'vue-sonner'

const { user } = useAuth()
const { loading, fetchSharedWithMe, sharedWithMeDocs, downloadDocument: downloadDoc } = useDocuments()

// ===== ESTADO =====
const searchTerm       = ref('')
const permissionFilter = ref('')
const typeFilter       = ref('')
const sortBy           = ref('date')
const viewMode         = ref<'table' | 'gallery'>('table')
const showFilters      = ref(false)
const viewingDocument  = ref<Document | null>(null)

onMounted(async () => {
  await fetchSharedWithMe()
})

// ===== COMPUTED =====
const sharedDocuments = computed(() => sharedWithMeDocs.value)
const totalShared = computed(() => sharedDocuments.value.length)
const viewCount   = computed(() => sharedDocuments.value.filter(d => getMyPermission(d) === 'view').length)
const editCount   = computed(() => sharedDocuments.value.filter(d => getMyPermission(d) === 'edit').length)

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

// ===== FUNCIONES =====
function clearFilters() {
  searchTerm.value = ''
  permissionFilter.value = ''
  typeFilter.value = ''
}

function getMyPermission(doc: Document): 'view' | 'edit' {
  const share = doc.sharedWith?.find(s => s.email === user.value?.email)
  return share?.permission || 'view'
}

function viewDocument(doc: Document) {
  viewingDocument.value = doc
  if (user.value) {
  }
}

function navigateDocument(direction: 'prev' | 'next') {
  if (!viewingDocument.value) return
  const idx = filteredDocuments.value.findIndex(d => d.id === viewingDocument.value!.id)
  if (direction === 'prev' && idx > 0) viewingDocument.value = filteredDocuments.value[idx - 1]
  else if (direction === 'next' && idx < filteredDocuments.value.length - 1) viewingDocument.value = filteredDocuments.value[idx + 1]
}

async function handleDownload(doc: Document) {
  const url = await downloadDoc(doc.id)
  if (!url) return
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = blobUrl
    a.download = doc.name
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
    if (user.value) {
    }
  } catch {
    toast.error('Error al descargar el archivo')
  }
}

// ===== UTILIDADES =====
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
  return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

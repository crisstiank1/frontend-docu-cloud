<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Archivos Compartidos Conmigo
        </h1>
        <p class="text-muted-foreground mt-2">
          {{ totalShared }} documento{{ totalShared !== 1 ? 's' : '' }}
          compartido{{ totalShared !== 1 ? 's' : '' }} contigo por otros usuarios
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <!-- Filtros -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              type="search"
              v-model="searchTerm"
              placeholder="Buscar Archivos..."
              class="w-full h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select v-model="permissionFilter" class="h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Todos los permisos</option>
            <option value="view">Solo lectura</option>
            <option value="edit">Edición</option>
          </select>
          <select v-model="sortBy" class="h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="date">Más recientes</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
          <button
            @click="viewMode = viewMode === 'table' ? 'gallery' : 'table'"
            :title="viewMode === 'table' ? 'Vista de galería' : 'Vista de tabla'"
            class="h-10 px-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <svg v-if="viewMode === 'table'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        <!-- Vista tabla -->
        <div v-if="viewMode === 'table'" class="border rounded-lg overflow-x-auto shadow-sm hover:shadow-md transition-shadow">
          <table class="w-full text-sm">
            <thead class="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
              <tr>
                <th class="text-left px-6 py-4 font-semibold">Nombre</th>
                <th class="text-left px-6 py-4 font-semibold">Propietario</th>
                <th class="text-left px-6 py-4 font-semibold">Tipo</th>
                <th class="text-left px-6 py-4 font-semibold">Permiso</th>
                <th class="text-left px-6 py-4 font-semibold">Compartido</th>
                <th class="text-right px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="doc in filteredDocuments"
                :key="doc.id"
                class="border-b hover:bg-primary/5 transition-colors group"
              >
                <td class="px-6 py-4">
                  <router-link :to="`/documents/${doc.id}`" class="text-primary hover:underline font-semibold group-hover:text-primary/80">
                    {{ doc.name }}
                  </router-link>
                </td>
                <td class="px-6 py-4 text-muted-foreground">{{ doc.ownerName }}</td>
                <td class="px-6 py-4 text-muted-foreground text-xs uppercase">{{ getFileType(doc.type) }}</td>
                <td class="px-6 py-4">
                  <span
                    :style="{
                      backgroundColor: getPermissionBgColor(getMyPermission(doc)),
                      color: getPermissionTextColor(getMyPermission(doc))
                    }"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {{ getPermissionLabel(getMyPermission(doc)) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-muted-foreground text-xs">{{ formatDate(doc.uploadedAt) }}</td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button @click="downloadDocument(doc)" class="text-primary hover:bg-primary/10 px-3 py-1 rounded text-xs font-medium transition-colors">
                    ⬇ Descargar
                  </button>
                  <router-link :to="`/documents/${doc.id}`" class="text-primary hover:bg-primary/10 px-3 py-1 rounded text-xs font-medium transition-colors inline-block">
                    👁 Ver
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista galería -->
        <div v-else class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="group p-4 rounded-lg border bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden relative"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="relative z-10">
              <div class="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-3 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <span class="text-5xl">{{ getFileIcon(doc.type) }}</span>
              </div>
              <router-link :to="`/documents/${doc.id}`" class="font-semibold text-sm hover:text-primary group-hover:text-primary truncate block transition-colors">
                {{ doc.name }}
              </router-link>
              <div class="flex items-center justify-between mt-2 mb-3">
                <div>
                  <p class="text-xs text-muted-foreground">Por: {{ doc.ownerName }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(doc.uploadedAt) }}</p>
                </div>
                <span
                  :style="{
                    backgroundColor: getPermissionBgColor(getMyPermission(doc)),
                    color: getPermissionTextColor(getMyPermission(doc))
                  }"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
                >
                  {{ getPermissionLabel(getMyPermission(doc)) }}
                </span>
              </div>
              <div class="flex gap-2 text-xs">
                <button @click="downloadDocument(doc)" class="flex-1 px-2 py-1.5 rounded border hover:bg-primary/10 hover:border-primary/50 transition-colors font-medium">
                  ⬇ Descargar
                </button>
                <router-link :to="`/documents/${doc.id}`" class="flex-1 px-2 py-1.5 rounded border hover:bg-primary/10 hover:border-primary/50 transition-colors text-center font-medium">
                  👁 Ver
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredDocuments.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-muted-foreground">
            {{ searchTerm ? 'Sin resultados para tu búsqueda' : 'No hay archivos compartidos contigo' }}
          </p>
        </div>

        <!-- Estadísticas -->
        <div v-if="sharedDocuments.length > 0" class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Total Compartidos</p>
              <p class="text-2xl font-bold text-primary">{{ totalShared }}</p>
              <p class="text-xs text-muted-foreground mt-2">
                documento{{ totalShared !== 1 ? 's' : '' }} compartido{{ totalShared !== 1 ? 's' : '' }} contigo
              </p>
            </div>
            <div class="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Solo Lectura</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ sharedDocuments.filter(d => getMyPermission(d) === 'view').length }}
              </p>
            </div>
            <div class="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Con Edición</p>
              <p class="text-2xl font-bold text-green-600">
                {{ sharedDocuments.filter(d => getMyPermission(d) === 'edit').length }}
              </p>
            </div>
          </div>
        </div>
      </template>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import { useAuditLog } from '../../composables/useAuditLog'

const { user } = useAuth()
const { documents, loading, fetchDocuments, downloadDocument: downloadDoc } = useDocuments()
const { addLog } = useAuditLog()

const searchTerm       = ref('')
const permissionFilter = ref('')
const sortBy           = ref('date')
const viewMode         = ref<'table' | 'gallery'>('table')

onMounted(async () => {
  await fetchDocuments()
})

// ── Computed ───────────────────────────────────────────────────────────────────

const sharedDocuments = computed(() => {
  if (!user.value) return []
  return documents.value.filter(d =>
    d.sharedWith?.some(s => s.email === user.value!.email)
  )
})

const totalShared = computed(() => sharedDocuments.value.length)

const filteredDocuments = computed(() => {
  let docs = [...sharedDocuments.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    docs = docs.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.ownerName?.toLowerCase().includes(search)
    )
  }

  if (permissionFilter.value) {
    docs = docs.filter(d => getMyPermission(d) === permissionFilter.value)
  }

  docs.sort((a, b) =>
    sortBy.value === 'date'
      ? new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      : a.name.localeCompare(b.name)
  )

  return docs
})

// ── Helpers ────────────────────────────────────────────────────────────────────

function getMyPermission(doc: Document): 'view' | 'edit' {
  const share = doc.sharedWith?.find(s => s.email === user.value?.email)
  return share?.permission || 'view'
}

function getPermissionLabel(perm: 'view' | 'edit'): string {
  return perm === 'view' ? 'Solo lectura' : 'Edición'
}

function getPermissionBgColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#3b82f620' : '#10b98120'
}

function getPermissionTextColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#2563eb' : '#059669'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function getFileType(type: string): string {
  if (type.includes('pdf'))   return 'PDF'
  if (type.includes('word'))  return 'Word'
  if (type.includes('text'))  return 'Texto'
  if (type.startsWith('image')) return 'Imagen'
  return type.split('/')[1]?.toUpperCase() || 'Archivo'
}

function getFileIcon(type: string): string {
  if (type.includes('pdf'))     return '📕'
  if (type.includes('word'))    return '📘'
  if (type.includes('text'))    return '📄'
  if (type.startsWith('image')) return '🖼️'
  return '📎'
}

// ── Descarga usando URL real de S3 ─────────────────────────────────────────────

async function downloadDocument(doc: Document) {
  const url = await downloadDoc(doc.id)
  if (!url) return

  const a = window.document.createElement('a')
  a.href = url
  a.download = doc.name
  window.document.body.appendChild(a)
  a.click()
  window.document.body.removeChild(a)

  if (user.value) {
    addLog({
      action: 'download',
      userId: user.value.id,
      userName: user.value.name,
      userEmail: user.value.email,
      documentId: doc.id,
      documentName: doc.name
    })
  }
}
</script>

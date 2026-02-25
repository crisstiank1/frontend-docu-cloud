<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Archivos Compartidos Conmigo
        </h1>
        <p class="text-muted-foreground mt-2">
          {{ sharedDocuments.length }} documento{{ sharedDocuments.length !== 1 ? 's' : '' }}
          compartido{{ sharedDocuments.length !== 1 ? 's' : '' }} contigo por otros usuarios
        </p>
      </div>

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
              <td class="px-6 py-4 text-muted-foreground text-xs uppercase">{{ doc.type }}</td>
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
              <svg class="w-12 h-12 text-primary/60 group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
        <svg class="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-muted-foreground">No hay Archivos compartidos contigo</p>
      </div>

      <!-- Estadísticas -->
      <div v-if="sharedDocuments.length > 0" class="mt-4 pt-4 border-t">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Total Compartidos</p>
            <p class="text-2xl font-bold text-primary">{{ sharedDocuments.length }}</p>
            <p class="text-xs text-muted-foreground mt-2">
              documento{{ sharedDocuments.length !== 1 ? 's' : '' }}
              compartido{{ sharedDocuments.length !== 1 ? 's' : '' }} contigo
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

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import { useAuditLog } from '../../composables/useAuditLog'

const { user } = useAuth()
const { documents } = useDocuments()
const { addLog } = useAuditLog()

const searchTerm = ref('')
const permissionFilter = ref('')
const sortBy = ref('date')
const viewMode = ref<'table' | 'gallery'>('table')

const sharedDocuments = computed(() => {
  if (!user.value) return []
  return documents.value.filter(d => d.sharedWith.some(s => s.email === user.value!.email))
})

const filteredDocuments = computed(() => {
  let docs = [...sharedDocuments.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    docs = docs.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.ownerName.toLowerCase().includes(search)
    )
  }

  if (permissionFilter.value) {
    docs = docs.filter(d => getMyPermission(d) === permissionFilter.value)
  }

  if (sortBy.value === 'date') {
    docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  } else {
    docs.sort((a, b) => a.name.localeCompare(b.name))
  }

  return docs
})

function getMyPermission(doc: Document): 'view' | 'edit' {
  const share = doc.sharedWith.find(s => s.email === user.value?.email)
  return share?.permission || 'view'
}

function getPermissionLabel(perm: 'view' | 'edit'): string {
  return perm === 'view' ? 'Solo lectura' : 'Edición'
}

// ✅ getPermissionColor eliminada — no se usaba en el template

function getPermissionBgColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#3b82f620' : '#10b98120'
}

function getPermissionTextColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#2563eb' : '#059669'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function downloadDocument(doc: Document) {
  // ✅ Protección: solo descarga si hay contenido real
  if (!doc.content && !doc.url) return

  const element = document.createElement('a')
  element.href = doc.url || URL.createObjectURL(new Blob([doc.content || ''], { type: doc.type }))
  element.download = doc.name
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

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

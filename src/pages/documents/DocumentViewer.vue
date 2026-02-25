<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- No encontrado -->
      <div v-if="!documentData" class="text-center py-12">
        <p class="text-muted-foreground">Archivo no encontrado</p>
        <router-link
          to="/documents"
          class="inline-flex items-center justify-center gap-2 mt-4 h-10 px-4 bg-primary text-primary-foreground rounded-lg"
        >
          Volver a Archivos
        </router-link>
      </div>

      <div v-else class="grid gap-8">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <router-link to="/documents" class="text-primary hover:underline text-sm">← Archivos</router-link>
            <h1 class="text-3xl font-bold mt-2">{{ documentData.name }}</h1>
            <p class="text-muted-foreground mt-1">
              Cargado por {{ documentData.ownerName }} · {{ formatDate(documentData.uploadedAt) }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="downloadDocument"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
            <button
              v-if="isOwner"
              @click="showDeleteConfirm = true"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="grid md:grid-cols-3 gap-6">

          <!-- Preview -->
          <div class="md:col-span-2">
            <div class="bg-muted rounded-lg p-12 text-center min-h-96 flex items-center justify-center">
              <div>
                <svg class="w-24 h-24 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="font-medium">Previsualización no disponible</p>
                <p class="text-sm text-muted-foreground mt-1">Descarga el archivo para verlo</p>
              </div>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-4">

            <!-- Información general -->
            <div class="p-4 rounded-lg border bg-card">
              <h3 class="font-semibold mb-4">Información</h3>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-muted-foreground">Tipo</dt>
                  <dd class="font-medium">{{ documentData.type }}</dd>
                </div>
                <div>
                  <dt class="text-muted-foreground">Tamaño</dt>
                  <dd class="font-medium">{{ formatFileSize(documentData.size) }}</dd>
                </div>
                <div>
                  <dt class="text-muted-foreground">Propietario</dt>
                  <dd class="font-medium">{{ documentData.ownerName }}</dd>
                </div>
                <div v-if="documentData.classification?.category">
                  <dt class="text-muted-foreground">Categoría</dt>
                  <dd>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :style="{
                        backgroundColor: getCategoryColor(documentData.classification.category) + '20',
                        color: getCategoryColor(documentData.classification.category)
                      }"
                    >
                      {{ getCategoryName(documentData.classification.category) }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Etiquetas -->
            <div v-if="documentData.classification?.tags?.length" class="p-4 rounded-lg border bg-card">
              <h3 class="font-semibold mb-3">Etiquetas</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in documentData.classification.tags"
                  :key="tag"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Compartido con -->
            <div class="p-4 rounded-lg border bg-card">
              <h3 class="font-semibold mb-3">Compartido con</h3>
              <div v-if="documentData.sharedWith.length === 0" class="text-sm text-muted-foreground">
                No compartido
              </div>
              <ul v-else class="space-y-2 text-sm">
                <li
                  v-for="share in documentData.sharedWith"
                  :key="share.email"
                  class="flex items-center justify-between"
                >
                  <div>
                    <p>{{ share.email }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ share.permission === 'view' ? 'Lectura' : 'Edición' }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <!-- ✅ Modal de confirmación (ya era inline, sin confirm()) -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-background rounded-2xl w-full max-w-sm p-6 border shadow-2xl">
          <h2 class="text-lg font-semibold mb-2">Eliminar documento</h2>
          <p class="text-muted-foreground mb-6">
            ¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 h-10 rounded-lg border hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import { useAuditLog } from '../../composables/useAuditLog'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const { getDocument, deleteDocument, categories } = useDocuments()
const { addLog } = useAuditLog()

// ✅ Tipado correcto con Document en lugar de any
const documentData = ref<Document | null>(null)
const showDeleteConfirm = ref(false)

onMounted(() => {
  const docId = route.params.id as string
  documentData.value = getDocument(docId) ?? null

  // ✅ Log de 'view' al abrir, no 'download'
  if (documentData.value && user.value) {
    addLog({
      action: 'view',
      userId: user.value.id,
      userName: user.value.name,
      userEmail: user.value.email,
      documentId: documentData.value.id,
      documentName: documentData.value.name
    })
  }
})

const isOwner = computed(() => documentData.value?.ownerId === user.value?.id)

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function getCategoryColor(id: string): string {
  const cat = categories.value.find(c => c.id === id)
  return cat?.color || '#6366f1'
}

function getCategoryName(id: string): string {
  const cat = categories.value.find(c => c.id === id)
  return cat?.name || 'Sin categoría'
}

function downloadDocument() {
  if (!documentData.value) return

  // ✅ Protección si no hay contenido real
  const content = documentData.value.content || ''
  const blob = new Blob([content], { type: documentData.value.type })
  const url = URL.createObjectURL(blob)
  const element = document.createElement('a')
  element.href = url
  element.download = documentData.value.name
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(url) // ✅ liberar memoria

  if (user.value) {
    addLog({
      action: 'download',
      userId: user.value.id,
      userName: user.value.name,
      userEmail: user.value.email,
      documentId: documentData.value.id,
      documentName: documentData.value.name
    })
  }
}

function confirmDelete() {
  if (!documentData.value || !isOwner.value) return

  if (user.value) {
    addLog({
      action: 'delete',
      userId: user.value.id,
      userName: user.value.name,
      userEmail: user.value.email,
      documentId: documentData.value.id,
      documentName: documentData.value.name
    })
  }

  deleteDocument(documentData.value.id)
  router.push('/documents')
}
</script>

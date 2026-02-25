<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Clasificación inteligente
        </h1>
          <p class="text-muted-foreground mt-1">Gestiona categorías, etiquetas y sugerencias de clasificación</p>
        </div>
        <button
          @click="showNewCategory = true"
          class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      <!-- Categorías + Estadísticas -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="p-6 rounded-lg border bg-card">
          <h2 class="text-lg font-semibold mb-4">Categorías Disponibles</h2>
          <div class="space-y-3">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center justify-between p-3 rounded-lg border"
            >
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded" :style="{ backgroundColor: cat.color }" />
                <span class="font-medium">{{ cat.name }}</span>
              </div>
              <!-- ✅ Confirmación inline sin confirm() -->
              <div v-if="confirmDeleteId === cat.id" class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">¿Eliminar?</span>
                <button @click="confirmDelete(cat.id)" class="text-xs text-destructive font-semibold hover:underline">Sí</button>
                <button @click="confirmDeleteId = null" class="text-xs hover:underline">No</button>
              </div>
              <button
                v-else
                @click="confirmDeleteId = cat.id"
                class="text-destructive hover:underline text-xs"
              >
                Eliminar
              </button>
            </div>
            <div v-if="categories.length === 0" class="text-center py-8 text-muted-foreground">
              <p>No hay categorías creadas</p>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-lg border bg-card">
          <h2 class="text-lg font-semibold mb-4">Estadísticas de Clasificación</h2>
          <div class="space-y-4">
            <div v-for="cat in categories" :key="'stat-' + cat.id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: cat.color }" />
                <span class="text-sm">{{ cat.name }}</span>
              </div>
              <span class="font-semibold">{{ getDocumentsInCategory(cat.id).length }}</span>
            </div>
            <div class="pt-4 border-t">
              <p class="text-sm text-muted-foreground">Total de Archivos clasificados</p>
              <p class="text-2xl font-bold">{{ totalClassifiedDocuments }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sugerencias automáticas -->
      <div class="p-6 rounded-lg border bg-card">
        <h2 class="text-lg font-semibold mb-4">Sugerencias Automáticas de Clasificación</h2>
        <div v-if="suggestedDocuments.length === 0" class="text-center py-8 text-muted-foreground">
          <p>Todos los Archivos están clasificados</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="doc in suggestedDocuments"
            :key="doc.id"
            class="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
          >
            <div>
              <p class="font-medium">{{ doc.name }}</p>
              <p class="text-sm text-muted-foreground">Sin categoría</p>
            </div>
            <select
              @change="applySuggestion(doc, ($event.target as HTMLSelectElement).value)"
              class="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Archivos por categoría -->
      <div class="p-6 rounded-lg border bg-card">
        <h2 class="text-lg font-semibold mb-4">Archivos por Categoría</h2>
        <div v-for="cat in categories" :key="'docs-' + cat.id" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: cat.color }" />
            <h3 class="font-medium">{{ cat.name }}</h3>
            <span class="text-xs text-muted-foreground">({{ getDocumentsInCategory(cat.id).length }})</span>
          </div>
          <div v-if="getDocumentsInCategory(cat.id).length === 0" class="text-sm text-muted-foreground ml-5">
            Sin Archivos
          </div>
          <ul v-else class="ml-5 space-y-2">
            <li v-for="doc in getDocumentsInCategory(cat.id)" :key="doc.id" class="text-sm">
              <router-link :to="`/documents/${doc.id}`" class="text-primary hover:underline">
                {{ doc.name }}
              </router-link>
              <span
                v-if="doc.classification?.tags?.length"
                class="text-xs text-muted-foreground ml-2"
              >
                ({{ doc.classification.tags.join(', ') }})
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Categoría -->
    <div v-if="showNewCategory" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-background rounded-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Nueva Categoría</h2>
          <button @click="showNewCategory = false" class="text-muted-foreground hover:text-foreground">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="text-sm font-semibold mb-1 block">Nombre de la Categoría</label>
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="ej. Contratos"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-1 block">Color</label>
            <div class="flex gap-2">
              <input type="color" v-model="newCategoryColor" class="w-12 h-10 border rounded-lg cursor-pointer" />
              <div class="flex-1 h-10 rounded-lg border" :style="{ backgroundColor: newCategoryColor }" />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="showNewCategory = false"
            class="flex-1 h-10 rounded-lg border hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="createCategory"
            :disabled="!newCategoryName"
            class="flex-1 h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocuments } from '../../composables/useDocuments'
import type { Document } from '../../composables/useDocuments'

const { documents, categories, addCategory, deleteCategory: deleteCat, updateDocument } = useDocuments()

const showNewCategory = ref(false)
const newCategoryName = ref('')
const newCategoryColor = ref('#6366f1')
const confirmDeleteId = ref<string | null>(null) // ✅ Estado para confirmación inline

const totalClassifiedDocuments = computed(() =>
  documents.value.filter(d => d.classification?.category).length
)

const suggestedDocuments = computed(() =>
  documents.value.filter(d => !d.classification?.category).slice(0, 10)
)

function getDocumentsInCategory(categoryId: string) {
  return documents.value.filter(d => d.classification?.category === categoryId)
}

function createCategory() {
  if (!newCategoryName.value.trim()) return
  addCategory(newCategoryName.value, newCategoryColor.value)
  showNewCategory.value = false
  newCategoryName.value = ''
  newCategoryColor.value = '#6366f1'
}

// ✅ Sin confirm() — usa estado confirmDeleteId
function confirmDelete(id: string) {
  deleteCat(id)
  confirmDeleteId.value = null
}

// ✅ Tipado correcto con Document
function applySuggestion(doc: Document, categoryId: string) {
  if (!categoryId) return
  updateDocument(doc.id, {
    ...doc,
    classification: {
      ...doc.classification,
      category: categoryId
    }
  })
}
</script>

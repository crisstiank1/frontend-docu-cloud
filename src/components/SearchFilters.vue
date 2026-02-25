<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
    <!-- Type Filter -->
    <div>
      <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Tipo de archivo</label>
      <select
        v-model="filters.type"
        @change="emit('update', filters)"
        class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      >
        <option value="">Todos</option>
        <option value="PDF">PDF</option>
        <option value="DOCX">Word (DOCX)</option>
        <option value="TXT">Texto (TXT)</option>
        <option value="Imágenes">Imágenes</option>
      </select>
    </div>

    <!-- Category Filter -->
    <div>
      <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Categoría</label>
      <select
        v-model="filters.category"
        @change="emit('update', filters)"
        class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- Date Range -->
    <div>
      <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Desde</label>
      <input
        v-model="dateFromString"
        @change="updateDateFrom"
        type="date"
        class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
    </div>

    <div>
      <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Hasta</label>
      <input
        v-model="dateToString"
        @change="updateDateTo"
        type="date"
        class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
    </div>
  </div>

  <!-- Tags Filter -->
  <div v-if="showTags" class="mt-3">
    <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Etiquetas</label>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="tag in availableTags"
        :key="tag"
        @click="toggleTag(tag)"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors',
          filters.tags?.includes(tag)
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        ]"
      >
        {{ tag }}
      </div>
    </div>
  </div>

  <!-- Filter Info -->
  <div v-if="hasActiveFilters" class="mt-3 flex items-center justify-between">
    <span class="text-xs text-muted-foreground">
      {{ activeFilterCount }} filtro{{ activeFilterCount !== 1 ? 's' : '' }} activo{{ activeFilterCount !== 1 ? 's' : '' }}
    </span>
    <button
      @click="clearFilters"
      class="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
    >
      Limpiar filtros
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SearchFilter, DocumentCategory } from '../composables/useDocuments'
import { useDocuments } from '../composables/useDocuments'

interface Props {
  initialFilters?: SearchFilter
  categories: DocumentCategory[]
  showTags?: boolean
}

withDefaults(defineProps<Props>(), {
  showTags: true
})

const emit = defineEmits<{
  update: [filters: SearchFilter]
  clear: []
}>()

const { documents } = useDocuments()

const filters = ref<SearchFilter>({
  query: '',
  type: '',
  category: '',
  tags: [],
  dateFrom: undefined,
  dateTo: undefined
})

const dateFromString = ref('')
const dateToString = ref('')

const availableTags = computed(() => {
  const tags = new Set<string>()
  documents.value.forEach(doc => {
    doc.classification?.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.type) count++
  if (filters.value.category) count++
  if (filters.value.tags && filters.value.tags.length > 0) count++
  if (filters.value.dateFrom) count++
  if (filters.value.dateTo) count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

function toggleTag(tag: string) {
  if (!filters.value.tags) {
    filters.value.tags = []
  }

  const idx = filters.value.tags.indexOf(tag)
  if (idx >= 0) {
    filters.value.tags.splice(idx, 1)
  } else {
    filters.value.tags.push(tag)
  }

  emit('update', filters.value)
}

function updateDateFrom() {
  if (dateFromString.value) {
    filters.value.dateFrom = new Date(dateFromString.value)
  } else {
    filters.value.dateFrom = undefined
  }
  emit('update', filters.value)
}

function updateDateTo() {
  if (dateToString.value) {
    filters.value.dateTo = new Date(dateToString.value)
  } else {
    filters.value.dateTo = undefined
  }
  emit('update', filters.value)
}

function clearFilters() {
  filters.value = {
    query: '',
    type: '',
    category: '',
    tags: [],
    dateFrom: undefined,
    dateTo: undefined
  }
  dateFromString.value = ''
  dateToString.value = ''
  emit('clear')
}
</script>

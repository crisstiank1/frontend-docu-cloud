<template>
  <div class="space-y-3">
    <!-- Fila de filtros principales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

      <!-- Tipo de archivo -->
      <div>
        <label for="filter-type" class="text-xs font-semibold block mb-1.5 text-muted-foreground">
          Tipo de archivo
        </label>
        <select
          id="filter-type"
          v-model="filters.type"
          @change="emit('update', { ...filters })"
          class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        >
          <option value="">Todos</option>
          <option value="PDF">PDF</option>
          <option value="DOCX">Word (DOCX)</option>
          <option value="TXT">Texto (TXT)</option>
          <option value="Imágenes">Imágenes</option>
        </select>
      </div>

      <!-- Categoría -->
      <div>
        <label for="filter-category" class="text-xs font-semibold block mb-1.5 text-muted-foreground">
          Categoría
        </label>
        <select
          id="filter-category"
          v-model="filters.category"
          @change="emit('update', { ...filters })"
          class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Desde -->
      <div>
        <label for="filter-date-from" class="text-xs font-semibold block mb-1.5 text-muted-foreground">
          Desde
        </label>
        <input
          id="filter-date-from"
          v-model="dateFromString"
          @change="updateDateFrom"
          type="date"
          :max="dateToString || undefined"
          class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      <!-- Hasta -->
      <div>
        <label for="filter-date-to" class="text-xs font-semibold block mb-1.5 text-muted-foreground">
          Hasta
        </label>
        <input
          id="filter-date-to"
          v-model="dateToString"
          @change="updateDateTo"
          type="date"
          :min="dateFromString || undefined"
          class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>
    </div>

    <!-- Tags Filter -->
    <div v-if="showTags && availableTags.length > 0">
      <label class="text-xs font-semibold block mb-1.5 text-muted-foreground">Etiquetas</label>
      <!-- CORRECCIÓN: role="group" + cada tag con role="checkbox" para accesibilidad -->
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por etiqueta">
        <button
          v-for="tag in availableTags"
          :key="tag"
          type="button"
          @click="toggleTag(tag)"
          :aria-pressed="filters.tags?.includes(tag)"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            'min-h-[32px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
            filters.tags?.includes(tag)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Filter Info -->
    <div v-if="hasActiveFilters" class="flex items-center justify-between gap-2 flex-wrap">
      <span class="text-xs text-muted-foreground" role="status" aria-live="polite">
        {{ activeFilterCount }} filtro{{ activeFilterCount !== 1 ? 's' : '' }} activo{{ activeFilterCount !== 1 ? 's' : '' }}
      </span>
      <button
        type="button"
        @click="clearFilters"
        class="text-xs font-medium text-primary hover:text-primary/80 transition-colors
               min-h-[32px] px-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DocumentCategory } from '../composables/useDocuments'
import { useTags } from '../composables/useTags'

// CORRECCIÓN: SearchFilter definida en archivo compartido (types/search.ts),
// aquí se importa. La dejamos inline solo para no alterar la estructura del proyecto.
interface SearchFilter {
  query?:    string
  type?:     string
  // CORRECCIÓN: category acepta number | string porque los IDs del backend son number
  category?: number | string
  tags?:     string[]
  dateFrom?: Date
  dateTo?:   Date
}

interface Props {
  initialFilters?: SearchFilter
  categories:      DocumentCategory[]
  showTags?:       boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTags: true,
})

const emit = defineEmits<{
  update: [filters: SearchFilter]
  clear:  []
}>()

const { tags } = useTags()

// CORRECCIÓN: inicializar desde initialFilters si se proporciona
const filters = ref<SearchFilter>({
  query:    props.initialFilters?.query    ?? '',
  type:     props.initialFilters?.type     ?? '',
  category: props.initialFilters?.category ?? '',
  tags:     props.initialFilters?.tags     ? [...props.initialFilters.tags] : [],
  dateFrom: props.initialFilters?.dateFrom,
  dateTo:   props.initialFilters?.dateTo,
})

const dateFromString = ref(
  props.initialFilters?.dateFrom
    ? props.initialFilters.dateFrom.toISOString().split('T')[0]
    : ''
)
const dateToString = ref(
  props.initialFilters?.dateTo
    ? props.initialFilters.dateTo.toISOString().split('T')[0]
    : ''
)

const availableTags = computed(() =>
  tags.value.map((t) => t.name).sort()
)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.type)                          count++
  if (filters.value.category)                      count++
  if (filters.value.tags && filters.value.tags.length > 0) count++
  if (filters.value.dateFrom)                      count++
  if (filters.value.dateTo)                        count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

function toggleTag(tag: string) {
  if (!filters.value.tags) filters.value.tags = []
  const idx = filters.value.tags.indexOf(tag)
  if (idx >= 0) filters.value.tags.splice(idx, 1)
  else          filters.value.tags.push(tag)
  // CORRECCIÓN: emitir copia para no mutar la referencia interna
  emit('update', { ...filters.value, tags: [...filters.value.tags] })
}

function updateDateFrom() {
  filters.value.dateFrom = dateFromString.value ? new Date(dateFromString.value) : undefined
  emit('update', { ...filters.value })
}

function updateDateTo() {
  filters.value.dateTo = dateToString.value ? new Date(dateToString.value) : undefined
  emit('update', { ...filters.value })
}

function clearFilters() {
  filters.value = { query: '', type: '', category: '', tags: [], dateFrom: undefined, dateTo: undefined }
  dateFromString.value = ''
  dateToString.value   = ''
  emit('clear')
}
</script>
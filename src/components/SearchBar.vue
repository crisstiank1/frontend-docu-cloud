<template>
  <!-- role="search" identifica semánticamente este bloque como zona de búsqueda -->
  <div class="relative" role="search" ref="searchContainer">
    <div class="flex items-center gap-2">

      <!-- Input + Botón -->
      <div class="flex-1 relative">
        <label for="search-input" class="sr-only">Buscar archivos</label>
        <input
          id="search-input"
          v-model="searchQuery"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.enter="performSearch"
          @keydown.arrow-down.prevent="focusFirstSuggestion"
          @keydown.escape="closeSuggestions"
          type="search"
          autocomplete="off"
          placeholder="Buscar archivos..."
          class="w-full h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
          :aria-expanded="showSuggestions"
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          role="combobox"
        />
      </div>

      <!-- Botón buscar — min-w fijo para que no se comprima cuando el input crece -->
      <button
        @click="performSearch"
        class="h-10 px-3 sm:px-4 rounded-lg bg-primary text-primary-foreground
               hover:shadow-lg transition-all font-medium flex items-center gap-2
               flex-shrink-0 min-w-[44px]"
        :aria-label="searchQuery ? `Buscar ${searchQuery}` : 'Buscar'"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="hidden sm:inline text-sm">Buscar</span>
      </button>
    </div>

    <!--
      CORRECCIÓN CLAVE: <Teleport to="body"> saca el dropdown del árbol del componente
      y lo renderiza directamente en <body>.

      ¿Por qué? El dropdown tenía z-50 pero quedaba ATRAPADO por el z-index del header
      o por overflow-hidden de algún ancestro. Al renderizarse en body con position:fixed
      y z-[9999], ya no hay ningún ancestro que lo pueda tapar.

      El posicionamiento se calcula con getBoundingClientRect() para que el dropdown
      siga al input aunque el header sea sticky o haya scroll.
    -->
    <Teleport to="body">
      <div
        v-if="showSuggestions && (backendSuggestions.length > 0 || history.length > 0 || searchQuery)"
        id="search-suggestions"
        :style="dropdownStyle"
        class="fixed bg-background border rounded-lg shadow-xl z-dropdown
               max-h-72 sm:max-h-96 overflow-y-auto"
        role="listbox"
        aria-label="Sugerencias de búsqueda"
      >

        <!-- Historial reciente -->
        <div v-if="!searchQuery && history.length > 0" class="border-b">
          <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
            Búsquedas Recientes
          </div>

          <button
            v-for="item in history.slice(0, 5)"
            :key="item.id"
            @mousedown.prevent="selectHistoryItem(item.query)"
            class="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-accent transition-colors
                   flex items-center gap-2 text-sm min-h-[44px] sm:min-h-0"
            role="option"
            :aria-label="`Búsqueda reciente: ${item.query}`"
          >
            <svg class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <span class="flex-1 min-w-0 truncate">{{ item.query }}</span>

            <!-- Botón X con target táctil mínimo de 28px -->
            <button
              @mousedown.stop.prevent="deleteHistoryItem(item.id)"
              class="p-1.5 hover:text-destructive transition-colors flex-shrink-0
                     min-w-[28px] min-h-[28px] flex items-center justify-center rounded"
              :aria-label="`Eliminar búsqueda: ${item.query}`"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>

          <button
            @mousedown.prevent="handleClearHistory"
            class="w-full text-left px-3 py-2.5 sm:py-2 text-destructive hover:bg-destructive/10
                   transition-colors text-xs font-medium border-t min-h-[40px] sm:min-h-0"
          >
            Limpiar historial
          </button>
        </div>

        <!-- Sugerencias del backend -->
        <div v-if="searchQuery && backendSuggestions.length > 0">
          <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
            Sugerencias
          </div>
          <button
            v-for="(suggestion, idx) in backendSuggestions"
            :key="idx"
            @mousedown.prevent="selectSuggestionText(suggestion)"
            class="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-accent transition-colors
                   flex items-center gap-2 text-sm min-h-[44px] sm:min-h-0"
            role="option"
            :aria-label="`Sugerencia: ${suggestion}`"
          >
            <svg class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="truncate">{{ suggestion }}</span>
          </button>
        </div>

        <!-- Sin resultados -->
        <div
          v-if="searchQuery && backendSuggestions.length === 0 && !loadingSuggestions"
          class="px-3 py-4 text-center text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Sin sugerencias para "{{ searchQuery }}"
        </div>

        <!-- Loading -->
        <div
          v-if="loadingSuggestions"
          class="px-3 py-3 flex items-center justify-center"
          role="status"
          aria-label="Cargando sugerencias"
        >
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        </div>

      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSearchHistory } from '../composables/useSearchHistory'

const emit = defineEmits<{
  search: [query: string]
}>()

const {
  recentSearches: history,
  suggestions: backendSuggestions,
  fetchRecent,
  fetchSuggestions,
  deleteOne,
  clearAll,
} = useSearchHistory()

const searchQuery        = ref('')
const showSuggestions    = ref(false)
const loadingSuggestions = ref(false)
const debounceTimer      = ref<ReturnType<typeof setTimeout> | null>(null)

// ─── Ref al contenedor del componente ────────────────────────────────────────
// Necesario para calcular la posición del dropdown con getBoundingClientRect()
const searchContainer = ref<HTMLElement | null>(null)

// ─── Posición dinámica del dropdown ──────────────────────────────────────────
// Usamos coordenadas "fixed" (relativas a la ventana) para que el dropdown
// siempre aparezca justo debajo del input, sin importar el scroll de la página
// ni el contexto de z-index del componente padre.
const dropdownTop  = ref(0)
const dropdownLeft = ref(0)
const dropdownWidth = ref(0)

const dropdownStyle = computed(() => ({
  top:   `${dropdownTop.value}px`,
  left:  `${dropdownLeft.value}px`,
  width: `${dropdownWidth.value}px`,
}))

function recalculatePosition() {
  if (!searchContainer.value) return
  const rect = searchContainer.value.getBoundingClientRect()
  dropdownTop.value   = rect.bottom + 4  // 4px de separación visual
  dropdownLeft.value  = rect.left
  dropdownWidth.value = rect.width
}

// ─── Actualizar posición al hacer scroll o resize ────────────────────────────
// Crítico cuando el header es sticky: al hacer scroll, el input se mueve
// junto con el header y el dropdown debe seguirlo.
onMounted(() => {
  window.addEventListener('scroll', recalculatePosition, true) // capture:true para detectar scroll en cualquier contenedor
  window.addEventListener('resize', recalculatePosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', recalculatePosition, true)
  window.removeEventListener('resize', recalculatePosition)
})

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleFocus() {
  recalculatePosition() // Calcular posición justo cuando se abre el dropdown
  showSuggestions.value = true
  if (!searchQuery.value) await fetchRecent()
}

// Delay de 200ms necesario para que @mousedown.prevent en las opciones
// se ejecute ANTES de que blur cierre el dropdown
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function closeSuggestions() {
  showSuggestions.value = false
  searchQuery.value = ''
}

function handleInput() {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(async () => {
    if (searchQuery.value.trim().length >= 2) {
      loadingSuggestions.value = true
      await fetchSuggestions(searchQuery.value)
      loadingSuggestions.value = false
    }
  }, 300)
}

// Navegar con teclado hacia el dropdown
function focusFirstSuggestion() {
  const first = document.querySelector<HTMLElement>('#search-suggestions button')
  first?.focus()
}

function selectHistoryItem(query: string) {
  searchQuery.value = query
  performSearch()
}

function selectSuggestionText(suggestion: string) {
  searchQuery.value = suggestion
  performSearch()
}

function performSearch() {
  if (!searchQuery.value.trim()) return
  emit('search', searchQuery.value.trim())
  showSuggestions.value = false
}

async function deleteHistoryItem(id: number) {
  await deleteOne(id)
}

async function handleClearHistory() {
  await clearAll()
  showSuggestions.value = false
}
</script>
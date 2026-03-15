<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.enter="performSearch"
          @keydown.escape="showSuggestions = false"
          type="text"
          placeholder="Buscar archivos..."
          class="w-full h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <!-- Suggestions Dropdown -->
        <div
          v-if="showSuggestions && (backendSuggestions.length > 0 || history.length > 0 || searchQuery)"
          class="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >

          <!-- Historial reciente (cuando no hay texto) -->
          <div v-if="!searchQuery && history.length > 0" class="border-b">
            <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
              Búsquedas Recientes
            </div>
            <button
              v-for="item in history.slice(0, 5)"
              :key="item.id"
              @mousedown.prevent="selectHistoryItem(item.query)"
              class="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ item.query }}</span>
              </div>
              <button
                @click.stop="deleteHistoryItem(item.id)"
                class="p-1 hover:text-destructive transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </button>
            <button
              @mousedown.prevent="handleClearHistory"
              class="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium border-t"
            >
              Limpiar historial
            </button>
          </div>

          <!-- Sugerencias del backend (mientras escribe) -->
          <div v-if="searchQuery && backendSuggestions.length > 0">
            <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
              Sugerencias
            </div>
            <button
              v-for="(suggestion, idx) in backendSuggestions"
              :key="idx"
              @mousedown.prevent="selectSuggestionText(suggestion)"
              class="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{{ suggestion }}</span>
            </button>
          </div>

          <!-- Sin resultados -->
          <div
            v-if="searchQuery && backendSuggestions.length === 0 && !loadingSuggestions"
            class="px-3 py-4 text-center text-sm text-muted-foreground"
          >
            Sin sugerencias para "{{ searchQuery }}"
          </div>

          <!-- Loading sugerencias -->
          <div v-if="loadingSuggestions" class="px-3 py-3 flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>

        </div>
      </div>

      <!-- Botón buscar -->
      <button
        @click="performSearch"
        class="h-10 px-4 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="hidden sm:inline">Buscar</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSearchHistory } from '../composables/useSearchHistory'

const emit = defineEmits<{
  search: [query: string]
}>()

const {
  history,
  suggestions: backendSuggestions,
  fetchRecent,
  fetchSuggestions,
  deleteOne,
  clearAll
} = useSearchHistory()

const searchQuery        = ref('')
const showSuggestions    = ref(false)
const loadingSuggestions = ref(false)
const debounceTimer      = ref<ReturnType<typeof setTimeout> | null>(null)

// ===== HANDLERS =====
async function handleFocus() {
  showSuggestions.value = true
  if (!searchQuery.value) await fetchRecent()
}

function handleBlur() {
  setTimeout(() => { showSuggestions.value = false }, 200)
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
  emit('search', searchQuery.value)
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

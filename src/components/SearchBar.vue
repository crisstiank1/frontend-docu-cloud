<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          @input="handleInput"
          @focus="showSuggestions = true"
          @blur="handleBlur"
          type="text"
          placeholder="Buscar Archivos..."
          class="w-full h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <!-- Suggestions Dropdown -->
        <div
          v-if="showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)"
          class="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <!-- Search History (show when input is empty) -->
          <div v-if="!searchQuery && searchHistory.length > 0" class="border-b">
            <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
              Búsquedas Recientes
            </div>
            <button
              v-for="(query, idx) in searchHistory.slice(0, 5)"
              :key="idx"
              @click="selectSearch(query)"
              class="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center justify-between text-sm"
            >
              <span>{{ query }}</span>
              <span class="text-xs text-muted-foreground">⏱️</span>
            </button>
            <button
              v-if="searchHistory.length > 0"
              @click="clearHistory"
              class="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium border-t"
            >
              Limpiar historial
            </button>
          </div>

          <!-- Suggestions (show when typing) -->
          <div v-if="searchQuery && suggestions.length > 0">
            <template v-for="(suggestion, idx) in suggestions" :key="idx">
              <div v-if="idx === 0 || suggestions[idx - 1].type !== suggestion.type" class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-muted">
                {{ suggestion.type === 'document' ? 'Archivos' : suggestion.type === 'category' ? 'Categorías' : 'Etiquetas' }}
              </div>
              <button
                @click="selectSuggestion(suggestion)"
                class="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2 text-sm"
              >
                <span>{{ suggestion.icon }}</span>
                <span>{{ suggestion.label }}</span>
              </button>
            </template>
          </div>

          <div v-if="searchQuery && suggestions.length === 0" class="px-3 py-4 text-center text-sm text-muted-foreground">
            Sin resultados para "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <!-- Search Button -->
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
import { ref, computed } from 'vue'
import { useSearch, type Suggestion } from '../composables/useSearch'
import { useDocuments } from '../composables/useDocuments'

const emit = defineEmits<{
  search: [query: string]
  selectSuggestion: [suggestion: Suggestion]
}>()

const { getSuggestions, getRecentSearches, saveSearch } = useSearch()
const { clearSearchHistory } = useDocuments()

const searchQuery = ref('')
const showSuggestions = ref(false)
const debounceTimer = ref<number | null>(null)

const suggestions = computed(() => {
  if (!searchQuery.value.trim()) return []
  return getSuggestions(searchQuery.value)
})

const searchHistory = computed(() => {
  return getRecentSearches()
})

function handleBlur() {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function handleInput() {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = window.setTimeout(() => {
    if (searchQuery.value.trim()) {
      emit('search', searchQuery.value)
    }
  }, 300)
}

function selectSearch(query: string) {
  searchQuery.value = query
  performSearch()
}

function selectSuggestion(suggestion: Suggestion) {
  searchQuery.value = suggestion.label
  emit('selectSuggestion', suggestion)
  performSearch()
}

function performSearch() {
  if (!searchQuery.value.trim()) return
  saveSearch(searchQuery.value)
  emit('search', searchQuery.value)
  showSuggestions.value = false
}

function clearHistory() {
  clearSearchHistory()
}
</script>

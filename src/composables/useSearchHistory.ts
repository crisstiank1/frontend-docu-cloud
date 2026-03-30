import { ref } from 'vue'
import api from '../config/api'

export interface SearchHistoryItem {
  id: number
  query: string
  searchedAt: string
}

export function useSearchHistory() {
  const recentSearches = ref<SearchHistoryItem[]>([])
  const suggestions = ref<string[]>([])
  const loadingRecent = ref(false)
  const loadingSuggestions = ref(false)
  const loadingDelete = ref(false)

  async function fetchRecent() {
    loadingRecent.value = true
    try {
      const { data } = await api.get<SearchHistoryItem[]>('/api/search-history')
      recentSearches.value = data ?? []
    } catch {
      recentSearches.value = []
    } finally {
      loadingRecent.value = false
    }
  }

  async function fetchSuggestions(prefix: string) {
    const value = prefix.trim()

    if (value.length < 2) {
      suggestions.value = []
      return
    }

    loadingSuggestions.value = true
    try {
      const { data } = await api.get<{ suggestions: string[] }>('/api/search-history/suggestions', {
        params: { prefix: value }
      })
      suggestions.value = data.suggestions ?? []
    } catch {
      suggestions.value = []
    } finally {
      loadingSuggestions.value = false
    }
  }

  async function deleteOne(historyId: number) {
    loadingDelete.value = true
    try {
      await api.delete(`/api/search-history/${historyId}`)
      recentSearches.value = recentSearches.value.filter(h => h.id !== historyId)
    } finally {
      loadingDelete.value = false
    }
  }

  async function clearAll() {
    loadingDelete.value = true
    try {
      await api.delete('/api/search-history')
      recentSearches.value = []
    } finally {
      loadingDelete.value = false
    }
  }

  function clearSuggestions() {
    suggestions.value = []
  }

  return {
    recentSearches,
    suggestions,
    loadingRecent,
    loadingSuggestions,
    loadingDelete,
    fetchRecent,
    fetchSuggestions,
    deleteOne,
    clearAll,
    clearSuggestions
  }
}
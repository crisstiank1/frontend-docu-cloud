import { ref } from 'vue'
import api from '../config/api'

export interface SearchHistoryItem {
  id: number
  query: string
  searchedAt: string
}

export function useSearchHistory() {
  const history     = ref<SearchHistoryItem[]>([])
  const suggestions = ref<string[]>([])
  const loading     = ref(false)

  async function fetchRecent() {
    try {
      const { data } = await api.get<SearchHistoryItem[]>('/api/search-history')
      history.value = data
    } catch { /* no bloqueante */ }
  }

  async function fetchSuggestions(prefix: string) {
    if (!prefix || prefix.length < 2) {
      suggestions.value = []
      return
    }
    try {
      const { data } = await api.get<{ suggestions: string[] }>(
        `/api/search-history/suggestions?prefix=${encodeURIComponent(prefix)}`
      )
      suggestions.value = data.suggestions ?? []
    } catch {
      suggestions.value = []
    }
  }

  async function deleteOne(historyId: number) {
    try {
      await api.delete(`/api/search-history/${historyId}`)
      history.value = history.value.filter(h => h.id !== historyId)
    } catch { /* silencioso */ }
  }

  async function clearAll() {
    try {
      await api.delete('/api/search-history')
      history.value = []
    } catch { /* silencioso */ }
  }

  return { history, suggestions, loading, fetchRecent, fetchSuggestions, deleteOne, clearAll }
}

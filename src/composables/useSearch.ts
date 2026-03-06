import { ref } from 'vue'
import { useDocuments, type Document } from './useDocuments'
import { useAuth } from './useAuth'

export interface SearchFilter {
  query?: string
  type?: string
  category?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface SearchResult {
  documents: Document[]
  query: string
  totalResults: number
  filters: SearchFilter
}

export interface Suggestion {
  type: 'document' | 'category' | 'tag'
  label: string
  value: string
  icon?: string
}

export function useSearch() {
  const {
    documents,
    categories,
    updateSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    searchDocuments,   // ← conecta al backend
    totalElements
  } = useDocuments()

  const isSearching = ref(false)

  // ── Búsqueda principal → llama al backend ──────────────────────────────────

  async function search(filter: SearchFilter): Promise<SearchResult> {
    isSearching.value = true
    try {
      await searchDocuments({
        query:    filter.query,
        mimeType: mapTypeToMime(filter.type),
        fromDate: filter.dateFrom?.toISOString().split('T')[0],
        toDate:   filter.dateTo?.toISOString().split('T')[0]
      })

      // Filtros locales post-backend (categoría y tags no los soporta el backend aún)
      let results = documents.value
      if (filter.category) {
        results = results.filter(d => d.classification?.category === filter.category)
      }
      if (filter.tags && filter.tags.length > 0) {
        results = results.filter(d =>
          filter.tags!.some(tag => d.classification?.tags?.includes(tag))
        )
      }

      return {
        documents: results,
        query: filter.query || '',
        totalResults: totalElements.value,
        filters: filter
      }
    } finally {
      isSearching.value = false
    }
  }

  // Mapea tipo legible → mimeType para el backend
  function mapTypeToMime(type?: string): string | undefined {
    if (!type || type === 'Todos') return undefined
    const map: Record<string, string> = {
      'PDF':      'application/pdf',
      'DOCX':     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'TXT':      'text/plain',
      'Imágenes': 'image/'
    }
    return map[type]
  }

  // ── Sugerencias locales (rápidas, sin llamar al backend) ───────────────────

  function getSuggestions(query: string): Suggestion[] {
    if (!query.trim()) return []
    const queryLower = query.toLowerCase()
    const suggestions: Suggestion[] = []

    suggestions.push(...documents.value
      .filter(d => d.name.toLowerCase().includes(queryLower))
      .slice(0, 5)
      .map(d => ({ type: 'document' as const, label: d.name, value: d.name, icon: '📄' }))
    )

    suggestions.push(...categories.value
      .filter(c => c.name.toLowerCase().includes(queryLower))
      .slice(0, 5)
      .map(c => ({ type: 'category' as const, label: c.name, value: c.id, icon: '📂' }))
    )

    const allTags = [...new Set(
      documents.value
        .flatMap(d => d.classification?.tags || [])
        .filter(tag => tag.toLowerCase().includes(queryLower))
    )].slice(0, 5)

    suggestions.push(...allTags.map(tag => ({
      type: 'tag' as const, label: tag, value: tag, icon: '🏷️'
    })))

    return suggestions
  }

  // ── Helpers locales ────────────────────────────────────────────────────────

  function getFrequentCategories() {
    const count: Record<string, number> = {}
    documents.value.forEach(d => {
      if (d.classification?.category) {
        count[d.classification.category] = (count[d.classification.category] || 0) + 1
      }
    })
    return Object.entries(count)
      .map(([id, c]) => ({ id, name: categories.value.find(x => x.id === id)?.name || 'Unknown', count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  function getDocumentsByType(type: string): Document[] {
    if (type === 'Todos') return documents.value
    return documents.value.filter(d => {
      if (type === 'PDF')      return d.type === 'application/pdf'
      if (type === 'DOCX')     return d.type.includes('word')
      if (type === 'TXT')      return d.type.includes('text')
      if (type === 'Imágenes') return d.type.startsWith('image/')
      return false
    })
  }

  function getDocumentsByTags(tags: string[]): Document[] {
    if (!tags.length) return documents.value
    return documents.value.filter(d =>
      tags.every(tag => d.classification?.tags?.includes(tag))
    )
  }

  function getDocumentsByDateRange(from: Date, to: Date): Document[] {
    return documents.value.filter(d => {
      const date = new Date(d.uploadedAt)
      return date >= from && date <= to
    })
  }

  function highlightTerms(text: string, query: string): string {
    if (!query || !text) return text
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)
    let highlighted = text
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    })
    return highlighted
  }

  function saveSearch(query: string) {
    updateSearchHistory(query)
  }

  function getRecentSearches(): string[] {
    return getSearchHistory().map(h => h.query)
  }

  return {
    isSearching,
    search,
    getSuggestions,
    getFrequentCategories,
    getDocumentsByType,
    getDocumentsByTags,
    getDocumentsByDateRange,
    highlightTerms,
    saveSearch,
    getRecentSearches,
    clearSearchHistory
  }
}

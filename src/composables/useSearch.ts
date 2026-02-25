import { useDocuments, type SearchFilter, type Document } from './useDocuments'
import { useAuth } from './useAuth'

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
  const { documents, categories, updateSearchHistory, getSearchHistory } = useDocuments()

  /**
   * Main search function with combined filters
   */
  function search(filter: SearchFilter): SearchResult {
  // ✅ Solo documentos del usuario o compartidos con él
  const { user } = useAuth()
  let results = documents.value.filter(d =>
    d.ownerId === user.value?.id ||
    d.sharedWith.some(s => s.email === user.value?.email)
  )

  if (filter.query && filter.query.trim()) {
    const query = filter.query.toLowerCase()
    results = results.filter(doc => {
      const nameMatch = doc.name.toLowerCase().includes(query)
      const tagsMatch = doc.classification?.tags.some(tag => tag.toLowerCase().includes(query))
      const typeMatch = doc.type.toLowerCase().includes(query)
      return nameMatch || tagsMatch || typeMatch
    })
  }

  if (filter.type && filter.type !== 'Todos') {
    results = results.filter(doc => {
      if (filter.type === 'PDF') return doc.type === 'application/pdf' || doc.name.endsWith('.pdf')
      if (filter.type === 'DOCX') return doc.type.includes('word') || doc.name.endsWith('.docx')
      if (filter.type === 'TXT') return doc.type.includes('text') || doc.name.endsWith('.txt')
      if (filter.type === 'Imágenes') return doc.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name)
      return true
    })
  }

  if (filter.category) {
    results = results.filter(doc => doc.classification?.category === filter.category)
  }

  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(doc => {
      if (!doc.classification?.tags) return false
      return filter.tags!.some(tag => doc.classification!.tags.includes(tag))
    })
  }

  if (filter.dateFrom || filter.dateTo) {
    results = results.filter(doc => {
      const docDate = new Date(doc.uploadedAt)
      if (filter.dateFrom && docDate < filter.dateFrom) return false
      if (filter.dateTo && docDate > filter.dateTo) return false
      return true
    })
  }

  results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  return {
    documents: results,
    query: filter.query,
    totalResults: results.length,
    filters: filter
  }
}


  /**
   * Get suggestions based on search query
   * Returns top 5 documents + top 5 categories
   */
  function getSuggestions(query: string): Suggestion[] {
    if (!query || query.trim().length === 0) return []

    const suggestions: Suggestion[] = []
    const queryLower = query.toLowerCase()

    // Add matching documents (top 5)
    const matchingDocs = documents.value
      .filter(doc => doc.name.toLowerCase().includes(queryLower))
      .slice(0, 5)

    suggestions.push(...matchingDocs.map(doc => ({
      type: 'document' as const,
      label: doc.name,
      value: doc.name,
      icon: '📄'
    })))

    // Add matching categories (top 5)
    const matchingCategories = categories.value
      .filter(cat => cat.name.toLowerCase().includes(queryLower))
      .slice(0, 5)

    suggestions.push(...matchingCategories.map(cat => ({
      type: 'category' as const,
      label: cat.name,
      value: cat.id,
      icon: '📂'
    })))

    // Add matching tags (top 5)
    const allTags = [...new Set(
      documents.value
        .flatMap(d => d.classification?.tags || [])
        .filter(tag => tag.toLowerCase().includes(queryLower))
    )].slice(0, 5)

    suggestions.push(...allTags.map(tag => ({
      type: 'tag' as const,
      label: tag,
      value: tag,
      icon: '🏷️'
    })))

    return suggestions
  }

  /**
   * Get frequently used categories
   */
  function getFrequentCategories(): Array<{ id: string; name: string; count: number }> {
    const categoryCount: Record<string, number> = {}

    documents.value.forEach(doc => {
      if (doc.classification?.category) {
        categoryCount[doc.classification.category] = (categoryCount[doc.classification.category] || 0) + 1
      }
    })

    return Object.entries(categoryCount)
      .map(([id, count]) => ({
        id,
        name: categories.value.find(c => c.id === id)?.name || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  /**
   * Get documents by type
   */
  function getDocumentsByType(type: string): Document[] {
    if (type === 'Todos') return documents.value

    return documents.value.filter(doc => {
      if (type === 'PDF') return doc.type === 'application/pdf' || doc.name.endsWith('.pdf')
      if (type === 'DOCX') return doc.type.includes('word') || doc.name.endsWith('.docx')
      if (type === 'TXT') return doc.type.includes('text') || doc.name.endsWith('.txt')
      if (type === 'Imágenes') return doc.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name)
      return false
    })
  }

  /**
   * Get documents by tags (match all tags - AND logic)
   */
  function getDocumentsByTags(tags: string[]): Document[] {
    if (tags.length === 0) return documents.value

    return documents.value.filter(doc => {
      if (!doc.classification?.tags) return false
      return tags.every(tag => doc.classification!.tags.includes(tag))
    })
  }

  /**
   * Get documents in date range
   */
  function getDocumentsByDateRange(from: Date, to: Date): Document[] {
    return documents.value.filter(doc => {
      const docDate = new Date(doc.uploadedAt)
      return docDate >= from && docDate <= to
    })
  }

  /**
   * Highlight search terms in text
   */
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

  /**
   * Save search query to history
   */
  function saveSearch(query: string): void {
    updateSearchHistory(query)
  }

  /**
   * Get recent searches
   */
  function getRecentSearches(): string[] {
    return getSearchHistory().map(h => h.query)
  }

  return {
    search,
    getSuggestions,
    getFrequentCategories,
    getDocumentsByType,
    getDocumentsByTags,
    getDocumentsByDateRange,
    highlightTerms,
    saveSearch,
    getRecentSearches
  }
}

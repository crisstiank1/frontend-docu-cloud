import { ref } from 'vue'
import api from '../config/api'

export interface FavoriteResponse {
  id: number
  documentId: number
  documentName: string
  mimeType: string
  sizeBytes: number
  categoryId?: number
  markedAt: string
}

export function useFavorites() {
  const favorites = ref<FavoriteResponse[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  async function fetchFavorites(categoryId?: number) {
    loading.value = true
    error.value   = null
    try {
      const params = categoryId ? `?categoryId=${categoryId}` : ''
      const { data } = await api.get<FavoriteResponse[]>(`/api/favorites${params}`)
      favorites.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar favoritos'
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(documentId: number): Promise<boolean> {
    try {
      const { data } = await api.post<{ documentId: number; isFavorite: boolean; message: string }>(
        `/api/favorites/${documentId}`
      )
      // Actualiza la lista local
      if (data.isFavorite) {
        // no tenemos el objeto completo, recargamos
        await fetchFavorites()
      } else {
        favorites.value = favorites.value.filter(f => f.documentId !== documentId)
      }
      return data.isFavorite
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar favorito'
      return false
    }
  }

  function isFavorite(documentId: number): boolean {
    return favorites.value.some(f => f.documentId === documentId)
  }

  return { favorites, loading, error, fetchFavorites, toggleFavorite, isFavorite }
}

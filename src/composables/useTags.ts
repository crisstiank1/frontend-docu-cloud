import { ref } from 'vue'
import api from '../config/api'

export interface TagResponse {
  id: number
  name: string
}

export function useTags() {
  const tags    = ref<TagResponse[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchTags() {
    loading.value = true
    try {
      const { data } = await api.get<TagResponse[]>('/api/tags')
      tags.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar tags'
    } finally {
      loading.value = false
    }
  }

  async function createTag(name: string): Promise<TagResponse | null> {
    try {
      const { data } = await api.post<TagResponse>('/api/tags', { name })
      tags.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear tag'
      return null
    }
  }

  async function deleteTag(id: number) {
    try {
      await api.delete(`/api/tags/${id}`)
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar tag'
    }
  }

  return { tags, loading, error, fetchTags, createTag, deleteTag }
}

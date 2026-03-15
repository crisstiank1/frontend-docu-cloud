import { ref } from 'vue'
import api from '../config/api'

export interface AuditLog {
  id: number
  userId: number
  action: string
  resourceType: string
  createdAt: string
  details?: Record<string, any>
}

export interface AuditFilters {
  userId?: number
  action?: string
  resourceType?: string
  from?: string   // YYYY-MM-DD
  to?: string     // YYYY-MM-DD
}

export function useAudit() {
  const logs          = ref<AuditLog[]>([])
  const loading       = ref(false)
  const error         = ref<string | null>(null)
  const totalElements = ref(0)
  const totalPages    = ref(0)

  async function fetchLogs(filters: AuditFilters = {}, page = 0, size = 20) {
    loading.value = true
    error.value   = null
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('size', String(size))
      params.set('sort', 'createdAt,desc')
      if (filters.userId)       params.set('userId',       String(filters.userId))
      if (filters.action)       params.set('action',       filters.action)
      if (filters.resourceType) params.set('resourceType', filters.resourceType)
      if (filters.from)         params.set('from',         filters.from)
      if (filters.to)           params.set('to',           filters.to)

      const { data } = await api.get(`/api/admin/audit/logs?${params}`)
      logs.value          = data.content       ?? []
      totalElements.value = data.totalElements  ?? 0
      totalPages.value    = data.totalPages     ?? 0
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar el historial'
    } finally {
      loading.value = false
    }
  }

  return { logs, loading, error, totalElements, totalPages, fetchLogs }
}

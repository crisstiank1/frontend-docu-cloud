import { ref } from "vue";
import api from "../config/api";

// ✅ Completo según ActivityHistory.java
export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resourceType: string | null;
  resourceId: number | null;
  isSuccessful: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  detailedTimestamp: string;
  createdAt: string;
  details: Record<string, any> | null;
}

// ✅ userId acepta string también porque viene de un <input type="text">
export interface AuditFilters {
  userId?: string | number;
  action?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}

export function useAudit() {
  const logs = ref<AuditLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalElements = ref(0);
  const totalPages = ref(0);

  async function fetchLogs(filters: AuditFilters = {}, page = 0, size = 20) {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));
      params.set("sort", "createdAt,desc");

      // userId: convierte a número y valida antes de enviar
      if (filters.userId !== undefined && filters.userId !== "") {
        const uid = Number(filters.userId);
        if (!isNaN(uid)) params.set("userId", String(uid));
      }

      if (filters.action?.trim()) params.set("action", filters.action.trim());
      if (filters.resourceType?.trim())
        params.set("resourceType", filters.resourceType.trim());
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      // ✅ /api incluido — baseURL es "" en dev (proxy Vite)
      const { data } = await api.get(`/api/admin/audit/logs?${params}`);

      logs.value = data.content ?? [];
      totalElements.value = data.totalElements ?? 0;
      totalPages.value = data.totalPages ?? 0;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? "Error al cargar el historial";
      logs.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { logs, loading, error, totalElements, totalPages, fetchLogs };
}

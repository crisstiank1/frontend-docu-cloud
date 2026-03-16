import { ref } from "vue";
import api from "../config/api";

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

      if (filters.userId !== undefined && filters.userId !== "") {
        const uid = Number(filters.userId);
        if (!isNaN(uid)) params.set("userId", String(uid));
      }
      if (filters.action?.trim()) params.set("action", filters.action.trim());
      if (filters.resourceType?.trim())
        params.set("resourceType", filters.resourceType.trim());
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

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

  // ✅ fetchMyLogs — usa el endpoint propio sin requerir ADMIN
  async function fetchMyLogs(size = 10) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get("/api/audit/logs/my", {
        params: { size, page: 0, sort: "createdAt,desc" },
      });

      logs.value = data.content ?? [];
      totalElements.value = data.totalElements ?? 0;
      totalPages.value = data.totalPages ?? 0;
    } catch (err: any) {
      // Si el endpoint aún no existe (404/403), queda vacío sin romper
      error.value = null;
      logs.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setLogs(data: AuditLog[]) {
    logs.value = data;
  }

  return {
    logs,
    loading,
    error,
    totalElements,
    totalPages,
    fetchLogs,
    fetchMyLogs,
    setLogs, 
  };
}

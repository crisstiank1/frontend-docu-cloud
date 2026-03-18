import { ref, computed } from "vue";
import api from "@/config/api";

const STORAGE_LIMIT_MB = 1024; // 1 GB

export function useDashboardStats() {
  const storageMB = ref(0);
  const loadingStats = ref(false);
  const errorStats = ref<string | null>(null);

  // Usa api (axios) — el interceptor ya inyecta el Bearer token.
  // Nunca leer localStorage manualmente para el token.
  async function fetchStorageUsed(): Promise<number> {
    try {
      const { data } = await api.get<{ usedBytes: number }>(
        "/api/documents/storage",
      );
      return parseFloat(((data.usedBytes ?? 0) / (1024 * 1024)).toFixed(1));
    } catch {
      return 0;
    }
  }

  const storagePercent = computed(() =>
    Math.min(Math.round((storageMB.value / STORAGE_LIMIT_MB) * 100), 100),
  );

  const storageLimitLabel = computed(() =>
    STORAGE_LIMIT_MB >= 1024
      ? `${STORAGE_LIMIT_MB / 1024} GB`
      : `${STORAGE_LIMIT_MB} MB`,
  );

  async function loadStats() {
    loadingStats.value = true;
    errorStats.value = null;
    try {
      storageMB.value = await fetchStorageUsed();
    } catch (e: any) {
      errorStats.value = "No se pudo cargar el almacenamiento.";
      console.warn("[useDashboardStats]", e?.message);
    } finally {
      loadingStats.value = false;
    }
  }

  return {
    storageMB,
    storagePercent,
    storageLimitLabel,
    loadingStats,
    errorStats,
    loadStats,
  };
}

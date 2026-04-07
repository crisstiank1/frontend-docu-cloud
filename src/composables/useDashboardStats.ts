import { ref, computed } from "vue";
import api from "../config/api";
import { isLoggingOut } from "../composables/useAuth";

const STORAGE_LIMIT_MB = 1024;

export function useDashboardStats() {
  const storageMB = ref(0);
  const loadingStats = ref(false);
  const errorStats = ref<string | null>(null);

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
    if (isLoggingOut.value) return;

    loadingStats.value = true;
    errorStats.value = null;
    try {
      storageMB.value = await fetchStorageUsed();
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
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

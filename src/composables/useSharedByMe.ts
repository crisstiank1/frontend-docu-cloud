import { ref, computed } from "vue";
import { documentService } from "@/services/documentService";
import type { SharedByMeDocument, Page } from "@/types/sharing";

export function useSharedByMe() {
  const result = ref<Page<SharedByMeDocument> | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(0);

  const documents = computed(() => result.value?.content ?? []);
  const totalPages = computed(() => result.value?.totalPages ?? 0);
  const totalDocs = computed(() => result.value?.totalElements ?? 0);

  async function fetch(p = 0) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getSharedByMe(p);
      result.value = data;
      page.value = p;
    } catch {
      error.value = "No se pudieron cargar los documentos compartidos.";
    } finally {
      loading.value = false;
    }
  }

  async function revokeShare(shareId: string) {
    await documentService.revokeShare(shareId); // ya existe en tu servicio
    await fetch(page.value); // refresca la página actual
  }

  return {
    documents,
    loading,
    error,
    totalPages,
    totalDocs,
    page,
    fetch,
    revokeShare,
  };
}

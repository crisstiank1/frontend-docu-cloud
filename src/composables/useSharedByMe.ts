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
      // Carga thumbnails para imágenes — igual que en useDocuments
      await loadThumbnailsFor(data.content);
    } catch {
      error.value = "No se pudieron cargar los archivos compartidos.";
    } finally {
      loading.value = false;
    }
  }

  // Genera URL presignada para cada imagen del lote
  async function loadThumbnailsFor(docs: SharedByMeDocument[]) {
    const imageDocs = docs.filter(
      (d) => d.mimeType?.startsWith("image/") && !d.thumbnailUrl
    );
    await Promise.allSettled(
      imageDocs.map(async (doc) => {
        if (!doc.documentId) return;
        try {
          const { data } = await documentService.getPreviewUrl(doc.documentId);
          doc.thumbnailUrl = data.downloadUrl;
        } catch {
          // silencioso — si falla, muestra el ícono genérico
        }
      })
    );
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

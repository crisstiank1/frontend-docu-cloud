import { ref, computed } from "vue";
import { useAuth } from "./useAuth";
import { useDocuments, type Document } from "./useDocuments";
import { useSharedByMe } from "./useSharedByMe";
import { documentService } from "../services/documentService";
import { toast } from "vue-sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ActiveTab = "received" | "sent";
export type SortBy = "date" | "name";
export type ViewMode = "table" | "gallery";

// ─── Composable ───────────────────────────────────────────────────────────────

export function useSharedDocuments() {
  const { user } = useAuth();
  const {
    loading: loadingReceived,
    sharedWithMeDocs,
    fetchSharedWithMe,
    removeSharedWithMe,
    uploadNewVersion,
  } = useDocuments();

  const {
    documents: sharedByMeDocs,
    loading: loadingSent,
    totalDocs: sharedByMeTotalElements,
    fetch: fetchSharedByMe,
    revokeShare: revokeSharedByMe,
  } = useSharedByMe();

  // ─── Estado UI ───────────────────────────────────────────────────────────────

  const activeTab = ref<ActiveTab>("received");
  const searchTerm = ref("");
  const permissionFilter = ref("");
  const typeFilter = ref("");
  const sortBy = ref<SortBy>("date");
  const viewMode = ref<ViewMode>("table");
  const showFilters = ref(false);

  // ─── Estado visor ─────────────────────────────────────────────────────────────

  const viewingDocument = ref<Document | null>(null);
  const currentPreviewUrl = ref<string | null | undefined>(undefined);

  // ─── Estado subida de versión ─────────────────────────────────────────────────

  const uploadingDoc = ref<Document | null>(null);

  // ─── Loading unificado ────────────────────────────────────────────────────────

  const loading = computed(() => loadingReceived.value || loadingSent.value);

  // ─── Stats recibidos ──────────────────────────────────────────────────────────

  const readCount = computed(
    () =>
      sharedWithMeDocs.value.filter((d) => getMyPermission(d) === "READ")
        .length,
  );

  const writeCount = computed(
    () =>
      sharedWithMeDocs.value.filter((d) => getMyPermission(d) === "WRITE")
        .length,
  );

  // ─── Stats enviados ───────────────────────────────────────────────────────────

  const totalRecipientsCount = computed(() =>
    sharedByMeDocs.value.reduce(
      (acc, doc) => acc + (doc.shares?.length || 0),
      0,
    ),
  );

  const sharedWithWriteCount = computed(() =>
    sharedByMeDocs.value.reduce(
      (acc, doc) =>
        acc + (doc.shares?.filter((s) => s.permission === "WRITE").length || 0),
      0,
    ),
  );

  // ─── Archivos filtrados ─────────────────────────────────────────────────────

  const filteredDocuments = computed(() => {
    const source =
      activeTab.value === "received"
        ? sharedWithMeDocs.value
        : sharedByMeDocs.value.map(mapSharedByMeToDocument);

    let docs = [...source];

    if (searchTerm.value) {
      const q = searchTerm.value.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.ownerName || "").toLowerCase().includes(q) ||
          (d.ownerEmail || "").toLowerCase().includes(q),
      );
    }

    if (permissionFilter.value && activeTab.value === "received") {
      docs = docs.filter((d) => getMyPermission(d) === permissionFilter.value);
    }

    if (typeFilter.value) {
      docs = docs.filter((d) => d.type.includes(typeFilter.value));
    }

    docs.sort((a, b) =>
      sortBy.value === "date"
        ? new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        : a.name.localeCompare(b.name),
    );

    return docs;
  });

  // ─── Mapper SharedByMeDocument → Document ────────────────────────────────────

  function mapSharedByMeToDocument(d: any): Document {
    return {
      id: String(d.documentId),
      backendId: d.documentId,
      name: d.fileName,
      type: d.mimeType,
      size: d.sizeBytes ?? 0,
      ownerId: "",
      ownerName: "",
      ownerEmail: "",
      uploadedAt: d.createdAt ?? "",
      status: "AVAILABLE",
      isFavorite: false,
      thumbnailUrl: d.thumbnailUrl ?? undefined,
      sharedWith: (d.shares ?? []).map((s: any) => ({
        shareId: s.shareId,
        email: s.recipientEmail ?? "Enlace público",
        permission: s.permission as "READ" | "WRITE",
      })),
    };
  }

  // ─── Permisos ─────────────────────────────────────────────────────────────────

  function getMyPermission(doc: Document): "READ" | "WRITE" {
    const share = doc.sharedWith?.find((s) => s.email === user.value?.email);
    return (share?.permission as string) === "WRITE" ? "WRITE" : "READ";
  }

  // ─── Filtros ──────────────────────────────────────────────────────────────────

  function clearFilters() {
    searchTerm.value = "";
    permissionFilter.value = "";
    typeFilter.value = "";
  }

  // ─── Visor ────────────────────────────────────────────────────────────────────

  function viewDocument(doc: Document) {
    currentPreviewUrl.value = undefined;
    viewingDocument.value = doc;
  }

  function closeViewer() {
    viewingDocument.value = null;
    currentPreviewUrl.value = undefined;
  }

  function navigateDocument(direction: "prev" | "next") {
    if (!viewingDocument.value) return;
    const idx = filteredDocuments.value.findIndex(
      (d) => d.id === viewingDocument.value!.id,
    );
    if (direction === "prev" && idx > 0) {
      viewingDocument.value = filteredDocuments.value[idx - 1];
    } else if (
      direction === "next" &&
      idx < filteredDocuments.value.length - 1
    ) {
      viewingDocument.value = filteredDocuments.value[idx + 1];
    }
    currentPreviewUrl.value = undefined;
  }

  // ─── Descarga ─────────────────────────────────────────────────────────────────

  async function handleDownload(doc: Document): Promise<void> {
    if (!doc.backendId) return;
    try {
      const { data } = await documentService.getDownloadUrl(doc.backendId);
      const blob = await fetch(data.downloadUrl).then((r) => r.blob());
      const blobUrl = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = blobUrl;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Error al descargar el archivo");
    }
  }

  // ─── Preview ──────────────────────────────────────────────────────────────────

  async function handleRequestPreview(doc: Document): Promise<void> {
    if (!doc.backendId) {
      currentPreviewUrl.value = null;
      return;
    }
    try {
      const { data } = await documentService.getPreviewUrl(doc.backendId);
      currentPreviewUrl.value = data.downloadUrl;
    } catch {
      currentPreviewUrl.value = null;
      toast.error("No se pudo cargar la vista previa");
    }
  }

  // ─── Acciones compartidos recibidos ───────────────────────────────────────────

  async function handleRemoveShared(doc: Document): Promise<void> {
    await removeSharedWithMe(doc.id);
  }

  // ─── Subida de nueva versión ──────────────────────────────────────────────────

  function setUploadingDoc(doc: Document) {
    uploadingDoc.value = doc;
  }

  async function handleVersionUpload(file: File): Promise<void> {
    if (!uploadingDoc.value) return;
    await uploadNewVersion(uploadingDoc.value.id, file);
    uploadingDoc.value = null;
  }

  // ─── Revocar acceso (tab enviados) ────────────────────────────────────────────

  async function handleRevokeShare(shareId: string): Promise<void> {
    const confirmed = window.confirm(
      "¿Revocar el acceso? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;
    await revokeSharedByMe(shareId);
  }

  // ─── Inicialización ───────────────────────────────────────────────────────────

  async function init(): Promise<void> {
    await Promise.all([fetchSharedWithMe(), fetchSharedByMe()]);
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  return {
    // Estado UI
    activeTab,
    searchTerm,
    permissionFilter,
    typeFilter,
    sortBy,
    viewMode,
    showFilters,

    // Estado visor
    viewingDocument,
    currentPreviewUrl,
    uploadingDoc,

    // Loading
    loading,

    // Datos
    sharedWithMeDocs,
    sharedByMeDocs,
    sharedByMeTotalElements,
    filteredDocuments,

    // Stats
    readCount,
    writeCount,
    totalRecipientsCount,
    sharedWithWriteCount,

    // Funciones
    init,
    clearFilters,
    getMyPermission,
    viewDocument,
    closeViewer,
    navigateDocument,
    handleDownload,
    handleRequestPreview,
    handleRemoveShared,
    setUploadingDoc,
    handleVersionUpload,
    handleRevokeShare,
  };
}

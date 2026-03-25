import { reactive, toRefs, computed, ref } from "vue";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import {
  documentService,
  type CategoryResponse,
} from "../services/documentService";
import type {
  DocumentResponse,
  FolderResponse as FolderResponseDto,
} from "../services/documentService";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DocumentClassification {
  category?: string;
  tags?: string[];
  confidence?: number;
}

export interface ShareLink {
  id: string;
  token: string;
  isPublic: boolean;
  password?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  classification?: DocumentClassification;
  uploadedAt: string;
  sharedWith: {
    shareId?: string; 
    email: string;
    permission: "view" | "edit" | "READ" | "WRITE";
  }[];
  shareLinks?: ShareLink[];
  content?: string;
  url?: string;
  folderId?: string;
  isFavorite?: boolean;
  folderPath?: string;
  searchTags?: string[];
  status?: string;
  backendId?: number;
  thumbnailUrl?: string;
  sharedAt?: string;
  categoryId?: number | null;
  isAutomaticallyAssigned?: boolean;
}

export interface Folder {
  id: string;
  backendId: number;
  name: string;
  parentId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  childFolders: string[];
  documentCount: number;
  depth: number;
}

export interface SearchHistory {
  query: string;
  timestamp: string;
}

export type { CategoryResponse as DocumentCategory };

// ─── Constantes ───────────────────────────────────────────────────────────────

const FOLDERS_KEY = "docucloud_folders_v1";
const SEARCH_HISTORY_KEY = "docucloud_search_history_v1";
const MAX_FOLDER_DEPTH = 5;
const MAX_SEARCH_HISTORY = 10;

// ─── Persistencia en localStorage ────────────────────────────────────────────

function loadFolders(): Record<string, Folder> {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFolders(f: Record<string, Folder>) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(f));
}

function loadSearchHistory(): SearchHistory[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(h: SearchHistory[]) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h));
}

// ─── Estado reactivo (singleton) ─────────────────────────────────────────────

const state = reactive<{
  documents: Document[];
  categories: CategoryResponse[];
  folders: Record<string, Folder>;
  searchHistory: SearchHistory[];
  filter: {
    search: string;
    category?: string;
    owner?: string;
    sortBy: "name" | "date";
  };
  currentFolderId: string | null;
}>({
  documents: [],
  categories: [],
  folders: loadFolders(),
  searchHistory: loadSearchHistory(),
  filter: { search: "", sortBy: "date" },
  currentFolderId: null,
});

const loading = ref(false)
const error = ref<string | null>(null)
const totalElements = ref(0)
const currentPage = ref(0)
const viewDocuments = ref<Document[]>([])
const viewTotalElements = ref(0)
const viewCurrentPage = ref(0)
const viewLoading = ref(false)
const foldersLoading = ref(false)
const sharedWithMeDocs = ref<Document[]>([])
const sharedByMeDocs = ref<Document[]>([])
const sharedByMeTotalElements = ref(0);
const sharedByMeCurrentPage = ref(0);


// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapBackendDoc(d: DocumentResponse, user?: any): Document {
  return {
    id: String(d.id),
    backendId: d.id,
    name: d.fileName,
    type: d.mimeType,
    size: d.sizeBytes,
    ownerId: String(user?.id ?? ""),
    ownerName: user?.name ?? "",
    uploadedAt: d.createdAt,
    sharedWith: [],
    folderId: d.folderId ? String(d.folderId) : undefined,
    status: d.status,
    isFavorite: d.isFavorite ?? false,
    categoryId: d.categoryId,
    isAutomaticallyAssigned: d.isAutomaticallyAssigned,
    classification: d.categoryId || d.tags?.length
      ? {
          category: d.categoryId ? String(d.categoryId) : undefined,
          confidence: d.confidenceScore || 0,
          tags: d.tags?.map(t => t.name) ?? [],  
        }
      : undefined,
  };
}

function mapBackendFolder(f: FolderResponseDto): Folder {
  return {
    id: String(f.id),
    backendId: f.id,
    name: f.name,
    parentId: f.parentId ? String(f.parentId) : undefined,
    ownerId: "",
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    documentCount: 0,
    childFolders: [],
    depth: 0,
  };
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useDocuments() {
  const { user } = useAuth();
  const toast = useToast();

  function mapDoc(d: DocumentResponse): Document {
    const existing = state.documents.find((x) => x.backendId === d.id)
    // Si el usuario quitó la categoría manualmente, no pisar ese estado
    if (existing && existing.isAutomaticallyAssigned === false && !existing.categoryId) {
        return {
            ...mapBackendDoc(d, user.value),
            categoryId: undefined,
            classification: undefined,
            isAutomaticallyAssigned: false,
        }
    }
    return mapBackendDoc(d, user.value)
  }

  // ── Vista "Todos" ─────────────────────────────────────────────────────────────

  async function fetchDocuments(page = 0, size = 20) {
    loading.value = true;
    error.value = null;
    try {
      const [docsRes] = await Promise.all([
        documentService.list(page, size),
        state.categories.length === 0 ? fetchCategories() : Promise.resolve(),
      ]);
      state.documents = docsRes.data.content.map(mapDoc);
      totalElements.value = docsRes.data.totalElements;
      currentPage.value = docsRes.data.number;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al cargar archivos";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
    loadThumbnailsFor(state.documents);
    loadTagsFor(state.documents);
  }

  // ── Vista "Carpeta" ───────────────────────────────────────────────────────────
  const pageSize = ref(20);

  const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value));

  async function goToPage(page: number) {
    await fetchDocuments(page, pageSize.value);
  }

  // ── Vista "Carpeta" — paginación backend con endpoint propio ─────────────────
  // Usa GET /api/folders/{id}/documents que ya existe en documentService

  async function fetchDocumentsByFolder(folderId: string, page = 0, size = 20) {
    viewLoading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getFolderDocuments(
        Number(folderId),
        page,
        size,
      );
      viewDocuments.value = data.content.map(mapDoc);
      viewTotalElements.value = data.totalElements;
      viewCurrentPage.value = data.number;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al cargar carpeta";
      toast.error(error.value!);
      viewDocuments.value = [];
      viewTotalElements.value = 0;
    } finally {
      viewLoading.value = false;
    }
    loadThumbnailsFor(viewDocuments.value);
    loadTagsFor(viewDocuments.value);
  }

  // ── Vista "Favoritos" ─────────────────────────────────────────────────────────

  async function fetchFavoriteDocuments(page = 0, size = 20) {
    viewLoading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getFavorites();
      const mapped: Document[] = data.map((f) => ({
        id: String(f.documentId),
        backendId: f.documentId,
        name: f.documentName,
        type: f.fileType,
        size: 0,
        ownerId: String(user.value?.id ?? ""),
        ownerName: user.value?.name ?? "",
        uploadedAt: f.favoritedAt,
        sharedWith: [],
        folderId: f.folderId ? String(f.folderId) : undefined,
        isFavorite: true,
        status: "AVAILABLE",
        classification: f.categoryNames?.length
          ? { category: f.categoryNames[0] }
          : undefined,
      }));
      viewTotalElements.value = mapped.length;
      viewCurrentPage.value = page;
      viewDocuments.value = mapped.slice(page * size, (page + 1) * size);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al cargar favoritos";
      toast.error(error.value!);
      viewDocuments.value = [];
      viewTotalElements.value = 0;
    } finally {
      viewLoading.value = false;
    }
    loadThumbnailsFor(viewDocuments.value);
    loadTagsFor(viewDocuments.value); 
  }

  // ── Vista "Categoría" ─────────────────────────────────────────────────────────

  async function fetchDocumentsByCategory(
    categoryId: string,
    page = 0,
    size = 20,
  ) {
    viewLoading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.list(
        page,
        size,
        Number(categoryId),
      );
      viewDocuments.value = data.content.map(mapDoc);
      viewTotalElements.value = data.totalElements;
      viewCurrentPage.value = data.number;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al cargar categoría";
      toast.error(error.value!);
      viewDocuments.value = [];
      viewTotalElements.value = 0;
    } finally {
      viewLoading.value = false;
    }
    loadThumbnailsFor(viewDocuments.value);
    loadTagsFor(viewDocuments.value);
  }

  // ── Vista "Sin clasificar" ────────────────────────────────────────────────────
  // ✅ CORREGIDO: usa documentService.listUnclassified() en lugar de
  // cargar 1000 documentos y filtrar en frontend

  async function fetchUnclassifiedDocuments(page = 0, size = 20) {
    viewLoading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.listUnclassified(page, size);
      viewDocuments.value = data.content.map(mapDoc);
      viewTotalElements.value = data.totalElements;
      viewCurrentPage.value = data.number;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Error al cargar sin clasificar";
      toast.error(error.value!);
      viewDocuments.value = [];
      viewTotalElements.value = 0;
    } finally {
      viewLoading.value = false;
    }
    loadThumbnailsFor(viewDocuments.value);
    loadTagsFor(viewDocuments.value);
  }

  function clearViewDocuments() {
    viewDocuments.value = [];
    viewTotalElements.value = 0;
    viewCurrentPage.value = 0;
  }

  // ── Shared With Me ────────────────────────────────────────────────────────────

  async function fetchSharedWithMe() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getSharedWithMe();
      sharedWithMeDocs.value = data.content.map((d: any) => ({
        id: String(d.shareId),
        backendId: d.documentId,
        name: d.fileName,
        type: d.mimeType,
        size: d.sizeBytes,
        ownerId: "",
        ownerName: d.sharedByName ?? "Usuario",
        ownerEmail: d.sharedByEmail ?? "",
        uploadedAt: d.sharedAt ?? "",
        sharedAt: d.sharedAt ?? "",
        status: "AVAILABLE",
        isFavorite: false,
        thumbnailUrl: d.thumbnailUrl ?? undefined,
        sharedWith: [
          {
            email: String(user.value?.email ?? ""),
            permission: (d.permission ?? "READ") as "READ" | "WRITE",
          },
        ],
      }));
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Error al cargar compartidos";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function fetchSharedByMe(page = 0) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getSharedByMe(page);

      sharedByMeDocs.value = data.content.map((d: any) => ({
        id: String(d.documentId),
        backendId: d.documentId,
        name: d.fileName,
        type: d.mimeType,
        size: d.sizeBytes ?? 0,
        ownerId: "", // el backend no lo envía — somos nosotros el owner
        ownerName: "",
        ownerEmail: "",
        uploadedAt: d.createdAt ?? "",
        status: "AVAILABLE",
        isFavorite: false,
        thumbnailUrl: d.thumbnailUrl ?? undefined,
        sharedWith: (d.shares ?? []).map((s: any) => ({
          email: s.recipientEmail ?? "Enlace público",
          permission: s.permission as "READ" | "WRITE",
          shareId: s.shareId, // guardamos para poder revocar
        })),
      }));

      sharedByMeTotalElements.value = data.totalElements;
      sharedByMeCurrentPage.value = data.number;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Error al cargar compartidos por mí";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function removeSharedWithMe(shareId: string): Promise<boolean> {
    try {
      await documentService.removeSharedWithMe(shareId);
      sharedWithMeDocs.value = sharedWithMeDocs.value.filter(
        (d) => d.id !== shareId,
      );
      toast.success("Documento eliminado de compartidos");
      return true;
    } catch {
      toast.error("No se pudo eliminar el acceso");
      return false;
    }
  }

  async function revokeSharedByMe(shareId: string): Promise<boolean> {
    try {
      await documentService.revokeShare(shareId);
      // Refrescar la página actual
      await fetchSharedByMe(sharedByMeCurrentPage.value);
      toast.success("Acceso revocado correctamente");
      return true;
    } catch {
      toast.error("No se pudo revocar el acceso");
      return false;
    }
  }

  async function uploadNewVersion(
    shareId: string,
    file: File,
  ): Promise<boolean> {
    try {
      const { data } = await documentService.getWriteUrlForRecipient(
        shareId,
        file.type,
      );
      await fetch(data.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      toast.success("Nueva versión subida correctamente");
      return true;
    } catch {
      toast.error("No se pudo subir la nueva versión");
      return false;
    }
  }

  async function fetchRecent(size = 10): Promise<Document[]> {
    try {
      const { data } = await documentService.recent(size);
      return data.content.map(mapDoc);
    } catch {
      return [];
    }
  }

  async function uploadDocument(
    file: File,
    folderId?: string,
  ): Promise<Document | null> {
    loading.value = true;
    error.value = null;
    try {
      const { data: initData } = await documentService.initUpload({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        folderId: folderId ? Number(folderId) : undefined,
      });

      await fetch(initData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      await documentService.completeUpload(initData.documentId, {
        fileHash: crypto.randomUUID().replace(/-/g, ""),
        sizeBytes: file.size,
      });

      await fetchDocuments();
      toast.success(`"${file.name}" subido correctamente`);

      const docId = initData.documentId;
      let attempts = 0;
      const maxAttempts = 15;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const { data } = await documentService.list(0, 20);
          const updated = data.content.find((d) => d.id === docId);

          if (updated?.categoryId || attempts >= maxAttempts) {
            clearInterval(pollInterval);
            if (updated?.categoryId) {
              const idx = state.documents.findIndex(
                (d) => d.backendId === docId,
              );
              if (idx >= 0) {
                const currentDoc = state.documents[idx];
                if (currentDoc.isAutomaticallyAssigned === false) return;
                state.documents.splice(idx, 1, {
                  ...currentDoc,
                  categoryId: updated.categoryId,
                  isAutomaticallyAssigned: updated.isAutomaticallyAssigned,
                  classification: {
                    category: String(updated.categoryId),
                    confidence: updated.confidenceScore ?? 0,
                  },
                });
              }
            } else if (attempts >= maxAttempts) {
              const idx = state.documents.findIndex(
                (d) => d.backendId === docId,
              );
              if (idx >= 0) {
                state.documents.splice(idx, 1, {
                  ...state.documents[idx],
                  classification: { category: "", confidence: 0 },
                });
              }
            }
          }
        } catch {
          clearInterval(pollInterval);
        }
      }, 2000);

      return (
        state.documents.find((d) => d.backendId === initData.documentId) ?? null
      );
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al subir el archivo";
      toast.error(error.value!);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDocument(id: string): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === id) ??
      viewDocuments.value.find((d) => d.id === id);
    if (!doc?.backendId) return false;
    try {
      await documentService.delete(doc.backendId);
      state.documents = state.documents.filter((d) => d.id !== id);
      viewDocuments.value = viewDocuments.value.filter((d) => d.id !== id);
      viewTotalElements.value = Math.max(0, viewTotalElements.value - 1);
      toast.success("Archivo eliminado correctamente");
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al eliminar";
      toast.error(error.value!);
      return false;
    }
  }

  async function updateDocument(
    id: string,
    changes: Partial<Document>,
  ): Promise<boolean> {
      const doc =
          state.documents.find((d) => d.id === id) ??
          viewDocuments.value.find((d) => d.id === id);
      if (!doc?.backendId) return false;

      if (changes.classification !== undefined) {
          const raw = changes.classification?.category;
          const categoryId = raw ? Number(raw) : null;

          try {
              if (categoryId && !isNaN(categoryId)) {
                  await documentService.assignCategory(doc.backendId, categoryId);
              } else {
                  await documentService.removeCategory(doc.backendId);
              }
          } catch {
              toast.error("No se pudo actualizar la categoría");
              return false;
          }

          if (categoryId && doc.categoryId && doc.categoryId !== categoryId) {
              try {
                  const predictedName =
                      state.categories.find((c) => c.id === doc.categoryId)?.name ??
                      String(doc.categoryId);
                  const correctName =
                      state.categories.find((c) => c.id === categoryId)?.name ??
                      String(categoryId);
                  await fetch(
                      "https://classifierservice-production-36f0.up.railway.app/feedback",
                      {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                              filename: doc.name,
                              predicted: predictedName,
                              correct: correctName,
                              confidence: doc.classification?.confidence ?? null,
                              preview_text: doc.content ?? "",
                          }),
                      },
                  );
              } catch {
                  // silencioso
              }
          }

          changes.isAutomaticallyAssigned = false;
          changes.categoryId = categoryId ?? null;
          // ← si quitas categoría limpia todo, si asignas solo resetea confidence
          changes.classification = categoryId
              ? { ...changes.classification, confidence: 0 }
              : undefined;
      }

      const idxGlobal = state.documents.findIndex((d) => d.id === id);
      if (idxGlobal >= 0) {
          state.documents.splice(idxGlobal, 1, {
              ...state.documents[idxGlobal],
              ...changes,
          });
      }
      const idxView = viewDocuments.value.findIndex((d) => d.id === id);
      if (idxView >= 0) {
          viewDocuments.value.splice(idxView, 1, {
              ...viewDocuments.value[idxView],
              ...changes,
          });
      }

      toast.success("Clasificación actualizada");
      return true;
  }


  // bug de punto y coma — sharedWithMeDocs.value.find()
  // estaba en una línea separada sin asignación, nunca se ejecutaba
  async function downloadDocument(id: string): Promise<string | null> {
    const doc =
      state.documents.find((d) => d.id === id) ??
      viewDocuments.value.find((d) => d.id === id) ??
      sharedWithMeDocs.value.find((d) => d.id === id);
    if (!doc?.backendId) return null;
    try {
      const { data } = await documentService.getDownloadUrl(doc.backendId);
      toast.success("Descarga iniciada");
      return data.downloadUrl;
    } catch {
      toast.error("No se pudo obtener el enlace de descarga");
      return null;
    }
  }

  // ✅ CORREGIDO: mismo bug en previewDocument
  async function previewDocument(id: string): Promise<string | null> {
    const doc =
      state.documents.find((d) => d.id === id) ??
      viewDocuments.value.find((d) => d.id === id) ??
      sharedWithMeDocs.value.find((d) => d.id === id);
    if (!doc?.backendId) return null;
    try {
      const { data } = await documentService.getPreviewUrl(doc.backendId);
      return data.downloadUrl ?? null;
    } catch {
      toast.error("No se pudo obtener la vista previa");
      return null;
    }
  }

  async function loadThumbnails(): Promise<void> {
    loadThumbnailsFor(state.documents);
  }

  async function loadThumbnailsFor(docs: Document[]): Promise<void> {
    const imageDocs = docs.filter(
      (d) => d.type.startsWith("image/") && !d.thumbnailUrl,
    );
    await Promise.allSettled(
      imageDocs.map(async (doc) => {
        if (!doc.backendId) return;
        try {
          const { data } = await documentService.getPreviewUrl(doc.backendId);
          doc.thumbnailUrl = data.downloadUrl;
        } catch {
          /* silencioso */
        }
      }),
    );
  }

  async function loadTagsFor(docs: Document[]): Promise<void> {
  await Promise.allSettled(
    docs.map(async (doc) => {
      if (!doc.backendId) return;
      try {
        const { data } = await documentService.getDocumentTags(doc.backendId);
        if (data.length > 0) {
          const idxG = state.documents.findIndex((d) => d.backendId === doc.backendId);
          if (idxG >= 0) {
            state.documents[idxG].classification = {
              ...state.documents[idxG].classification,
              tags: data.map((t) => t.name),
            };
          }
          const idxV = viewDocuments.value.findIndex((d) => d.backendId === doc.backendId);
          if (idxV >= 0) {
            viewDocuments.value[idxV].classification = {
              ...viewDocuments.value[idxV].classification,
              tags: data.map((t) => t.name),
            };
          }
        }
      } catch { /* silencioso */ }
    })
  );
}


  async function searchDocuments(params: {
    query?: string;
    mimeType?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.search(params);
      state.documents = data.content.map(mapDoc);
      totalElements.value = data.totalElements;
      if (data.totalElements === 0) toast.info("No se encontraron archivos");
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error en la búsqueda";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function shareDocument(
    docId: string,
    email: string,
    permission: "view" | "edit",
  ): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      const backendPermission = permission === "edit" ? "WRITE" : "READ";
      await documentService.share(doc.backendId, {
        recipientEmail: email,
        permission: backendPermission,
      });
      const existing = doc.sharedWith.findIndex((s) => s.email === email);
      if (existing >= 0) doc.sharedWith[existing].permission = permission;
      else doc.sharedWith.push({ email, permission });
      toast.success(`Archivo compartido con ${email}`);
      return true;
    } catch {
      toast.error("No se pudo compartir el archivo");
      return false;
    }
  }

  async function moveDocumentTo(
    docId: string,
    folderId?: string,
  ): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      if (folderId) {
        await documentService.moveToFolder(doc.backendId, Number(folderId));
        doc.folderId = folderId;
        toast.success("Archivo movido a la carpeta");
      } else {
        await documentService.removeFromFolder(doc.backendId);
        doc.folderId = undefined;
        toast.success("Archivo removido de la carpeta");
      }
      return true;
    } catch {
      toast.error("No se pudo mover el archivo");
      return false;
    }
  }

  async function toggleFavorite(docId: string): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      const { data } = await documentService.toggleFavorite(doc.backendId);
      [state.documents, viewDocuments.value].forEach((arr) => {
        const d = arr.find((x) => x.id === docId);
        if (d) d.isFavorite = data.isFavorite;
      });
      toast.info(data.message);
      return true;
    } catch {
      toast.error("No se pudo actualizar favorito");
      return false;
    }
  }

  // ── Helpers árbol de carpetas ─────────────────────────────────────────────────

  function calculateFolderDepth(
    parentId?: string,
    visited = new Set<string>(),
  ): number {
    if (!parentId) return 0;
    if (visited.has(parentId)) return 0;
    const parent = state.folders[parentId];
    if (!parent) return 0;
    visited.add(parentId);
    return 1 + calculateFolderDepth(parent.parentId, visited);
  }

  function isDescendantOf(folderId: string, targetId: string): boolean {
    const visited = new Set<string>();
    let current: string | undefined = targetId;
    while (current) {
      if (visited.has(current)) break;
      visited.add(current);
      if (current === folderId) return true;
      current = state.folders[current]?.parentId;
    }
    return false;
  }

  function getSubtreeHeight(
    folderId: string,
    visited = new Set<string>(),
  ): number {
    if (visited.has(folderId)) return 0;
    visited.add(folderId);
    const folder = state.folders[folderId];
    if (!folder || folder.childFolders.length === 0) return 0;
    return (
      1 +
      Math.max(
        ...folder.childFolders.map((id) => getSubtreeHeight(id, visited)),
      )
    );
  }

  function updateSubtreeDepth(
    folderId: string,
    depth: number,
    visited = new Set<string>(),
  ): void {
    if (visited.has(folderId)) return;
    visited.add(folderId);
    const folder = state.folders[folderId];
    if (!folder) return;
    folder.depth = depth;
    folder.childFolders.forEach((childId) =>
      updateSubtreeDepth(childId, depth + 1, visited),
    );
  }

  // ── Carpetas ──────────────────────────────────────────────────────────────────

  async function fetchFolders(): Promise<void> {
    if (!user.value) return;
    foldersLoading.value = true;
    try {
      const { data } = await documentService.listFolders();
      const mapped: Record<string, Folder> = {};

      data.forEach((f) => {
        const folder = mapBackendFolder(f);
        folder.ownerId = String(user.value!.id);
        mapped[folder.id] = folder;
      });

      data.forEach((f) => {
        if (f.parentId) {
          const parentKey = String(f.parentId);
          if (mapped[parentKey]) {
            mapped[parentKey].childFolders.push(String(f.id));
          }
        }
      });

      const queue: Array<{ id: string; depth: number }> = [];
      Object.values(mapped)
        .filter((f) => !f.parentId)
        .forEach((f) => queue.push({ id: f.id, depth: 0 }));

      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        mapped[id].depth = depth;
        mapped[id].childFolders.forEach((childId) => {
          if (mapped[childId]) queue.push({ id: childId, depth: depth + 1 });
        });
      }

      state.folders = mapped;
      saveFolders(state.folders);
    } catch {
      // fallback silencioso
    } finally {
      foldersLoading.value = false;
    }
  }

  async function createFolder(
    name: string,
    parentId?: string,
  ): Promise<Folder | null> {
    if (!user.value) return null;
    try {
      const { data } = await documentService.createFolder(
        name.trim(),
        parentId ? Number(parentId) : undefined,
      );
      const folder = mapBackendFolder(data);
      folder.ownerId = String(user.value!.id);
      folder.depth = calculateFolderDepth(parentId);
      state.folders = { ...state.folders, [folder.id]: folder };
      if (parentId && state.folders[parentId]) {
        state.folders[parentId].childFolders.push(folder.id);
      }
      saveFolders(state.folders);
      toast.success(`Carpeta "${name}" creada`);
      return folder;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al crear carpeta");
      return null;
    }
  }

  async function renameFolder(
    folderId: string,
    newName: string,
  ): Promise<boolean> {
    const folder = state.folders[folderId];
    if (!folder?.backendId) return false;
    try {
      const { data } = await documentService.renameFolder(
        folder.backendId,
        newName.trim(),
      );
      state.folders[folderId].name = data.name;
      state.folders[folderId].updatedAt = data.updatedAt;
      saveFolders(state.folders);
      toast.success(`Carpeta renombrada a "${newName}"`);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al renombrar carpeta");
      return false;
    }
  }

  async function deleteFolder(folderId: string): Promise<boolean> {
    const folder = state.folders[folderId];
    if (!folder?.backendId) return false;
    try {
      await documentService.deleteFolder(folder.backendId);
      state.documents
        .filter((d) => d.folderId === folderId)
        .forEach((d) => {
          d.folderId = undefined;
        });
      viewDocuments.value
        .filter((d) => d.folderId === folderId)
        .forEach((d) => {
          d.folderId = undefined;
        });
      if (folder.parentId && state.folders[folder.parentId]) {
        state.folders[folder.parentId].childFolders = state.folders[
          folder.parentId
        ].childFolders.filter((id) => id !== folderId);
      }
      delete state.folders[folderId];
      state.folders = { ...state.folders };
      saveFolders(state.folders);
      toast.success("Carpeta eliminada");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al eliminar carpeta");
      return false;
    }
  }

  function moveFolderTo(folderId: string, newParentId?: string): boolean {
    const folder = state.folders[folderId];
    if (
      !folder ||
      folder.ownerId !== String(user.value?.id ?? "") ||
      newParentId === folderId
    )
      return false;
    if (newParentId && isDescendantOf(folderId, newParentId)) {
      toast.warning("No se puede mover una carpeta dentro de sí misma");
      return false;
    }
    const newDepth = calculateFolderDepth(newParentId);
    const subtreeHeight = getSubtreeHeight(folderId);
    if (newDepth + subtreeHeight >= MAX_FOLDER_DEPTH) {
      toast.warning("No se puede mover: se excede el límite de profundidad");
      return false;
    }
    if (folder.parentId && state.folders[folder.parentId]) {
      state.folders[folder.parentId].childFolders = state.folders[
        folder.parentId
      ].childFolders.filter((id) => id !== folderId);
    }
    folder.parentId = newParentId;
    folder.updatedAt = new Date().toISOString();
    if (newParentId && state.folders[newParentId]) {
      state.folders[newParentId].childFolders.push(folderId);
    }
    updateSubtreeDepth(folderId, newDepth);
    saveFolders(state.folders);
    toast.success("Carpeta movida correctamente");
    return true;
  }

  function getFolderPath(folderId: string): string {
    const folder = state.folders[folderId];
    if (!folder) return "";
    const parts = [folder.name];
    let current = folder.parentId;
    while (current) {
      const parent = state.folders[current];
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent.parentId;
    }
    return "/" + parts.join("/");
  }

  function getFolderTree(): Folder[] {
    if (!user.value) return [];
    return Object.values(foldersWithCount.value)
      .filter((f) => f.ownerId === String(user.value!.id ?? "") && !f.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

  const foldersWithCount = computed(() => {
    const result: Record<string, Folder> = {};
    for (const [id, folder] of Object.entries(state.folders)) {
      result[id] = {
        ...folder,
        documentCount: state.documents.filter((d) => d.folderId === id).length,
      };
    }
    return result;
  });

  // ── Getters ───────────────────────────────────────────────────────────────────

  function getMyDocuments(): Document[] {
    return state.documents.filter((d) => d.status !== "DELETED");
  }

  function getSharedWithMe(): Document[] {
    return sharedWithMeDocs.value;
  }

  function getDocument(id: string): Document | null {
    return (
      state.documents.find((d) => d.id === id) ??
      viewDocuments.value.find((d) => d.id === id) ??
      null
    );
  }

  function getFilteredDocuments(): Document[] {
    let docs = state.documents.filter((d) => d.status !== "DELETED");
    if (state.filter.category) {
      docs = docs.filter(
        (d) => d.classification?.category === state.filter.category,
      );
    }
    if (state.filter.search) {
      const search = state.filter.search.toLowerCase();
      docs = docs.filter(
        (d) => d.name.toLowerCase().includes(search) || d.type.includes(search),
      );
    }
    if (state.filter.sortBy === "name") {
      docs.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      docs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
    }
    return docs;
  }

  function getDocumentsInFolder(folderId?: string): Document[] {
    return state.documents.filter(
      (d) => d.folderId === folderId && d.status !== "DELETED",
    );
  }

  function getUnclassifiedDocuments(): Document[] {
    return state.documents.filter(
      (d) =>
        d.status !== "DELETED" && !d.folderId && !d.classification?.category,
    );
  }

  function getFavoriteDocuments(): Document[] {
    return state.documents
      .filter((d) => d.isFavorite && d.status !== "DELETED")
      .slice(0, 10);
  }

  // ── Categorías ────────────────────────────────────────────────────────────────

  async function addCategory(
    name: string,
    color: string,
  ): Promise<CategoryResponse | null> {
    try {
      const { data } = await documentService.createCategory(name, color);
      state.categories.push(data);
      toast.success(`Categoría "${name}" creada`);
      return data;
    } catch {
      toast.error("No se pudo crear la categoría");
      return null;
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    try {
      await documentService.deleteCategory(Number(id));
      const idx = state.categories.findIndex((c) => String(c.id) === id);
      if (idx >= 0) state.categories.splice(idx, 1);
      for (let i = state.documents.length - 1; i >= 0; i--) {
        const doc = state.documents[i];
        if (doc.categoryId === Number(id)) {
          state.documents.splice(i, 1, {
            ...doc,
            categoryId: undefined,
            isAutomaticallyAssigned: false,
            classification: undefined,
          });
        }
      }
      toast.success("Categoría eliminada");
      return true;
    } catch {
      toast.error("No se pudo eliminar la categoría");
      return false;
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await documentService.listCategories();
      state.categories = data;
    } catch {
      console.error("Error cargando categorías");
    }
  }

  async function updateCategory(
    id: string,
    name: string,
    color: string,
  ): Promise<boolean> {
    try {
      const { data } = await documentService.updateCategory(
        Number(id),
        name,
        color,
      );
      const cat = state.categories.find((c) => String(c.id) === id);
      if (cat) {
        cat.name = data.name;
        cat.color = data.color;
      }
      toast.success("Categoría actualizada");
      return true;
    } catch {
      toast.error("No se pudo actualizar la categoría");
      return false;
    }
  }

  // ── Historial de búsqueda ─────────────────────────────────────────────────────

  function updateSearchHistory(query: string): void {
    if (!query.trim()) return;
    const history = state.searchHistory;
    const exists = history.findIndex((h) => h.query === query.trim());
    if (exists >= 0) history.splice(exists, 1);
    history.unshift({
      query: query.trim(),
      timestamp: new Date().toISOString(),
    });
    if (history.length > MAX_SEARCH_HISTORY) history.splice(MAX_SEARCH_HISTORY);
    state.searchHistory = history;
    saveSearchHistory(history);
  }

  function getSearchHistory(): SearchHistory[] {
    return [...state.searchHistory];
  }

  function clearSearchHistory(): void {
    state.searchHistory = [];
    saveSearchHistory([]);
    toast.info("Historial de búsqueda limpiado");
  }

  // ── Compartir ─────────────────────────────────────────────────────────────────

  async function revokeAccess(docId: string, email: string): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    const shareLink = doc.shareLinks?.find((l) => l.id);
    try {
      if (shareLink) await documentService.revokeShare(shareLink.id);
      doc.sharedWith = doc.sharedWith.filter((s) => s.email !== email);
      toast.success(`Acceso revocado para ${email}`);
      return true;
    } catch {
      toast.error("No se pudo revocar el acceso");
      return false;
    }
  }

  function createShareLink(
    docId: string,
    isPublic: boolean,
    password?: string,
  ): ShareLink | null {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc) return null;
    const shareLink: ShareLink = {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      isPublic,
      password,
      createdAt: new Date().toISOString(),
    };
    if (!doc.shareLinks) doc.shareLinks = [];
    doc.shareLinks.push(shareLink);
    toast.success("Enlace de compartir creado");
    return shareLink;
  }

  function deleteShareLink(docId: string, linkId: string): boolean {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.shareLinks) return false;
    doc.shareLinks = doc.shareLinks.filter((l) => l.id !== linkId);
    toast.success("Enlace eliminado");
    return true;
  }

  // ── Tags ──────────────────────────────────────────────────────────────────────

  async function assignTagToDocument(
    docId: string,
    tagId: number,
  ): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    const currentTags = doc.classification?.tags ?? [];
    if (currentTags.length >= 3) {
      toast.error("Máximo 3 etiquetas por documento");
      return false;
    }
    try {
      await documentService.addTagToDocument(doc.backendId, tagId);
      const { data: tagList } = await documentService.getDocumentTags(
        doc.backendId,
      );
      const tagNames = tagList.map((t) => t.name);
      [state.documents, viewDocuments.value].forEach((arr) => {
        const d = arr.find((x) => x.id === docId);
        if (d) d.classification = { ...d.classification, tags: tagNames };
      });
      return true;
    } catch {
      toast.error("No se pudo agregar la etiqueta");
      return false;
    }
  }

  async function removeTagFromDocument(
    docId: string,
    tagId: number,
  ): Promise<boolean> {
    const doc =
      state.documents.find((d) => d.id === docId) ??
      viewDocuments.value.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      await documentService.removeTagFromDocument(doc.backendId, tagId);
      const { data: tagList } = await documentService.getDocumentTags(
        doc.backendId,
      );
      const tagNames = tagList.map((t) => t.name);
      [state.documents, viewDocuments.value].forEach((arr) => {
        const d = arr.find((x) => x.id === docId);
        if (d) d.classification = { ...d.classification, tags: tagNames };
      });
      return true;
    } catch {
      toast.error("No se pudo quitar la etiqueta");
      return false;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    ...toRefs(state),
    folders: foldersWithCount,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    goToPage,
    viewDocuments,
    viewTotalElements,
    viewCurrentPage,
    viewLoading,
    fetchDocuments,
    fetchDocumentsByFolder,
    fetchFavoriteDocuments,
    fetchDocumentsByCategory,
    fetchUnclassifiedDocuments,
    clearViewDocuments,
    fetchRecent,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    previewDocument,
    searchDocuments,
    shareDocument,
    moveDocumentTo,
    getDocument,
    getMyDocuments,
    getSharedWithMe,
    getFilteredDocuments,
    getDocumentsInFolder,
    getUnclassifiedDocuments,
    getFavoriteDocuments,
    toggleFavorite,
    addCategory,
    deleteCategory,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolderTo,
    getFolderPath,
    getFolderTree,
    updateSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    revokeAccess,
    createShareLink,
    deleteShareLink,
    foldersLoading,
    fetchFolders,
    loadThumbnails,
    sharedWithMeDocs,
    fetchSharedWithMe,
    assignTagToDocument,
    removeTagFromDocument,
    updateCategory,
    updateDocument,
    fetchCategories,
    removeSharedWithMe,
    uploadNewVersion,
    sharedByMeDocs,
    fetchSharedByMe,
    sharedByMeTotalElements,
    sharedByMeCurrentPage,
    revokeSharedByMe,
  };
}

import { reactive, toRefs, computed, ref } from "vue";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { documentService, type CategoryResponse } from "../services/documentService";
import type { DocumentResponse, FolderResponse as FolderResponseDto, } from "../services/documentService";

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
  sharedWith: { email: string; permission: "view" | "edit" }[];
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

// Categorías reales del backend

async function fetchCategories() {
  try {
    const { data } = await documentService.listCategories();
    state.categories = data;
  } catch (error) {
    console.error("Error cargando categorías", error); // 👈 agrega el error
  }
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

const loading = ref(false);
const error = ref<string | null>(null);
const totalElements = ref(0);
const currentPage = ref(0);
const foldersLoading = ref(false);
const sharedWithMeDocs = ref<Document[]>([]);

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapBackendDoc(d: DocumentResponse): Document {
  return {
    id: String(d.id),
    backendId: d.id,
    name: d.fileName,
    type: d.mimeType,
    size: d.sizeBytes,
    ownerId: "",
    ownerName: "",
    uploadedAt: d.createdAt,
    sharedWith: [],
    folderId: d.folderId ? String(d.folderId) : undefined,
    status: d.status,
    isFavorite: d.isFavorite ?? false,
    categoryId: d.categoryId, 
    isAutomaticallyAssigned: d.isAutomaticallyAssigned, 
    classification: d.categoryId
      ? { category: String(d.categoryId),
        confidence: d.confidenceScore || 0
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

  // ── Documentos ───────────────────────────────────────────────────────────────

  async function fetchDocuments(page = 0, size = 20) {
    loading.value = true;
    error.value = null;
    try {
      const [docsRes] = await Promise.all([
        documentService.list(page, size),
        state.categories.length === 0 ? fetchCategories() : Promise.resolve(),
      ]);

      state.documents = docsRes.data.content.map((d) => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ""),
        ownerName: user.value?.name ?? "",
      }));
      totalElements.value = docsRes.data.totalElements;
      currentPage.value = docsRes.data.number;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Error al cargar archivos";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
    loadThumbnails();
  }


  async function fetchSharedWithMe() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await documentService.getSharedWithMe();
      sharedWithMeDocs.value = data.content.map((d) => {
        const base = mapBackendDoc(d);
        return {
          ...base,
          ownerName: (d as any).ownerName ?? "Usuario",
          ownerEmail: (d as any).ownerEmail ?? "",
          sharedAt: (d as any).sharedAt ?? d.createdAt,
          sharedWith: [
            {
              email: String(user.value?.email ?? ""),
              permission: ((d as any).permission ?? "view") as "view" | "edit",
            },
          ],
        };
      });
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Error al cargar compartidos";
      toast.error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function fetchRecent(size = 10): Promise<Document[]> {
    try {
      const { data } = await documentService.recent(size);
      return data.content.map((d) => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ""),
        ownerName: user.value?.name ?? "",
      }));
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

    // 1er intento: 6s (clasificación tarda ~5s en promedio)
    setTimeout(async () => {
      await fetchDocuments();
      await fetchCategories();
    }, 6000);

    // 2do intento: 9s (fallback por si el clasificador tardó más)
    setTimeout(async () => {
      await fetchDocuments();
      await fetchCategories();
    }, 9000);

    // 3er intento de seguridad: 15s (por si la IA está saturada)
    setTimeout(async () => {
      await fetchDocuments();
    }, 15000);

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
    const doc = state.documents.find((d) => d.id === id);
    if (!doc?.backendId) return false;
    try {
      await documentService.delete(doc.backendId);
      state.documents = state.documents.filter((d) => d.id !== id);
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
    const doc = state.documents.find((d) => d.id === id);
    if (!doc?.backendId) return false;

    const idx = state.documents.findIndex((d) => d.id === id);
    if (idx < 0) return false;

    if (changes.classification !== undefined) {
      const raw = changes.classification?.category;
      const categoryId = raw ? Number(raw) : null;

      console.log("classification raw:", raw, "→ categoryId:", categoryId);

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
    }

    state.documents[idx] = { ...state.documents[idx], ...changes };
    toast.success("Clasificación actualizada");
    return true;
  }



  async function downloadDocument(id: string): Promise<string | null> {
    const doc = state.documents.find((d) => d.id === id);
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

  async function previewDocument(id: string): Promise<string | null> {
    const doc = state.documents.find((d) => d.id === id);
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
    const imageDocs = state.documents.filter(
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
      state.documents = data.content.map((d) => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ""),
        ownerName: user.value?.name ?? "",
      }));
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
    const doc = state.documents.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      await documentService.share(doc.backendId, { email, permission });
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
    const doc = state.documents.find((d) => d.id === docId);
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

  // ── Helpers privados del árbol de carpetas ────────────────────────────────

  /**
   * FIX Bug 2: versión con Set de visitados para proteger contra ciclos
   * en datos corruptos de localStorage. Sin este fix, un ciclo A→B→A
   * causaría stack overflow.
   */
  function calculateFolderDepth(
    parentId?: string,
    visited = new Set<string>(),
  ): number {
    if (!parentId) return 0;
    if (visited.has(parentId)) return 0; // ciclo detectado: cortar recursión
    const parent = state.folders[parentId];
    if (!parent) return 0;
    visited.add(parentId);
    return 1 + calculateFolderDepth(parent.parentId, visited);
  }

  /**
   * FIX Bug 3: verifica si targetId es descendiente de folderId.
   * Evita que moveFolderTo cree ciclos al mover una carpeta dentro
   * de uno de sus propios descendientes.
   */
  function isDescendantOf(folderId: string, targetId: string): boolean {
    const visited = new Set<string>();
    let current: string | undefined = targetId;
    while (current) {
      if (visited.has(current)) break; // ciclo en datos: abortar
      visited.add(current);
      if (current === folderId) return true;
      current = state.folders[current]?.parentId;
    }
    return false;
  }

  /**
   * FIX Bug 4: retorna la altura del subárbol (niveles de hijos).
   * Altura 0 = hoja, 1 = un nivel de hijos, etc.
   * Necesario para verificar que mover un subárbol no viola MAX_FOLDER_DEPTH.
   */
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

  /**
   * FIX Bug 5: propaga el nuevo depth a todos los descendientes del folder
   * movido. Sin este fix, los hijos conservan su profundidad anterior.
   */
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

  // ── Carpetas ──────────────────────────────────────────────────────────────

  /**
   * FIX Bug 1: tercer paso con BFS para calcular depth correctamente.
   * BFS desde raíces garantiza que cada nodo se procesa después de su padre,
   * calculando la profundidad en O(n) sin recursión.
   */
  async function fetchFolders(): Promise<void> {
    if (!user.value) return;
    foldersLoading.value = true;
    try {
      const { data } = await documentService.listFolders();
      const mapped: Record<string, Folder> = {};

      // Paso 1: mapear todas (depth = 0, childFolders = [])
      data.forEach((f) => {
        const folder = mapBackendFolder(f);
        folder.ownerId = String(user.value!.id);
        mapped[folder.id] = folder;
      });

      // Paso 2: reconstruir childFolders
      data.forEach((f) => {
        if (f.parentId) {
          const parentKey = String(f.parentId);
          if (mapped[parentKey]) {
            mapped[parentKey].childFolders.push(String(f.id));
          }
        }
      });

      // Paso 3 (FIX Bug 1): calcular depth con BFS desde las raíces
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
      // fallback silencioso: usa localStorage
    } finally {
      foldersLoading.value = false;
    }
  }

  /**
   * FIX Bug 6: folder.depth se calcula en base al parentId real.
   */
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
      folder.depth = calculateFolderDepth(parentId); // FIX Bug 6

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
      // El backend desasocia los docs, actualizamos local
      state.documents
        .filter((d) => d.folderId === folderId)
        .forEach((d) => {
          d.folderId = undefined;
        });
      // Limpiar de childFolders del padre
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

  /**
   * FIX Bugs 3, 4 y 5 aplicados:
   * - isDescendantOf: evita ciclos al mover dentro de un descendiente
   * - getSubtreeHeight: valida la profundidad máxima del subárbol completo
   * - updateSubtreeDepth: propaga el nuevo depth a todos los descendientes
   */
  function moveFolderTo(folderId: string, newParentId?: string): boolean {
    const folder = state.folders[folderId];
    if (
      !folder ||
      folder.ownerId !== String(user.value?.id ?? "") ||
      newParentId === folderId
    )
      return false;

    // FIX Bug 3: evitar que el destino sea un descendiente del folder movido
    if (newParentId && isDescendantOf(folderId, newParentId)) {
      toast.warning("No se puede mover una carpeta dentro de sí misma");
      return false;
    }

    // FIX Bug 4: verificar que todo el subárbol cabe en el nuevo nivel
    const newDepth = calculateFolderDepth(newParentId);
    const subtreeHeight = getSubtreeHeight(folderId);
    if (newDepth + subtreeHeight >= MAX_FOLDER_DEPTH) {
      toast.warning("No se puede mover: se excede el límite de profundidad");
      return false;
    }

    // Desconectar del padre anterior
    if (folder.parentId && state.folders[folder.parentId]) {
      state.folders[folder.parentId].childFolders = state.folders[
        folder.parentId
      ].childFolders.filter((id) => id !== folderId);
    }

    // Actualizar parentId
    folder.parentId = newParentId;
    folder.updatedAt = new Date().toISOString();

    // Conectar al nuevo padre
    if (newParentId && state.folders[newParentId]) {
      state.folders[newParentId].childFolders.push(folderId);
    }

    // FIX Bug 5: propagar depth a todo el subárbol
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

  // ── Computed ─────────────────────────────────────────────────────────────

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

  // ── Getters de documentos ─────────────────────────────────────────────────

  function getMyDocuments(): Document[] {
    return state.documents.filter((d) => d.status !== "DELETED");
  }

  function getSharedWithMe(): Document[] {
    return sharedWithMeDocs.value;
  }

  function getDocument(id: string): Document | null {
    return state.documents.find((d) => d.id === id) ?? null;
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

  async function toggleFavorite(docId: string): Promise<boolean> {
    const doc = state.documents.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    try {
      const { data } = await documentService.toggleFavorite(doc.backendId);
      doc.isFavorite = data.isFavorite; // usa el valor confirmado por el backend
      toast.info(data.message);
      return true;
    } catch {
      toast.error("No se pudo actualizar favorito");
      return false;
    }
  }

  // ── Categorías ────────────────────────────────────────────────────────────

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
      // Desasocia en frontend los docs que tenían esta categoría
      state.documents.forEach((doc) => {
        if (doc.classification?.category === id) {
          doc.classification = { ...doc.classification, category: undefined };
        }
      });
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


  // ── Historial de búsqueda ─────────────────────────────────────────────────

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

  // ── Compartir ─────────────────────────────────────────────────────────────

  async function revokeAccess(docId: string, email: string): Promise<boolean> {
    const doc = state.documents.find((d) => d.id === docId);
    if (!doc?.backendId) return false;
    const shareLink = doc.shareLinks?.find((l) => l.id);
    try {
      if (shareLink) {
        await documentService.revokeShare(shareLink.id);
      }
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
    const doc = state.documents.find((d) => d.id === docId);
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
    const doc = state.documents.find((d) => d.id === docId);
    if (!doc?.shareLinks) return false;
    doc.shareLinks = doc.shareLinks.filter((l) => l.id !== linkId);
    toast.success("Enlace eliminado");
    return true;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    ...toRefs(state),
    folders: foldersWithCount,
    loading,
    error,
    totalElements,
    currentPage,
    fetchDocuments,
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
    updateCategory,
    updateDocument,
    fetchCategories,
  };
}

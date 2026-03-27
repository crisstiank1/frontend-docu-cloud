import { ref, computed } from "vue";
import {
  classificationService,
  type ClassificationStats,
} from "../services/classificationService";
import { useDocuments, type Document } from "./useDocuments";
import { useTags } from "./useTags";

// ── Tipo extendido para el módulo de clasificación ───────────────────────────
// Añade campos aplanados sin modificar el tipo base Document
export interface ClassifiedDocument extends Document {
  mimeType: string; // alias de doc.type
  tags: string[]; // aplanado desde doc.classification?.tags
  confidenceScore: number | null; // aplanado desde doc.classification?.confidence
}

// Mapeo puro — sin efectos secundarios
export function toClassifiedDocument(doc: Document): ClassifiedDocument {
  return {
    ...doc,
    mimeType: doc.type,
    tags: doc.classification?.tags ?? [],
    confidenceScore: doc.classification?.confidence ?? null,
  };
}

export function useClassification() {
  const {
    documents,
    categories,
    fetchDocuments,
    fetchDocumentsByCategory,
    fetchUnclassifiedDocuments,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateDocument,
    assignTagToDocument,
    removeTagFromDocument,
    totalElements,
    currentPage,
    totalPages,
    goToPage,
    viewDocuments,
    viewTotalElements,          
    viewCurrentPage,    
  } = useDocuments();

  const { tags, fetchTags, createTag, deleteTag } = useTags();

  // ── Stats reales del backend ─────────────────────────────────────────────────
  const stats = ref<ClassificationStats>({
    total: 0,
    classified: 0,
    pending: 0,
    failed: 0,
    categoriesCount: 0,
  });
  const loadingStats = ref(false);

  async function fetchStats(): Promise<void> {
    loadingStats.value = true;
    try {
      stats.value = await classificationService.getStats();
    } finally {
      loadingStats.value = false;
    }
  }

  // ── Documentos mapeados al tipo aplanado ─────────────────────────────────────
  // Classification.vue consume este computed, no documents directamente
  const classifiedDocuments = computed<ClassifiedDocument[]>(() =>
    documents.value.map(toClassifiedDocument),
  );

  const viewClassifiedDocuments = computed<ClassifiedDocument[]>(() =>
    viewDocuments.value.map(toClassifiedDocument)
  )

  // ── Pendientes (sobre los documentos ya mapeados) ────────────────────────────
  const pendingDocuments = computed<ClassifiedDocument[]>(() =>
    classifiedDocuments.value.filter((d) => !d.categoryId),
  );

  // ← NUEVO: fuente unificada según vista activa
  const activeView = ref<string | null>(null)

  const activeDocuments = computed<ClassifiedDocument[]>(() =>
    activeView.value !== null
      ? viewClassifiedDocuments.value
      : classifiedDocuments.value
  )

  const activeTotalElements = computed(() =>
    activeView.value !== null ? viewTotalElements.value : totalElements.value
  )

  const activeTotalPages = computed(() =>
    Math.ceil(activeTotalElements.value / 20)
  )

  // ← NUEVO: fetch unificado según categoría
  async function fetchByView(category: string | null, page = 0) {
    activeView.value = category
    if (!category) {
      await fetchDocuments(page)
    } else if (category === 'unclassified') {
      await fetchUnclassifiedDocuments(page)
    } else if (category === 'failed') {
      // filtra client-side sobre state.documents
      await fetchDocuments(page)
    } else {
      await fetchDocumentsByCategory(category, page)
    }
  }


  // ── Asignar categoría ────────────────────────────────────────────────────────
  // documentId es number (backendId), categoryId es string desde el select
  async function assignCategory(
    documentId: number,
    categoryId: string,
  ): Promise<void> {
    await classificationService.assignCategory(
      documentId,
      categoryId ? Number(categoryId) : null,
    );
    await Promise.all([fetchDocuments(), fetchStats(), fetchCategories()]);
  }

  // ── Wrappers que reciben ClassifiedDocument ──────────────────────────────────
  // Encapsulan la conversión string→number para que el componente no lo haga
  async function assignTagToClassifiedDocument(
    doc: ClassifiedDocument,
    tagId: number,
  ): Promise<boolean> {
    return assignTagToDocument(doc.id, tagId);
  }

  async function removeTagFromClassifiedDocument(
    doc: ClassifiedDocument,
    tagId: number,
  ): Promise<boolean> {
    return removeTagFromDocument(doc.id, tagId);
  }

  // ── Inicialización ───────────────────────────────────────────────────────────
  async function init(): Promise<void> {
    await Promise.all([
      fetchDocuments(),
      fetchCategories(),
      fetchTags(),
      fetchStats(),
    ]);
  }

  return {
    documents: activeDocuments,           
    categories,
    tags,
    stats,
    loadingStats,
    pendingDocuments,
    totalElements: activeTotalElements,   
    currentPage,
    totalPages: activeTotalPages,         
    init,
    fetchDocuments,
    fetchCategories,
    fetchTags,
    fetchByView,                          
    goToPage,
    assignCategory,
    updateDocument,
    assignTagToDocument: assignTagToClassifiedDocument,
    removeTagFromDocument: removeTagFromClassifiedDocument,
    addCategory,
    updateCategory,
    deleteCategory,
    createTag,
    deleteTag,
  }
}

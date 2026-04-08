import { ref, computed } from "vue";
import {
  classificationService,
  type ClassificationStats,
} from "../services/classificationService";
import { useDocuments, type Document } from "./useDocuments";
import { useTags } from "./useTags";

export interface ClassifiedDocument extends Document {
  mimeType: string;
  tags: string[];
  confidenceScore: number | null;
  thumbnailUrl?: string;
}

export function toClassifiedDocument(doc: Document): ClassifiedDocument {
  return {
    ...doc,
    mimeType: doc.type,
    tags: doc.classification?.tags ?? [],
    confidenceScore: doc.classification?.confidence ?? null,
    thumbnailUrl: doc.thumbnailUrl ?? undefined,
  };
}

export function useClassification() {
  const {
    documents,
    categories,
    fetchDocuments,
    fetchDocumentsByCategory,
    fetchUnclassifiedDocuments,
    fetchFailedDocuments,
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
    viewDocuments,
    viewTotalElements,
    viewCurrentPage,
  } = useDocuments();

  const { tags, fetchTags, createTag, deleteTag } = useTags();

  const stats = ref<ClassificationStats>({
    total: 0,
    classified: 0,
    pending: 0,
    failed: 0,
    categoriesCount: 0,
  });

  const loadingStats = ref(false);
  const activeView = ref<string | null>(null);

  async function fetchStats(): Promise<void> {
    loadingStats.value = true;
    try {
      stats.value = await classificationService.getStats();
    } finally {
      loadingStats.value = false;
    }
  }

  const classifiedDocuments = computed<ClassifiedDocument[]>(() =>
    documents.value.map(toClassifiedDocument)
  );

  const viewClassifiedDocuments = computed<ClassifiedDocument[]>(() =>
    viewDocuments.value.map(toClassifiedDocument)
  );

  const activeDocuments = computed<ClassifiedDocument[]>(() =>
    activeView.value !== null
      ? viewClassifiedDocuments.value
      : classifiedDocuments.value
  );

  const activeTotalElements = computed(() =>
    activeView.value !== null ? viewTotalElements.value : totalElements.value
  );

  const activeCurrentPage = computed(() =>
    activeView.value !== null ? viewCurrentPage.value : currentPage.value
  );

  const activeTotalPages = computed(() =>
    Math.ceil(activeTotalElements.value / 20)
  );

  const pendingDocuments = computed<ClassifiedDocument[]>(() =>
    activeDocuments.value.filter((d) => !d.categoryId)
  );

  async function fetchByView(category: string | null, page = 0) {
    activeView.value = category;

    if (!category) {
      await fetchDocuments(page);
      return;
    }

    if (category === "unclassified") {
      await fetchUnclassifiedDocuments(page);
      return;
    }

    if (category === "failed") {
      await fetchFailedDocuments(page);
      return;
    }

    await fetchDocumentsByCategory(category, page);
  }

  async function assignCategory(
    documentId: number,
    categoryId: string,
  ): Promise<void> {
    const allDocs = [...documents.value, ...viewDocuments.value];
    const doc = allDocs.find((d) => String(d.backendId) === String(documentId));

    if (!doc) {
      await classificationService.assignCategory(
        documentId,
        categoryId ? Number(categoryId) : null,
      );
    } else {
      await updateDocument(doc.id, {
        categoryId: categoryId ? Number(categoryId) : null,
        isAutomaticallyAssigned: false,
        classification: categoryId
          ? {
              ...(doc.classification ?? {}),
              category: categoryId,
              confidence: 0,
              tags: doc.classification?.tags ?? [],
            }
          : undefined,
      });
    }

    await Promise.all([fetchStats(), fetchCategories()]);

    if (activeView.value !== null) {
      await fetchByView(activeView.value, activeCurrentPage.value);
    } else {
      await fetchDocuments(activeCurrentPage.value);
    }
  }

  async function assignTagToClassifiedDocument(
    doc: ClassifiedDocument,
    tagId: number,
  ): Promise<boolean> {
    return assignTagToDocument(doc.id, tagId)
  }

  async function removeTagFromClassifiedDocument(
    doc: ClassifiedDocument,
    tagId: number,
  ): Promise<boolean> {
    return removeTagFromDocument(doc.id, tagId)
  }


  async function refreshCurrentView(): Promise<void> {
    await Promise.all([
      fetchStats(),
      fetchCategories(),
      activeView.value !== null
        ? fetchByView(activeView.value, activeCurrentPage.value)
        : fetchDocuments(currentPage.value),
    ]);
  }

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
  currentPage: activeCurrentPage,
  totalPages: activeTotalPages,
  init,
  fetchDocuments,
  fetchCategories,
  fetchTags,
  fetchByView,
  refreshCurrentView,
  assignCategory,
  updateDocument,
  assignTagToDocument: assignTagToClassifiedDocument,
  removeTagFromDocument: removeTagFromClassifiedDocument,
  addCategory,
  updateCategory,
  deleteCategory,
  createTag,
  deleteTag,
};
}
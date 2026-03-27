import api from "../config/api";

export interface ClassificationStats {
  total: number;
  classified: number;
  pending: number;
  failed: number;
  categoriesCount: number;
}

export const classificationService = {
  // ✅ CORREGIDO: ruta real del CategoryController
  async getStats(): Promise<ClassificationStats> {
    const { data } = await api.get<ClassificationStats>(
      "/api/categories/classification/stats",
    );
    return data;
  },

  // usa PATCH con categoryId en la ruta (asignar)
  // o DELETE si categoryId es null (quitar)
  async assignCategory(
    documentId: number,
    categoryId: number | null,
  ): Promise<void> {
    if (categoryId === null) {
      // Quitar categoría
      await api.delete(`/api/categories/documents/${documentId}`);
    } else {
      // Asignar categoría
      await api.patch(`/api/categories/${categoryId}/documents/${documentId}`);
    }
  },
};

import api from '../config/api'

export type DocumentStatus = 'PENDING_UPLOAD' | 'AVAILABLE' | 'DELETED'

export interface DocumentResponse {
  id: number
  fileName: string
  mimeType: string
  sizeBytes: number
  fileHash: string
  status: DocumentStatus
  folderId: number | null
  categoryId: number | null
  isAutomaticallyAssigned: boolean
  confidenceScore?: number;
  createdAt: string
  updatedAt: string
  isFavorite: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface InitUploadRequest {
  fileName: string
  mimeType: string
  sizeBytes: number
  folderId?: number
}

export interface InitUploadResponse {
  documentId: number
  uploadUrl: string
  expiresAt: string
  s3Key: string
}

export interface CompleteUploadRequest {
  fileHash: string
  sizeBytes: number
}

export interface ShareRequest {
  email?: string
  isPublic?: boolean
  password?: string
  expiresAt?: string
  permission?: 'view' | 'edit'
}

export interface DownloadUrlResponse {
  downloadUrl: string
  expiresAt: string
}

// ── Carpetas ──────────────────────────────────────────────────────────────────
export interface FolderResponse {
  id: number
  name: string
  parentId: number | null  // ← soporta subcarpetas
  createdAt: string
  updatedAt: string
}

export interface ShareEntry {
  id: string
  email: string
  permission: 'view' | 'edit'
  sharedAt: string
  ownerName?: string
  ownerEmail?: string
}

export interface SharedDocumentResponse extends DocumentResponse {
  ownerName: string
  ownerEmail: string
  permission: 'view' | 'edit'
  sharedAt: string
}

export interface UpdateMetadataRequest {
  fileName?: string
  categoryId?: number
  tags?: string[]
}

export interface CategoryResponse {
  id: number
  name: string
  color: string
  documentCount: number
}

export interface ToggleFavoriteResponse {
  documentId: number;
  isFavorite: boolean;
  message: string;
}


export const documentService = {
  // ── Documentos ──────────────────────────────────────────────────────────────

  list(page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents", {
      params: { page, size, sort: "createdAt,desc" },
    });
  },

  recent(size = 10) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents/recent", {
      params: { size, sort: "createdAt,desc" },
    });
  },

  search(params: {
    query?: string;
    mimeType?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents/search", {
      params,
    });
  },

  initUpload(data: InitUploadRequest) {
    return api.post<InitUploadResponse>("/api/documents/upload/init", data);
  },

  completeUpload(documentId: number, data: CompleteUploadRequest) {
    return api.post<void>(`/api/documents/${documentId}/upload/complete`, data);
  },

  getDownloadUrl(documentId: number) {
    return api.get<DownloadUrlResponse>(
      `/api/documents/${documentId}/download`,
    );
  },

  getPreviewUrl(documentId: number) {
    return api.get<DownloadUrlResponse>(`/api/documents/${documentId}/preview`);
  },

  delete(documentId: number) {
    return api.delete<void>(`/api/documents/${documentId}`);
  },

  share(docId: number, data: ShareRequest) {
    return api.put(`/api/documents/${docId}/share`, data);
  },

  revokeShare(shareId: string) {
    return api.delete<void>(`/api/documents/shares/${shareId}`);
  },

  accessShare(shareId: string, password?: string) {
    return api.get(`/api/documents/shares/${shareId}/access`, {
      params: password ? { password } : {},
    });
  },

  moveToFolder(docId: number, folderId: number) {
    return api.patch<DocumentResponse>(
      `/api/documents/${docId}/folder/${folderId}`,
    );
  },

  removeFromFolder(docId: number) {
    return api.delete<DocumentResponse>(`/api/documents/${docId}/folder`);
  },

  // ── Carpetas ─────────────────────────────────────────────────────────────────

  listFolders() {
    return api.get<FolderResponse[]>("/api/folders");
  },

  createFolder(name: string, parentId?: number) {
    return api.post<FolderResponse>("/api/folders", { name, parentId });
  },

  renameFolder(folderId: number, name: string) {
    return api.patch<FolderResponse>(`/api/folders/${folderId}`, { name });
  },

  deleteFolder(folderId: number) {
    return api.delete<void>(`/api/folders/${folderId}`);
  },

  getFolderDocuments(folderId: number, page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>(
      `/api/folders/${folderId}/documents`,
      { params: { page, size, sort: "createdAt,desc" } },
    );
  },

  // ── Compartidos ───────────────────────────────────────────────────────────────

  getSharedWithMe(page = 0, size = 50) {
    return api.get<PageResponse<DocumentResponse>>(
      "/api/documents/shared-with-me",
      {
        params: { page, size },
      },
    );
  },

  listShares(docId: number) {
    return api.get<ShareEntry[]>(`/api/documents/${docId}/shares`);
  },

  // ── Metadatos ─────────────────────────────────────────────────────────────────

  updateMetadata(docId: number, data: UpdateMetadataRequest) {
    return api.patch<DocumentResponse>(`/api/documents/${docId}`, data);
  },

  // ── Favoritos ─────────────────────────────────────────────────────────────────

  toggleFavorite(documentId: number) {
    return api.post<ToggleFavoriteResponse>(`/api/favorites/${documentId}`);
  },

  // ── Categorías ────────────────────────────────────────────────────────────────

  listCategories() {
    return api.get<CategoryResponse[]>("/api/categories");
  },

  createCategory(name: string, color: string) {
    return api.post<CategoryResponse>("/api/categories", { name, color });
  },

  updateCategory(categoryId: number, name: string, color: string) {
    return api.patch<CategoryResponse>(`/api/categories/${categoryId}`, {
      name,
      color,
    });
  },

  deleteCategory(categoryId: number) {
    return api.delete<void>(`/api/categories/${categoryId}`);
  },

  // ── Categorías — asignar/quitar en documento ──────────────────────────────────

  assignCategory(documentId: number, categoryId: number) {
    return api.patch<void>(
      `/api/documents/${documentId}/category/${categoryId}`,
    );
  },

  removeCategory(documentId: number) {
    return api.delete<void>(`/api/documents/${documentId}/category`);
  },
};

import api from "../config/api";
import type { SharedByMeDocument, Page } from "../types/sharing";

export type DocumentStatus =
  | "PENDING_UPLOAD"
  | "AVAILABLE"
  | "DELETED"
  | "FAILED";

export interface DocumentResponse {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileHash: string;
  status: DocumentStatus;
  folderId: number | null;
  categoryId: number | null;
  isAutomaticallyAssigned: boolean;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  tags?: { id: number; name: string }[];
  thumbnailUrl?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface InitUploadRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  folderId?: number;
}

export interface InitUploadResponse {
  documentId: number;
  uploadUrl: string;
  expiresAt: string;
  s3Key: string;
}

export interface CompleteUploadRequest {
  fileHash: string;
  sizeBytes: number;
}

export interface ShareRequest {
  permission: "READ" | "WRITE";
  recipientEmail?: string;
  password?: string;
  expiresDays?: number;
}

export interface ShareResponse {
  shareUrl: string;
  shareId: string;
  expiresAt: string | null;
}

export interface ShareSummaryResponse {
  id: string;
  documentId: number;
  fileName: string | null;
  permission: "READ" | "WRITE";
  hasPassword: boolean;
  revoked: boolean;
  usedCount: number;
  recipientEmail: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface FolderResponse {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareEntry {
  id: string;
  email: string;
  permission: "READ" | "WRITE";
  sharedAt: string;
  ownerName?: string;
  ownerEmail?: string;
}

export interface SharedDocumentResponse extends DocumentResponse {
  ownerName: string;
  ownerEmail: string;
  permission: "READ" | "WRITE";
  sharedAt: string;
  thumbnailUrl: string | null;
}

export interface UpdateMetadataRequest {
  fileName?: string;
  categoryId?: number;
  tags?: string[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  documentCount: number;
}

export interface ToggleFavoriteResponse {
  documentId: number;
  isFavorite: boolean;
  message: string;
}

export interface FavoriteResponse {
  documentId: number;
  documentName: string;
  fileType: string;
  sizeBytes: number;
  folderId: number | null;
  folderName: string | null;
  favoritedAt: string;
  categoryNames: string[];
}

export const documentService = {
  // ── Archivos ───────────────────────────────────────────────────────────────

  list(page = 0, size = 20, categoryId?: number) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents", {
      params: {
        page,
        size,
        sort: "createdAt,desc",
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
    });
  },

  listUnclassified(page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents", {
      params: {
        unclassified: true,
        page,
        size,
        sort: "createdAt,desc",
      },
    });
  },

  recent(size = 10) {
    return api.get<PageResponse<DocumentResponse>>("/api/documents/recent", {
      params: { size, sort: "createdAt,desc" },
    });
  },

  listFailed(page = 0, size = 20) {
  return api.get<PageResponse<DocumentResponse>>("/api/documents/failed", {
    params: {
      page,
      size,
      sort: "updatedAt,desc",
    },
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
    return api.put<ShareResponse>(`/api/documents/${docId}/share`, data);
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

  // ── Carpetas ──────────────────────────────────────────────────────────────────

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
    return api.get<PageResponse<SharedDocumentResponse>>(
      "/api/documents/shares/received",
      { params: { page, size } },
    );
  },

  removeSharedWithMe(shareId: string) {
    return api.delete<void>(`/api/documents/shares/received/${shareId}`);
  },

  getWriteUrlForRecipient(shareId: string, mimeType: string) {
    return api.get<{ url: string; expiresAt: string }>(
      `/api/documents/shares/received/${shareId}/write-url`,
      { params: { mimeType } },
    );
  },

  listShares(docId: number) {
    return api.get<ShareSummaryResponse[]>(`/api/documents/${docId}/shares`);
  },

  // ✅ CORREGIDO: import de tipos + prefijo /api/
  getSharedByMe(page = 0, size = 20) {
    return api.get<Page<SharedByMeDocument>>("/api/documents/shared-by-me", {
      params: { page, size, sort: "createdAt,desc" },
    });
  },

  // ── Metadatos ─────────────────────────────────────────────────────────────────

  updateMetadata(docId: number, data: UpdateMetadataRequest) {
    return api.patch<DocumentResponse>(`/api/documents/${docId}`, data);
  },

  // ── Favoritos ─────────────────────────────────────────────────────────────────

  toggleFavorite(documentId: number) {
    return api.post<ToggleFavoriteResponse>(`/api/favorites/${documentId}`);
  },

  getFavorites(categoryId?: number) {
    return api.get<FavoriteResponse[]>("/api/favorites", {
      params: categoryId !== undefined ? { categoryId } : {},
    });
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

  getById(documentId: number) {
  return api.get<DocumentResponse>(`/api/documents/${documentId}`);
  },

  assignCategory(documentId: number, categoryId: number | null) {
    return api.put<void>(`/api/documents/${documentId}/category`, {
      categoryId,
    });
  },

  removeCategory(documentId: number) {
    return api.put<void>(`/api/documents/${documentId}/category`, {
      categoryId: null,
    });
  },

  // ── Tags ──────────────────────────────────────────────────────────────────────

  addTagToDocument(documentId: number, tagId: number) {
    return api.put<void>(`/api/documents/${documentId}/tags/${tagId}`);
  },

  removeTagFromDocument(documentId: number, tagId: number) {
    return api.delete<void>(`/api/documents/${documentId}/tags/${tagId}`);
  },

  getDocumentTags(documentId: number) {
    return api.get<{ id: number; name: string }[]>(
      `/api/documents/${documentId}/tags`,
    );
  },
};

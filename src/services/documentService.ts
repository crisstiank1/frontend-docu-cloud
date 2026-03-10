import api from '../config/api'

export type DocumentStatus = 'PENDING_UPLOAD' | 'ACTIVE' | 'DELETED'

export interface DocumentResponse {
  id: number
  fileName: string
  mimeType: string
  sizeBytes: number
  fileHash: string
  status: DocumentStatus
  folderId: number | null
  createdAt: string
  updatedAt: string
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

export const documentService = {

  // ── Documentos ──────────────────────────────────────────────────────────────

  list(page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>('/api/documents', {
      params: { page, size, sort: 'createdAt,desc' }
    })
  },

  recent(size = 10) {
    return api.get<PageResponse<DocumentResponse>>('/api/documents/recent', {
      params: { size, sort: 'createdAt,desc' }
    })
  },

  search(params: {
    query?: string
    mimeType?: string
    status?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
  }) {
    return api.get<PageResponse<DocumentResponse>>('/api/documents/search', { params })
  },

  initUpload(data: InitUploadRequest) {
    return api.post<InitUploadResponse>('/api/documents/upload/init', data)
  },

  completeUpload(documentId: number, data: CompleteUploadRequest) {
    return api.post<void>(`/api/documents/${documentId}/upload/complete`, data)
  },

  getDownloadUrl(documentId: number) {
    return api.get<DownloadUrlResponse>(`/api/documents/${documentId}/download`)
  },

  delete(documentId: number) {
    return api.delete<void>(`/api/documents/${documentId}`)
  },

  share(docId: number, data: ShareRequest) {
    return api.put(`/api/documents/${docId}/share`, data)
  },

  revokeShare(shareId: string) {
    return api.delete<void>(`/api/documents/shares/${shareId}`)
  },

  accessShare(shareId: string, password?: string) {
    return api.get(`/api/documents/shares/${shareId}/access`, {
      params: password ? { password } : {}
    })
  },

  moveToFolder(docId: number, folderId: number) {
    return api.patch<DocumentResponse>(`/api/documents/${docId}/folder/${folderId}`)
  },

  removeFromFolder(docId: number) {
    return api.delete<DocumentResponse>(`/api/documents/${docId}/folder`)
  },

  // ── Carpetas ─────────────────────────────────────────────────────────────────

  listFolders() {
    return api.get<FolderResponse[]>('/api/folders')
  },

  createFolder(name: string, parentId?: number) {
    return api.post<FolderResponse>('/api/folders', { name, parentId })
  },

  renameFolder(folderId: number, name: string) {
    return api.patch<FolderResponse>(`/api/folders/${folderId}`, { name })
  },

  deleteFolder(folderId: number) {
    return api.delete<void>(`/api/folders/${folderId}`)
  },

  getFolderDocuments(folderId: number, page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>(
      `/api/folders/${folderId}/documents`,
      { params: { page, size, sort: 'createdAt,desc' } }
    )
  }
}

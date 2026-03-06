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
  presignedUrl: string
}

export interface CompleteUploadRequest {
  fileHash: string
}

export interface ShareRequest {
  email?: string
  isPublic?: boolean
  password?: string
  expiresAt?: string
  permission?: 'view' | 'edit'
}

export const documentService = {

  // Listar documentos paginados
  list(page = 0, size = 20) {
    return api.get<PageResponse<DocumentResponse>>('/api/documents', {
      params: { page, size, sort: 'createdAt,desc' }
    })
  },

  // Documentos recientes
  recent(size = 10) {
    return api.get<PageResponse<DocumentResponse>>('/api/documents/recent', {
      params: { size, sort: 'createdAt,desc' }
    })
  },

  // Buscar documentos
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

  // Iniciar upload (obtiene presigned URL de S3)
  initUpload(data: InitUploadRequest) {
    return api.post<InitUploadResponse>('/api/documents/upload/init', data)
  },

  // Confirmar que el upload a S3 terminó
  completeUpload(documentId: number, data: CompleteUploadRequest) {
    return api.post<void>(`/api/documents/${documentId}/upload/complete`, data)
  },

  // Obtener URL de descarga
  getDownloadUrl(documentId: number) {
    return api.get<{ url: string }>(`/api/documents/${documentId}/download`)
  },

  // Eliminar documento
  delete(documentId: number) {
    return api.delete<void>(`/api/documents/${documentId}`)
  },

  // Compartir documento
  share(docId: number, data: ShareRequest) {
    return api.put(`/api/documents/${docId}/share`, data)
  },

  // Revocar acceso compartido
  revokeShare(shareId: string) {
    return api.delete<void>(`/api/documents/shares/${shareId}`)
  },

  // Acceder a documento compartido por enlace
  accessShare(shareId: string, password?: string) {
    return api.get(`/api/documents/shares/${shareId}/access`, {
      params: password ? { password } : {}
    })
  },

  // Mover a carpeta
  moveToFolder(docId: number, folderId: number) {
    return api.patch<DocumentResponse>(`/api/documents/${docId}/folder/${folderId}`)
  },

  // Quitar de carpeta
  removeFromFolder(docId: number) {
    return api.delete<DocumentResponse>(`/api/documents/${docId}/folder`)
  }
}

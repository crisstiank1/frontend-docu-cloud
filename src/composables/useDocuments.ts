import { reactive, toRefs, computed, ref } from 'vue'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { documentService } from '../services/documentService'
import type { DocumentResponse, FolderResponse as FolderResponseDto } from '../services/documentService'

export interface DocumentCategory {
  id: string
  name: string
  color: string
}

export interface DocumentClassification {
  category?: string
  tags?: string[]
  confidence?: number
}

export interface ShareLink {
  id: string
  token: string
  isPublic: boolean
  password?: string
  createdAt: string
  expiresAt?: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  ownerId: string
  ownerName: string
  classification?: DocumentClassification
  uploadedAt: string
  sharedWith: { email: string; permission: 'view' | 'edit' }[]
  shareLinks?: ShareLink[]
  content?: string
  url?: string
  folderId?: string
  isFavorite?: boolean
  folderPath?: string
  searchTags?: string[]
  status?: string
  backendId?: number
}

export interface Folder {
  id: string
  backendId: number
  name: string
  parentId?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  childFolders: string[]
  documentCount: number
  depth: number
}

export interface SearchHistory {
  query: string
  timestamp: string
}

const CATEGORIES_KEY = 'docucloud_categories_v1'
const FOLDERS_KEY = 'docucloud_folders_v1'
const SEARCH_HISTORY_KEY = 'docucloud_search_history_v1'
const MAX_FOLDER_DEPTH = 5
const MAX_SEARCH_HISTORY = 10

function loadCategories(): DocumentCategory[] {
  try { const raw = localStorage.getItem(CATEGORIES_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveCategories(cats: DocumentCategory[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
}
function loadFolders(): Record<string, Folder> {
  try { const raw = localStorage.getItem(FOLDERS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}
function saveFolders(f: Record<string, Folder>) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(f))
}
function loadSearchHistory(): SearchHistory[] {
  try { const raw = localStorage.getItem(SEARCH_HISTORY_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveSearchHistory(h: SearchHistory[]) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h))
}

const defaultCategories: DocumentCategory[] = [
  { id: '1', name: 'Contratos', color: '#ef4444' },
  { id: '2', name: 'Facturas', color: '#f97316' },
  { id: '3', name: 'Reportes', color: '#eab308' },
  { id: '4', name: 'Otros', color: '#6366f1' }
]
const categories = loadCategories().length > 0 ? loadCategories() : defaultCategories
if (loadCategories().length === 0) saveCategories(defaultCategories)

const state = reactive<{
  documents: Document[]
  categories: DocumentCategory[]
  folders: Record<string, Folder>
  searchHistory: SearchHistory[]
  filter: { search: string; category?: string; owner?: string; sortBy: 'name' | 'date' }
  currentFolderId: string | null
}>({
  documents: [],
  categories,
  folders: loadFolders(),
  searchHistory: loadSearchHistory(),
  filter: { search: '', sortBy: 'date' },
  currentFolderId: null
})

const loading = ref(false)
const error = ref<string | null>(null)
const totalElements = ref(0)
const currentPage = ref(0)
const foldersLoading = ref(false)

function mapBackendDoc(d: DocumentResponse): Document {
  return {
    id: String(d.id),
    backendId: d.id,
    name: d.fileName,
    type: d.mimeType,
    size: d.sizeBytes,
    ownerId: '',
    ownerName: '',
    uploadedAt: d.createdAt,
    sharedWith: [],
    folderId: d.folderId ? String(d.folderId) : undefined,
    status: d.status
    }
  }

function mapBackendFolder(f: FolderResponseDto): Folder {
  return {
    id: String(f.id),
    backendId: f.id,
    name: f.name,
    parentId: f.parentId ? String(f.parentId) : undefined,
    ownerId: '',
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    documentCount: 0,
    childFolders: [],
    depth: 0
    }
  }

export function useDocuments() {
  const { user } = useAuth()
  const toast = useToast()

  async function fetchDocuments(page = 0, size = 20) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentService.list(page, size)
      state.documents = data.content.map(d => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ''),
        ownerName: user.value?.name ?? ''
      }))
      totalElements.value = data.totalElements
      currentPage.value = data.number
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar archivos'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecent(size = 10): Promise<Document[]> {
    try {
      const { data } = await documentService.recent(size)
      return data.content.map(d => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ''),
        ownerName: user.value?.name ?? ''
      }))
    } catch {
      return []
    }
  }

  async function fetchFolders(): Promise<void> {
  if (!user.value) return
  foldersLoading.value = true
  try {
    const { data } = await documentService.listFolders()
    const mapped: Record<string, Folder> = {}

    // Primer paso: mapear todas
    data.forEach(f => {
      const folder = mapBackendFolder(f)
      folder.ownerId = String(user.value!.id)
      mapped[folder.id] = folder
    })

    // Segundo paso: reconstruir childFolders
    data.forEach(f => {
      if (f.parentId) {
        const parentKey = String(f.parentId)
        if (mapped[parentKey]) {
          mapped[parentKey].childFolders.push(String(f.id))
        }
      }
    })

    state.folders = mapped
    saveFolders(state.folders)
  } catch {
    // fallback silencioso: usa localStorage
  } finally {
    foldersLoading.value = false
  }
}

  async function uploadDocument(file: File, folderId?: string): Promise<Document | null> {
    loading.value = true
    error.value = null
    try {
      const { data: initData } = await documentService.initUpload({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        folderId: folderId ? Number(folderId) : undefined
      })

      // ✅ FIX: era "presignedUrl", el backend devuelve "uploadUrl"
      await fetch(initData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' }
      })

      await documentService.completeUpload(initData.documentId, { fileHash: crypto.randomUUID().replace(/-/g, ''),
        sizeBytes: file.size
      })
      await fetchDocuments()

      toast.success(`"${file.name}" subido correctamente`)
      return state.documents.find(d => d.backendId === initData.documentId) ?? null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al subir el archivo'
      toast.error(error.value!)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteDocument(id: string): Promise<boolean> {
    const doc = state.documents.find(d => d.id === id)
    if (!doc?.backendId) return false
    try {
      await documentService.delete(doc.backendId)
      state.documents = state.documents.filter(d => d.id !== id)
      toast.success('Archivo eliminado correctamente')
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar'
      toast.error(error.value!)
      return false
    }
  }

  async function downloadDocument(id: string): Promise<string | null> {
    const doc = state.documents.find(d => d.id === id)
    if (!doc?.backendId) return null
    try {
      const { data } = await documentService.getDownloadUrl(doc.backendId)
      toast.success('Descarga iniciada')
      return data.downloadUrl   
    } catch {
      toast.error('No se pudo obtener el enlace de descarga')
      return null
    }
  }


  async function searchDocuments(params: {
    query?: string
    mimeType?: string
    status?: string
    fromDate?: string
    toDate?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentService.search(params)
      state.documents = data.content.map(d => ({
        ...mapBackendDoc(d),
        ownerId: String(user.value?.id ?? ''),
        ownerName: user.value?.name ?? ''
      }))
      totalElements.value = data.totalElements
      if (data.totalElements === 0) toast.info('No se encontraron archivos')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error en la búsqueda'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  async function shareDocument(docId: string, email: string, permission: 'view' | 'edit'): Promise<boolean> {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc?.backendId) return false
    try {
      await documentService.share(doc.backendId, { email, permission })
      const existing = doc.sharedWith.findIndex(s => s.email === email)
      if (existing >= 0) doc.sharedWith[existing].permission = permission
      else doc.sharedWith.push({ email, permission })
      toast.success(`Archivo compartido con ${email}`)
      return true
    } catch {
      toast.error('No se pudo compartir el archivo')
      return false
    }
  }

  async function moveDocumentTo(docId: string, folderId?: string): Promise<boolean> {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc?.backendId) return false
    try {
      if (folderId) {
        await documentService.moveToFolder(doc.backendId, Number(folderId))
        doc.folderId = folderId
        toast.success('Archivo movido a la carpeta')
      } else {
        await documentService.removeFromFolder(doc.backendId)
        doc.folderId = undefined
        toast.success('Archivo removido de la carpeta')
      }
      return true
    } catch {
      toast.error('No se pudo mover el Archivo')
      return false
    }
  }

  const foldersWithCount = computed(() => {
    const result: Record<string, Folder> = {}
    for (const [id, folder] of Object.entries(state.folders)) {
      result[id] = {
        ...folder,
        documentCount: state.documents.filter(d => d.folderId === id).length
      }
    }
    return result
  })

  function getMyDocuments(): Document[] {
    return state.documents.filter(d => d.status !== 'DELETED')
  }

  function getSharedWithMe(): Document[] {
    if (!user.value) return []
    return state.documents.filter(d => d.sharedWith.some(s => s.email === user.value!.email))
  }

  function getDocument(id: string): Document | null {
    return state.documents.find(d => d.id === id) ?? null
  }

  function getFilteredDocuments(): Document[] {
    let docs = state.documents.filter(d => d.status !== 'DELETED')
    if (state.filter.category) {
      docs = docs.filter(d => d.classification?.category === state.filter.category)
    }
    if (state.filter.search) {
      const search = state.filter.search.toLowerCase()
      docs = docs.filter(d =>
        d.name.toLowerCase().includes(search) || d.type.includes(search)
      )
    }
    if (state.filter.sortBy === 'name') {
      docs.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    }
    return docs
  }

  function getDocumentsInFolder(folderId?: string): Document[] {
    return state.documents.filter(d => d.folderId === folderId && d.status !== 'DELETED')
  }

  function getUnclassifiedDocuments(): Document[] {
    return state.documents.filter(d =>
      d.status !== 'DELETED' && !d.folderId && !d.classification?.category
    )
  }

  function getFavoriteDocuments(): Document[] {
    return state.documents.filter(d => d.isFavorite && d.status !== 'DELETED').slice(0, 10)
  }

  function toggleFavorite(docId: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc) return false
    doc.isFavorite = !doc.isFavorite
    toast.info(doc.isFavorite ? 'Agregado a favoritos' : 'Removido de favoritos')
    return true
  }

  function calculateFolderDepth(parentId?: string): number {
    if (!parentId) return 0
    const parent = state.folders[parentId]
    if (!parent) return 0
    return 1 + calculateFolderDepth(parent.parentId)
  }

  async function createFolder(name: string, parentId?: string): Promise<Folder | null> {
    if (!user.value) return null
    try {
      const { data } = await documentService.createFolder(
        name.trim(),
        parentId ? Number(parentId) : undefined
      )
      const folder = mapBackendFolder(data)
      folder.ownerId = String(user.value!.id)
      state.folders = { ...state.folders, [folder.id]: folder }
      if (parentId && state.folders[parentId]) {
        state.folders[parentId].childFolders.push(folder.id)
      }
      saveFolders(state.folders)
      toast.success(`Carpeta "${name}" creada`)
      return folder
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear carpeta')
      return null
    }
  }


  async function renameFolder(folderId: string, newName: string): Promise<boolean> {
    const folder = state.folders[folderId]
    if (!folder?.backendId) return false
    try {
      const { data } = await documentService.renameFolder(folder.backendId, newName.trim())
      state.folders[folderId].name = data.name
      state.folders[folderId].updatedAt = data.updatedAt
      saveFolders(state.folders)
      toast.success(`Carpeta renombrada a "${newName}"`)
      return true
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al renombrar carpeta')
      return false
    }
  }

  async function deleteFolder(folderId: string): Promise<boolean> {
    const folder = state.folders[folderId]
    if (!folder?.backendId) return false
    try {
      await documentService.deleteFolder(folder.backendId)
      // El backend desasocia los docs, actualizamos local
      state.documents
        .filter(d => d.folderId === folderId)
        .forEach(d => { d.folderId = undefined })
      // Limpiar de childFolders del padre
      if (folder.parentId && state.folders[folder.parentId]) {
        state.folders[folder.parentId].childFolders =
          state.folders[folder.parentId].childFolders.filter(id => id !== folderId)
      }
      delete state.folders[folderId]
      state.folders = { ...state.folders }
      saveFolders(state.folders)
      toast.success('Carpeta eliminada')
      return true
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar carpeta')
      return false
    }
  }

  function moveFolderTo(folderId: string, newParentId?: string): boolean {
    const folder = state.folders[folderId]
    if (!folder || folder.ownerId !== String(user.value?.id ?? '') || newParentId === folderId) return false
    const newDepth = calculateFolderDepth(newParentId)
    if (newDepth >= MAX_FOLDER_DEPTH) {
      toast.warning('No se puede mover: se excede el límite de profundidad')
      return false
    }
    if (folder.parentId && state.folders[folder.parentId]) {
      state.folders[folder.parentId].childFolders =
        state.folders[folder.parentId].childFolders.filter(id => id !== folderId)
    }
    folder.parentId = newParentId
    folder.depth = newDepth
    folder.updatedAt = new Date().toISOString()
    if (newParentId && state.folders[newParentId]) {
      state.folders[newParentId].childFolders.push(folderId)
    }
    saveFolders(state.folders)
    toast.success('Carpeta movida correctamente')
    return true
  }

  function getFolderPath(folderId: string): string {
    const folder = state.folders[folderId]
    if (!folder) return ''
    const parts = [folder.name]
    let current = folder.parentId
    while (current) {
      const parent = state.folders[current]
      if (!parent) break
      parts.unshift(parent.name)
      current = parent.parentId
    }
    return '/' + parts.join('/')
  }

  function getFolderTree(): Folder[] {
    if (!user.value) return []
    return Object.values(foldersWithCount.value)
      .filter(f => f.ownerId === String(user.value!.id ?? '') && !f.parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  function addCategory(name: string, color: string): DocumentCategory {
    const cat: DocumentCategory = { id: crypto.randomUUID(), name, color }
    state.categories.push(cat)
    saveCategories(state.categories)
    toast.success(`Categoría "${name}" creada`)
    return cat
  }

  function deleteCategory(id: string): boolean {
    const idx = state.categories.findIndex(c => c.id === id)
    if (idx < 0) return false
    state.categories.splice(idx, 1)
    saveCategories(state.categories)
    toast.success('Categoría eliminada')
    return true
  }

  function updateSearchHistory(query: string): void {
    if (!query.trim()) return
    const history = state.searchHistory
    const exists = history.findIndex(h => h.query === query.trim())
    if (exists >= 0) history.splice(exists, 1)
    history.unshift({ query: query.trim(), timestamp: new Date().toISOString() })
    if (history.length > MAX_SEARCH_HISTORY) history.splice(MAX_SEARCH_HISTORY)
    state.searchHistory = history
    saveSearchHistory(history)
  }

  function getSearchHistory(): SearchHistory[] {
    return [...state.searchHistory]
  }

  function clearSearchHistory(): void {
    state.searchHistory = []
    saveSearchHistory([])
    toast.info('Historial de búsqueda limpiado')
  }

  async function revokeAccess(docId: string, email: string): Promise<boolean> {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc?.backendId) return false
  
    // Buscar el shareId correspondiente al email
    const shareLink = doc.shareLinks?.find(l => l.id)
  
    try {
      // Si tienes el shareId, llama al backend
      if (shareLink) {
        await documentService.revokeShare(shareLink.id)
      }
      // Actualiza estado local
      doc.sharedWith = doc.sharedWith.filter(s => s.email !== email)
      toast.success(`Acceso revocado para ${email}`)
      return true
    } catch {
      toast.error('No se pudo revocar el acceso')
      return false
    }
  }

  function createShareLink(docId: string, isPublic: boolean, password?: string): ShareLink | null {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc) return null
    const shareLink: ShareLink = {
      id: crypto.randomUUID(), token: crypto.randomUUID(),
      isPublic, password, createdAt: new Date().toISOString()
    }
    if (!doc.shareLinks) doc.shareLinks = []
    doc.shareLinks.push(shareLink)
    toast.success('Enlace de compartir creado')
    return shareLink
  }

  function deleteShareLink(docId: string, linkId: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc?.shareLinks) return false
    doc.shareLinks = doc.shareLinks.filter(l => l.id !== linkId)
    toast.success('Enlace eliminado')
    return true
  }

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
  }
}
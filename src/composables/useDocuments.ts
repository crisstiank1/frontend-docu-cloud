import { reactive, toRefs, computed } from 'vue'
import { useAuth } from './useAuth'

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
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  childFolders: string[]
  documentCount: number
  depth: number
}

export interface SearchFilter {
  query: string
  type?: string
  category?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface SearchHistory {
  query: string
  timestamp: string
}

const DOCUMENTS_KEY = 'docucloud_documents_v1'
const CATEGORIES_KEY = 'docucloud_categories_v1'
const FOLDERS_KEY = 'docucloud_folders_v1'
const SEARCH_HISTORY_KEY = 'docucloud_search_history_v1'
const MAX_FOLDER_DEPTH = 5
const MAX_SEARCH_HISTORY = 10

function loadDocuments(): Record<string, Document> {
  try { const raw = localStorage.getItem(DOCUMENTS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}

function saveDocuments(docs: Record<string, Document>) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs))
}

function loadCategories(): DocumentCategory[] {
  try { const raw = localStorage.getItem(CATEGORIES_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function saveCategories(cats: DocumentCategory[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
}

function loadFolders(): Record<string, Folder> {
  try { const raw = localStorage.getItem(FOLDERS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}

function saveFolders(folders: Record<string, Folder>) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
}

function loadSearchHistory(): SearchHistory[] {
  try { const raw = localStorage.getItem(SEARCH_HISTORY_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function saveSearchHistory(history: SearchHistory[]) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
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
  documents: Object.values(loadDocuments()),
  categories: categories,
  folders: loadFolders(),
  searchHistory: loadSearchHistory(),
  filter: { search: '', sortBy: 'date' },
  currentFolderId: null
})

export function useDocuments() {
  const { user } = useAuth()

  // ✅ documentCount calculado dinámicamente — nunca se desincroniza
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

  function addDocument(doc: Omit<Document, 'id' | 'uploadedAt'> & { content?: string }): Document {
    const id = crypto.randomUUID()
    const newDoc: Document = { ...doc, id, uploadedAt: new Date().toISOString() }
    const docs = loadDocuments()
    docs[id] = newDoc
    saveDocuments(docs)
    state.documents.push(newDoc)
    return newDoc
  }

  function updateDocument(id: string, updates: Partial<Document>): boolean {
    const docs = loadDocuments()
    if (!docs[id]) return false
    docs[id] = { ...docs[id], ...updates }
    saveDocuments(docs)
    const idx = state.documents.findIndex(d => d.id === id)
    if (idx >= 0) state.documents[idx] = docs[id]
    return true
  }

  function deleteDocument(id: string): boolean {
    const docs = loadDocuments()
    if (!docs[id]) return false
    delete docs[id]
    saveDocuments(docs)
    state.documents = state.documents.filter(d => d.id !== id)
    return true
  }

  function getDocument(id: string): Document | null {
    const fresh = loadDocuments()
    return fresh[id] ?? state.documents.find(d => d.id === id) ?? null
  }

  function getMyDocuments(): Document[] {
    if (!user.value) return []
    return state.documents.filter(d => d.ownerId === user.value!.id)
  }

  function getSharedWithMe(): Document[] {
    if (!user.value) return []
    return state.documents.filter(d => d.sharedWith.some(s => s.email === user.value!.email))
  }

  function shareDocument(docId: string, email: string, permission: 'view' | 'edit'): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return false
    const existing = doc.sharedWith.findIndex(s => s.email === email)
    if (existing >= 0) {
      doc.sharedWith[existing].permission = permission
    } else {
      doc.sharedWith.push({ email, permission })
    }
    updateDocument(docId, doc)
    return true
  }

  function revokeAccess(docId: string, email: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return false
    doc.sharedWith = doc.sharedWith.filter(s => s.email !== email)
    updateDocument(docId, doc)
    return true
  }

  function createShareLink(docId: string, isPublic: boolean, password?: string): ShareLink | null {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return null

    const shareLink: ShareLink = {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      isPublic,
      password: password || undefined,
      createdAt: new Date().toISOString()
    }

    if (!doc.shareLinks) doc.shareLinks = []
    doc.shareLinks.push(shareLink)
    updateDocument(docId, doc)
    return shareLink
  }

  function deleteShareLink(docId: string, linkId: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return false
    if (!doc.shareLinks) return false
    doc.shareLinks = doc.shareLinks.filter(l => l.id !== linkId)
    updateDocument(docId, doc)
    return true
  }

  function addCategory(name: string, color: string): DocumentCategory {
    const cat: DocumentCategory = { id: crypto.randomUUID(), name, color }
    state.categories.push(cat)
    saveCategories(state.categories)
    return cat
  }

  function deleteCategory(id: string): boolean {
    const idx = state.categories.findIndex(c => c.id === id)
    if (idx < 0) return false
    state.categories.splice(idx, 1)
    saveCategories(state.categories)
    state.documents.forEach(doc => {
      if (doc.classification?.category === id) {
        doc.classification.category = undefined
        updateDocument(doc.id, doc)
      }
    })
    return true
  }

  function getFilteredDocuments(): Document[] {
    let docs = state.documents.filter(d =>
      d.ownerId === user.value?.id ||
      d.sharedWith.some(s => s.email === user.value?.email)
    )

    if (state.filter.category) {
      docs = docs.filter(d => d.classification?.category === state.filter.category)
    }
    if (state.filter.search) {
      const search = state.filter.search.toLowerCase()
      docs = docs.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.type.includes(search)
      )
    }
    if (state.filter.owner) {
      docs = docs.filter(d => d.ownerId === state.filter.owner)
    }
    if (state.filter.sortBy === 'name') {
      docs.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    }
    return docs
  }

  function calculateFolderDepth(parentId?: string): number {
    if (!parentId) return 0
    const parent = state.folders[parentId]
    if (!parent) return 0
    return 1 + calculateFolderDepth(parent.parentId)
  }

  function createFolder(name: string, parentId?: string): Folder | null {
    if (!user.value) return null
    const depth = calculateFolderDepth(parentId)
    if (depth >= MAX_FOLDER_DEPTH) return null

    const folderId = crypto.randomUUID()
    const now = new Date().toISOString()

    const folder: Folder = {
      id: folderId,
      name: name.trim(),
      parentId,
      ownerId: user.value.id,
      createdAt: now,
      updatedAt: now,
      childFolders: [],
      documentCount: 0, // será sobreescrito por foldersWithCount
      depth
    }

    state.folders = { ...state.folders, [folderId]: folder }

    if (parentId && state.folders[parentId]) {
      state.folders = {
        ...state.folders,
        [parentId]: {
          ...state.folders[parentId],
          childFolders: [...state.folders[parentId].childFolders, folderId],
          updatedAt: now
        }
      }
    }

    saveFolders(state.folders)
    return folder
  }

  function renameFolder(folderId: string, newName: string): boolean {
    const folder = state.folders[folderId]
    if (!folder || folder.ownerId !== user.value?.id) return false
    folder.name = newName.trim()
    folder.updatedAt = new Date().toISOString()
    saveFolders(state.folders)
    return true
  }

  function deleteFolder(folderId: string): boolean {
    const folder = state.folders[folderId]
    if (!folder || folder.ownerId !== user.value?.id) return false

    const docsInFolder = state.documents.filter(d => d.folderId === folderId)
    const realSubfolders = folder.childFolders.filter(childId => state.folders[childId])

    if (realSubfolders.length !== folder.childFolders.length) {
      folder.childFolders = realSubfolders
      saveFolders(state.folders)
    }

    if (docsInFolder.length > 0 || realSubfolders.length > 0) return false

    if (folder.parentId && state.folders[folder.parentId]) {
      state.folders[folder.parentId].childFolders =
        state.folders[folder.parentId].childFolders.filter(id => id !== folderId)
      state.folders[folder.parentId].updatedAt = new Date().toISOString()
    }

    delete state.folders[folderId]
    state.folders = { ...state.folders }
    saveFolders(state.folders)
    return true
  }

  function moveFolderTo(folderId: string, newParentId?: string): boolean {
    const folder = state.folders[folderId]
    if (!folder || folder.ownerId !== user.value?.id) return false
    if (newParentId === folderId) return false

    const newDepth = calculateFolderDepth(newParentId)
    if (newDepth >= MAX_FOLDER_DEPTH) return false

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
    return true
  }

  function moveDocumentTo(docId: string, folderId?: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return false

    // ✅ Solo actualizamos el documento — foldersWithCount se recalcula solo
    doc.folderId = folderId
    doc.folderPath = folderId ? getFolderPath(folderId) : undefined
    updateDocument(docId, doc)

    saveFolders(state.folders)
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
      .filter(f => f.ownerId === user.value!.id && !f.parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  function getDocumentsInFolder(folderId?: string): Document[] {
    return state.documents.filter(d => d.ownerId === user.value?.id && d.folderId === folderId)
  }

  function getUnclassifiedDocuments(): Document[] {
  return state.documents.filter(d =>
    d.ownerId === user.value?.id &&
    !d.folderId &&
    !d.classification?.category
  )
  }
  function toggleFavorite(docId: string): boolean {
    const doc = state.documents.find(d => d.id === docId)
    if (!doc || doc.ownerId !== user.value?.id) return false
    doc.isFavorite = !doc.isFavorite
    updateDocument(docId, doc)
    return true
  }

  function getFavoriteDocuments(): Document[] {
    return state.documents.filter(d => d.ownerId === user.value?.id && d.isFavorite).slice(0, 10)
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
  }

  return {
    ...toRefs(state),
    folders: foldersWithCount,  // ✅ Reemplaza el ref estático con el computed
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getMyDocuments,
    getSharedWithMe,
    shareDocument,
    revokeAccess,
    createShareLink,
    deleteShareLink,
    addCategory,
    deleteCategory,
    getFilteredDocuments,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolderTo,
    moveDocumentTo,
    getFolderPath,
    getFolderTree,
    getDocumentsInFolder,
    getUnclassifiedDocuments,
    toggleFavorite,
    getFavoriteDocuments,
    updateSearchHistory,
    getSearchHistory,
    clearSearchHistory
  }
}

<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">

    <!-- ===== HEADER ===== -->
    <header class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="h-full max-w-full px-4 flex items-center gap-4">

        <div class="flex items-center gap-3 flex-shrink-0">
          <button @click="showSidebar = !showSidebar" class="lg:hidden p-2 hover:bg-accent rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar en todos los archivos..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              @input="handleSearchInput"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">

          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-10 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
            </button>

            <div v-if="showFilters" @click.stop class="absolute right-0 top-12 w-80 bg-card border rounded-lg shadow-xl p-4 z-50">
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium mb-1 block">Tipo de archivo</label>
                  <select v-model="currentFilter.type" class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="application/pdf">PDF</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word</option>
                    <option value="text/plain">Texto</option>
                    <option value="image/">Imágenes</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Categoría</label>
                  <select v-model="currentFilter.category" class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todas</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button @click="clearFilters(); showFilters = false" class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent">Limpiar</button>
                  <button @click="applyFilters(); showFilters = false" class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg">Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="viewMode = viewMode === 'table' ? 'gallery' : 'table'"
            class="h-10 w-10 rounded-lg border hover:bg-accent transition-colors hidden sm:flex items-center justify-center"
            :title="viewMode === 'table' ? 'Vista de galería' : 'Vista de tabla'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="viewMode === 'table'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <button
            @click="showUploadModal = true"
            class="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="hidden sm:inline">Subir</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== LAYOUT PRINCIPAL ===== -->
    <div class="flex-1 flex overflow-hidden">

      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showSidebar" class="lg:hidden fixed inset-0 bg-black/50 z-40" @click="showSidebar = false" />
        </Transition>
        <Transition name="slide">
          <aside v-if="showSidebar" class="lg:hidden fixed inset-y-0 left-0 w-64 bg-background border-r z-50 flex flex-col">
            <div class="p-4 border-b">
              <button @click="showSidebar = false" class="p-2 hover:bg-accent rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarMinimal
              :root-folders="rootFolders"
              :current-folder-id="currentFolderId"
              :folders="folders"
              :categories="categories"
              :current-category-id="currentCategoryId"
              :unclassified-count="unclassifiedCount"
              :favorite-count="favoriteDocuments.length"
              :showing-favorites="showFavoritesOnly"
              @select-folder="selectFolderAndCloseSidebar"
              @show-favorites="showFavoritesOnly = true; currentFolderId = null; showSidebar = false"
              @select-category="selectCategoryAndCloseSidebar"
              @create-folder="handleCreateFolder"
              @rename-folder="openRenameFolderModal"
              @delete-folder="confirmDeleteFolder"
              @drop-document="handleDropToFolder"
            />
          </aside>
        </Transition>
      </Teleport>

      <aside class="hidden lg:flex w-60 border-r bg-card/30 flex-col flex-shrink-0">
        <SidebarMinimal
          :root-folders="rootFolders"
          :current-folder-id="currentFolderId"
          :folders="folders"
          :categories="categories"
          :current-category-id="currentCategoryId"
          :unclassified-count="unclassifiedCount"
          :favorite-count="favoriteDocuments.length"
          :showing-favorites="showFavoritesOnly"
          @select-folder="selectFolder"
          @show-favorites="showFavoritesOnly = true; currentFolderId = null"
          @select-category="selectCategory"
          @create-folder="handleCreateFolder"
          @rename-folder="openRenameFolderModal"
          @delete-folder="confirmDeleteFolder"
          @drop-document="handleDropToFolder"
        />
      </aside>

      <!-- ===== CONTENIDO PRINCIPAL ===== -->
      <main class="flex-1 flex flex-col overflow-hidden">

        <!-- Breadcrumbs y contador -->
        <div class="h-12 px-6 border-b bg-background/50 flex items-center justify-between flex-shrink-0">
          <nav class="flex items-center gap-2 text-sm">
            <button @click="currentFolderId = null; showFavoritesOnly = false; currentCategoryId = null" class="text-primary hover:underline font-medium">
              Mi Biblioteca
            </button>
            <template v-if="showFavoritesOnly">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-amber-600 dark:text-amber-400 font-medium">Favoritos</span>
            </template>
            <template v-else-if="currentCategoryId">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-muted-foreground font-medium">
                {{ categories.find(c => c.id === currentCategoryId)?.name }}
              </span>
            </template>
            <template v-else-if="currentFolderPath">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-muted-foreground">{{ currentFolderPath }}</span>
            </template>
          </nav>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{{ totalElements }} archivo{{ totalElements !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div v-if="folderDeleteError" class="mx-6 mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {{ folderDeleteError }}
        </div>

        <!-- ===== ÁREA DE DOCUMENTOS ===== -->
        <div class="flex-1 overflow-y-auto p-6">

          <!-- Loading skeleton -->
          <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-muted animate-pulse" />
          </div>

          <template v-else>
            <!-- Vista Galería -->
            <div v-if="viewMode === 'gallery' && displayedDocuments.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div
                v-for="doc in displayedDocuments"
                :key="doc.id"
                class="group relative"
                draggable="true"
                @dragstart="dragStart(doc)"
                @drop="dropDocument($event, currentFolderId)"
                @dragover.prevent
              >
                <div
                  @click="viewDocument(doc)"
                  class="aspect-square rounded-xl border-2 bg-gradient-to-br from-card to-muted/20 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer p-4 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div class="text-5xl mb-2">{{ getFileIcon(doc.type) }}</div>
                  <button
                    @click.stop="toggleFavorite(doc.id)"
                    class="absolute top-2 right-2 text-xl hover:scale-125 transition-transform z-10"
                  >
                    {{ doc.isFavorite ? '⭐' : '☆' }}
                  </button>
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button @click.stop="viewDocument(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Ver">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button @click.stop="openEditModal(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Editar">
                      <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click.stop="openShareModal(doc)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Compartir">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <template v-if="confirmDeleteDocId === doc.id">
                      <button @click.stop="confirmDeleteDoc()" class="p-1 px-2 text-xs bg-red-600 text-white rounded-lg font-semibold">✓</button>
                      <button @click.stop="confirmDeleteDocId = null" class="p-1 px-2 text-xs bg-white/90 rounded-lg">✗</button>
                    </template>
                    <button v-else @click.stop="deleteDoc(doc.id)" class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Eliminar">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-2 px-1">
                  <p class="text-sm font-medium truncate" :title="doc.name">{{ doc.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatFileSize(doc.size) }}</p>
                </div>
              </div>
            </div>

            <!-- Vista Tabla -->
            <div v-else-if="viewMode === 'table' && displayedDocuments.length > 0" class="border rounded-xl overflow-hidden bg-card">
              <table class="w-full text-sm">
                <thead class="bg-muted/50 border-b sticky top-0">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold w-8"></th>
                    <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                    <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-24">Tipo</th>
                    <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell w-24">Tamaño</th>
                    <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32">Modificado</th>
                    <th class="text-right px-4 py-3 font-semibold w-48">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="doc in displayedDocuments"
                    :key="doc.id"
                    class="hover:bg-accent/30 transition-colors group cursor-pointer"
                    @click="viewDocument(doc)"
                    draggable="true"
                    @dragstart="dragStart(doc)"
                  >
                    <td class="px-4 py-3">
                      <button @click.stop="toggleFavorite(doc.id)" class="text-lg hover:scale-110 transition-transform">
                        {{ doc.isFavorite ? '⭐' : '☆' }}
                      </button>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">{{ getFileIcon(doc.type) }}</span>
                        <span class="font-medium text-foreground group-hover:text-primary transition-colors">{{ doc.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground hidden md:table-cell">{{ getFileType(doc.type) }}</td>
                    <td class="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">{{ formatFileSize(doc.size) }}</td>
                    <td class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{{ formatDate(doc.uploadedAt) }}</td>
                    <td class="px-4 py-3 text-right" @click.stop>
                      <div class="flex justify-end gap-1 items-center">
                        <button @click="viewDocument(doc)" class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600" title="Ver">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button @click="openEditModal(doc)" class="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded text-amber-600" title="Editar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button @click="openShareModal(doc)" class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600" title="Compartir">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <template v-if="confirmDeleteDocId === doc.id">
                          <button @click.stop="confirmDeleteDoc()" class="px-2 py-1 text-xs bg-red-600 text-white rounded font-semibold">✓ Sí</button>
                          <button @click.stop="confirmDeleteDocId = null" class="px-2 py-1 text-xs border rounded hover:bg-muted">✗ No</button>
                        </template>
                        <button v-else @click="deleteDoc(doc.id)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600" title="Eliminar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Estado vacío -->
            <div v-if="displayedDocuments.length === 0" class="flex flex-col items-center justify-center py-20">
              <div class="text-7xl mb-4">📭</div>
              <h3 class="text-xl font-semibold mb-2">{{ searchQuery ? 'Sin resultados' : 'Sin archivos' }}</h3>
              <p class="text-sm text-muted-foreground mb-6">
                {{ searchQuery ? 'Intenta con otros términos de búsqueda' : (currentFolderId ? 'Esta carpeta está vacía' : 'Sube tu primer archivo para comenzar') }}
              </p>
              <button v-if="!searchQuery" @click="showUploadModal = true" class="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium">
                Subir Archivo
              </button>
            </div>

            <!-- ===== PAGINACIÓN ===== -->
            <div v-if="totalPages > 1" class="flex items-center justify-between pt-6 mt-2 border-t">
              <p class="text-sm text-muted-foreground">
                Página {{ currentPage + 1 }} de {{ totalPages }}
                <span class="hidden sm:inline">· {{ totalElements }} archivos en total</span>
              </p>
              <div class="flex items-center gap-1">
                <button
                  @click="goToPage(0)"
                  :disabled="currentPage === 0 || loading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Primera página"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 0 || loading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Anterior"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <template v-for="page in totalPages" :key="page">
                  <button
                    v-if="Math.abs(page - 1 - currentPage) <= 2"
                    @click="goToPage(page - 1)"
                    :disabled="loading"
                    class="w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    :class="page - 1 === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                  >
                    {{ page }}
                  </button>
                </template>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage >= totalPages - 1 || loading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Siguiente"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  @click="goToPage(totalPages - 1)"
                  :disabled="currentPage >= totalPages - 1 || loading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

        </div>
      </main>
    </div>

    <!-- ===== MODALES ===== -->

    <!-- Modal: Subir archivo -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showUploadModal = false">
      <div class="bg-background rounded-2xl w-full max-w-lg p-6 border shadow-2xl" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Subir Archivos</h2>
          <button @click="showUploadModal = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          class="relative rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all p-12 text-center cursor-pointer"
          @click="fileInput?.click()"
          @drop.prevent="onDrop"
          @dragover.prevent
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
          :class="isDragging && 'border-primary bg-primary/5'"
        >
          <div class="text-5xl mb-4">📁</div>
          <p class="font-semibold text-lg mb-2">Arrastra archivos aquí</p>
          <p class="text-sm text-muted-foreground mb-4">o haz clic para seleccionar</p>
          <p class="text-xs text-muted-foreground">Máximo 10 MB por archivo</p>
          <input type="file" ref="fileInput" multiple @change="onUpload" class="hidden" />
        </div>
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Subiendo...</span>
            <span class="text-sm font-semibold text-primary">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" :style="{ width: uploadProgress + '%' }" />
          </div>
        </div>
        <div v-if="uploadedFiles.length > 0" class="mt-6 space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span class="text-2xl">{{ getFileIconByName(file.name) }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="uploadedFiles.splice(index, 1)" class="p-1 hover:bg-destructive/10 text-destructive rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showUploadModal = false" class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">Cancelar</button>
          <button
            v-if="uploadedFiles.length > 0"
            @click="confirmUpload"
            :disabled="uploadProgress > 0 && uploadProgress < 100"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            Subir {{ uploadedFiles.length }} archivo{{ uploadedFiles.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar documento -->
    <div v-if="showEditModal && editingDoc" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showEditModal = false">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <h2 class="text-xl font-bold mb-6">Editar Archivo</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-2 block">Nombre</label>
            <input v-model="editingDoc.name" type="text" class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block">Categoría</label>
            <select v-model="editingDoc.classification.category" class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option :value="undefined">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block">Etiquetas</label>
            <input v-model="tagsInput" type="text" placeholder="ej. importante, urgente" class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showEditModal = false" class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">Cancelar</button>
          <button @click="saveDocumentChanges" class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Compartir documento -->
    <div v-if="selectedDoc" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="selectedDoc = null">
      <div class="bg-background rounded-2xl w-full max-w-2xl p-6 border shadow-2xl" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Compartir: {{ selectedDoc.name }}</h2>
          <button @click="selectedDoc = null" class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SharingPanel
          :shares="selectedDoc.sharedWith"
          :links="selectedDoc.shareLinks || []"
          :document-id="selectedDoc.id"
          @add-share="shareDoc"
          @remove-share="revokeDoc"
          @create-link="createLink"
          @delete-link="deleteLink"
        />
      </div>
    </div>

    <!-- Modal: Crear carpeta -->
    <div v-if="showCreateFolderModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="cancelCreateFolder">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <h2 class="text-xl font-bold mb-4">Nueva Carpeta</h2>
        <p v-if="folderCreateError" class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2 mb-3">
          {{ folderCreateError }}
        </p>
        <input
          ref="folderInputRef"
          v-model="newFolderName"
          type="text"
          placeholder="Nombre de la carpeta"
          class="w-full h-12 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6 font-medium"
          @keyup.enter="createFolderConfirm"
          @keyup.escape="cancelCreateFolder"
        />
        <div class="flex gap-3">
          <button type="button" @click="cancelCreateFolder" class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">Cancelar</button>
          <button
            type="button"
            @click="createFolderConfirm"
            :disabled="!newFolderName.trim()"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Renombrar carpeta -->
    <div v-if="showRenameFolderModal && folderToRename" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showRenameFolderModal = false">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <h2 class="text-xl font-bold mb-4">Renombrar Carpeta</h2>
        <input
          v-model="renameFolderName"
          type="text"
          placeholder="Nuevo nombre"
          class="w-full h-12 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6 font-medium"
          @keyup.enter="renameFolderConfirm"
          @keyup.escape="showRenameFolderModal = false"
        />
        <div class="flex gap-3">
          <button @click="showRenameFolderModal = false" class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">Cancelar</button>
          <button @click="renameFolderConfirm" :disabled="!renameFolderName.trim()" class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50">Renombrar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Visor de documento -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="displayedDocuments"
      @close="viewingDocument = null"
      @navigate="navigateDocument"
    />

  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document } from '../../composables/useDocuments'
import { useAuditLog } from '../../composables/useAuditLog'
import DocumentViewerModal from '../../components/DocumentViewerModal.vue'
import SharingPanel from '../../components/SharingPanel.vue'
import SidebarMinimal from '../../components/SidebarMinimal.vue'

const { user } = useAuth()
const {
  documents,
  categories,
  folders,
  loading,
  totalElements,
  currentPage,
  deleteDocument,
  fetchDocuments,
  uploadDocument,
  createFolder,
  renameFolder,
  deleteFolder,
  moveDocumentTo,
  toggleFavorite: toggleFavoriteFn,
  getFavoriteDocuments,
  getFolderTree,
  getDocumentsInFolder,
  getUnclassifiedDocuments,
  shareDocument,
  revokeAccess,
  createShareLink,
  deleteShareLink
} = useDocuments()
const { addLog } = useAuditLog()

onMounted(() => {
  fetchDocuments()
})

interface EditingDoc {
  id: string
  name: string
  classification: {
    category?: string
    tags: string[]
  }
}

// ===== ESTADO =====
const PAGE_SIZE = 20
const viewMode = ref<'table' | 'gallery'>('gallery')
const currentFolderId = ref<string | null>(null)
const currentCategoryId = ref<string | null>(null)
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showCreateFolderModal = ref(false)
const showRenameFolderModal = ref(false)
const showSidebar = ref(false)
const showFilters = ref(false)
const showFavoritesOnly = ref(false)
const selectedDoc = ref<Document | null>(null)
const viewingDocument = ref<Document | null>(null)
const uploadProgress = ref(0)
const uploadedFiles = ref<File[]>([])
const editingDoc = ref<EditingDoc | null>(null)
const tagsInput = ref('')
const newFolderName = ref('')
const renameFolderName = ref('')
const folderToRename = ref<string | null>(null)
const searchQuery = ref('')
const currentFilter = ref<{ query: string; type?: string; category?: string }>({ query: '' })
const draggedDocument = ref<Document | null>(null)
const folderInputRef = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const confirmDeleteDocId = ref<string | null>(null)
const folderDeleteError = ref<string | null>(null)
const folderCreateError = ref<string | null>(null)

// ===== COMPUTED =====

const totalPages = computed(() => Math.ceil(totalElements.value / PAGE_SIZE))
const rootFolders = computed(() => getFolderTree())
const favoriteDocuments = computed(() => getFavoriteDocuments())

const currentFolderPath = computed(() => {
  if (!currentFolderId.value) return ''
  const folder = folders.value[currentFolderId.value]
  if (!folder) return ''
  const parts = [folder.name]
  let current = folder.parentId
  while (current && folders.value[current]) {
    parts.unshift(folders.value[current].name)
    current = folders.value[current].parentId
  }
  return parts.join(' / ')
})

const allUserDocuments = computed(() =>
  documents.value.filter(d => d.status !== 'DELETED')
)

const documentsInCurrentFolder = computed(() => {
  if (currentFolderId.value === null) return allUserDocuments.value
  if (currentFolderId.value === '') return getUnclassifiedDocuments()
  return getDocumentsInFolder(currentFolderId.value)
})

const unclassifiedCount = computed(() => getUnclassifiedDocuments().length)

const filteredDocuments = computed(() => {
  let docs = documentsInCurrentFolder.value
  if (currentCategoryId.value) {
    docs = docs.filter(d => d.classification?.category === currentCategoryId.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(d => d.name.toLowerCase().includes(query))
  }
  if (currentFilter.value.type) {
    docs = docs.filter(d => d.type.includes(currentFilter.value.type!))
  }
  if (currentFilter.value.category) {
    docs = docs.filter(d => d.classification?.category === currentFilter.value.category)
  }
  return docs
})

const displayedDocuments = computed(() => {
  if (showFavoritesOnly.value) {
    return filteredDocuments.value.filter(d => d.isFavorite)
  }
  return filteredDocuments.value
})

// ===== PAGINACIÓN =====

async function goToPage(page: number) {
  if (page < 0 || page >= totalPages.value) return
  await fetchDocuments(page, PAGE_SIZE)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ===== FUNCIONES UTILITARIAS =====

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getFileType(type: string): string {
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word')) return 'Word'
  if (type.includes('text')) return 'Texto'
  if (type.startsWith('image')) return 'Imagen'
  return type.split('/')[1]?.toUpperCase() || 'Archivo'
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📕'
  if (type.includes('word')) return '📘'
  if (type.includes('text')) return '📄'
  if (type.startsWith('image')) return '🖼️'
  return '📎'
}

function getFileIconByName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📕'
  if (['doc', 'docx'].includes(ext || '')) return '📘'
  if (ext === 'txt') return '📄'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return '🖼️'
  return '📎'
}

// ===== BÚSQUEDA Y FILTROS =====

function handleSearchInput() {
  currentFilter.value.query = searchQuery.value
}

function applyFilters() {}

function clearFilters() {
  currentFilter.value = { query: '' }
  searchQuery.value = ''
}

// ===== SUBIDA =====

function onUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) uploadedFiles.value.push(...Array.from(target.files))
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) uploadedFiles.value.push(...Array.from(e.dataTransfer.files))
}

async function confirmUpload() {
  if (uploadedFiles.value.length === 0) return
  uploadProgress.value = 10
  for (const file of uploadedFiles.value) {
    uploadProgress.value += Math.floor(80 / uploadedFiles.value.length)
    const doc = await uploadDocument(file, currentFolderId.value || undefined)
    if (doc && user.value) {
      addLog({
        action: 'upload',
        userId: user.value.id,
        userName: user.value.name,
        userEmail: user.value.email,
        documentId: doc.id,
        documentName: doc.name
      })
    }
  }
  uploadProgress.value = 100
  setTimeout(() => {
    showUploadModal.value = false
    uploadedFiles.value = []
    uploadProgress.value = 0
  }, 500)
}

// ===== EDICIÓN =====

function openEditModal(doc: Document) {
  editingDoc.value = {
    id: doc.id,
    name: doc.name,
    classification: {
      category: doc.classification?.category,
      tags: doc.classification?.tags || []
    }
  }
  tagsInput.value = doc.classification?.tags?.join(', ') || ''
  showEditModal.value = true
}

function saveDocumentChanges() {
  if (!editingDoc.value) return
  const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
  const doc = documents.value.find(d => d.id === editingDoc.value!.id)
  if (doc) {
    doc.name = editingDoc.value.name
    doc.classification = { category: editingDoc.value.classification.category, tags }
  }
  showEditModal.value = false
  editingDoc.value = null
}

// ===== ELIMINACIÓN =====

function deleteDoc(id: string) {
  confirmDeleteDocId.value = id
}

async function confirmDeleteDoc() {
  const docId = confirmDeleteDocId.value
  if (!docId) return
  const doc = documents.value.find(d => d.id === docId)
  if (doc) {
    await deleteDocument(docId)
    addLog({
      action: 'delete',
      userId: user.value!.id,
      userName: user.value!.name,
      userEmail: user.value!.email,
      documentId: docId,
      documentName: doc.name
    })
  }
  confirmDeleteDocId.value = null
}

// ===== VISUALIZACIÓN =====

function viewDocument(doc: Document) {
  viewingDocument.value = doc
  if (user.value) {
    addLog({
      action: 'view',
      userId: user.value.id,
      userName: user.value.name,
      userEmail: user.value.email,
      documentId: doc.id,
      documentName: doc.name
    })
  }
}

function navigateDocument(direction: 'prev' | 'next') {
  if (!viewingDocument.value) return
  const currentIndex = displayedDocuments.value.findIndex(d => d.id === viewingDocument.value!.id)
  if (direction === 'prev' && currentIndex > 0) {
    viewingDocument.value = displayedDocuments.value[currentIndex - 1]
  } else if (direction === 'next' && currentIndex < displayedDocuments.value.length - 1) {
    viewingDocument.value = displayedDocuments.value[currentIndex + 1]
  }
}

// ===== COMPARTIR =====

function openShareModal(doc: Document) {
  selectedDoc.value = doc
}

function shareDoc(email: string, permission: string) {
  if (selectedDoc.value) {
    shareDocument(selectedDoc.value.id, email, permission as 'view' | 'edit')
    if (user.value) {
      addLog({
        action: 'share',
        userId: user.value.id,
        userName: user.value.name,
        userEmail: user.value.email,
        documentId: selectedDoc.value.id,
        documentName: selectedDoc.value.name
      })
    }
  }
}

function revokeDoc(email: string) {
  if (selectedDoc.value) revokeAccess(selectedDoc.value.id, email)
}

function createLink(permission: string) {
  if (selectedDoc.value) {
    return createShareLink(selectedDoc.value.id, permission === 'view')
  }
}

function deleteLink(linkId: string) {
  if (selectedDoc.value) deleteShareLink(selectedDoc.value.id, linkId)
}

// ===== CARPETAS =====

function selectFolder(id: string | null) {
  currentFolderId.value = id
  showFavoritesOnly.value = false
  currentCategoryId.value = null
}

function selectFolderAndCloseSidebar(id: string | null) {
  selectFolder(id)
  showSidebar.value = false
}

function selectCategory(id: string | null) {
  currentCategoryId.value = id
  currentFolderId.value = null
  showFavoritesOnly.value = false
}

function selectCategoryAndCloseSidebar(id: string | null) {
  selectCategory(id)
  showSidebar.value = false
}

function handleCreateFolder(_parentId?: string) {
  folderCreateError.value = null
  newFolderName.value = ''
  showCreateFolderModal.value = true
  setTimeout(() => folderInputRef.value?.focus(), 100)
}

function createFolderConfirm() {
  if (!newFolderName.value.trim()) return
  try {
    createFolder(newFolderName.value.trim(), currentFolderId.value || undefined)
    showCreateFolderModal.value = false
    newFolderName.value = ''
    folderCreateError.value = null
  } catch (error: any) {
    folderCreateError.value = error.message
  }
}

function cancelCreateFolder() {
  showCreateFolderModal.value = false
  newFolderName.value = ''
  folderCreateError.value = null
}

function openRenameFolderModal(id: string) {
  folderToRename.value = id
  const folder = folders.value[id]
  renameFolderName.value = folder?.name || ''
  showRenameFolderModal.value = true
}

function renameFolderConfirm() {
  if (!folderToRename.value || !renameFolderName.value.trim()) return
  renameFolder(folderToRename.value, renameFolderName.value.trim())
  showRenameFolderModal.value = false
  folderToRename.value = null
  renameFolderName.value = ''
}

function confirmDeleteFolder(id: string) {
  folderDeleteError.value = null
  try {
    deleteFolder(id)
    if (currentFolderId.value === id) currentFolderId.value = null
  } catch (error: any) {
    folderDeleteError.value = error.message
    setTimeout(() => { folderDeleteError.value = null }, 5000)
  }
}

// ===== FAVORITOS =====

function toggleFavorite(id: string) {
  toggleFavoriteFn(id)
}

// ===== DRAG & DROP =====

function dragStart(doc: Document) {
  draggedDocument.value = doc
}

function dropDocument(e: DragEvent, folderId: string | null) {
  e.preventDefault()
  if (draggedDocument.value) {
    moveDocumentTo(draggedDocument.value.id, folderId || undefined)
    draggedDocument.value = null
  }
}

function handleDropToFolder(payload: { targetFolderId: string }) {
  if (draggedDocument.value) {
    moveDocumentTo(draggedDocument.value.id, payload.targetFolderId)
    draggedDocument.value = null
  }
}
</script>

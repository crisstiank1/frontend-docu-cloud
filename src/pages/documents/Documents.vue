<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">

    <!-- ===== HEADER ===== -->
    <header class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="h-full max-w-full px-4 flex items-center gap-4">

        <!-- Botón menú hamburguesa (solo mobile) -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <button @click="showSidebar = !showSidebar" class="lg:hidden p-2 hover:bg-accent rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Barra de búsqueda global -->
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

        <!-- Acciones del header -->
        <div class="flex items-center gap-2 flex-shrink-0">

          <!-- Dropdown de filtros avanzados -->
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

            <!-- Panel de filtros -->
            <div v-if="showFilters" @click.stop class="absolute right-0 top-12 w-80 bg-card border rounded-lg shadow-xl p-4 z-50">
              <div class="space-y-3">
                <!-- Filtro por tipo de archivo -->
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
                <!-- Filtro por categoría -->
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

          <!-- Toggle entre vista galería y tabla -->
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

          <!-- Botón subir archivo -->
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

      <!-- Overlay oscuro para sidebar mobile -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showSidebar" class="lg:hidden fixed inset-0 bg-black/50 z-40" @click="showSidebar = false" />
        </Transition>
        <!-- Sidebar mobile (deslizable desde la izquierda) -->
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

      <!-- Sidebar desktop (fijo a la izquierda) -->
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

        <!-- Breadcrumbs y contador de archivos -->
        <div class="h-12 px-6 border-b bg-background/50 flex items-center justify-between flex-shrink-0">
          <nav class="flex items-center gap-2 text-sm">
            <!-- Botón raíz "Mi Biblioteca" -->
            <button @click="currentFolderId = null; showFavoritesOnly = false; currentCategoryId = null" class="text-primary hover:underline font-medium">
              Mi Biblioteca
            </button>
            <!-- Indicador de favoritos activos -->
            <template v-if="showFavoritesOnly">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-amber-600 dark:text-amber-400 font-medium">Favoritos</span>
            </template>
            <!-- Indicador de categoría activa -->
            <template v-else-if="currentCategoryId">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-muted-foreground font-medium">
                {{ categories.find(c => c.id === currentCategoryId)?.name }}
              </span>
            </template>
            <!-- Ruta de carpeta activa -->
            <template v-else-if="currentFolderPath">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-muted-foreground">{{ currentFolderPath }}</span>
            </template>
          </nav>
          <!-- Contador de archivos visibles -->
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{{ filteredDocuments.length }} archivo{{ filteredDocuments.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Error al intentar eliminar carpeta con contenido -->
        <div v-if="folderDeleteError" class="mx-6 mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {{ folderDeleteError }}
        </div>

        <!-- ===== ÁREA DE DOCUMENTOS ===== -->
        <div class="flex-1 overflow-y-auto p-6">

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
                <!-- Ícono del tipo de archivo -->
                <div class="text-5xl mb-2">{{ getFileIcon(doc.type) }}</div>

                <!-- Estrella de favorito -->
                <button
                  @click.stop="toggleFavorite(doc.id)"
                  class="absolute top-2 right-2 text-xl hover:scale-125 transition-transform z-10"
                >
                  {{ doc.isFavorite ? '⭐' : '☆' }}
                </button>

                <!-- Acciones rápidas al hacer hover -->
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
                  <!-- Confirmación inline para eliminar -->
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
              <!-- Nombre y tamaño del archivo -->
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
                  <!-- Favorito -->
                  <td class="px-4 py-3">
                    <button @click.stop="toggleFavorite(doc.id)" class="text-lg hover:scale-110 transition-transform">
                      {{ doc.isFavorite ? '⭐' : '☆' }}
                    </button>
                  </td>
                  <!-- Nombre con ícono -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">{{ getFileIcon(doc.type) }}</span>
                      <span class="font-medium text-foreground group-hover:text-primary transition-colors">{{ doc.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-muted-foreground hidden md:table-cell">{{ getFileType(doc.type) }}</td>
                  <td class="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">{{ formatFileSize(doc.size) }}</td>
                  <td class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{{ formatDate(doc.uploadedAt) }}</td>
                  <!-- Acciones de fila -->
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
                      <!-- Confirmación inline para eliminar en tabla -->
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

          <!-- Estado vacío cuando no hay documentos -->
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

        <!-- Zona de arrastre de archivos -->
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

        <!-- Barra de progreso de subida -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Subiendo...</span>
            <span class="text-sm font-semibold text-primary">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" :style="{ width: uploadProgress + '%' }" />
          </div>
        </div>

        <!-- Lista de archivos listos para subir -->
        <div v-if="uploadedFiles.length > 0" class="mt-6 space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span class="text-2xl">{{ getFileIconByName(file.name) }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
            </div>
            <!-- Quitar archivo de la lista -->
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
          <!-- Nombre del archivo -->
          <div>
            <label class="text-sm font-semibold mb-2 block">Nombre</label>
            <input v-model="editingDoc.name" type="text" class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <!-- Categoría del archivo -->
          <div>
            <label class="text-sm font-semibold mb-2 block">Categoría</label>
            <select v-model="editingDoc.classification.category" class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option :value="undefined">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <!-- Etiquetas del archivo -->
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

    <!-- Modal: Crear nueva carpeta -->
    <div v-if="showCreateFolderModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="cancelCreateFolder">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <h2 class="text-xl font-bold mb-4">Nueva Carpeta</h2>
        <!-- Error de creación de carpeta -->
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
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDocuments, type Document, type SearchFilter } from '../../composables/useDocuments'
import { useAuditLog } from '../../composables/useAuditLog'
import DocumentViewerModal from '../../components/DocumentViewerModal.vue'
import SharingPanel from '../../components/SharingPanel.vue'
import SidebarMinimal from '../../components/SidebarMinimal.vue'

const { user } = useAuth()
const {
  documents,
  categories,
  folders,
  addDocument,
  deleteDocument,
  updateDocument,
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

// Tipo para el documento en edición
interface EditingDoc {
  id: string
  name: string
  classification: {
    category?: string
    tags: string[]
  }
}

// ===== ESTADO =====
const viewMode = ref<'table' | 'gallery'>('gallery')          // Modo de vista activo
const currentFolderId = ref<string | null>(null)              // Carpeta seleccionada
const currentCategoryId = ref<string | null>(null)            // Categoría seleccionada desde el sidebar
const showUploadModal = ref(false)                            // Controla modal de subida
const showEditModal = ref(false)                              // Controla modal de edición
const showCreateFolderModal = ref(false)                      // Controla modal nueva carpeta
const showRenameFolderModal = ref(false)                      // Controla modal renombrar carpeta
const showSidebar = ref(false)                                // Controla sidebar mobile
const showFilters = ref(false)                                // Controla dropdown de filtros
const showFavoritesOnly = ref(false)                          // Activa vista de solo favoritos
const selectedDoc = ref<Document | null>(null)                // Documento para compartir
const viewingDocument = ref<Document | null>(null)            // Documento abierto en visor
const uploadProgress = ref(0)                                 // Progreso de subida (0-100)
const uploadedFiles = ref<File[]>([])                         // Archivos listos para subir
const editingDoc = ref<EditingDoc | null>(null)               // Documento en edición
const tagsInput = ref('')                                     // Etiquetas como texto separado por comas
const newFolderName = ref('')                                 // Nombre de nueva carpeta
const renameFolderName = ref('')                              // Nuevo nombre al renombrar
const folderToRename = ref<string | null>(null)               // ID de la carpeta a renombrar
const searchQuery = ref('')                                   // Texto de búsqueda
const currentFilter = ref<SearchFilter>({ query: '' })        // Filtros activos
const draggedDocument = ref<Document | null>(null)            // Documento siendo arrastrado
const folderInputRef = ref<HTMLInputElement | null>(null)     // Ref del input de carpeta
const fileInput = ref<HTMLInputElement | null>(null)          // Ref del input de archivo
const isDragging = ref(false)                                 // Estado de arrastre en zona de subida
const confirmDeleteDocId = ref<string | null>(null)           // ID del documento a confirmar eliminación
const folderDeleteError = ref<string | null>(null)            // Error al eliminar carpeta
const folderCreateError = ref<string | null>(null)            // Error al crear carpeta

// ===== COMPUTED =====

// Carpetas raíz del usuario actual
const rootFolders = computed(() => getFolderTree())

// Documentos marcados como favoritos
const favoriteDocuments = computed(() => getFavoriteDocuments())

// Ruta textual de la carpeta activa (ej: "Trabajo / Proyectos")
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

// Todos los documentos del usuario autenticado
const allUserDocuments = computed(() =>
  documents.value.filter(d => d.ownerId === user.value?.id)
)

// Documentos según la carpeta activa
const documentsInCurrentFolder = computed(() => {
  if (currentFolderId.value === null) return allUserDocuments.value
  if (currentFolderId.value === '') return getUnclassifiedDocuments()
  return getDocumentsInFolder(currentFolderId.value)
})

// Total de archivos sin carpeta asignada
const unclassifiedCount = computed(() => getUnclassifiedDocuments().length)

// Documentos tras aplicar búsqueda y filtros
const filteredDocuments = computed(() => {
  let docs = documentsInCurrentFolder.value

  // Filtro por categoría seleccionada en el sidebar
  if (currentCategoryId.value) {
    docs = docs.filter(d => d.classification?.category === currentCategoryId.value)
  }
  // Filtro por texto de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(d => d.name.toLowerCase().includes(query))
  }
  // Filtro por tipo de archivo
  if (currentFilter.value.type) {
    docs = docs.filter(d => d.type.includes(currentFilter.value.type!))
  }
  // Filtro por categoría del dropdown de filtros
  if (currentFilter.value.category) {
    docs = docs.filter(d => d.classification?.category === currentFilter.value.category)
  }
  return docs
})

// Documentos finales mostrados (considera vista de favoritos)
const displayedDocuments = computed(() => {
  if (showFavoritesOnly.value) {
    return filteredDocuments.value.filter(d => d.isFavorite)
  }
  return filteredDocuments.value
})

// ===== FUNCIONES UTILITARIAS =====

// Formatea bytes a unidad legible (KB, MB...)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Formatea una fecha ISO a formato legible en español
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Devuelve el nombre de tipo legible según MIME type
function getFileType(type: string): string {
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word')) return 'Word'
  if (type.includes('text')) return 'Texto'
  if (type.startsWith('image')) return 'Imagen'
  return type.split('/')[1]?.toUpperCase() || 'Archivo'
}

// Devuelve emoji representativo según MIME type
function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📕'
  if (type.includes('word')) return '📘'
  if (type.includes('text')) return '📄'
  if (type.startsWith('image')) return '🖼️'
  return '📎'
}

// Devuelve emoji representativo según extensión del nombre
function getFileIconByName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📕'
  if (['doc', 'docx'].includes(ext || '')) return '📘'
  if (ext === 'txt') return '📄'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️'
  return '📎'
}

// ===== FUNCIONES DE NAVEGACIÓN =====

// Selecciona una carpeta y limpia categoría/favoritos
function selectFolder(folderId: string | null) {
  currentFolderId.value = folderId
  showFavoritesOnly.value = false
  currentCategoryId.value = null
}

// Selecciona carpeta y cierra sidebar mobile
function selectFolderAndCloseSidebar(folderId: string | null) {
  selectFolder(folderId)
  showSidebar.value = false
}

// Selecciona una categoría y limpia carpeta/favoritos
function selectCategory(categoryId: string) {
  currentCategoryId.value = categoryId
  showFavoritesOnly.value = false
  currentFolderId.value = null
}

// Selecciona categoría y cierra sidebar mobile
function selectCategoryAndCloseSidebar(categoryId: string) {
  selectCategory(categoryId)
  showSidebar.value = false
}

// Sincroniza el filtro de búsqueda con el input
function handleSearchInput() {
  currentFilter.value.query = searchQuery.value
}

// Aplicar filtros (los computed lo hacen automáticamente)
function applyFilters() {}

// Limpia todos los filtros activos
function clearFilters() {
  currentFilter.value = { query: searchQuery.value }
  searchQuery.value = ''
}

// ===== FUNCIONES DE ARCHIVOS =====

// Maneja el drop de archivos en la zona de subida
function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  uploadedFiles.value = [...uploadedFiles.value, ...files]
}

// Maneja la selección de archivos desde el input
function onUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  uploadedFiles.value = [...uploadedFiles.value, ...files]
}

// Simula subida con barra de progreso y crea los documentos
function confirmUpload() {
  if (uploadedFiles.value.length === 0) return
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 30
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(interval)
      uploadedFiles.value.forEach(file => {
        const doc = addDocument({
          name: file.name,
          type: file.type,
          size: file.size,
          ownerId: user.value!.id,
          ownerName: user.value!.name,
          folderId: currentFolderId.value || undefined,
          classification: { tags: [] },
          sharedWith: []
        })
        addLog({
          action: 'upload',
          userId: user.value!.id,
          userName: user.value!.name,
          userEmail: user.value!.email,
          documentId: doc.id,
          documentName: doc.name
        })
      })
      setTimeout(() => {
        showUploadModal.value = false
        uploadedFiles.value = []
        uploadProgress.value = 0
      }, 500)
    }
  }, 300)
}

// Inicia la confirmación inline de eliminación
function deleteDoc(docId: string) {
  confirmDeleteDocId.value = docId
}

// Confirma y ejecuta la eliminación del documento
function confirmDeleteDoc() {
  const docId = confirmDeleteDocId.value
  if (!docId) return
  const doc = documents.value.find(d => d.id === docId)
  if (doc) {
    deleteDocument(docId)
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

// Abre el modal de edición con los datos del documento
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

// Guarda los cambios del documento editado
function saveDocumentChanges() {
  if (!editingDoc.value) return
  const originalDoc = documents.value.find(d => d.id === editingDoc.value!.id)
  if (!originalDoc) return
  updateDocument(editingDoc.value.id, {
    ...originalDoc,
    name: editingDoc.value.name,
    classification: {
      category: editingDoc.value.classification?.category,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }
  })
  addLog({
    action: 'edit',
    userId: user.value!.id,
    userName: user.value!.name,
    userEmail: user.value!.email,
    documentId: editingDoc.value.id,
    documentName: editingDoc.value.name
  })
  showEditModal.value = false
  editingDoc.value = null
}

// Abre el modal de compartir para un documento
function openShareModal(doc: Document) {
  selectedDoc.value = doc
}

// Agrega o actualiza un colaborador del documento
function shareDoc(email: string, permission: 'view' | 'edit') {
  if (!selectedDoc.value) return
  shareDocument(selectedDoc.value.id, email, permission)
  selectedDoc.value = { ...selectedDoc.value }
}

// Revoca el acceso de un colaborador
function revokeDoc(email: string) {
  if (!selectedDoc.value) return
  revokeAccess(selectedDoc.value.id, email)
  selectedDoc.value = { ...selectedDoc.value }
}

// Crea un enlace de compartición (público o con contraseña)
function createLink(type: 'public' | 'password', password?: string) {
  if (!selectedDoc.value) return
  createShareLink(selectedDoc.value.id, type === 'public', password)
  selectedDoc.value = { ...selectedDoc.value }
}

// Elimina un enlace de compartición
function deleteLink(linkId: string) {
  if (!selectedDoc.value) return
  deleteShareLink(selectedDoc.value.id, linkId)
  selectedDoc.value = { ...selectedDoc.value }
}

// Alterna el estado de favorito de un documento
function toggleFavorite(docId: string) {
  toggleFavoriteFn(docId)
}

// Abre el visor de documento
function viewDocument(doc: Document) {
  viewingDocument.value = doc
}

// Navega al documento anterior o siguiente en el visor
function navigateDocument(direction: 'prev' | 'next') {
  if (!viewingDocument.value) return
  const currentIdx = displayedDocuments.value.findIndex(d => d.id === viewingDocument.value?.id)
  if (direction === 'prev' && currentIdx > 0) {
    viewingDocument.value = displayedDocuments.value[currentIdx - 1]
  } else if (direction === 'next' && currentIdx < displayedDocuments.value.length - 1) {
    viewingDocument.value = displayedDocuments.value[currentIdx + 1]
  }
}

// ===== FUNCIONES DE CARPETAS =====

// Abre el modal de renombrar carpeta
function openRenameFolderModal(folderId: string) {
  folderToRename.value = folderId
  const folder = folders.value[folderId]
  renameFolderName.value = folder?.name || ''
  showRenameFolderModal.value = true
}

// Confirma el renombrado de la carpeta
function renameFolderConfirm() {
  if (!folderToRename.value || !renameFolderName.value.trim()) return
  renameFolder(folderToRename.value, renameFolderName.value)
  showRenameFolderModal.value = false
  folderToRename.value = null
  renameFolderName.value = ''
}

// Abre el modal de crear carpeta
function handleCreateFolder() {
  showCreateFolderModal.value = true
  showSidebar.value = false
  folderCreateError.value = null
  setTimeout(() => folderInputRef.value?.focus(), 100)
}

// Cancela la creación de carpeta
function cancelCreateFolder() {
  showCreateFolderModal.value = false
  newFolderName.value = ''
  folderCreateError.value = null
}

// Confirma la creación de la nueva carpeta
function createFolderConfirm() {
  if (!newFolderName.value.trim()) return
  folderCreateError.value = null
  const result = createFolder(newFolderName.value, currentFolderId.value ?? undefined)
  if (result) {
    showCreateFolderModal.value = false
    newFolderName.value = ''
  } else {
    folderCreateError.value = 'Error al crear la carpeta. Verifica el nombre o la profundidad máxima.'
  }
}

// Intenta eliminar carpeta, muestra error inline si tiene contenido
function confirmDeleteFolder(folderId: string) {
  folderDeleteError.value = null
  const folder = folders.value[folderId]
  if (!folder) return
  const result = deleteFolder(folderId)
  if (!result) {
    folderDeleteError.value = `No puedes eliminar "${folder.name}" porque contiene archivos o subcarpetas.`
    setTimeout(() => { folderDeleteError.value = null }, 4000)
  }
}

// Inicia el arrastre de un documento
function dragStart(doc: Document) {
  draggedDocument.value = doc
}

// Maneja el soltar un documento sobre una zona
function dropDocument(e: DragEvent, targetFolderId?: string | null) {
  if (!draggedDocument.value) return
  moveDocumentTo(draggedDocument.value.id, targetFolderId ?? undefined)
  draggedDocument.value = null
}

// Maneja el drop desde el sidebar (evento del FolderTreeNode)
function handleDropToFolder(payload: { targetFolderId: string }) {
  if (!draggedDocument.value) return
  moveDocumentTo(draggedDocument.value.id, payload.targetFolderId)
  draggedDocument.value = null
}
</script>

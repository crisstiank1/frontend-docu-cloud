<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">
    <!-- ===== HEADER ===== -->
    <header
      class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40"
    >
      <div class="h-full max-w-full px-4 flex items-center gap-4">
        <div class="flex items-center gap-3 flex-shrink-0">
          <button
            @click="showSidebar = !showSidebar"
            class="lg:hidden p-2 hover:bg-accent rounded-lg"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
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
            <svg
              class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-10 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
            </button>

            <div
              v-if="showFilters"
              @click.stop
              class="absolute right-0 top-12 w-80 bg-card border rounded-lg shadow-xl p-4 z-50"
            >
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium mb-1 block"
                    >Tipo de archivo</label
                  >
                  <select
                    v-model="currentFilter.type"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background"
                  >
                    <option value="">Todos</option>
                    <option value="application/pdf">PDF</option>
                    <option
                      value="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    >
                      Word
                    </option>
                    <option value="text/plain">Texto</option>
                    <option value="image/">Imágenes</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block"
                    >Categoría</label
                  >
                  <select
                    v-model="currentFilter.category"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background"
                  >
                    <option value="">Todas</option>
                    <option
                      v-for="cat in categories"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button
                    @click="
                      clearFilters();
                      showFilters = false;
                    "
                    class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="
                      applyFilters();
                      showFilters = false;
                    "
                    class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="viewMode = viewMode === 'table' ? 'gallery' : 'table'"
            class="h-10 w-10 rounded-lg border hover:bg-accent transition-colors hidden sm:flex items-center justify-center"
            :title="
              viewMode === 'table' ? 'Vista de galería' : 'Vista de tabla'
            "
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="viewMode === 'table'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>

          <button
            @click="showUploadModal = true"
            class="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
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
          <div
            v-if="showSidebar"
            class="lg:hidden fixed inset-0 bg-black/50 z-40"
            @click="showSidebar = false"
          />
        </Transition>
        <Transition name="slide">
          <aside
            v-if="showSidebar"
            class="lg:hidden fixed inset-y-0 left-0 w-64 bg-background border-r z-50 flex flex-col"
          >
            <div class="p-4 border-b">
              <button
                @click="showSidebar = false"
                class="p-2 hover:bg-accent rounded-lg"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
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
              :showing-favorites="showFavoritesOnly"
              @select-folder="selectFolderAndCloseSidebar"
              @show-favorites="setFavoritesViewAndClose"
              @select-category="selectCategoryAndCloseSidebar"
              @create-folder="handleCreateFolder"
              @rename-folder="openRenameFolderModal"
              @delete-folder="confirmDeleteFolder"
              @drop-document="handleDropToFolder"
            />
          </aside>
        </Transition>
      </Teleport>

      <aside
        class="hidden lg:flex w-60 border-r bg-card/30 flex-col flex-shrink-0"
      >
        <SidebarMinimal
          :root-folders="rootFolders"
          :current-folder-id="currentFolderId"
          :folders="folders"
          :categories="categories"
          :current-category-id="currentCategoryId"
          :unclassified-count="unclassifiedCount"
          :showing-favorites="showFavoritesOnly"
          @select-folder="selectFolder"
          @show-favorites="setFavoritesView"
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
        <div
          class="h-12 px-6 border-b bg-background/50 flex items-center justify-between flex-shrink-0"
        >
          <nav class="flex items-center gap-2 text-sm">
            <button
              @click="goToAllDocuments"
              class="text-primary hover:underline font-medium"
            >
              Mi Biblioteca
            </button>
            <template v-if="showFavoritesOnly">
              <svg
                class="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span class="text-amber-600 dark:text-amber-400 font-medium"
                >Favoritos</span
              >
            </template>
            <template v-else-if="currentCategoryId">
              <svg
                class="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span class="text-muted-foreground font-medium">
                {{
                  categories.find((c) => String(c.id) === currentCategoryId)
                    ?.name
                }}
              </span>
            </template>
            <template v-else-if="showUnclassified">
              <svg
                class="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span class="text-muted-foreground font-medium"
                >Sin clasificar</span
              >
            </template>
            <template v-else-if="currentFolderPath">
              <svg
                class="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span class="text-muted-foreground">{{ currentFolderPath }}</span>
            </template>
          </nav>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span
              >{{ effectiveTotalElements }} archivo{{
                effectiveTotalElements !== 1 ? "s" : ""
              }}</span
            >
          </div>
        </div>

        <div
          v-if="folderDeleteError"
          class="mx-6 mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
        >
          {{ folderDeleteError }}
        </div>

        <!-- ===== ÁREA DE DOCUMENTOS ===== -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Loading skeleton -->
          <div
            v-if="effectiveLoading"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            <div
              v-for="i in 10"
              :key="i"
              class="aspect-square rounded-xl bg-muted animate-pulse"
            />
          </div>

          <template v-else>
            <!-- Vista Galería -->
            <div
              v-if="viewMode === 'gallery' && displayedDocuments.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
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
                  <div
                    class="text-5xl mb-2 w-28 h-28 flex items-center justify-center"
                  >
                    <img
                      v-if="doc.type.startsWith('image/') && doc.thumbnailUrl"
                      :src="doc.thumbnailUrl"
                      :alt="doc.name"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <img
                      v-else-if="getFileIconUrl(doc.type)"
                      :src="getFileIconUrl(doc.type)!"
                      :alt="getFileType(doc.type)"
                      class="w-20 h-20 object-contain"
                    />
                    <span v-else class="text-7xl">{{
                      getFileIcon(doc.type)
                    }}</span>
                  </div>
                  <button
                    @click.stop="toggleFavorite(doc.id)"
                    class="absolute top-2 right-2 text-xl hover:scale-125 transition-transform z-10"
                  >
                    {{ doc.isFavorite ? "⭐" : "☆" }}
                  </button>
                  <div
                    class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  >
                    <button
                      @click.stop="openEditModal(doc)"
                      class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Editar"
                    >
                      <svg
                        class="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click.stop="openShareModal(doc)"
                      class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Compartir"
                    >
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                    <button
                      @click.stop="downloadDoc(doc)"
                      class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Descargar"
                    >
                      <svg
                        class="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <template v-if="confirmDeleteDocId === doc.id">
                      <button
                        @click.stop="confirmDeleteDoc()"
                        class="p-1 px-2 text-xs bg-red-600 text-white rounded-lg font-semibold"
                      >
                        ✓
                      </button>
                      <button
                        @click.stop="confirmDeleteDocId = null"
                        class="p-1 px-2 text-xs bg-white/90 rounded-lg"
                      >
                        ✗
                      </button>
                    </template>
                    <button
                      v-else
                      @click.stop="deleteDoc(doc.id)"
                      class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      title="Eliminar"
                    >
                      <svg
                        class="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-2 px-1">
                  <div
                    v-if="doc.classification?.tags?.length"
                    class="flex flex-wrap gap-1 mt-1"
                  >
                    <span
                      v-for="tag in doc.classification.tags.slice(0, 2)"
                      :key="tag"
                      class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="doc.classification.tags.length > 2"
                      class="text-[10px] text-muted-foreground"
                    >
                      +{{ doc.classification.tags.length - 2 }}
                    </span>
                  </div>
                  <p class="text-sm font-medium truncate" :title="doc.name">
                    {{ doc.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatFileSize(doc.size) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Vista Tabla -->
            <div
              v-else-if="viewMode === 'table' && displayedDocuments.length > 0"
              class="border rounded-xl overflow-hidden bg-card"
            >
              <table class="w-full text-sm">
                <thead class="bg-muted/50 border-b sticky top-0">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold w-8"></th>
                    <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                    <th
                      class="text-left px-4 py-3 font-semibold hidden md:table-cell w-24"
                    >
                      Tipo
                    </th>
                    <th
                      class="text-left px-4 py-3 font-semibold hidden lg:table-cell w-24"
                    >
                      Tamaño
                    </th>
                    <th
                      class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-24"
                    >
                      Etiqueta
                    </th>
                    <th
                      class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32"
                    >
                      Modificado
                    </th>
                    <th class="text-right px-4 py-3 font-semibold w-48">
                      Acciones
                    </th>
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
                      <button
                        @click.stop="toggleFavorite(doc.id)"
                        class="text-lg hover:scale-110 transition-transform"
                      >
                        {{ doc.isFavorite ? "⭐" : "☆" }}
                      </button>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        >
                          <img
                            v-if="
                              doc.type.startsWith('image/') && doc.thumbnailUrl
                            "
                            :src="doc.thumbnailUrl"
                            :alt="doc.name"
                            class="w-8 h-8 object-cover rounded"
                          />
                          <img
                            v-else-if="getFileIconUrl(doc.type)"
                            :src="getFileIconUrl(doc.type)!"
                            :alt="getFileType(doc.type)"
                            class="w-7 h-7 object-contain"
                          />
                          <span v-else class="text-2xl">{{
                            getFileIcon(doc.type)
                          }}</span>
                        </div>
                        <span
                          class="font-medium text-foreground group-hover:text-primary transition-colors"
                          >{{ doc.name }}</span
                        >
                      </div>
                    </td>
                    <td
                      class="px-4 py-3 text-muted-foreground hidden md:table-cell"
                    >
                      {{ getFileType(doc.type) }}
                    </td>
                    <td
                      class="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs"
                    >
                      {{ formatFileSize(doc.size) }}
                    </td>
                    <td class="px-4 py-3 hidden xl:table-cell">
                      <div class="flex flex-wrap gap-1">
                        <template v-if="doc.classification?.tags?.length">
                          <span
                            v-for="tag in doc.classification.tags"
                            :key="tag"
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
                          >
                            {{ tag }}
                          </span>
                        </template>
                        <span
                          v-else
                          class="text-xs text-muted-foreground italic"
                        >
                          Sin etiqueta
                        </span>
                      </div>
                    </td>
                    <td
                      class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs"
                    >
                      {{ formatDate(doc.uploadedAt) }}
                    </td>
                    <td class="px-4 py-3 text-right" @click.stop>
                      <div class="flex justify-end gap-1 items-center">
                        <button
                          @click="openEditModal(doc)"
                          class="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded text-amber-600"
                          title="Editar"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          @click="openShareModal(doc)"
                          class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
                          title="Compartir"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </button>
                        <button
                          @click="downloadDoc(doc)"
                          class="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded text-indigo-600"
                          title="Descargar"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                        <template v-if="confirmDeleteDocId === doc.id">
                          <button
                            @click.stop="confirmDeleteDoc()"
                            class="px-2 py-1 text-xs bg-red-600 text-white rounded font-semibold"
                          >
                            ✓ Sí
                          </button>
                          <button
                            @click.stop="confirmDeleteDocId = null"
                            class="px-2 py-1 text-xs border rounded hover:bg-muted"
                          >
                            ✗ No
                          </button>
                        </template>
                        <button
                          v-else
                          @click="deleteDoc(doc.id)"
                          class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                          title="Eliminar"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Estado vacío -->
            <div
              v-if="displayedDocuments.length === 0"
              class="flex flex-col items-center justify-center py-20"
            >
              <div class="text-7xl mb-4">📭</div>
              <h3 class="text-xl font-semibold mb-2">
                {{ searchQuery ? "Sin resultados" : "Sin archivos" }}
              </h3>
              <p class="text-sm text-muted-foreground mb-6">
                {{
                  searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : currentFolderId
                      ? "Esta carpeta está vacía"
                      : "Sube tu primer archivo para comenzar"
                }}
              </p>
              <button
                v-if="!searchQuery"
                @click="showUploadModal = true"
                class="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium"
              >
                Subir Archivo
              </button>
            </div>

            <!-- ===== PAGINACIÓN ===== -->
            <div
              v-if="effectiveTotalPages > 1"
              class="flex items-center justify-between pt-6 mt-2 border-t"
            >
              <p class="text-sm text-muted-foreground">
                Página {{ effectivePage + 1 }} de {{ effectiveTotalPages }}
              </p>
              <div class="flex items-center gap-1">
                <button
                  @click="goToPage(0)"
                  :disabled="effectivePage === 0 || effectiveLoading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Primera página"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  @click="goToPage(effectivePage - 1)"
                  :disabled="effectivePage === 0 || effectiveLoading"
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Anterior"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <template v-for="page in effectiveTotalPages" :key="page">
                  <button
                    v-if="Math.abs(page - 1 - effectivePage) <= 2"
                    @click="goToPage(page - 1)"
                    :disabled="effectiveLoading"
                    class="w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    :class="
                      page - 1 === effectivePage
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    "
                  >
                    {{ page }}
                  </button>
                </template>
                <button
                  @click="goToPage(effectivePage + 1)"
                  :disabled="
                    effectivePage >= effectiveTotalPages - 1 || effectiveLoading
                  "
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Siguiente"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  @click="goToPage(effectiveTotalPages - 1)"
                  :disabled="
                    effectivePage >= effectiveTotalPages - 1 || effectiveLoading
                  "
                  class="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
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
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showUploadModal = false"
    >
      <div
        class="bg-background rounded-2xl w-full max-w-lg p-6 border shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Subir Archivos</h2>
          <button
            @click="showUploadModal = false"
            class="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
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
          <p class="text-sm text-muted-foreground mb-4">
            o haz clic para seleccionar
          </p>
          <p class="text-xs text-muted-foreground">Máximo 10 MB por archivo</p>
          <input
            type="file"
            ref="fileInput"
            multiple
            @change="onUpload"
            class="hidden"
          />
        </div>
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Subiendo...</span>
            <span class="text-sm font-semibold text-primary"
              >{{ uploadProgress }}%</span
            >
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            />
          </div>
        </div>
        <div
          v-if="uploadedFiles.length > 0"
          class="mt-6 space-y-2 max-h-48 overflow-y-auto"
        >
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
          >
            <span class="text-2xl">{{ getFileIconByName(file.name) }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatFileSize(file.size) }}
              </p>
            </div>
            <button
              @click="uploadedFiles.splice(index, 1)"
              class="p-1 hover:bg-destructive/10 text-destructive rounded"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showUploadModal = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            v-if="uploadedFiles.length > 0"
            @click="confirmUpload"
            :disabled="isUploading"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            Subir {{ uploadedFiles.length }} archivo{{
              uploadedFiles.length !== 1 ? "s" : ""
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar documento -->
    <div
      v-if="showEditModal && editingDoc"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showEditModal = false"
    >
      <div
        class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-6">Editar Archivo</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-2 block">Nombre</label>
            <input
              v-model="editingDoc.name"
              type="text"
              class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block">Categoría</label>
            <select
              v-model="editingDoc.classification.category"
              class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option :value="undefined">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block">Etiquetas</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="ej. importante, urgente"
              class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="saveDocumentChanges"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Compartir documento -->
    <div
      v-if="selectedDoc"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="selectedDoc = null"
    >
      <div
        class="bg-background rounded-2xl w-full max-w-2xl p-6 border shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Compartir: {{ selectedDoc.name }}</h2>
          <button
            @click="selectedDoc = null"
            class="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
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
    <div
      v-if="showCreateFolderModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="cancelCreateFolder"
    >
      <div
        class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl"
        @click.stop
      >
        <h2 class="text-xl font-bold mb-4">Nueva Carpeta</h2>
        <p
          v-if="folderCreateError"
          class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2 mb-3"
        >
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
          <button
            type="button"
            @click="cancelCreateFolder"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
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
    <div
      v-if="showRenameFolderModal && folderToRename"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showRenameFolderModal = false"
    >
      <div
        class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl"
        @click.stop
      >
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
          <button
            @click="showRenameFolderModal = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="renameFolderConfirm"
            :disabled="!renameFolderName.trim()"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            Renombrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Visor de documento -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="displayedDocuments"
      :preview-url="currentPreviewUrl"
      @close="
        viewingDocument = null;
        currentPreviewUrl = null;
      "
      @navigate="navigateDocument"
      @download="downloadDoc"
      @request-preview="handleRequestPreview"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useDocuments, type Document } from "../../composables/useDocuments";
import DocumentViewerModal from "../../components/DocumentViewerModal.vue";
import SharingPanel from "../../components/SharingPanel.vue";
import SidebarMinimal from "../../components/SidebarMinimal.vue";
import { toast } from "vue-sonner";
import { documentService } from "../../services/documentService";

// ─── Composables ──────────────────────────────────────────────────────────────

const { user } = useAuth();
const {
  documents,
  categories,
  folders,
  loading,
  totalElements,
  currentPage,
  // ── Nuevo: estado de vista activa ──
  viewDocuments,
  viewTotalElements,
  viewCurrentPage,
  viewLoading,
  // ── Nuevo: fetch por sección ──
  fetchDocuments,
  fetchDocumentsByFolder,
  fetchFavoriteDocuments,
  fetchDocumentsByCategory,
  fetchUnclassifiedDocuments,
  clearViewDocuments,
  // ── Resto igual ──
  fetchFolders,
  fetchCategories,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  updateDocument,
  searchDocuments,
  createFolder,
  renameFolder,
  deleteFolder,
  moveDocumentTo,
  toggleFavorite,
  getFolderTree,
  getUnclassifiedDocuments,
  shareDocument,
  revokeAccess,
  createShareLink,
  deleteShareLink,
} = useDocuments();

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const FILE_ICON_URLS: Record<string, string> = {
  pdf: "https://img.icons8.com/fluency/96/pdf.png",
  word: "https://img.icons8.com/color/96/microsoft-word-2019--v2.png",
  excel: "https://img.icons8.com/color/96/microsoft-excel-2019--v1.png",
  powerpoint:
    "https://img.icons8.com/color/96/microsoft-powerpoint-2019--v1.png",
};

// ─── Estado: UI ───────────────────────────────────────────────────────────────

const viewMode = ref<"table" | "gallery">("gallery");
const showSidebar = ref(false);
const showFilters = ref(false);

// ─── Estado: Navegación ───────────────────────────────────────────────────────

// Qué vista está activa — solo una puede estar activa a la vez
type ActiveView = "all" | "folder" | "favorites" | "category" | "unclassified";
const activeView = ref<ActiveView>("all");

const currentFolderId = ref<string | null>(null);
const currentCategoryId = ref<string | null>(null);
const showFavoritesOnly = ref(false);
const showUnclassified = ref(false);

// ─── Estado: Modales ──────────────────────────────────────────────────────────

const showUploadModal = ref(false);
const showEditModal = ref(false);
const showCreateFolderModal = ref(false);
const showRenameFolderModal = ref(false);
const selectedDoc = ref<Document | null>(null);
const viewingDocument = ref<Document | null>(null);

// ─── Estado: Subida ───────────────────────────────────────────────────────────

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<File[]>([]);
const uploadProgress = ref(0);
const isUploading = ref(false);
const isDragging = ref(false);

// ─── Estado: Edición ──────────────────────────────────────────────────────────

interface EditingDoc {
  id: string;
  name: string;
  classification: { category?: string; tags: string[] };
}
const editingDoc = ref<EditingDoc | null>(null);
const tagsInput = ref("");

// ─── Estado: Carpetas ─────────────────────────────────────────────────────────

const folderInputRef = ref<HTMLInputElement | null>(null);
const newFolderName = ref("");
const renameFolderName = ref("");
const folderToRename = ref<string | null>(null);
const pendingParentFolderId = ref<string | null>(null);
const folderDeleteError = ref<string | null>(null);
const folderCreateError = ref<string | null>(null);

// ─── Estado: Búsqueda y Filtros ───────────────────────────────────────────────

const searchQuery = ref("");
const currentFilter = ref<{ query: string; type?: string; category?: string }>({
  query: "",
});
const confirmDeleteDocId = ref<string | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// ─── Estado: Drag & Drop ──────────────────────────────────────────────────────

const draggedDocument = ref<Document | null>(null);

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchDocuments(), fetchFolders(), fetchCategories()]);
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});

// ─── Computed: vista activa ───────────────────────────────────────────────────

// Indica si estamos en una vista local (no "Todos")
const isLocalView = computed(() => activeView.value !== "all");

// Los docs que se muestran en la tabla/galería
const displayedDocuments = computed(() => {
  if (!isLocalView.value) {
    // Vista "Todos": filtra localmente sobre la página del backend
    let docs = documents.value.filter((d) => d.status !== "DELETED");
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      docs = docs.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (currentFilter.value.type) {
      docs = docs.filter((d) => d.type.includes(currentFilter.value.type!));
    }
    if (currentFilter.value.category) {
      docs = docs.filter(
        (d) => d.classification?.category === currentFilter.value.category,
      );
    }
    return docs;
  }
  // Vistas locales: viewDocuments ya viene filtrado y paginado del composable
  if (!searchQuery.value && !currentFilter.value.type)
    return viewDocuments.value;
  // Filtro local adicional sobre la página de la vista activa
  let docs = [...viewDocuments.value];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    docs = docs.filter((d) => d.name.toLowerCase().includes(q));
  }
  if (currentFilter.value.type) {
    docs = docs.filter((d) => d.type.includes(currentFilter.value.type!));
  }
  return docs;
});

// Paginación unificada — elige las variables correctas según la vista
const effectivePage = computed(() =>
  isLocalView.value ? viewCurrentPage.value : currentPage.value,
);
const effectiveTotalElements = computed(() =>
  isLocalView.value ? viewTotalElements.value : totalElements.value,
);
const effectiveTotalPages = computed(() =>
  Math.ceil(effectiveTotalElements.value / PAGE_SIZE),
);
const effectiveLoading = computed(() =>
  isLocalView.value ? viewLoading.value : loading.value,
);

// Sidebar counters — usan getUnclassifiedDocuments sobre state.documents
// (conteo aproximado; para conteo exacto habría que hacer un fetch dedicado)
const rootFolders = computed(() => getFolderTree());
const unclassifiedCount = computed(() => getUnclassifiedDocuments().length);
// favoriteCount: suma los que tienen isFavorite en el estado global
const favoriteCount = computed(
  () =>
    documents.value.filter((d) => d.isFavorite && d.status !== "DELETED")
      .length,
);

const currentFolderPath = computed(() => {
  if (!currentFolderId.value) return "";
  const folder = folders.value[currentFolderId.value];
  if (!folder) return "";
  const parts = [folder.name];
  let current = folder.parentId;
  while (current && folders.value[current]) {
    parts.unshift(folders.value[current].name);
    current = folders.value[current].parentId;
  }
  return parts.join(" / ");
});

// ─── Paginación ───────────────────────────────────────────────────────────────

async function goToPage(page: number) {
  if (page < 0 || page >= effectiveTotalPages.value) return;

  if (activeView.value === "all") {
    await fetchDocuments(page, PAGE_SIZE);
  } else if (activeView.value === "folder" && currentFolderId.value) {
    await fetchDocumentsByFolder(currentFolderId.value, page, PAGE_SIZE);
  } else if (activeView.value === "favorites") {
    await fetchFavoriteDocuments(page, PAGE_SIZE);
  } else if (activeView.value === "category" && currentCategoryId.value) {
    await fetchDocumentsByCategory(currentCategoryId.value, page, PAGE_SIZE);
  } else if (activeView.value === "unclassified") {
    await fetchUnclassifiedDocuments(page, PAGE_SIZE);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Navegación entre vistas ──────────────────────────────────────────────────

async function goToAllDocuments() {
  activeView.value = "all";
  currentFolderId.value = null;
  currentCategoryId.value = null;
  showFavoritesOnly.value = false;
  showUnclassified.value = false;
  clearViewDocuments();
  // No hace falta re-fetch si ya tenemos datos; solo si queremos refrescar:
  // await fetchDocuments(0, PAGE_SIZE);
}

async function selectFolder(id: string | null) {
  if (id === null) {
    await goToAllDocuments();
    return;
  }
  activeView.value = "folder";
  currentFolderId.value = id;
  currentCategoryId.value = null;
  showFavoritesOnly.value = false;
  showUnclassified.value = false;
  await fetchDocumentsByFolder(id, 0, PAGE_SIZE);
}

async function selectFolderAndCloseSidebar(id: string | null) {
  await selectFolder(id);
  showSidebar.value = false;
}

async function setFavoritesView() {
  activeView.value = "favorites";
  showFavoritesOnly.value = true;
  currentFolderId.value = null;
  currentCategoryId.value = null;
  showUnclassified.value = false;
  await fetchFavoriteDocuments(0, PAGE_SIZE);
}

async function setFavoritesViewAndClose() {
  await setFavoritesView();
  showSidebar.value = false;
}

async function selectCategory(id: string | null) {
  if (id === null) {
    await goToAllDocuments();
    return;
  }
  activeView.value = "category";
  currentCategoryId.value = id;
  currentFolderId.value = null;
  showFavoritesOnly.value = false;
  showUnclassified.value = false;
  await fetchDocumentsByCategory(id, 0, PAGE_SIZE);
}

async function selectCategoryAndCloseSidebar(id: string | null) {
  await selectCategory(id);
  showSidebar.value = false;
}

// ─── Utilidades de archivo ────────────────────────────────────────────────────

function getFileIconUrl(type: string): string | null {
  if (type.includes("pdf")) return FILE_ICON_URLS.pdf;
  if (type.includes("word") || type.includes("wordprocessingml"))
    return FILE_ICON_URLS.word;
  if (type.includes("excel") || type.includes("spreadsheet"))
    return FILE_ICON_URLS.excel;
  if (type.includes("powerpoint") || type.includes("presentation"))
    return FILE_ICON_URLS.powerpoint;
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileType(type: string): string {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word")) return "Word";
  if (type.includes("text")) return "Texto";
  if (type.startsWith("image")) return "Imagen";
  return type.split("/")[1]?.toUpperCase() || "Archivo";
}

function getFileIcon(type: string): string {
  if (type.includes("pdf")) return "📕";
  if (type.includes("word") || type.includes("wordprocessingml")) return "📘";
  if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
  if (type.includes("powerpoint") || type.includes("presentation")) return "📊";
  if (type.includes("text")) return "📄";
  if (type.startsWith("image")) return "🖼️";
  return "📎";
}

function getFileIconByName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "📕",
    doc: "📘",
    docx: "📘",
    xls: "📊",
    xlsx: "📊",
    ppt: "📊",
    pptx: "📊",
    txt: "📄",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    svg: "🖼️",
  };
  return map[ext] ?? "📎";
}

// ─── Búsqueda y Filtros ───────────────────────────────────────────────────────

function handleSearchInput() {
  currentFilter.value.query = searchQuery.value;
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    if (activeView.value === "all") fetchDocuments(0, PAGE_SIZE);
    return;
  }

  // La búsqueda global del backend solo aplica en vista "Todos"
  if (activeView.value === "all") {
    searchTimeout = setTimeout(() => {
      searchDocuments({
        query: searchQuery.value.trim(),
        mimeType: currentFilter.value.type || undefined,
      });
    }, 400);
  }
  // En vistas locales, el filtro se aplica en displayedDocuments (computed)
}

function applyFilters() {
  if (activeView.value === "all") {
    searchDocuments({
      query: searchQuery.value.trim() || undefined,
      mimeType: currentFilter.value.type || undefined,
    });
  }
}

function clearFilters() {
  currentFilter.value = { query: "" };
  searchQuery.value = "";
  if (activeView.value === "all") fetchDocuments(0, PAGE_SIZE);
}

// ─── Subida ───────────────────────────────────────────────────────────────────

function onUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) uploadedFiles.value.push(...Array.from(files));
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files)
    uploadedFiles.value.push(...Array.from(e.dataTransfer.files));
}

async function confirmUpload() {
  if (!uploadedFiles.value.length || isUploading.value) return;
  isUploading.value = true;
  uploadProgress.value = 10;
  const step = Math.floor(80 / uploadedFiles.value.length);

  try {
    for (const file of uploadedFiles.value) {
      await uploadDocument(file, currentFolderId.value || undefined);
      uploadProgress.value = Math.min(uploadProgress.value + step, 90);
    }
    uploadProgress.value = 100;
    // Refresca la vista activa después de subir
    await refreshCurrentView();
    setTimeout(() => {
      showUploadModal.value = false;
      uploadedFiles.value = [];
      uploadProgress.value = 0;
    }, 500);
  } finally {
    isUploading.value = false;
  }
}

// Refresca la vista activa sin cambiar de sección
async function refreshCurrentView() {
  if (activeView.value === "all") {
    await fetchDocuments(currentPage.value, PAGE_SIZE);
  } else if (activeView.value === "folder" && currentFolderId.value) {
    await fetchDocumentsByFolder(
      currentFolderId.value,
      viewCurrentPage.value,
      PAGE_SIZE,
    );
  } else if (activeView.value === "favorites") {
    await fetchFavoriteDocuments(viewCurrentPage.value, PAGE_SIZE);
  } else if (activeView.value === "category" && currentCategoryId.value) {
    await fetchDocumentsByCategory(
      currentCategoryId.value,
      viewCurrentPage.value,
      PAGE_SIZE,
    );
  } else if (activeView.value === "unclassified") {
    await fetchUnclassifiedDocuments(viewCurrentPage.value, PAGE_SIZE);
  }
}

// ─── Edición ──────────────────────────────────────────────────────────────────

function openEditModal(doc: Document) {
  editingDoc.value = {
    id: doc.id,
    name: doc.name,
    classification: {
      category: doc.classification?.category,
      tags: doc.classification?.tags ?? [],
    },
  };
  tagsInput.value = doc.classification?.tags?.join(", ") ?? "";
  showEditModal.value = true;
}

function saveDocumentChanges() {
  if (!editingDoc.value) return;
  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  updateDocument(editingDoc.value.id, {
    name: editingDoc.value.name,
    classification: {
      category: editingDoc.value.classification.category,
      tags,
    },
  });
  showEditModal.value = false;
  editingDoc.value = null;
}

// ─── Eliminación ──────────────────────────────────────────────────────────────

function deleteDoc(id: string) {
  confirmDeleteDocId.value = id;
}

async function confirmDeleteDoc() {
  if (!confirmDeleteDocId.value) return;
  await deleteDocument(confirmDeleteDocId.value);
  confirmDeleteDocId.value = null;
}

// ─── Descarga ─────────────────────────────────────────────────────────────────

async function downloadDoc(doc: Document) {
  const url = await downloadDocument(doc.id);
  if (!url) return;

  try {
    const blob = await fetch(url).then((r) => r.blob());
    const blobUrl = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: blobUrl,
      download: doc.name,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    toast.error("Error al descargar el archivo");
  }
}

// ─── Visualización ────────────────────────────────────────────────────────────

function viewDocument(doc: Document) {
  viewingDocument.value = doc;
}

function navigateDocument(direction: "prev" | "next") {
  if (!viewingDocument.value) return;
  const idx = displayedDocuments.value.findIndex(
    (d) => d.id === viewingDocument.value!.id,
  );
  if (direction === "prev" && idx > 0)
    viewingDocument.value = displayedDocuments.value[idx - 1];
  if (direction === "next" && idx < displayedDocuments.value.length - 1)
    viewingDocument.value = displayedDocuments.value[idx + 1];
}

// ─── Compartir ────────────────────────────────────────────────────────────────

function openShareModal(doc: Document) {
  selectedDoc.value = doc;
}

function shareDoc(email: string, permission: string) {
  if (selectedDoc.value)
    shareDocument(selectedDoc.value.id, email, permission as "view" | "edit");
}

function revokeDoc(email: string) {
  if (selectedDoc.value) revokeAccess(selectedDoc.value.id, email);
}

function createLink(permission: string) {
  if (selectedDoc.value)
    return createShareLink(selectedDoc.value.id, permission === "view");
}

function deleteLink(linkId: string) {
  if (selectedDoc.value) deleteShareLink(selectedDoc.value.id, linkId);
}

// ─── Carpetas ─────────────────────────────────────────────────────────────────

function handleCreateFolder(parentId?: string) {
  folderCreateError.value = null;
  newFolderName.value = "";
  pendingParentFolderId.value = parentId ?? null;
  showCreateFolderModal.value = true;
  setTimeout(() => folderInputRef.value?.focus(), 100);
}

async function createFolderConfirm() {
  if (!newFolderName.value.trim()) return;
  folderCreateError.value = null;
  const result = await createFolder(
    newFolderName.value.trim(),
    pendingParentFolderId.value ?? undefined,
  );
  if (result) {
    newFolderName.value = "";
    pendingParentFolderId.value = null;
    showCreateFolderModal.value = false;
  } else {
    folderCreateError.value = "Ya existe una carpeta con ese nombre";
  }
}

function cancelCreateFolder() {
  showCreateFolderModal.value = false;
  newFolderName.value = "";
  folderCreateError.value = null;
}

function openRenameFolderModal(id: string) {
  folderToRename.value = id;
  renameFolderName.value = folders.value[id]?.name ?? "";
  showRenameFolderModal.value = true;
}

async function renameFolderConfirm() {
  if (!renameFolderName.value.trim() || !folderToRename.value) return;
  const ok = await renameFolder(
    folderToRename.value,
    renameFolderName.value.trim(),
  );
  if (ok) {
    showRenameFolderModal.value = false;
    folderToRename.value = null;
    renameFolderName.value = "";
  }
}

async function confirmDeleteFolder(folderId: string) {
  folderDeleteError.value = null;
  const ok = await deleteFolder(folderId);
  if (!ok) folderDeleteError.value = "No se pudo eliminar la carpeta";
  // Si estábamos viendo esa carpeta, volver a "Todos"
  if (currentFolderId.value === folderId) await goToAllDocuments();
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────

function dragStart(doc: Document) {
  draggedDocument.value = doc;
}

function dropDocument(e: DragEvent, folderId: string | null) {
  e.preventDefault();
  if (!draggedDocument.value) return;
  moveDocumentTo(draggedDocument.value.id, folderId || undefined);
  draggedDocument.value = null;
}

function handleDropToFolder(payload: { targetFolderId: string }) {
  if (!draggedDocument.value) return;
  moveDocumentTo(draggedDocument.value.id, payload.targetFolderId);
  draggedDocument.value = null;
}

const currentPreviewUrl = ref<string | null | undefined>(undefined);

async function handleRequestPreview(doc: Document) {
  currentPreviewUrl.value = undefined;
  try {
    const { data } = await documentService.getPreviewUrl(doc.backendId!);
    currentPreviewUrl.value = data.downloadUrl;
  } catch {
    currentPreviewUrl.value = null;
  }
}
</script>

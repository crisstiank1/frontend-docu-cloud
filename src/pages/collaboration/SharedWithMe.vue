<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">

    <!-- ===== HEADER ===== -->
    <header class="border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="max-w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1 min-w-0 sm:max-w-2xl">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              :placeholder="activeTab === 'received'
                ? 'Buscar en archivos compartidos conmigo...'
                : 'Buscar en archivos que compartí...'"
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none
                    focus:ring-2 focus:ring-primary/50 text-sm"
              @input="handleSearchInput"
              @focus="openSearchDropdown"
              @blur="closeSearchDropdown"
              @keydown="handleSearchKeydown"
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

            <div
              v-if="showSearchDropdown"
              class="absolute top-12 left-0 right-0 z-50 rounded-xl border bg-card shadow-xl p-2"
            >
              <template v-if="searchTerm.trim().length >= 2">
                <p class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Sugerencias
                </p>

                <div
                  v-if="loadingSearchDropdown"
                  class="px-3 py-2 text-xs text-muted-foreground"
                >
                  Cargando...
                </div>

                <button
                  v-for="(item, index) in suggestions"
                  :key="`${item}-${index}`"
                  @mousedown.prevent="applySearch(item)"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                  :class="selectedSearchIndex === index ? 'bg-accent' : ''"
                >
                  {{ item }}
                </button>

                <div v-if="!loadingSearchDropdown && !suggestions.length">
                  <p class="px-3 py-2 text-xs text-muted-foreground">
                    Sin sugerencias
                  </p>

                  <template v-if="history.length">
                    <p class="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">
                      Recientes
                    </p>

                    <div
                      v-for="item in history.slice(0, 4)"
                      :key="item.id"
                      class="flex items-center gap-2"
                    >
                      <button
                        @mousedown.prevent="applySearch(item.query)"
                        class="flex-1 text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                      >
                        {{ item.query }}
                      </button>

                      <button
                        @mousedown.prevent="handleDeleteRecent(item.id, $event)"
                        class="px-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar búsqueda"
                      >
                        ✕
                      </button>
                    </div>
                  </template>
                </div>
              </template>

              <template v-else>
                <div class="flex items-center justify-between px-3 py-2">
                  <p class="text-xs font-semibold text-muted-foreground uppercase">
                    Búsquedas recientes
                  </p>

                  <button
                    v-if="history.length"
                    @mousedown.prevent="clearAll"
                    class="text-xs text-destructive hover:underline"
                  >
                    Limpiar todo
                  </button>
                </div>

                <div
                  v-for="(item, index) in history"
                  :key="item.id"
                  class="flex items-center gap-2"
                >
                  <button
                    @mousedown.prevent="applySearch(item.query)"
                    class="flex-1 text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                    :class="selectedSearchIndex === index ? 'bg-accent' : ''"
                  >
                    {{ item.query }}
                  </button>

                  <button
                    @mousedown.prevent="handleDeleteRecent(item.id, $event)"
                    class="px-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar búsqueda"
                  >
                    ✕
                  </button>
                </div>

                <p
                  v-if="!history.length"
                  class="px-3 py-2 text-xs text-muted-foreground"
                >
                  No hay búsquedas recientes
                </p>
              </template>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">

          <!-- Filtros -->
          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-9 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
              :class="(permissionFilter || typeFilter) ? 'border-primary text-primary' : ''"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
              <span v-if="permissionFilter || typeFilter" class="w-2 h-2 rounded-full bg-primary" />
            </button>

            <div
              v-if="showFilters"
              @click.stop
              class="absolute left-0 sm:left-auto sm:right-0 top-11 w-72 bg-card border rounded-lg shadow-xl p-4 z-50">
              <div class="space-y-3">
                <div v-if="activeTab === 'received'">
                  <label class="text-xs font-medium mb-1 block">Permiso</label>
                  <select v-model="permissionFilter"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="READ">Solo lectura</option>
                    <option value="WRITE">Lectura y escritura</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Tipo de archivo</label>
                  <select v-model="typeFilter"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="application/pdf">PDF</option>
                    <option value="wordprocessingml">Word</option>
                    <option value="spreadsheet">Excel</option>
                    <option value="text/plain">Texto</option>
                    <option value="image/">Imágenes</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Ordenar por</label>
                  <select v-model="sortBy"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="date">Más recientes</option>
                    <option value="name">Nombre (A-Z)</option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button @click="clearFilters(); showFilters = false"
                    class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent">
                    Limpiar
                  </button>
                  <button @click="showFilters = false"
                    class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="viewMode = viewMode === 'table' ? 'gallery' : 'table'"
            class="h-9 w-9 rounded-lg border hover:bg-accent transition-colors flex items-center justify-center flex-shrink-0"
            :title="viewMode === 'table' ? 'Vista galería' : 'Vista tabla'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="viewMode === 'table'" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <!-- Contador de archivos -->
          <span class="text-sm text-muted-foreground whitespace-nowrap">
            {{ filteredDocuments.length }} archivo{{ filteredDocuments.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </header>

    <!-- ===== TABS ===== -->
    <div class="border-b bg-background flex-shrink-0">
      <div class="px-4 sm:px-6 flex gap-1 overflow-x-auto">
        <button
          @click="activeTab = 'received'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'received'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'">
          Compartidos conmigo
          <span class="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-muted">
            {{ sharedWithMeDocs.length }}
          </span>
        </button>
        <button
          @click="activeTab = 'sent'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'sent'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'">
          Compartidos por mí
          <span class="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-muted">
            {{ sharedByMeTotalElements ?? sharedByMeDocs.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ===== CONTENIDO ===== -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

        <!-- Estadísticas tab received -->
        <div v-if="activeTab === 'received' && sharedWithMeDocs.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Total Compartidos</p>
            <p class="text-2xl font-bold text-primary">{{ sharedWithMeDocs.length }}</p>
            <p class="text-xs text-muted-foreground mt-1">archivos contigo</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Solo Lectura</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ readCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de solo ver</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Con Edición</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ writeCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">con permiso de escritura</p>
          </div>
        </div>

        <!-- Estadísticas tab sent -->
        <div v-if="activeTab === 'sent' && sharedByMeDocs.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Archivos Compartidos</p>
            <p class="text-2xl font-bold text-primary">{{ sharedByMeDocs.length }}</p>
            <p class="text-xs text-muted-foreground mt-1">archivos que compartiste</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-400/10 border border-amber-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Personas con Acceso</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ totalRecipientsCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">usuarios con acceso activo</p>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-400/10 border border-purple-500/20">
            <p class="text-xs font-semibold text-muted-foreground mb-1">Con Permiso de Edición</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ sharedWithWriteCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">personas pueden editar</p>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div v-for="i in 10" :key="i" class="aspect-square rounded-xl bg-muted animate-pulse" />
        </div>

        <template v-else>

          <!-- ===== VISTA GALERÍA ===== -->
          <!--
            CAMBIO: Las acciones ya no son solo-hover.
            En móvil se muestran siempre en la zona inferior de la tarjeta.
            En desktop se mantiene el overlay original + las acciones fijas abajo.
            Esto garantiza accesibilidad táctil sin romper la experiencia de escritorio.
          -->
          <div v-if="viewMode === 'gallery' && filteredDocuments.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <div v-for="doc in filteredDocuments" :key="doc.id" class="group relative flex flex-col">

              <!-- Thumbnail con overlay solo para desktop -->
              <div
                @click="viewDocument(doc)"
                class="aspect-square rounded-xl border-2 bg-gradient-to-br from-card to-muted/20
                       hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer p-4
                       flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div class="text-5xl mb-2 w-28 h-28 flex items-center justify-center">
                  <img v-if="doc.type.startsWith('image/') && doc.thumbnailUrl"
                    :src="doc.thumbnailUrl" :alt="doc.name"
                    class="w-full h-full object-cover rounded-lg" />
                  <img v-else-if="getFileIconUrl(doc.type)"
                    :src="getFileIconUrl(doc.type)!" :alt="getFileType(doc.type)"
                    class="w-20 h-20 object-contain" />
                  <div v-else class="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <svg class="w-10 h-10 text-muted-foreground" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Badge de permiso (tab received) -->
                <div v-if="activeTab === 'received'" class="absolute top-2 left-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="getMyPermission(doc) === 'WRITE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'">
                    {{ getMyPermission(doc) === 'WRITE' ? 'Editar' : 'Ver' }}
                  </span>
                </div>

                <!-- Badge de destinatarios (tab sent) -->
                <div v-if="activeTab === 'sent' && doc.sharedWith?.length"
                  class="absolute top-2 left-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {{ doc.sharedWith.length }} persona{{ doc.sharedWith.length !== 1 ? 's' : '' }}
                  </span>
                </div>

                <!-- Overlay de hover — solo visible en desktop (sm+) con pointer -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm
                            hidden sm:flex
                            opacity-0 group-hover:opacity-100
                            transition-opacity items-center justify-center gap-2">
                  <button @click.stop="viewDocument(doc)"
                    class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Previsualizar">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click.stop="handleDownload(doc)"
                    class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Descargar">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button v-if="activeTab === 'received' && getMyPermission(doc) === 'WRITE'"
                    @click.stop="triggerVersionUpload(doc)"
                    class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Subir nueva versión">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button v-if="activeTab === 'received'"
                    @click.stop="handleRemoveShared(doc)"
                    class="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Quitar de compartidos">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Info del archivo -->
              <div class="mt-1.5 px-1 space-y-0.5">
                <p class="text-sm font-medium truncate leading-snug" :title="doc.name">
                  {{ doc.name }}
                </p>
                <p v-if="activeTab === 'received'" class="text-xs text-muted-foreground truncate">
                  Por {{ doc.ownerName || doc.ownerEmail }}
                </p>
                <p v-else class="text-xs text-muted-foreground truncate">
                  {{ doc.sharedWith?.length || 0 }} destinatario{{ (doc.sharedWith?.length || 0) !== 1 ? 's' : '' }}
                </p>
                <p class="text-xs text-muted-foreground font-mono">{{ formatFileSize(doc.size) }}</p>
              </div>

              <!--
                NUEVO: Barra de acciones siempre visible en móvil.
                En sm+ se oculta porque el overlay de hover cubre esa función.
                Esto garantiza que en táctil el usuario pueda ejecutar todas las acciones.
              -->
              <div class="flex items-center justify-around mt-2 pt-2 border-t sm:hidden">
                <button
                  @click.stop="viewDocument(doc)"
                  class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors text-primary"
                  title="Previsualizar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-[10px] text-muted-foreground">Ver</span>
                </button>

                <button
                  @click.stop="handleDownload(doc)"
                  class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors text-indigo-600"
                  title="Descargar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span class="text-[10px] text-muted-foreground">Descargar</span>
                </button>

                <button
                  v-if="activeTab === 'received' && getMyPermission(doc) === 'WRITE'"
                  @click.stop="triggerVersionUpload(doc)"
                  class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors text-green-600"
                  title="Subir nueva versión"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span class="text-[10px] text-muted-foreground">Versión</span>
                </button>

                <button
                  v-if="activeTab === 'received'"
                  @click.stop="handleRemoveShared(doc)"
                  class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors text-red-500"
                  title="Quitar de compartidos"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-[10px] text-muted-foreground">Quitar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ===== VISTA TABLA ===== -->
          <!--
            CAMBIOS EN TABLA:
            1. Se agrega columna de acciones siempre visible (no hidden en móvil).
            2. El botón "⋮" en móvil expande una fila de detalles con toda la info
               que normalmente estaría en columnas ocultas.
            3. Los botones de acción que tenían "hidden sm:flex" ahora están en
               la fila expandida, accesibles en cualquier tamaño.
            4. En desktop (sm+) se mantiene el comportamiento original intacto.
          -->
          <div v-else-if="viewMode === 'table' && filteredDocuments.length > 0"
            class="border rounded-xl overflow-hidden overflow-x-auto bg-card">
            <table class="w-full text-sm min-w-0">
              <thead class="bg-muted/50 border-b sticky top-0">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">
                    {{ activeTab === 'received' ? 'Compartido por' : 'Compartido con' }}
                  </th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-24">Tipo</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell w-24">Tamaño</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-44">Permiso</th>
                  <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32">Fecha</th>
                  <th class="text-right px-4 py-3 font-semibold w-24 sm:w-36">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <template v-for="doc in filteredDocuments" :key="doc.id">
                  <!-- Fila principal -->
                  <tr
                    class="hover:bg-accent/30 transition-colors group cursor-pointer"
                    @click="viewDocument(doc)"
                  >
                    <!-- Nombre -->
                    <td class="px-4 py-3 max-w-[160px] sm:max-w-none">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <img v-if="doc.type.startsWith('image/') && doc.thumbnailUrl"
                            :src="doc.thumbnailUrl" :alt="doc.name"
                            class="w-8 h-8 object-cover rounded" />
                          <img v-else-if="getFileIconUrl(doc.type)"
                            :src="getFileIconUrl(doc.type)!" :alt="getFileType(doc.type)"
                            class="w-7 h-7 object-contain" />
                          <svg v-else class="w-6 h-6 text-muted-foreground"
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div class="min-w-0">
                          <span class="font-medium text-foreground truncate block group-hover:text-primary transition-colors">
                            {{ doc.name }}
                          </span>
                          <!--
                            NUEVO: Info secundaria visible solo en móvil (bajo el nombre).
                            En desktop esto se muestra en columnas dedicadas.
                          -->
                          <span class="text-xs text-muted-foreground sm:hidden block truncate">
                            {{ activeTab === 'received'
                              ? (doc.ownerName || doc.ownerEmail)
                              : `${doc.sharedWith?.length || 0} destinatario${(doc.sharedWith?.length || 0) !== 1 ? 's' : ''}`
                            }}
                          </span>
                          <span class="text-xs text-muted-foreground sm:hidden block">
                            <span class="inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full text-[10px]"
                              :class="getMyPermission(doc) === 'WRITE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                            >
                              {{ getMyPermission(doc) === 'WRITE' ? 'Edición' : 'Lectura' }}
                            </span>
                            <span class="ml-1 font-mono">{{ formatFileSize(doc.size) }}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- Compartido por (received) — solo desktop -->
                    <td v-if="activeTab === 'received'" class="px-4 py-3 hidden lg:table-cell">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span class="text-xs font-bold text-primary uppercase">
                            {{ (doc.ownerName || doc.ownerEmail || '?').charAt(0) }}
                          </span>
                        </div>
                        <span class="text-sm truncate max-w-[140px]" :title="doc.ownerEmail">
                          {{ doc.ownerName || doc.ownerEmail }}
                        </span>
                      </div>
                    </td>

                    <!-- Compartido con (sent) — solo desktop -->
                    <td v-else class="px-4 py-3 hidden lg:table-cell">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="share in (doc.sharedWith || []).slice(0, 2)"
                          :key="share.shareId || share.email"
                          class="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full group/chip"
                          :title="share.email">
                          <span class="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center
                                       text-[10px] font-bold text-primary uppercase">
                            {{ share.email.charAt(0) }}
                          </span>
                          {{ share.email.split('@')[0] }}
                          <button v-if="share.shareId"
                            @click.stop="handleRevokeShare(share.shareId)"
                            class="ml-1 text-red-400 hover:text-red-600 opacity-0
                                   group-hover/chip:opacity-100 transition-opacity rounded"
                            title="Revocar acceso">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                        <span v-if="(doc.sharedWith?.length || 0) > 2" class="text-xs text-muted-foreground">
                          +{{ (doc.sharedWith?.length || 0) - 2 }}
                        </span>
                      </div>
                    </td>

                    <!-- Tipo — solo md+ -->
                    <td class="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {{ getFileType(doc.type) }}
                    </td>

                    <!-- Tamaño — solo lg+ -->
                    <td class="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">
                      {{ formatFileSize(doc.size) }}
                    </td>

                    <!-- Permiso (received) — solo md+ -->
                    <td v-if="activeTab === 'received'" class="px-4 py-3 hidden md:table-cell">
                      <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        :class="getMyPermission(doc) === 'WRITE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'">
                        {{ getMyPermission(doc) === 'WRITE' ? 'Lectura y escritura' : 'Solo lectura' }}
                      </span>
                    </td>

                    <!-- Permiso (sent) — solo md+ -->
                    <td v-else class="px-4 py-3 hidden md:table-cell">
                      <div class="flex gap-1 flex-wrap">
                        <span v-if="doc.sharedWith?.some(s => s.permission === 'WRITE')"
                          class="text-xs font-semibold px-2 py-0.5 rounded-full
                                 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          Edición
                        </span>
                        <span v-if="doc.sharedWith?.some(s => s.permission === 'READ')"
                          class="text-xs font-semibold px-2 py-0.5 rounded-full
                                 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                          Lectura
                        </span>
                      </div>
                    </td>

                    <!-- Fecha — solo xl+ -->
                    <td class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">
                      {{ formatDate(doc.uploadedAt) }}
                    </td>

                    <!-- ===== COLUMNA ACCIONES ===== -->
                    <td class="px-4 py-3 text-right" @click.stop>
                      <div class="flex justify-end gap-1 items-center">

                        <!-- Ver: siempre visible -->
                        <button @click="viewDocument(doc)"
                          class="p-1.5 sm:p-2 hover:bg-primary/10 rounded text-primary"
                          title="Previsualizar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5
                                     c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7
                                     -4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <!-- Descargar: siempre visible -->
                        <button @click="handleDownload(doc)"
                          class="p-1.5 sm:p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded text-indigo-600"
                          title="Descargar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>

                        <!-- Subir versión: solo desktop (sm+) para tab received con permiso WRITE -->
                        <button
                          v-if="activeTab === 'received' && getMyPermission(doc) === 'WRITE'"
                          @click="triggerVersionUpload(doc)"
                          class="hidden sm:flex p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
                          title="Subir nueva versión">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>

                        <!-- Quitar: solo desktop (sm+) para tab received -->
                        <button
                          v-if="activeTab === 'received'"
                          @click="handleRemoveShared(doc)"
                          class="hidden sm:flex p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                          title="Quitar de compartidos">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <!--
                          NUEVO: Botón "más acciones" (kebab ⋮) — solo visible en móvil.
                          Expande/colapsa la fila de detalles debajo de esta fila.
                          Agrupa las acciones que en desktop tienen columnas y botones propios.
                        -->
                        <button
                          class="sm:hidden p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground"
                          :class="expandedRow === doc.id ? 'bg-accent text-foreground' : ''"
                          @click.stop="expandedRow = expandedRow === doc.id ? null : doc.id"
                          title="Más opciones"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5"  r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="12" cy="19" r="1.5"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!--
                    NUEVO: Fila expandida de detalles — solo visible en móvil (sm:hidden).
                    Se muestra al pulsar el botón ⋮ de la fila principal.
                    Contiene toda la información que en desktop aparece en columnas ocultas,
                    más las acciones que no caben en la barra de acciones compacta.
                  -->
                  <tr
                    v-if="expandedRow === doc.id"
                    class="sm:hidden bg-muted/30"
                  >
                    <td colspan="7" class="px-4 py-3">
                      <div class="space-y-3">

                        <!-- Información del archivo -->
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div>
                            <p class="text-muted-foreground">Tipo</p>
                            <p class="font-medium">{{ getFileType(doc.type) }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground">Tamaño</p>
                            <p class="font-medium font-mono">{{ formatFileSize(doc.size) }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground">Fecha</p>
                            <p class="font-medium">{{ formatDate(doc.uploadedAt) }}</p>
                          </div>
                          <div v-if="activeTab === 'received'">
                            <p class="text-muted-foreground">Compartido por</p>
                            <p class="font-medium truncate">{{ doc.ownerName || doc.ownerEmail }}</p>
                          </div>
                          <div v-else>
                            <p class="text-muted-foreground">Destinatarios</p>
                            <p class="font-medium">{{ doc.sharedWith?.length || 0 }} persona{{ (doc.sharedWith?.length || 0) !== 1 ? 's' : '' }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground">Permiso</p>
                            <span class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              :class="getMyPermission(doc) === 'WRITE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'">
                              {{ getMyPermission(doc) === 'WRITE' ? 'Lectura y escritura' : 'Solo lectura' }}
                            </span>
                          </div>
                        </div>

                        <!-- Destinatarios con opción de revocar (tab sent) -->
                        <div v-if="activeTab === 'sent' && doc.sharedWith?.length" class="space-y-1">
                          <p class="text-xs text-muted-foreground font-medium">Compartido con:</p>
                          <div class="flex flex-wrap gap-1.5">
                            <span
                              v-for="share in doc.sharedWith"
                              :key="share.shareId || share.email"
                              class="inline-flex items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              <span class="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center
                                           text-[10px] font-bold text-primary uppercase">
                                {{ share.email.charAt(0) }}
                              </span>
                              <span class="max-w-[120px] truncate">{{ share.email }}</span>
                              <span class="text-[9px] font-semibold px-1 rounded"
                                :class="share.permission === 'WRITE'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'">
                                {{ share.permission === 'WRITE' ? 'Edit' : 'Ver' }}
                              </span>
                              <button
                                v-if="share.shareId"
                                @click.stop="handleRevokeShare(share.shareId)"
                                class="text-red-400 hover:text-red-600 transition-colors"
                                title="Revocar acceso"
                              >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          </div>
                        </div>

                        <!-- Acciones adicionales del móvil -->
                        <div class="flex flex-wrap gap-2 pt-1 border-t">
                          <button
                            v-if="activeTab === 'received' && getMyPermission(doc) === 'WRITE'"
                            @click.stop="triggerVersionUpload(doc)"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400
                                   text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Subir nueva versión
                          </button>

                          <button
                            v-if="activeTab === 'received'"
                            @click.stop="handleRemoveShared(doc)"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400
                                   text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Quitar de compartidos
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Estado vacío -->
          <div v-if="filteredDocuments.length === 0"
            class="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center">
            <div class="text-6xl sm:text-7xl mb-4">{{ activeTab === 'received' ? '🤝' : '📤' }}</div>
            <h3 class="text-lg sm:text-xl font-semibold mb-2">
              {{
                searchTerm || permissionFilter || typeFilter
                  ? 'Sin resultados'
                  : activeTab === 'received'
                    ? 'Nada compartido contigo aún'
                    : 'No has compartido nada aún'
              }}
            </h3>
            <p class="text-sm text-muted-foreground max-w-sm">
              {{
                searchTerm || permissionFilter || typeFilter
                  ? 'Intenta con otros términos o elimina los filtros'
                  : activeTab === 'received'
                    ? 'Cuando alguien comparta un documento contigo, aparecerá aquí'
                    : 'Los archivos que compartas con otros aparecerán aquí'
              }}
            </p>
            <button v-if="searchTerm || permissionFilter || typeFilter"
              @click="clearFilters"
              class="mt-6 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium">
              Limpiar filtros
            </button>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal Visor -->
    <DocumentViewerModal
      v-if="viewingDocument"
      :document="viewingDocument"
      :all-documents="filteredDocuments"
      :preview-url="currentPreviewUrl"
      @close="closeViewer"
      @navigate="navigateDocument"
      @download="handleDownload"
      @request-preview="handleRequestPreview"
    />

    <input ref="versionInput" type="file" class="hidden" @change="onVersionFileChange" />

  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSearchHistory } from '../../composables/useSearchHistory'
import { useSharedDocuments } from '../../composables/useSharedDocuments'
import { getFileIconUrl, getFileType, formatDate } from '../../utils/file'
import DocumentViewerModal from '../../components/DocumentViewerModal.vue'

// ─── Composable ───────────────────────────────────────────────────────────────

const {
  activeTab, searchTerm, permissionFilter, typeFilter,
  sortBy, viewMode, showFilters,
  viewingDocument, currentPreviewUrl,
  loading,
  sharedWithMeDocs, sharedByMeDocs, sharedByMeTotalElements,
  filteredDocuments,
  readCount, writeCount, totalRecipientsCount, sharedWithWriteCount,
  init, clearFilters, getMyPermission,
  viewDocument, closeViewer, navigateDocument,
  handleDownload, handleRequestPreview,
  handleRemoveShared, setUploadingDoc, handleVersionUpload,
  handleRevokeShare,
} = useSharedDocuments()

const {
  recentSearches: history,
  suggestions,
  loadingRecent,
  loadingSuggestions,
  fetchRecent,
  fetchSuggestions,
  deleteOne,
  clearAll,
  clearSuggestions,
} = useSearchHistory()

const loadingSearchDropdown = computed(() =>
  loadingRecent.value || loadingSuggestions.value
)

const showSearchDropdown = ref(false)
const selectedSearchIndex = ref(-1)

/**
 * Controla qué fila de la tabla está expandida en móvil.
 * Valor: id del documento expandido, o null si ninguno.
 * Al cambiar de fila, la anterior se colapsa automáticamente.
 */
const expandedRow = ref<string | null>(null)

let searchHistoryTimeout: ReturnType<typeof setTimeout> | null = null

const searchOptions = computed(() => {
  if (searchTerm.value.trim().length >= 2) {
    return suggestions.value.map(item => ({
      type: 'suggestion' as const,
      label: item,
    }))
  }

  return history.value.map(item => ({
    type: 'recent' as const,
    id: item.id,
    label: item.query,
  }))
})

// ─── Subida de versión ────────────────────────────────────────────────────────

const versionInput = ref<HTMLInputElement | null>(null)

function triggerVersionUpload(doc: any) {
  setUploadingDoc(doc)
  versionInput.value?.click()
}

async function onVersionFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  await handleVersionUpload(file)
  if (versionInput.value) versionInput.value.value = ''
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k     = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

// ─── Búsqueda ─────────────────────────────────────────────────────────────────

watch(searchTerm, (value) => {
  if (searchHistoryTimeout) clearTimeout(searchHistoryTimeout)

  if (value.trim().length < 2) {
    clearSuggestions?.()
    selectedSearchIndex.value = -1
    return
  }

  searchHistoryTimeout = setTimeout(() => {
    fetchSuggestions(value)
  }, 250)
})

function handleSearchInput() {
  showSearchDropdown.value = true
  selectedSearchIndex.value = -1
}

async function openSearchDropdown() {
  showSearchDropdown.value = true
  selectedSearchIndex.value = -1

  if (searchTerm.value.trim().length < 2) {
    await fetchRecent()
  } else {
    await fetchSuggestions(searchTerm.value)
  }
}

function closeSearchDropdown() {
  setTimeout(() => {
    showSearchDropdown.value = false
    selectedSearchIndex.value = -1
  }, 150)
}

function applySearch(value: string) {
  searchTerm.value = value
  showSearchDropdown.value = false
  selectedSearchIndex.value = -1
}

async function handleSearchKeydown(e: KeyboardEvent) {
  if (!showSearchDropdown.value && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    await openSearchDropdown()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!searchOptions.value.length) return

    selectedSearchIndex.value =
      selectedSearchIndex.value < searchOptions.value.length - 1
        ? selectedSearchIndex.value + 1
        : 0
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!searchOptions.value.length) return

    selectedSearchIndex.value =
      selectedSearchIndex.value > 0
        ? selectedSearchIndex.value - 1
        : searchOptions.value.length - 1
  }

  if (e.key === 'Enter') {
    e.preventDefault()

    if (selectedSearchIndex.value >= 0) {
      applySearch(searchOptions.value[selectedSearchIndex.value].label)
      return
    }

    applySearch(searchTerm.value)
  }

  if (e.key === 'Escape') {
    showSearchDropdown.value = false
    selectedSearchIndex.value = -1
  }
}

async function handleDeleteRecent(id: number, event: MouseEvent) {
  event.stopPropagation()
  await deleteOne(id)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onUnmounted(() => {
  if (searchHistoryTimeout) clearTimeout(searchHistoryTimeout)
})

onMounted(() => init())
</script>
<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">

    <!-- ===== HEADER ===== -->
    <header class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40">
      <div class="h-full max-w-full px-4 flex items-center gap-4">

        <!-- Buscador -->
        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar documentos..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">

          <!-- Filtro por estado -->
          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-10 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
              :class="statusFilter ? 'border-primary text-primary' : ''"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              <span class="hidden sm:inline">Filtros</span>
              <span v-if="statusFilter" class="w-2 h-2 rounded-full bg-primary"/>
            </button>

            <div
              v-if="showFilters"
              @click.stop
              class="absolute right-0 top-12 w-64 bg-card border rounded-lg shadow-xl p-4 z-50"
            >
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium mb-1 block">Estado</label>
                  <select v-model="statusFilter"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background">
                    <option value="">Todos</option>
                    <option value="CLASSIFIED">Automático</option>
                    <option value="MANUAL">Manual</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="FAILED">Falló</option>
                  </select>
                </div>
                <div class="flex gap-2 pt-1">
                  <button
                    @click="statusFilter = ''; showFilters = false"
                    class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent"
                  >Limpiar</button>
                  <button
                    @click="showFilters = false"
                    class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg"
                  >Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Nueva categoría -->
          <button
            @click="showNewCategory = true"
            class="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="hidden sm:inline">Nueva Categoría</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== CONTENIDO ===== -->
    <div class="flex-1 flex overflow-hidden">

      <!-- ===== SIDEBAR ===== -->
      <aside class="hidden lg:flex w-64 border-r bg-card/30 flex-col flex-shrink-0 overflow-hidden">
        <div class="p-3 space-y-1 flex-shrink-0">

          <!-- Todos -->
          <button
            @click="selectedCategory = null"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-accent text-foreground'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <span class="flex-1 text-left">Todos los archivos</span>
          </button>

          <!-- Sin clasificar -->
          <button
            v-if="stats.pending > 0"
            @click="selectedCategory = 'unclassified'"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
              selectedCategory === 'unclassified'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'hover:bg-accent text-foreground'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span class="flex-1 text-left">Sin clasificar</span>
            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded text-xs font-medium">
              {{ stats.pending }}
            </span>
          </button>

          <!-- Fallidos -->
          <button
            v-if="stats.failed > 0"
            @click="selectedCategory = 'failed'"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
              selectedCategory === 'failed'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'hover:bg-accent text-foreground'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="flex-1 text-left">Fallidos</span>
            <span class="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded text-xs font-medium">
              {{ stats.failed }}
            </span>
          </button>

          <!-- Categorías colapsables — SIN contador de documentos -->
          <div class="pt-1">
            <button
              @click="showCategories = !showCategories"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all text-sm font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <span class="flex-1 text-left text-xs">Categorías</span>
              <svg
                class="w-3 h-3 transition-transform duration-200"
                :class="showCategories ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <div v-if="showCategories" class="mt-1 space-y-0.5 pl-1">
              <div v-for="cat in categories" :key="cat.id" class="group relative">
                <button
                  @click="selectedCategory = String(cat.id)"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm pr-16',
                    selectedCategory === String(cat.id)
                      ? 'bg-accent font-medium text-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground'
                  ]"
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: cat.color }"/>
                  <span class="flex-1 text-left truncate">{{ cat.name }}</span>
                  <!-- Contador eliminado intencionalmente: se desincroniza al asignar -->
                </button>

                <!-- Editar / Eliminar -->
                <div class="absolute right-2 top-1.5 hidden group-hover:flex items-center gap-1">
                  <template v-if="confirmDeleteId === String(cat.id)">
                    <button @click.stop="confirmDelete(String(cat.id))"
                      class="text-xs px-1.5 py-0.5 bg-destructive text-white rounded font-semibold">✓</button>
                    <button @click.stop="confirmDeleteId = null"
                      class="text-xs px-1.5 py-0.5 border rounded hover:bg-muted">✗</button>
                  </template>
                  <template v-else>
                    <button @click.stop="openEditCategory(cat)"
                      class="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                      title="Editar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button @click.stop="confirmDeleteId = String(cat.id)"
                      class="p-1 hover:bg-destructive/10 rounded text-destructive"
                      title="Eliminar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </template>
                </div>
              </div>

              <p v-if="categories.length === 0" class="px-3 py-2 text-xs text-muted-foreground">
                Sin categorías
              </p>
            </div>
          </div>
        </div>

        <!-- Separador -->
        <div class="px-3 pb-3">
          <div class="h-px bg-border"></div>
        </div>

        <!-- Etiquetas -->
        <div class="flex-1 overflow-y-auto px-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between px-3 py-2">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etiquetas</h3>
              <button @click="showNewTag = true" class="p-1 hover:bg-accent rounded transition-colors">
                <svg class="w-4 h-4 text-muted-foreground hover:text-foreground"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>

            <div v-if="tags.length > 0" class="space-y-0.5">
              <div
                v-for="tag in tags"
                :key="tag.id"
                class="group flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-center gap-2 text-muted-foreground">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span>{{ tag.name }}</span>
                </div>
                <template v-if="confirmDeleteTagId === tag.id">
                  <div class="flex items-center gap-1">
                    <button @click.stop="handleConfirmDeleteTag(tag.id)"
                      class="text-xs px-1.5 py-0.5 bg-destructive text-white rounded font-semibold">✓</button>
                    <button @click.stop="confirmDeleteTagId = null"
                      class="text-xs px-1.5 py-0.5 border rounded hover:bg-muted">✗</button>
                  </div>
                </template>
                <button
                  v-else
                  @click.stop="confirmDeleteTagId = tag.id"
                  class="hidden group-hover:block p-1 hover:bg-destructive/10 rounded text-destructive"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-else class="px-3 py-8 text-center">
              <p class="text-xs text-muted-foreground">Sin etiquetas</p>
              <button @click="showNewTag = true"
                class="mt-3 text-xs text-primary hover:underline font-medium">
                Crear primera etiqueta
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- ===== MAIN ===== -->
      <main class="flex-1 flex flex-col overflow-hidden">

        <!-- Breadcrumb -->
        <div class="h-12 px-6 border-b bg-background/50 flex items-center justify-between flex-shrink-0">
          <nav class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span class="font-medium text-primary">Clasificación inteligente</span>
            <template v-if="selectedCategory">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-muted-foreground">{{ breadcrumbLabel }}</span>
            </template>
          </nav>
          <span class="text-sm text-muted-foreground">
            {{ totalElements }} archivo{{ totalElements !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">

          <!-- ── Stats: valores reales del backend ────────────────────────────── -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Total Archivos</p>
              <p class="text-2xl font-bold text-primary">{{ stats.total }}</p>
              <p class="text-xs text-muted-foreground mt-1">en la biblioteca</p>
            </div>
            <div class="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Clasificados</p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.classified }}</p>
              <p class="text-xs text-muted-foreground mt-1">con categoría asignada</p>
            </div>
            <div class="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-400/10 border border-amber-500/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Sin clasificar</p>
              <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.pending }}</p>
              <p class="text-xs text-muted-foreground mt-1">requieren atención</p>
            </div>
            <div class="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20">
              <p class="text-xs font-semibold text-muted-foreground mb-1">Categorías</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.categoriesCount }}</p>
              <p class="text-xs text-muted-foreground mt-1">creadas</p>
            </div>
          </div>

          <!-- ── Pendientes (solo si no hay filtro activo) ─────────────────────── -->
          <div
            v-if="pendingDocuments.length > 0 && !selectedCategory"
            class="border rounded-xl overflow-hidden bg-card"
          >
            <div class="px-4 py-3 border-b bg-amber-50/50 dark:bg-amber-900/10 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <h3 class="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  Sin clasificar esta página ({{ pendingDocuments.length }})
                </h3>
              </div>
              <span class="text-xs text-amber-600 dark:text-amber-400">Clasificación manual disponible</span>
            </div>
            <div class="divide-y">
              <div
                v-for="doc in pendingDocuments.slice(0, 5)"
                :key="doc.id"
                class="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Miniatura unificada con imágenes reales -->
                  <img
                    :src="getFileIcon(doc.mimeType)"
                    class="w-8 h-8 flex-shrink-0 object-contain"
                    :alt="doc.mimeType"
                  />
                  <div class="min-w-0">
                    <p class="font-medium text-sm truncate">{{ doc.name }}</p>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700
                      dark:bg-amber-900/40 dark:text-amber-400 font-medium">
                      Pendiente
                    </span>
                  </div>
                </div>
                <select
                  @change="applySuggestion(doc, ($event.target as HTMLSelectElement).value)"
                  class="h-8 px-3 text-xs border rounded-lg bg-background focus:outline-none
                    focus:ring-2 focus:ring-primary/50 flex-shrink-0 ml-4"
                >
                  <option value="">Asignar categoría...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div v-if="pendingDocuments.length > 5" class="px-4 py-2 text-xs text-center text-muted-foreground">
                +{{ pendingDocuments.length - 5 }} más —
                <button @click="selectedCategory = 'unclassified'" class="text-primary hover:underline">
                  ver todos
                </button>
              </div>
            </div>
          </div>

          <!-- ── Tabla de documentos ─────────────────────────────────────────── -->
          <div v-if="filteredDocuments.length > 0" class="border rounded-xl overflow-hidden bg-card">
            <div class="px-4 py-3 border-b bg-muted/30">
              <h3 class="text-sm font-semibold">{{ tableTitle }}</h3>
            </div>
            <table class="w-full text-sm">
              <thead class="bg-muted/50 border-b">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell w-44">Estado</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Categoría</th>
                  <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell">Etiquetas</th>
                  <th class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-32">Confianza IA</th>
                  <th class="text-right px-4 py-3 font-semibold w-40">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="hover:bg-accent/30 transition-colors group"
                >
                  <!-- Nombre + miniatura -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img
                        :src="getFileIcon(doc.mimeType)"
                        class="w-8 h-8 flex-shrink-0 object-contain"
                        :alt="doc.mimeType"
                      />
                      <span class="font-medium truncate max-w-[180px]" :title="doc.name">
                        {{ doc.name }}
                      </span>
                    </div>
                  </td>

                  <!-- Estado -->
                  <td class="px-4 py-3 hidden md:table-cell">
                    <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      :class="getStatusColor(doc)">
                      {{ getStatusLabel(doc) }}
                    </span>
                  </td>

                  <!-- Categoría -->
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <div v-if="doc.categoryId" class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: getCategoryColor(doc.categoryId) }"/>
                      <span class="text-sm">{{ getCategoryName(doc.categoryId) }}</span>
                    </div>
                    <span v-else class="text-muted-foreground text-xs">Sin categoría</span>
                  </td>

                  <!-- Etiquetas -->
                  <td class="px-4 py-3 hidden xl:table-cell">
                    <div class="flex flex-wrap gap-1 items-center">
                      <span
                        v-for="tag in (doc.tags ?? [])"
                        :key="tag"
                        class="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        {{ tag }}
                        <button @click="handleRemoveTag(doc, tag)"
                          class="hover:text-destructive transition-colors ml-0.5">×</button>
                      </span>
                      <select
                        @change="handleAddTag(doc, ($event.target as HTMLSelectElement))"
                        class="h-6 px-1 text-xs border rounded-lg bg-background focus:outline-none max-w-[90px]"
                      >
                        <option value="">Etiqueta</option>
                        <option v-for="tag in availableTags(doc)" :key="tag.id" :value="tag.id">
                          {{ tag.name }}
                        </option>
                      </select>
                    </div>
                  </td>

                  <!-- Confianza IA -->
                  <td class="px-4 py-3 hidden xl:table-cell">
                    <div v-if="doc.confidenceScore != null">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all"
                            :class="doc.confidenceScore >= 0.50
                              ? 'bg-green-500'
                              : doc.confidenceScore >= 0.20
                              ? 'bg-amber-500'
                              : 'bg-red-500'"
                            :style="{ width: `${(doc.confidenceScore * 100).toFixed(0)}%` }"
                          />
                        </div>
                        <span class="text-xs text-muted-foreground w-8 text-right">
                          {{ (doc.confidenceScore * 100).toFixed(0) }}%
                        </span>
                      </div>
                    </div>
                    <span v-else class="text-muted-foreground text-xs">—</span>
                  </td>

                  <!-- Acción -->
                  <td class="px-4 py-3 text-right">
                    <select
                      :value="doc.categoryId ? String(doc.categoryId) : ''"
                      @change="applySuggestion(doc, ($event.target as HTMLSelectElement).value)"
                      class="h-8 px-2 text-xs border rounded-lg bg-background focus:outline-none
                        focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Sin categoría</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginación -->
            <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t">
              <p class="text-xs text-muted-foreground">
                Mostrando {{ currentPage * 20 + 1 }}–{{ Math.min((currentPage + 1) * 20, totalElements) }}
                de {{ totalElements }}
              </p>
              <div class="flex gap-1">
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 0"
                  class="h-8 w-8 rounded-lg border text-sm hover:bg-accent
                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                    flex items-center justify-center"
                >‹</button>
                <button
                  v-for="p in totalPages" :key="p"
                  @click="goToPage(p - 1)"
                  class="h-8 w-8 rounded-lg text-sm font-medium transition-colors"
                  :class="currentPage === p - 1
                    ? 'bg-primary text-primary-foreground'
                    : 'border hover:bg-accent'"
                >{{ p }}</button>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages - 1"
                  class="h-8 w-8 rounded-lg border text-sm hover:bg-accent
                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                    flex items-center justify-center"
                >›</button>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-if="filteredDocuments.length === 0 && !loadingStats"
            class="flex flex-col items-center justify-center py-20">
            <div class="text-7xl mb-4">🏷️</div>
            <h3 class="text-xl font-semibold mb-2">
              {{ searchQuery || statusFilter ? 'Sin resultados' : 'No hay archivos' }}
            </h3>
            <p class="text-sm text-muted-foreground text-center max-w-sm">
              {{ searchQuery || statusFilter
                ? 'Intenta con otros términos o elimina los filtros'
                : 'Sube documentos para comenzar a clasificarlos' }}
            </p>
          </div>

        </div>
      </main>
    </div>

    <!-- ===== MODAL: NUEVA CATEGORÍA ===== -->
    <div v-if="showNewCategory"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showNewCategory = false">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Nueva Categoría</h2>
          <button @click="showNewCategory = false" class="p-2 hover:bg-muted rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-1.5 block">Nombre</label>
            <input v-model="newCategoryName" type="text" placeholder="Ej: Contratos, Facturas..."
              class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
          <div>
            <label class="text-sm font-semibold mb-1.5 block">Color</label>
            <div class="flex items-center gap-3">
              <input type="color" v-model="newCategoryColor"
                class="w-12 h-11 border rounded-lg cursor-pointer p-1"/>
              <div class="flex-1 h-11 rounded-lg border flex items-center px-4 gap-3">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: newCategoryColor }"/>
                <span class="text-sm font-mono text-muted-foreground">{{ newCategoryColor }}</span>
              </div>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-muted/30 border flex items-center gap-3">
            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: newCategoryColor }"/>
            <span class="text-sm font-medium">{{ newCategoryName || 'Nombre de categoría' }}</span>
            <span class="ml-auto text-xs text-muted-foreground">Vista previa</span>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showNewCategory = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">
            Cancelar
          </button>
          <button @click="handleCreateCategory" :disabled="!newCategoryName.trim()"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg
              transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            Crear Categoría
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: EDITAR CATEGORÍA ===== -->
    <div v-if="showEditCategory && editingCategory"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showEditCategory = false">
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Editar Categoría</h2>
          <button @click="showEditCategory = false" class="p-2 hover:bg-muted rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-1.5 block">Nombre</label>
            <input v-model="editingCategory.name" type="text"
              class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
          <div>
            <label class="text-sm font-semibold mb-1.5 block">Color</label>
            <div class="flex items-center gap-3">
              <input type="color" v-model="editingCategory.color"
                class="w-12 h-11 border rounded-lg cursor-pointer p-1"/>
              <div class="flex-1 h-11 rounded-lg border flex items-center px-4 gap-3">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: editingCategory.color }"/>
                <span class="text-sm font-mono text-muted-foreground">{{ editingCategory.color }}</span>
              </div>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-muted/30 border flex items-center gap-3">
            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: editingCategory.color }"/>
            <span class="text-sm font-medium">{{ editingCategory.name || 'Nombre de categoría' }}</span>
            <span class="ml-auto text-xs text-muted-foreground">Vista previa</span>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showEditCategory = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">
            Cancelar
          </button>
          <button @click="handleSaveEditCategory" :disabled="!editingCategory.name.trim()"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg
              transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: NUEVA ETIQUETA ===== -->
    <div v-if="showNewTag"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showNewTag = false">
      <div class="bg-background rounded-2xl w-full max-w-sm p-6 border shadow-2xl" @click.stop>
        <h2 class="text-xl font-bold mb-4">Nueva Etiqueta</h2>
        <input
          v-model="newTagName"
          type="text"
          placeholder="Ej: urgente, revisión, aprobado..."
          class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none
            focus:ring-2 focus:ring-primary/50 mb-6"
          @keyup.enter="handleCreateTag"
        />
        <div class="flex gap-3">
          <button @click="showNewTag = false"
            class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium">
            Cancelar
          </button>
          <button @click="handleCreateTag" :disabled="!newTagName.trim()"
            class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg
              transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            Crear
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClassification } from '../../composables/useClassification'
// ↓ Importar ClassifiedDocument en vez de Document
import type { ClassifiedDocument } from '../../composables/useClassification'

const {
  documents,
  categories,
  tags,
  stats,
  loadingStats,
  pendingDocuments,
  totalElements,
  currentPage,
  totalPages,
  init,
  goToPage,
  assignCategory,
  assignTagToDocument,
  removeTagFromDocument,
  addCategory,
  updateCategory,
  deleteCategory,
  createTag,
  deleteTag,
} = useClassification()

// Estado UI — sin cambios
const searchQuery        = ref('')
const statusFilter       = ref('')
const showFilters        = ref(false)
const showNewCategory    = ref(false)
const showEditCategory   = ref(false)
const showNewTag         = ref(false)
const showCategories     = ref(true)
const newCategoryName    = ref('')
const newCategoryColor   = ref('#6366f1')
const newTagName         = ref('')
const confirmDeleteId    = ref<string | null>(null)
const confirmDeleteTagId = ref<number | null>(null)  // ← siempre number
const selectedCategory   = ref<string | null>(null)
const editingCategory    = ref<{ id: string; name: string; color: string } | null>(null)

onMounted(() => init())

// ── Computed ──────────────────────────────────────────────────────────────────
// Ahora documents es ClassifiedDocument[], todos los campos existen ✓
const filteredDocuments = computed(() => {
  let docs = [...documents.value]

  if (selectedCategory.value === 'unclassified') {
    docs = docs.filter(d => !d.categoryId)
  } else if (selectedCategory.value === 'failed') {
    docs = docs.filter(d => d.status === 'FAILED')
  } else if (selectedCategory.value) {
    docs = docs.filter(d => String(d.categoryId) === selectedCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    docs = docs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))  // ✓ tags es string[]
    )
  }

  if (statusFilter.value) {
    docs = docs.filter(d => getClassificationStatus(d) === statusFilter.value)
  }

  return docs
})

const breadcrumbLabel = computed(() => {
  if (selectedCategory.value === 'unclassified') return 'Sin clasificar'
  if (selectedCategory.value === 'failed')        return 'Fallidos'
  return categories.value.find(c => String(c.id) === selectedCategory.value)?.name ?? ''
})

const tableTitle = computed(() => {
  if (selectedCategory.value === 'unclassified') return 'Sin clasificar'
  if (selectedCategory.value === 'failed')        return 'Fallidos'
  if (selectedCategory.value)
    return categories.value.find(c => String(c.id) === selectedCategory.value)?.name ?? ''
  return 'Todos los archivos'
})

// ── Helpers de presentación — usan ClassifiedDocument ─────────────────────────
function getFileIcon(mimeType: string): string {
  if (!mimeType) return '/icons/file.png'
  if (mimeType.includes('pdf'))                                            return '/icons/pdf.png'
  if (mimeType.includes('word') || mimeType.includes('wordprocessingml')) return '/icons/word.png'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))    return '/icons/excel.png'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '/icons/powerpoint.png'
  return '/icons/file.png'
}

function getClassificationStatus(doc: ClassifiedDocument): string {
  if (doc.status === 'FAILED') return 'FAILED'
  if (doc.categoryId) return doc.isAutomaticallyAssigned ? 'CLASSIFIED' : 'MANUAL'
  return 'PENDING'
}

function getStatusLabel(doc: ClassifiedDocument): string {
  const labels: Record<string, string> = {
    CLASSIFIED: 'Automático', MANUAL: 'Manual',
    PENDING: 'Pendiente',     FAILED: 'Falló',
  }
  return labels[getClassificationStatus(doc)] ?? 'Pendiente'
}

function getStatusColor(doc: ClassifiedDocument): string {
  const colors: Record<string, string> = {
    CLASSIFIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    MANUAL:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    PENDING:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    FAILED:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  }
  return colors[getClassificationStatus(doc)] ?? colors.PENDING
}

function getCategoryName(categoryId: number | string): string {
  return categories.value.find(c => String(c.id) === String(categoryId))?.name ?? '—'
}

function getCategoryColor(categoryId: number | string): string {
  return categories.value.find(c => String(c.id) === String(categoryId))?.color ?? '#888'
}

function availableTags(doc: ClassifiedDocument) {
  return tags.value.filter((t: any) => !doc.tags.includes(t.name))  // ✓ doc.tags es string[]
}

// ── Acciones ──────────────────────────────────────────────────────────────────

// ↓ CORRECCIÓN CLAVE: usar doc.backendId! (number) en vez de doc.id (string)
async function applySuggestion(doc: ClassifiedDocument, categoryId: string) {
  if (!doc.backendId) return
  await assignCategory(doc.backendId, categoryId)  // ✓ number, ya no hay error
}

async function handleCreateCategory() {
  if (!newCategoryName.value.trim()) return
  await addCategory(newCategoryName.value.trim(), newCategoryColor.value)
  showNewCategory.value = false
  newCategoryName.value = ''
  newCategoryColor.value = '#6366f1'
}

function openEditCategory(cat: { id: number; name: string; color: string }) {
  editingCategory.value = { id: String(cat.id), name: cat.name, color: cat.color }
  showEditCategory.value = true
}

async function handleSaveEditCategory() {
  if (!editingCategory.value?.name.trim()) return
  await updateCategory(editingCategory.value.id, editingCategory.value.name, editingCategory.value.color)
  showEditCategory.value = false
  editingCategory.value = null
}

async function confirmDelete(id: string) {
  await deleteCategory(id)
  confirmDeleteId.value = null
  if (selectedCategory.value === id) selectedCategory.value = null
}

async function handleCreateTag() {
  if (!newTagName.value.trim()) return
  await createTag(newTagName.value.trim())
  newTagName.value = ''
  showNewTag.value = false
}

async function handleConfirmDeleteTag(id: number) {
  await deleteTag(id)
  confirmDeleteTagId.value = null
}

async function handleAddTag(doc: ClassifiedDocument, select: HTMLSelectElement) {
  const tagId = Number(select.value)
  if (!tagId) return
  await assignTagToDocument(doc, tagId)  // ✓ wrapper en composable
  select.value = ''
}

async function handleRemoveTag(doc: ClassifiedDocument, tagName: string) {
  const tag = tags.value.find((t: any) => t.name === tagName)
  if (!tag) return
  await removeTagFromDocument(doc, tag.id)  // ✓ wrapper en composable
}
</script>
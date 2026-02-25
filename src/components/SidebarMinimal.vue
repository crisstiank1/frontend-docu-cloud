<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Navegación rápida -->
    <div class="p-3 space-y-1 flex-shrink-0">

      <!-- Todos los archivos -->
      <button
        @click="emit('selectFolder', null)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
          currentFolderId === null && !showingFavorites && !currentCategoryId
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'hover:bg-accent text-foreground'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span class="flex-1 text-left">Todos los archivos</span>
      </button>

      <!-- Favoritos -->
      <button
        @click="emit('showFavorites')"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
          showingFavorites
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : 'hover:bg-accent text-foreground'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span class="flex-1 text-left">Favoritos</span>
        <!-- Contador de favoritos, solo visible si hay alguno -->
        <span v-if="favoriteCount > 0" class="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">
          {{ favoriteCount }}
        </span>
      </button>

      <!-- Sección de Categorías (colapsable) -->
      <div class="pt-1">
        <!-- Encabezado colapsable de categorías -->
        <button
          @click="showCategories = !showCategories"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all text-sm font-semibold text-muted-foreground uppercase tracking-wider"
        >
          <!-- Ícono de etiqueta -->
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="flex-1 text-left text-xs">Categorías</span>
          <!-- Flecha que rota según estado colapsado/expandido -->
          <svg
            class="w-3 h-3 transition-transform duration-200"
            :class="showCategories ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Lista de categorías disponibles -->
        <div v-if="showCategories" class="mt-1 space-y-0.5 pl-1">
          <!-- Botón por cada categoría con su color indicador -->
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="emit('selectCategory', cat.id)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
              currentCategoryId === cat.id
                ? 'bg-accent font-medium text-foreground'
                : 'hover:bg-accent/50 text-muted-foreground'
            ]"
          >
            <!-- Punto de color de la categoría -->
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: cat.color }"
            />
            <span class="flex-1 text-left">{{ cat.name }}</span>
          </button>

          <!-- Estado vacío cuando no hay categorías creadas -->
          <p v-if="categories.length === 0" class="px-3 py-2 text-xs text-muted-foreground">
            Sin categorías
          </p>
        </div>
      </div>

      <!-- Sin clasificar (solo visible si hay archivos sin carpeta) -->
      <button
        v-if="unclassifiedCount > 0"
        @click="emit('selectFolder', '')"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
          currentFolderId === '' && !showingFavorites
            ? 'bg-accent font-medium'
            : 'hover:bg-accent/50 text-muted-foreground'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="flex-1 text-left">Sin clasificar</span>
        <!-- Contador de archivos sin clasificar -->
        <span class="px-2 py-0.5 bg-muted rounded text-xs font-medium">{{ unclassifiedCount }}</span>
      </button>
    </div>

    <!-- Separador visual -->
    <div class="px-3 pb-3">
      <div class="h-px bg-border"></div>
    </div>

    <!-- Sección de Carpetas (scrolleable) -->
    <div class="flex-1 overflow-y-auto px-3">
      <div class="space-y-2">

        <!-- Encabezado de carpetas con botón para crear nueva -->
        <div class="flex items-center justify-between px-3 py-2">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carpetas</h3>
          <button
            @click="emit('createFolder')"
            class="p-1 hover:bg-accent rounded transition-colors"
            title="Nueva carpeta"
          >
            <svg class="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Árbol de carpetas raíz -->
        <div v-if="rootFolders.length > 0" class="space-y-0.5">
          <FolderTreeNode
            v-for="folder in rootFolders"
            :key="folder.id"
            :folder="folder"
            :all-folders="folders"
            :selected-folder="currentFolderId"
            :expanded="expandedFolders"
            @select="emit('selectFolder', $event)"
            @toggle="toggleFolder"
            @rename="emit('renameFolder', $event)"
            @delete="emit('deleteFolder', $event)"
            @drop-document="emit('dropDocument', $event)"
          />
        </div>

        <!-- Estado vacío cuando no hay carpetas creadas -->
        <div v-else class="px-3 py-8 text-center">
          <div class="text-4xl mb-2">📁</div>
          <p class="text-xs text-muted-foreground">Sin carpetas</p>
          <button
            @click="emit('createFolder')"
            class="mt-3 text-xs text-primary hover:underline font-medium"
          >
            Crear primera carpeta
          </button>
        </div>
      </div>
    </div>

    <!-- Acciones inferiores: botón para crear carpeta -->
    <div class="p-3 border-t flex-shrink-0">
      <button
        @click="emit('createFolder')"
        class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <span>Nueva Carpeta</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Folder, DocumentCategory } from '../composables/useDocuments'
import FolderTreeNode from './FolderTreeNode.vue'

// Definición de props que recibe el componente
interface Props {
  rootFolders: Folder[]                  // Carpetas raíz del usuario
  currentFolderId: string | null         // Carpeta actualmente seleccionada
  folders: Record<string, Folder>        // Mapa completo de carpetas
  unclassifiedCount: number              // Archivos sin carpeta asignada
  favoriteCount: number                  // Total de archivos favoritos
  showingFavorites: boolean              // Si está activa la vista de favoritos
  categories: DocumentCategory[]         // Lista de categorías disponibles
  currentCategoryId?: string | null      // Categoría actualmente seleccionada
}

defineProps<Props>()

// Eventos que emite hacia el componente padre
const emit = defineEmits<{
  selectFolder: [folderId: string | null | '']       // Seleccionar o limpiar carpeta
  showFavorites: []                                   // Activar vista de favoritos
  createFolder: []                                    // Abrir modal de nueva carpeta
  renameFolder: [folderId: string]                    // Renombrar una carpeta
  deleteFolder: [folderId: string]                    // Eliminar una carpeta
  dropDocument: [payload: { targetFolderId: string }] // Soltar documento en carpeta
  selectCategory: [categoryId: string]                // Filtrar por categoría
}>()

// Controla qué carpetas están expandidas en el árbol
const expandedFolders = ref<Set<string>>(new Set())

// Controla si la sección de categorías está expandida (abierta por defecto)
const showCategories = ref(true)

// Alterna el estado expandido/colapsado de una carpeta
function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}
</script>

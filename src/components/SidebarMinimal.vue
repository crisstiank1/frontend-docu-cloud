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
      </button>

      <!-- Sección de Categorías (colapsable) -->
      <div class="pt-1">
        <button
          @click="showCategories = !showCategories"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all text-sm font-semibold text-muted-foreground uppercase tracking-wider"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="flex-1 text-left text-xs">Categorías</span>
          <svg
            class="w-3 h-3 transition-transform duration-200"
            :class="showCategories ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showCategories" class="mt-1 space-y-0.5 pl-1">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="emit('selectCategory', String(cat.id))"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
              currentCategoryId === String(cat.id)
                ? 'bg-accent font-medium text-foreground'
                : 'hover:bg-accent/50 text-muted-foreground'
            ]"
          >
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: cat.color }"
            />
            <span class="flex-1 text-left">{{ cat.name }}</span>
          </button>

          <p v-if="categories.length === 0" class="px-3 py-2 text-xs text-muted-foreground">
            Sin categorías
          </p>
        </div>
      </div>

      <!-- Sin clasificar -->
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
        <span class="px-2 py-0.5 bg-muted rounded text-xs font-medium">{{ unclassifiedCount }}</span>
      </button>
    </div>

    <!-- Separador visual -->
    <div class="px-3 pb-3">
      <div class="h-px bg-border"></div>
    </div>

    <!-- Sección de Carpetas (scrolleable) -->
    <div class="flex-1 overflow-y-scroll px-3">
      <div class="space-y-2">

        <div class="flex items-center justify-between px-3 py-2">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carpetas</h3>
          <button
            @click="emit('createFolder', currentFolderId ?? undefined)"
            class="p-1 hover:bg-accent rounded transition-colors"
            title="Nueva carpeta"
          >
            <svg class="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

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
            @create="emit('createFolder', $event)"
            @rename="emit('renameFolder', $event)"
            @delete="emit('deleteFolder', $event)"
            @drop-document="emit('dropDocument', $event)"
          />
        </div>

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

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Folder, DocumentCategory } from '../composables/useDocuments'
import FolderTreeNode from './FolderTreeNode.vue'

interface Props {
  rootFolders: Folder[]
  currentFolderId: string | null
  folders: Record<string, Folder>
  unclassifiedCount: number
  showingFavorites: boolean
  categories: DocumentCategory[]
  currentCategoryId?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'selectFolder': [folderId: string | null | '']
  'showFavorites': []
  'createFolder': [parentFolderId?: string]
  'renameFolder': [folderId: string]
  'deleteFolder': [folderId: string]
  'dropDocument': [payload: { targetFolderId: string }]
  'selectCategory': [categoryId: string]
}>()

const expandedFolders = ref<Set<string>>(new Set())
const showCategories = ref(true)

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}
</script>
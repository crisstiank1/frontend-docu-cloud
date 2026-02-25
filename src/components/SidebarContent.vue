<template>
  <div class="space-y-4">
    <!-- Quick Stats Card -->
    <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs sm:text-sm text-muted-foreground">Total Archivos</span>
          <span class="text-xl sm:text-2xl font-bold text-primary">{{ allUserDocuments.length }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs sm:text-sm text-muted-foreground">⭐ Favoritos</span>
          <span class="text-lg sm:text-xl font-semibold">{{ favoriteDocuments.length }}</span>
        </div>
      </div>
    </div>

    <!-- Favorites Section -->
    <div class="bg-card rounded-xl border p-4">
      <h3 class="font-semibold text-xs sm:text-sm mb-3 flex items-center gap-2">
        <span class="text-lg">⭐</span>
        Favoritos
      </h3>
      <div class="space-y-2">
        <div v-if="favoriteDocuments.length === 0" class="text-xs text-muted-foreground text-center py-4">
          No hay favoritos aún
        </div>
        <button
          v-for="doc in favoriteDocuments"
          :key="doc.id"
          @click="emit('viewDocument', doc)"
          class="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-accent transition-colors group flex items-start gap-2"
        >
          <span class="text-base flex-shrink-0">📄</span>
          <span class="truncate group-hover:text-primary transition-colors">{{ doc.name }}</span>
        </button>
      </div>
    </div>

    <!-- Folder Navigation -->
    <div class="bg-card rounded-xl border p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-xs sm:text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Carpetas
        </h3>
        <button
          @click="emit('showCreateFolder')"
          class="text-primary hover:text-primary/80 transition-colors"
          title="Nueva carpeta"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div class="space-y-1">
        <!-- All Files Button -->
        <button
          @click="emit('selectFolder', null)"
          :class="[
            'w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 text-xs sm:text-sm font-medium',
            currentFolderId === null
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'hover:bg-accent text-foreground'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Todos los Archivos
        </button>

        <!-- Unclassified -->
        <button
          @click="emit('selectFolder', '')"
          :class="[
            'w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 text-xs sm:text-sm',
            currentFolderId === ''
              ? 'bg-accent text-accent-foreground font-medium'
              : 'hover:bg-accent/50 text-muted-foreground'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Sin clasificar
          <span v-if="unclassifiedCount" class="ml-auto text-xs bg-muted px-2 py-1 rounded">{{ unclassifiedCount }}</span>
        </button>

        <!-- Folders List -->
        <FolderTree
          v-if="rootFolders.length > 0"
          :folders="rootFolders"
          :all-folders="folders"
          :selected-folder="currentFolderId"
          @select="emit('selectFolder', $event)"
          @create="emit('showCreateFolder')"
          @rename="emit('openRename', $event)"
          @delete="emit('confirmDelete', $event)"
        />

        <div v-if="rootFolders.length === 0" class="text-xs text-muted-foreground text-center py-3">
          Sin carpetas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document, Folder } from '../composables/useDocuments'
import FolderTree from './FolderTree.vue'

interface Props {
  rootFolders: Folder[]
  currentFolderId: string | null
  favoriteDocuments: Document[]
  allUserDocuments: Document[]
  unclassifiedCount: number
  folders: Record<string, Folder>
}

defineProps<Props>()

const emit = defineEmits<{
  selectFolder: [folderId: string | null | '']
  showCreateFolder: []
  openRename: [folderId: string]
  confirmDelete: [folderId: string]
  viewDocument: [doc: Document]
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="px-3 py-2">
      <button
        @click="emit('create', selectedFolder)"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed hover:bg-accent transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Carpeta
      </button>
    </div>

    <div class="border-t pt-2">
      <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Carpetas</div>
      <div v-if="folders.length === 0" class="px-3 py-2 text-xs text-muted-foreground">
        No hay carpetas
      </div>
      <FolderTreeNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :all-folders="allFolders"
        :selected-folder="selectedFolder"
        :expanded="expandedFolders"
        @select="(id) => emit('select', id)"
        @toggle="(id) => toggleFolder(id)"
        @create="(id) => emit('create', id)"
        @rename="(id) => emit('rename', id)"
        @delete="(id) => emit('delete', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Folder } from '../composables/useDocuments'
import FolderTreeNode from './FolderTreeNode.vue'

interface Props {
  folders: Folder[]
  allFolders: Record<string, Folder>
  selectedFolder: string | null
}

defineProps<Props>()
const emit = defineEmits<{
  select: [folderId: string]
  create: [parentId: string | null]
  rename: [folderId: string]
  delete: [folderId: string]
}>()

const expandedFolders = ref<Set<string>>(new Set())

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}
</script>

<template>
  <div class="space-y-0.5">
    <div
      :class="[
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all group cursor-pointer',
        selectedFolder === folder.id ? 'bg-accent font-medium' : 'hover:bg-accent/50',
        isDragOver && 'bg-primary/20 ring-2 ring-primary'
      ]"
      @click="emit('select', folder.id)"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
    >
      <!-- Toggle Chevron -->
      <button
        v-if="folder.childFolders.length > 0"
        @click.stop="emit('toggle', folder.id)"
        class="p-0.5 hover:bg-accent rounded transition-colors flex-shrink-0"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else class="w-5 flex-shrink-0"></span>

      <!-- Folder Icon -->
      <svg class="w-5 h-5 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>

      <!-- Folder Name -->
      <span class="flex-1 text-sm truncate">{{ folder.name }}</span>

      <!-- Document Count Badge -->
      <span
        v-if="folder.documentCount > 0"
        class="px-2 py-0.5 bg-muted rounded text-xs font-medium flex-shrink-0"
      >
        {{ folder.documentCount }}
      </span>

      <!-- Actions Menu -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          @click.stop="emit('rename', folder.id)"
          class="p-1 hover:bg-accent rounded transition-colors"
          title="Renombrar"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click.stop="emit('delete', folder.id)"
          class="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
          title="Eliminar"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Child Folders (Recursive) -->
    <div v-if="isExpanded && folder.childFolders.length > 0" class="ml-4 space-y-0.5">
      <FolderTreeNode
        v-for="childId in folder.childFolders"
        :key="childId"
        :folder="allFolders[childId]"
        :all-folders="allFolders"
        :selected-folder="selectedFolder"
        :expanded="expanded"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @rename="emit('rename', $event)"
        @delete="emit('delete', $event)"
        @drop-document="emit('dropDocument', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Folder } from '../composables/useDocuments'

interface Props {
  folder: Folder
  allFolders: Record<string, Folder>
  selectedFolder: string | null
  expanded: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [folderId: string]
  toggle: [folderId: string]
  rename: [folderId: string]
  delete: [folderId: string]
  dropDocument: [payload: { targetFolderId: string }]
}>()

const isDragOver = ref(false)
const dragEnterCount = ref(0)

const isExpanded = computed(() => props.expanded.has(props.folder.id))

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  dragEnterCount.value++
  if (dragEnterCount.value === 1) {
    isDragOver.value = true
  }
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  dragEnterCount.value--
  if (dragEnterCount.value === 0) {
    isDragOver.value = false
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  dragEnterCount.value = 0
  
  emit('dropDocument', { 
    targetFolderId: props.folder.id 
  })
}
</script>

<template>
  <!--
    DEFENSA #1: si folder llega undefined (childId existe en el array pero no
    en allFolders), no renderizamos nada. Esto corta el TypeError que luego
    hacía explotar formatTrace con RangeError.
  -->
  <div v-if="folder" class="space-y-0.5">
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

      <!-- Actions Menu -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          @click.stop="emit('create', folder.id)"
          class="p-1 hover:bg-accent rounded transition-colors"
          title="Nueva subcarpeta"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
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

    <!--
      DEFENSA #2 y #3 combinadas:
      - v-if="isExpanded" : el usuario debe expandir explícitamente (ya existía)
      - :key con v-if="validChild(childId)": filtra childIds que no existen en
        allFolders ANTES de pasarlos como prop, evitando folder=undefined en el hijo
      - :depth="depth + 1" + v-if="depth < MAX_DEPTH": corta la recursión si el
        árbol de datos tiene un ciclo que llegó hasta aquí sin detectarse
    -->
    <div v-if="isExpanded && validChildren.length > 0" class="ml-4 space-y-0.5">
      <FolderTreeNode
        v-for="childId in validChildren"
        :key="childId"
        :folder="allFolders[childId]"
        :all-folders="allFolders"
        :selected-folder="selectedFolder"
        :expanded="expanded"
        :depth="depth + 1"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @create="emit('create', $event)"
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

// Límite de profundidad de renderizado.
// Protege contra ciclos que no fueron detectados por sanitizeFolders.
// El máximo real del negocio es 5 (MAX_FOLDER_DEPTH en useDocuments),
// ponemos 8 como margen de seguridad antes de cortar.
const MAX_DEPTH = 8

interface Props {
  folder: Folder | undefined   // undefined es posible si childId no existe en allFolders
  allFolders: Record<string, Folder>
  selectedFolder: string | null
  expanded: Set<string>
  depth?: number               // profundidad actual en el árbol (raíz = 0)
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
})

const emit = defineEmits<{
  select: [folderId: string]
  toggle: [folderId: string]
  create: [parentId: string]
  rename: [folderId: string]
  delete: [folderId: string]
  dropDocument: [payload: { targetFolderId: string }]
}>()

const isDragOver = ref(false)
const dragEnterCount = ref(0)

const isExpanded = computed(() =>
  props.folder ? props.expanded.has(props.folder.id) : false
)

// DEFENSA #2: filtra los childIds que realmente existen en allFolders
// y que no superan la profundidad máxima de renderizado.
// Nunca pasamos undefined como prop :folder a un hijo.
const validChildren = computed(() => {
  if (!props.folder || props.depth >= MAX_DEPTH) return []
  return props.folder.childFolders.filter(
    (childId) => childId in props.allFolders
  )
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  dragEnterCount.value++
  if (dragEnterCount.value === 1) isDragOver.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  dragEnterCount.value--
  if (dragEnterCount.value === 0) isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  dragEnterCount.value = 0
  if (props.folder) {
    emit('dropDocument', { targetFolderId: props.folder.id })
  }
}
</script>
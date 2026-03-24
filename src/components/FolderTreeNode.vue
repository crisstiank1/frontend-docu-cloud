<template>
  <div v-if="folder" class="space-y-0.5">
    <div
      :class="[
        'relative flex items-center gap-2 py-2 pr-3 rounded-lg transition-all group cursor-pointer',
        selectedFolder === folder.id ? 'bg-accent font-medium' : 'hover:bg-accent/50',
        isDragOver && 'bg-primary/20 ring-2 ring-primary'
      ]"
      :style="{ paddingLeft: depth === 0 ? '12px' : `${depth * 16 + 4}px` }"
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
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else-if="depth > 0" class="w-5 flex-shrink-0"></span>

      <!-- Folder Icon -->
      <svg class="w-5 h-5 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>

      <!-- Folder Name -->
      <span class="flex-1 min-w-0 text-sm truncate" :title="folder.name">
        {{ folder.name }}
      </span>

      <!-- ✅ Botón de 3 puntos — solo visible en hover -->
      <div class="relative flex-shrink-0">
        <button
          @click.stop="toggleMenu"
          class="p-1 rounded transition-colors opacity-0 group-hover:opacity-100
                 hover:bg-accent"
          title="Más opciones"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        <!-- ✅ Dropdown del menú -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          leave-active-class="transition-all duration-150 ease-in"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-1 z-50 min-w-[160px]
                   bg-popover border border-border rounded-lg shadow-lg
                   py-1 text-sm"
            @click.stop
          >
            <button
              @click="handleAction('create')"
              class="w-full flex items-center gap-2 px-3 py-2
                     hover:bg-accent transition-colors text-left"
            >
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva subcarpeta
            </button>

            <button
              @click="handleAction('rename')"
              class="w-full flex items-center gap-2 px-3 py-2
                     hover:bg-accent transition-colors text-left"
            >
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Renombrar
            </button>

            <div class="border-t border-border my-1" />

            <button
              @click="handleAction('delete')"
              class="w-full flex items-center gap-2 px-3 py-2
                     hover:bg-destructive/10 text-destructive transition-colors text-left"
            >
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="isExpanded && validChildren.length > 0" class="space-y-0.5">
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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Folder } from '../composables/useDocuments'

const MAX_DEPTH = 8

interface Props {
  folder: Folder | undefined
  allFolders: Record<string, Folder>
  selectedFolder: string | null
  expanded: Set<string>
  depth?: number
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

// --- Estado del menú ---
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

// Cierra el menú al hacer clic fuera
function handleOutsideClick(e: MouseEvent) {
  menuOpen.value = false
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

// Despacha la acción y cierra el menú
function handleAction(action: 'create' | 'rename' | 'delete') {
  if (!props.folder) return
  closeMenu()
  if (action === 'create') emit('create', props.folder.id)
  else if (action === 'rename') emit('rename', props.folder.id)
  else if (action === 'delete') emit('delete', props.folder.id)
}

// --- Drag & Drop ---
const isDragOver = ref(false)
const dragEnterCount = ref(0)

const isExpanded = computed(() =>
  props.folder ? props.expanded.has(props.folder.id) : false
)

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
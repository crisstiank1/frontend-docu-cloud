<template>
  <div v-if="folder" class="space-y-0.5">
    <div
      :class="[
        'relative flex items-center gap-2 py-2 pr-3 rounded-lg transition-all group cursor-pointer',
        'min-h-[44px]',
        selectedFolder === folder.id
          ? 'bg-accent font-medium'
          : 'hover:bg-accent/50',
        isDragOver && 'bg-primary/20 ring-2 ring-primary',
      ]"
      :style="{ paddingLeft: depth === 0 ? '12px' : `${depth * 16 + 4}px` }"
      :data-folder-id="folder.id"
      @click="emit('select', folder.id)"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @touchenter="handleTouchEnter"
      @touchleave="handleTouchLeave"
      role="treeitem"
      :aria-selected="selectedFolder === folder.id"
      :aria-expanded="folder.childFolders.length > 0 ? isExpanded : undefined"
      :aria-label="`Carpeta ${folder.name}`"
    >
      <!-- Toggle Chevron -->
      <button
        v-if="folder.childFolders.length > 0"
        @click.stop="emit('toggle', folder.id)"
        class="p-1 hover:bg-accent rounded transition-colors flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
        :aria-label="isExpanded ? 'Colapsar carpeta' : 'Expandir carpeta'"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
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
      <!-- CORRECCIÓN: placeholder para alinear cuando no hay hijos — solo si depth > 0 -->
      <span v-else-if="depth > 0" class="w-5 flex-shrink-0 aria-hidden" />

      <!-- Folder Icon -->
      <svg
        class="w-5 h-5 flex-shrink-0 text-amber-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        />
      </svg>

      <!-- Folder Name -->
      <span class="flex-1 min-w-0 text-sm truncate" :title="folder.name">
        {{ folder.name }}
      </span>

      <!-- Menú 3 puntos -->
      <!-- CORRECCIÓN: siempre visible en táctil (hover no funciona en touch),
           oculto visualmente en desktop hasta hover del grupo -->
      <div class="relative flex-shrink-0">
        <button
          @click.stop="toggleMenu"
          class="p-1.5 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-accent focus-visible:opacity-100"
          :aria-label="`Opciones de la carpeta ${folder.name}`"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          title="Más opciones"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          leave-active-class="transition-all duration-150 ease-in"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-popover border border-border rounded-lg shadow-lg py-1 text-sm"
            role="menu"
            @click.stop
          >
            <button
              @click="handleAction('create')"
              class="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 hover:bg-accent transition-colors text-left"
              role="menuitem"
            >
              <svg
                class="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva subcarpeta
            </button>

            <button
              @click="handleAction('rename')"
              class="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 hover:bg-accent transition-colors text-left"
              role="menuitem"
            >
              <svg
                class="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Renombrar
            </button>

            <div class="border-t border-border my-1" role="separator" />

            <button
              @click="handleAction('delete')"
              class="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 hover:bg-destructive/10 text-destructive transition-colors text-left"
              role="menuitem"
            >
              <svg
                class="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Hijos recursivos -->
    <div
      v-if="isExpanded && validChildren.length > 0"
      class="space-y-0.5"
      role="group"
    >
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
        @drop-document="emit('drop-document', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import type { Folder } from "../composables/useDocuments";

const MAX_DEPTH = 8;

interface Props {
  folder: Folder | undefined;
  allFolders: Record<string, Folder>;
  selectedFolder: string | null;
  expanded: Set<string>;
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
});

const emit = defineEmits<{
  select: [folderId: string];
  toggle: [folderId: string];
  create: [parentId: string];
  rename: [folderId: string];
  delete: [folderId: string];
  "drop-document": [payload: { targetFolderId: string }];
}>();

const isExpanded = computed(() =>
  props.folder ? props.expanded.has(props.folder.id) : false,
);

const validChildren = computed(() => {
  if (!props.folder || props.depth >= MAX_DEPTH) return [];
  return props.folder.childFolders.filter(
    (childId) => childId in props.allFolders,
  );
});

// ─── Menú contextual ──────────────────────────────────────────────────────────

const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

// CORRECCIÓN: el listener solo cierra si el click fue FUERA del árbol
// Usar { capture: true } para capturarlo antes de que .stop lo cancele
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest("[data-folder-menu]")) {
    menuOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutsideClick, true));
onUnmounted(() =>
  document.removeEventListener("click", handleOutsideClick, true),
);

function handleAction(action: "create" | "rename" | "delete") {
  if (!props.folder) return;
  closeMenu();
  if (action === "create") emit("create", props.folder.id);
  else if (action === "rename") emit("rename", props.folder.id);
  else if (action === "delete") emit("delete", props.folder.id);
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────

const isDragOver = ref(false);
const dragEnterCount = ref(0);

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  dragEnterCount.value++;
  if (dragEnterCount.value === 1) isDragOver.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  dragEnterCount.value--;
  if (dragEnterCount.value === 0) isDragOver.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;
  dragEnterCount.value = 0;
  if (props.folder) {
    emit("drop-document", { targetFolderId: props.folder.id });
  }
}
// Touch visual feedback
function handleTouchEnter() {
  isDragOver.value = true
}

function handleTouchLeave() {
  isDragOver.value = false
}
</script>

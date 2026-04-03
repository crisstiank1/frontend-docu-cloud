<script setup lang="ts">
import { ref, watch } from 'vue'

// ─── Props y Emits ────────────────────────────────────────────────────────────
interface Category {
  id: number | string
  name: string
}

interface EditingDoc {
  id: string
  name: string
  classification?: {
    category?: string | null
  }
}

const props = defineProps<{
  modelValue: boolean          // controla visibilidad (v-model)
  document: EditingDoc | null  // documento a editar
  categories: Category[]       // lista de categorías disponibles
  saving: boolean              // estado de carga del botón
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [payload: { id: string; name: string; category: string | null }]
}>()

// ─── Estado local del formulario ──────────────────────────────────────────────
const localName = ref('')
const localCategory = ref<string | null>(null)

// Sincronizar estado local cuando cambia el documento recibido
watch(
  () => props.document,
  (doc) => {
    if (doc) {
      localName.value = doc.name
      localCategory.value = doc.classification?.category ?? null
    }
  },
  { immediate: true }
)

// ─── Acciones ─────────────────────────────────────────────────────────────────
function close() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (!props.document || !localName.value.trim()) return
  emit('save', {
    id: props.document.id,
    name: localName.value.trim(),
    category: localCategory.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue && document"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="close"
      >
        <Transition name="scale">
          <div
            class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold">Editar archivo</h2>
              <button
                @click="close"
                class="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Cerrar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Campo: Nombre -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">
                Nombre del archivo
              </label>
              <input
                v-model="localName"
                type="text"
                placeholder="Nombre del archivo"
                class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                :class="{ 'border-destructive ring-1 ring-destructive': !localName.trim() }"
                @keyup.enter="handleSave"
                @keyup.escape="close"
              />
              <p v-if="!localName.trim()" class="text-xs text-destructive mt-1">
                El nombre no puede estar vacío
              </p>
            </div>

            <!-- Campo: Categoría -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-1">
                Categoría
              </label>
              <select
                v-model="localCategory"
                class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option :value="null">Sin categoría</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="String(cat.id)"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Acciones -->
            <div class="flex gap-3">
              <button
                type="button"
                @click="close"
                class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="handleSave"
                :disabled="!localName.trim() || saving"
                class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  v-if="saving"
                  class="w-4 h-4 animate-spin"
                  fill="none" viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {{ saving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease; }
.scale-enter-from, .scale-leave-to { transform: scale(0.95); opacity: 0; }
</style>
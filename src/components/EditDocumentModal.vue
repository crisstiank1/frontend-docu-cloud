<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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
  modelValue: boolean
  document: EditingDoc | null
  categories: Category[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [payload: { id: string; name: string; category: string }]
}>()

const localName = ref('')
const localCategory = ref('')

const hasCategories = computed(() => props.categories.length > 0)
const isFormValid = computed(
  () => !!localName.value.trim() && !!localCategory.value && hasCategories.value
)

watch(
  () => [props.document, props.categories, props.modelValue] as const,
  ([doc, categories, isOpen]) => {
    if (!isOpen || !doc) return

    localName.value = doc.name.trim()

    const currentCategory = doc.classification?.category
    const categoryExists = categories.some((cat) => String(cat.id) === currentCategory)

    if (currentCategory && categoryExists) {
      localCategory.value = currentCategory
      return
    }

    localCategory.value = categories.length ? String(categories[0].id) : ''
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (!props.document || !isFormValid.value) return

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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="scale">
          <div
            class="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl"
            @click.stop
          >
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-xl font-bold">Editar archivo</h2>

              <button
                type="button"
                class="rounded-lg p-2 transition-colors hover:bg-muted"
                title="Cerrar"
                @click="close"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium">
                Nombre del archivo
              </label>

              <input
                v-model.trim="localName"
                type="text"
                placeholder="Nombre del archivo"
                class="h-11 w-full rounded-lg border bg-background px-4 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
                :class="{ 'border-destructive ring-1 ring-destructive': !localName.trim() }"
                @keyup.enter="handleSave"
                @keyup.escape="close"
              />

              <p v-if="!localName.trim()" class="mt-1 text-xs text-destructive">
                El nombre no puede estar vacío
              </p>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium">
                Categoría
              </label>

              <select
                v-model="localCategory"
                class="h-11 w-full rounded-lg border bg-background px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                :disabled="!hasCategories"
              >
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="String(cat.id)"
                >
                  {{ cat.name }}
                </option>
              </select>

              <p v-if="!hasCategories" class="mt-1 text-xs text-muted-foreground">
                No hay categorías disponibles.
              </p>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="h-11 flex-1 rounded-lg border font-medium transition-colors hover:bg-muted"
                @click="close"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!isFormValid || saving"
                @click="handleSave"
              >
                <svg
                  v-if="saving"
                  class="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    d="M4 12a8 8 0 0 1 8-8v8H4z"
                    fill="currentColor"
                  />
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition:
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
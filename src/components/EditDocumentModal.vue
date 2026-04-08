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
  'save': [payload: { id: string; name: string; categoryId: string }]
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
    categoryId: localCategory.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue && document"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <Transition name="slide-up">
          <div
            class="w-full rounded-t-2xl sm:rounded-2xl sm:max-w-md border bg-background p-5 sm:p-6 shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="mb-5 sm:mb-6 flex items-center justify-between">
              <h2 id="edit-modal-title" class="text-lg sm:text-xl font-bold">
                Editar archivo
              </h2>

              <button
                type="button"
                class="rounded-lg p-2 transition-colors hover:bg-muted"
                aria-label="Cerrar modal"
                title="Cerrar"
                @click="close"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>

            <!-- Campo nombre -->
            <div class="mb-4">
              <label for="edit-doc-name" class="mb-1.5 block text-sm font-medium">
                Nombre del archivo
              </label>

              <input
                id="edit-doc-name"
                v-model.trim="localName"
                type="text"
                placeholder="Nombre del archivo"
                class="h-11 w-full rounded-lg border bg-background px-4 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
                :class="{ 'border-destructive ring-1 ring-destructive': !localName.trim() }"
                @keyup.enter="handleSave"
                @keyup.escape="close"
              />

              <p v-if="!localName.trim()" class="mt-1 text-xs text-destructive" role="alert">
                El nombre no puede estar vacío
              </p>
            </div>

            <!-- Campo categoría -->
            <div class="mb-5 sm:mb-6">
              <label for="edit-doc-category" class="mb-1.5 block text-sm font-medium">
                Categoría
              </label>

              <select
                id="edit-doc-category"
                v-model="localCategory"
                class="h-11 w-full rounded-lg border bg-background px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
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

            <!-- Botones -->
            <div class="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                class="h-11 flex-1 rounded-lg border font-medium text-sm transition-colors hover:bg-muted"
                @click="close"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-medium text-sm text-primary-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!isFormValid || saving"
                @click="handleSave"
              >
                <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" d="M4 12a8 8 0 0 1 8-8v8H4z" fill="currentColor" />
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 640px) {
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: scale(0.95) translateY(0);
    opacity: 0;
  }
}
</style>
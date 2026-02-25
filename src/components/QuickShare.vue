<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="contact in recentContacts"
        :key="contact.email"
        @click="quickShareWith(contact.email, 'view')"
        :title="`Compartir con ${contact.name}`"
        class="px-3 py-2 rounded-lg border border-primary/30 hover:bg-primary/10 text-sm transition-colors flex items-center gap-2"
      >
        <span class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
          {{ contact.name.charAt(0) }}
        </span>
        {{ contact.name }}
      </button>

      <button
        v-if="allContacts.length > 3"
        @click="showMoreContacts = !showMoreContacts"
        class="px-3 py-2 rounded-lg border border-muted-foreground/20 hover:bg-accent/50 text-sm transition-colors"
      >
        + Más
      </button>
    </div>

    <div v-if="showMoreContacts" class="p-3 bg-muted/50 rounded-lg">
      <div class="text-xs font-semibold mb-2">Contactos frecuentes</div>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        <button
          v-for="contact in allContacts.slice(recentContacts.length)"
          :key="contact.email"
          @click="quickShareWith(contact.email, 'view'); showMoreContacts = false"
          class="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 text-sm transition-colors flex items-center gap-2"
        >
          <span class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
            {{ contact.name.charAt(0) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ contact.name }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ contact.email }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="allContacts.length === 0" class="text-center py-4 text-muted-foreground text-sm">
      <p>No hay contactos recientes</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocuments } from '../composables/useDocuments'

interface Contact {
  name: string
  email: string
}

// ✅ defineEmits al nivel raíz del script, no dentro de funciones
const emit = defineEmits<{
  'quick-share': [email: string, permission: 'view' | 'edit']
}>()

const { documents } = useDocuments()
const showMoreContacts = ref(false)

const allContacts = computed(() => {
  const contactSet = new Map<string, Contact>()
  documents.value.forEach(doc => {
    doc.sharedWith.forEach(share => {
      if (!contactSet.has(share.email)) {
        const name = share.email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
        contactSet.set(share.email, { email: share.email, name })
      }
    })
  })
  return Array.from(contactSet.values())
})

const recentContacts = computed(() => allContacts.value.slice(0, 3))

// ✅ emit al nivel raíz, no dentro de la función
function quickShareWith(email: string, permission: 'view' | 'edit') {
  emit('quick-share', email, permission)
}
</script>

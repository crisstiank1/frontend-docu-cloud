<template>
  <div class="space-y-3">

    <!-- Contactos recientes -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="contact in recentContacts"
        :key="contact.email"
        @click="quickShareWith(contact.email, 'view')"
        :disabled="sharing === contact.email"
        :title="`Compartir con ${contact.name}`"
        class="px-3 py-2 rounded-lg border border-primary/30 hover:bg-primary/10 text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
          {{ contact.name.charAt(0) }}
        </span>
        <span>{{ contact.name }}</span>
        <svg v-if="sharing === contact.email" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </button>

      <button
        v-if="allContacts.length > 3"
        @click="showMoreContacts = !showMoreContacts"
        class="px-3 py-2 rounded-lg border border-muted-foreground/20 hover:bg-accent/50 text-sm transition-colors"
      >
        {{ showMoreContacts ? 'Menos' : `+ ${allContacts.length - 3} más` }}
      </button>
    </div>

    <!-- Más contactos -->
    <div v-if="showMoreContacts" class="p-3 bg-muted/50 rounded-lg">
      <div class="text-xs font-semibold mb-2 text-muted-foreground">Contactos frecuentes</div>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        <button
          v-for="contact in allContacts.slice(3)"
          :key="contact.email"
          @click="quickShareWith(contact.email, 'view'); showMoreContacts = false"
          :disabled="sharing === contact.email"
          class="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold flex-shrink-0">
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
      <p class="text-xs mt-1">Los contactos aparecen cuando compartes documentos</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { documentService } from '../services/documentService'
import { useDocuments } from '../composables/useDocuments'
import { useToast } from '../composables/useToast'

interface Props {
  // ID del documento a compartir (requerido para llamar al backend)
  documentId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  // Notifica al padre cuando el share se completó correctamente
  'shared': [email: string, permission: 'view' | 'edit']
}>()

const { documents } = useDocuments()
const toast = useToast()

const showMoreContacts = ref(false)
const sharing = ref<string | null>(null)  // email del contacto en proceso

// Construye la lista de contactos únicos a partir de los documentos compartidos
const allContacts = computed(() => {
  const contactSet = new Map<string, { name: string; email: string }>()
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

async function quickShareWith(email: string, permission: 'view' | 'edit') {
  if (!props.documentId || sharing.value) return

  sharing.value = email

  try {
    await documentService.share(Number(props.documentId), {
      recipientEmail: email,
      permission: permission === 'edit' ? 'WRITE' as any : 'READ' as any,
    })

    emit('shared', email, permission)
    toast.success(`Documento compartido con ${email}`)
  } catch (err: any) {
    toast.error(err.response?.data?.message ?? `No se pudo compartir con ${email}`)
  } finally {
    sharing.value = null
  }
}
</script>
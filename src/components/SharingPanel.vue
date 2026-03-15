<template>
  <div class="space-y-6">

    <!-- ===== COMPARTIR POR EMAIL ===== -->
    <div>
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartir por Email
      </h3>

      <div class="space-y-3">

        <!-- Lista de shares existentes -->
        <div v-if="shares.length > 0" class="space-y-2 mb-4">
          <div
            v-for="share in shares"
            :key="share.email"
            class="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors border"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Avatar inicial -->
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-primary uppercase">
                  {{ share.email.charAt(0) }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ share.email }}</p>
                <!-- Badge permiso con Tailwind puro -->
                <span
                  class="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="share.permission === 'edit'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="share.permission === 'edit'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ share.permission === 'edit' ? 'Lectura y escritura' : 'Solo lectura' }}
                </span>
              </div>
            </div>
            <button
              @click="removeShare(share.email)"
              class="flex-shrink-0 text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs font-medium border border-transparent hover:border-destructive/20 ml-2"
            >
              Revocar
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/20">
          <div class="text-3xl mb-2">📭</div>
          <p>No compartido con nadie aún</p>
        </div>

        <!-- Formulario nuevo share -->
        <div class="grid gap-3 pt-3 border-t">
          <div>
            <label class="text-xs font-semibold mb-1.5 block">Email del usuario</label>
            <input
              type="email"
              v-model="newShare.email"
              placeholder="usuario@ejemplo.com"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label class="text-xs font-semibold mb-1.5 block">Permiso</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="newShare.permission = 'view'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newShare.permission === 'view'
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                  : 'border-border hover:bg-accent'"
              >
                👁️ Solo lectura
              </button>
              <button
                @click="newShare.permission = 'edit'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newShare.permission === 'edit'
                  ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400'
                  : 'border-border hover:bg-accent'"
              >
                ✏️ Lectura y escritura
              </button>
            </div>
          </div>

          <button
            @click="addShare"
            :disabled="!newShare.email || shares.some(s => s.email === newShare.email)"
            class="h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {{ shares.some(s => s.email === newShare.email) ? 'Ya tiene acceso' : 'Compartir' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== GENERAR ENLACE ===== -->
    <div class="pt-4 border-t">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Enlace de acceso
      </h3>

      <div class="space-y-3">

        <!-- Links existentes -->
        <div v-if="links.length > 0" class="space-y-2 mb-4">
          <div
            v-for="link in links"
            :key="link.id"
            class="p-3 bg-muted/50 rounded-lg border group hover:bg-muted transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="link.isPublic
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'"
                >
                  {{ link.isPublic ? '🌍 Público' : '🔒 Con contraseña' }}
                </span>
              </div>
              <button
                @click="deleteLink(link.id)"
                class="text-destructive hover:bg-destructive/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Eliminar enlace"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- URL del enlace -->
            <div class="bg-background p-2 rounded-lg text-xs break-all border mb-2 font-mono text-muted-foreground select-all">
              {{ generateLinkUrl(link.token) }}
            </div>

            <button
              @click="copyLink(link)"
              class="text-xs font-medium flex items-center gap-1.5 transition-colors"
              :class="copiedLinkId === link.id ? 'text-green-600' : 'text-primary hover:underline'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="copiedLinkId === link.id" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copiedLinkId === link.id ? 'Copiado!' : 'Copiar enlace' }}
            </button>
          </div>
        </div>

        <!-- Formulario nuevo link -->
        <div class="grid gap-3 pt-3 border-t">
          <div>
            <label class="text-xs font-semibold mb-1.5 block">Tipo de enlace</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="newLink.type = 'public'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newLink.type === 'public'
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                  : 'border-border hover:bg-accent'"
              >
                🌍 Público
              </button>
              <button
                @click="newLink.type = 'password'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newLink.type === 'password'
                  ? 'bg-orange-50 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-400'
                  : 'border-border hover:bg-accent'"
              >
                🔒 Con contraseña
              </button>
            </div>
          </div>

          <div v-if="newLink.type === 'password'">
            <label class="text-xs font-semibold mb-1.5 block">Contraseña del enlace</label>
            <input
              type="password"
              v-model="newLink.password"
              placeholder="Ingresa una contraseña"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <button
            @click="createLink"
            :disabled="newLink.type === 'password' && !newLink.password"
            class="h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Generar Enlace
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Share {
  email: string
  permission: 'view' | 'edit'
}

interface Link {
  id: string
  token: string
  isPublic: boolean
}

interface Props {
  shares: Share[]
  links: Link[]
  documentId: string
}

defineProps<Props>()

const emit = defineEmits<{
  'add-share':    [email: string, permission: 'view' | 'edit']
  'remove-share': [email: string]
  'create-link':  [type: 'public' | 'password', password?: string]
  'delete-link':  [linkId: string]
  'copy-link':    [link: Link]
}>()

const newShare    = ref({ email: '', permission: 'view' as 'view' | 'edit' })
const newLink     = ref({ type: 'public' as 'public' | 'password', password: '' })
const copiedLinkId = ref<string | null>(null)

function addShare() {
  if (newShare.value.email) {
    emit('add-share', newShare.value.email, newShare.value.permission)
    newShare.value = { email: '', permission: 'view' }
  }
}

function removeShare(email: string) {
  emit('remove-share', email)
}

function createLink() {
  const password = newLink.value.type === 'password' ? newLink.value.password : undefined
  emit('create-link', newLink.value.type, password)
  newLink.value = { type: 'public', password: '' }
}

function deleteLink(linkId: string) {
  emit('delete-link', linkId)
}

function copyLink(link: Link) {
  navigator.clipboard.writeText(generateLinkUrl(link.token))
  copiedLinkId.value = link.id
  setTimeout(() => { copiedLinkId.value = null }, 2000)
  emit('copy-link', link)
}

function generateLinkUrl(token: string): string {
  return `${window.location.origin}/share/${token}`
}
</script>

<template>
  <div class="space-y-6">

    <!-- Compartir por Email -->
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
            class="flex items-center justify-between p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
          >
            <div class="flex-1">
              <p class="font-medium text-sm">{{ share.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  :style="{ backgroundColor: getPermissionBgColor(share.permission), color: getPermissionTextColor(share.permission) }"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                >
                  {{ getPermissionLabel(share.permission) }}
                </span>
              </div>
            </div>
            <button
              @click="removeShare(share.email)"
              class="text-destructive hover:bg-destructive/10 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium"
            >
              Revocar
            </button>
          </div>
        </div>

        <div v-else class="text-center py-4 text-muted-foreground text-sm">
          <p>No compartido aún</p>
        </div>

        <!-- Formulario nuevo share -->
        <div class="grid gap-2 pt-2 border-t">
          <div>
            <label class="text-xs font-semibold mb-1 block">Email</label>
            <input
              type="email"
              v-model="newShare.email"
              placeholder="usuario@ejemplo.com"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div>
            <label class="text-xs font-semibold mb-1 block">Permiso</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="newShare.permission = 'view'"
                :class="[
                  'h-10 px-3 rounded-lg text-sm font-medium transition-all border',
                  newShare.permission === 'view'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-700'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                ]"
              >
                📖 Solo lectura
              </button>
              <button
                @click="newShare.permission = 'edit'"
                :class="[
                  'h-10 px-3 rounded-lg text-sm font-medium transition-all border',
                  newShare.permission === 'edit'
                    ? 'bg-green-500/10 border-green-500 text-green-700'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                ]"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
          <button
            @click="addShare"
            :disabled="!newShare.email || shares.some(s => s.email === newShare.email)"
            class="h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>

    <!-- Generar Enlace -->
    <div class="pt-4 border-t">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Generar Enlace de Descarga
      </h3>

      <div class="space-y-3">
        <!-- Links existentes -->
        <div v-if="links.length > 0" class="space-y-2 mb-4">
          <div
            v-for="link in links"
            :key="link.id"
            class="p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-xs font-semibold text-primary">Enlace generado</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ link.isPublic ? '🌍 Público' : '🔒 Protegido con contraseña' }}
                </p>
              </div>
              <button
                @click="deleteLink(link.id)"
                class="text-destructive hover:bg-destructive/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium"
              >
                ✕
              </button>
            </div>
            <div class="bg-background p-2 rounded text-xs break-all border mb-2 font-mono text-muted-foreground">
              {{ generateLinkUrl(link.token) }}
            </div>
            <button @click="copyLink(link)" class="text-xs text-primary hover:underline w-full text-left">
              {{ copiedLinkId === link.id ? '✓ Copiado' : '📋 Copiar enlace' }}
            </button>
          </div>
        </div>

        <!-- Formulario nuevo link -->
        <div class="grid gap-2 pt-2 border-t">
          <div>
            <label class="text-xs font-semibold mb-1 block">Tipo de enlace</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="newLink.type = 'public'"
                :class="[
                  'h-10 px-3 rounded-lg text-sm font-medium transition-all border',
                  newLink.type === 'public'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-700'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                ]"
              >
                🌍 Público
              </button>
              <button
                @click="newLink.type = 'password'"
                :class="[
                  'h-10 px-3 rounded-lg text-sm font-medium transition-all border',
                  newLink.type === 'password'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-700'
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                ]"
              >
                🔒 Contraseña
              </button>
            </div>
          </div>
          <div v-if="newLink.type === 'password'">
            <label class="text-xs font-semibold mb-1 block">Contraseña</label>
            <input
              type="password"
              v-model="newLink.password"
              placeholder="Ingresa contraseña"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <button
            @click="createLink"
            :disabled="newLink.type === 'password' && !newLink.password"
            class="h-10 rounded-lg bg-accent text-accent-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
  'add-share': [email: string, permission: 'view' | 'edit']
  'remove-share': [email: string]
  'create-link': [type: 'public' | 'password', password?: string]
  'delete-link': [linkId: string]
  'copy-link': [link: Link]
}>()

const newShare = ref({ email: '', permission: 'view' as 'view' | 'edit' })
const newLink = ref({ type: 'public' as 'public' | 'password', password: '' })
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
  const url = generateLinkUrl(link.token)
  navigator.clipboard.writeText(url)
  copiedLinkId.value = link.id
  setTimeout(() => { copiedLinkId.value = null }, 2000)
  emit('copy-link', link)
}

function generateLinkUrl(token: string): string {
  return `${window.location.origin}/share/${token}`
}

function getPermissionLabel(perm: 'view' | 'edit'): string {
  return perm === 'view' ? 'Solo lectura' : 'Edición'
}

function getPermissionBgColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#3b82f620' : '#10b98120'
}

function getPermissionTextColor(perm: 'view' | 'edit'): string {
  return perm === 'view' ? '#2563eb' : '#059669'
}
</script>

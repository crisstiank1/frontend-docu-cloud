<template>
  <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-1">

    <!-- ===== COMPARTIR POR EMAIL ===== -->
    <div>
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartir por Email
      </h3>

      <!-- Loading -->
      <div v-if="loadingShares" class="flex items-center justify-center py-8" role="status" aria-label="Cargando accesos">
        <svg class="w-5 h-5 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span class="ml-2 text-sm text-muted-foreground">Cargando...</span>
      </div>

      <div v-else class="space-y-3">
        <!-- Shares existentes -->
        <div v-if="activeShares.length > 0" class="space-y-2 mb-4">
          <div
            v-for="share in activeShares"
            :key="share.id"
            class="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors border"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <span class="text-xs font-bold text-primary uppercase">
                  {{ (share.recipientEmail ?? '?').charAt(0) }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">
                  {{ share.recipientEmail ?? 'Enlace sin email' }}
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="share.permission === 'WRITE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
                  >
                    {{ share.permission === 'WRITE' ? '✏️ Lectura y escritura' : '👁️ Solo lectura' }}
                  </span>
                  <span v-if="share.expiresAt" class="text-xs text-muted-foreground">
                    · Expira {{ formatExpiry(share.expiresAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Confirmación inline de revocación -->
            <!-- CORRECCIÓN: siempre visible en móvil, no solo en hover -->
            <div class="flex-shrink-0 ml-2">
              <div v-if="pendingRevokeId === share.id" class="flex items-center gap-1">
                <span class="text-xs text-muted-foreground">¿Confirmar?</span>
                <button
                  @click="confirmRevoke(share.id)"
                  :disabled="revoking === share.id"
                  class="text-xs font-medium text-destructive hover:underline disabled:opacity-50 min-h-[32px] px-1"
                  :aria-label="`Confirmar revocación de acceso a ${share.recipientEmail}`"
                >
                  {{ revoking === share.id ? 'Revocando...' : 'Sí' }}
                </button>
                <button
                  @click="pendingRevokeId = null"
                  class="text-xs font-medium text-muted-foreground hover:underline min-h-[32px] px-1"
                  aria-label="Cancelar revocación"
                >
                  No
                </button>
              </div>
              <!-- CORRECCIÓN: opacity-100 en móvil, group-hover solo en sm+ -->
              <button
                v-else
                @click="pendingRevokeId = share.id"
                class="text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                       focus-visible:opacity-100
                       transition-all text-xs font-medium border border-transparent hover:border-destructive/20
                       min-h-[36px]"
                :aria-label="`Revocar acceso de ${share.recipientEmail}`"
              >
                Revocar
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/20">
          <div class="text-3xl mb-2" aria-hidden="true">📭</div>
          <p>No compartido con nadie aún</p>
        </div>

        <!-- Formulario nuevo share -->
        <div class="grid gap-3 pt-3 border-t">
          <div>
            <label for="share-email" class="text-xs font-semibold mb-1.5 block">
              Email del usuario
            </label>
            <input
              id="share-email"
              type="email"
              v-model="newShare.email"
              placeholder="usuario@ejemplo.com"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              @keyup.enter="addShare"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="text-xs font-semibold mb-1.5 block" id="share-permission-label">
              Permiso
            </label>
            <!-- CORRECCIÓN: role="group" + aria-labelledby para el par de botones -->
            <div class="grid grid-cols-2 gap-2" role="group" aria-labelledby="share-permission-label">
              <button
                type="button"
                @click="newShare.permission = 'READ'"
                :aria-pressed="newShare.permission === 'READ'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newShare.permission === 'READ'
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                  : 'border-border hover:bg-accent'"
              >
                👁️ Solo lectura
              </button>
              <button
                type="button"
                @click="newShare.permission = 'WRITE'"
                :aria-pressed="newShare.permission === 'WRITE'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newShare.permission === 'WRITE'
                  ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400'
                  : 'border-border hover:bg-accent'"
              >
                ✏️ Lectura y escritura
              </button>
            </div>
          </div>

          <div>
            <label for="share-expiry" class="text-xs font-semibold mb-1.5 block">
              Expiración <span class="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <select
              id="share-expiry"
              v-model="newShare.expiresDays"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option :value="null">Sin expiración</option>
              <option :value="1">1 día</option>
              <option :value="7">7 días</option>
              <option :value="30">30 días</option>
              <option :value="90">90 días</option>
            </select>
          </div>

          <p
            v-if="shareError"
            class="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
            role="alert"
          >
            {{ shareError }}
          </p>

          <button
            type="button"
            @click="addShare"
            :disabled="!newShare.email.trim() || isSharing || alreadySharedWith(newShare.email)"
            class="h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <span v-if="isSharing" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Compartiendo...
            </span>
            <span v-else>
              {{ alreadySharedWith(newShare.email) ? 'Ya tiene acceso' : 'Compartir' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== ENLACES DE ACCESO ===== -->
    <div class="pt-4 border-t">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Enlace de acceso
      </h3>

      <div class="space-y-3">
        <!-- Links existentes -->
        <div v-if="linkShares.length > 0" class="space-y-2 mb-4">
          <div
            v-for="share in linkShares"
            :key="share.id"
            class="p-3 bg-muted/50 rounded-lg border group hover:bg-muted transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="share.hasPassword
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'"
              >
                {{ share.hasPassword ? '🔒 Con contraseña' : '🌍 Público' }}
              </span>
              <!-- CORRECCIÓN: siempre visible en móvil -->
              <button
                @click="pendingRevokeId = share.id"
                class="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                       focus-visible:opacity-100 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Revocar enlace"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="pendingRevokeId === share.id" class="flex items-center gap-2 mb-2 text-xs">
              <span class="text-muted-foreground">¿Revocar este enlace?</span>
              <button @click="confirmRevoke(share.id)" class="text-destructive font-medium hover:underline min-h-[28px] px-1">Sí</button>
              <button @click="pendingRevokeId = null" class="text-muted-foreground hover:underline min-h-[28px] px-1">No</button>
            </div>

            <!-- CORRECCIÓN: select-all para copiar fácil en móvil -->
            <div class="bg-background p-2 rounded-lg text-xs break-all border mb-2 font-mono text-muted-foreground select-all cursor-text">
              {{ generateLinkUrl(share.id) }}
            </div>

            <button
              type="button"
              @click="copyShareLink(share.id)"
              class="text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[32px]"
              :class="copiedId === share.id ? 'text-green-600' : 'text-primary hover:underline'"
              :aria-label="copiedId === share.id ? 'Enlace copiado' : 'Copiar enlace al portapapeles'"
            >
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="copiedId === share.id" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copiedId === share.id ? '¡Copiado!' : 'Copiar enlace' }}
            </button>
          </div>
        </div>

        <!-- Formulario nuevo link -->
        <div class="grid gap-3 pt-3 border-t">
          <div>
            <label class="text-xs font-semibold mb-1.5 block" id="link-type-label">
              Tipo de enlace
            </label>
            <div class="grid grid-cols-2 gap-2" role="group" aria-labelledby="link-type-label">
              <button
                type="button"
                @click="newLink.type = 'public'"
                :aria-pressed="newLink.type === 'public'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newLink.type === 'public'
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                  : 'border-border hover:bg-accent'"
              >
                🌍 Público
              </button>
              <button
                type="button"
                @click="newLink.type = 'password'"
                :aria-pressed="newLink.type === 'password'"
                class="h-10 px-3 rounded-lg text-sm font-medium transition-all border"
                :class="newLink.type === 'password'
                  ? 'bg-orange-50 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-400'
                  : 'border-border hover:bg-accent'"
              >
                🔒 Con contraseña
              </button>
            </div>
          </div>

          <Transition name="slide-down">
            <div v-if="newLink.type === 'password'">
              <label for="link-password" class="text-xs font-semibold mb-1.5 block">
                Contraseña del enlace
              </label>
              <input
                id="link-password"
                type="password"
                v-model="newLink.password"
                placeholder="Ingresa una contraseña"
                class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                autocomplete="new-password"
              />
            </div>
          </Transition>

          <button
            type="button"
            @click="createLink"
            :disabled="(newLink.type === 'password' && !newLink.password) || isCreatingLink"
            class="h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {{ isCreatingLink ? 'Generando...' : 'Generar Enlace' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { documentService, type ShareSummaryResponse } from '../services/documentService'
import { useToast } from '../composables/useToast'

interface Props {
  documentId: string
}

const props = defineProps<Props>()
const toast = useToast()

const allShares      = ref<ShareSummaryResponse[]>([])
const loadingShares  = ref(false)
const isSharing      = ref(false)
const isCreatingLink = ref(false)
const revoking       = ref<string | null>(null)
const shareError     = ref<string | null>(null)
const copiedId       = ref<string | null>(null)
const pendingRevokeId = ref<string | null>(null)

const newShare = ref({
  email:       '',
  permission:  'READ' as 'READ' | 'WRITE',
  expiresDays: null as number | null,
})

const newLink = ref({
  type:     'public' as 'public' | 'password',
  password: '',
})

const activeShares = computed(() => allShares.value.filter(s => s.recipientEmail))
const linkShares   = computed(() => allShares.value.filter(s => !s.recipientEmail))

onMounted(() => loadShares())

async function loadShares() {
  loadingShares.value = true
  try {
    const { data } = await documentService.listShares(Number(props.documentId))
    allShares.value = data
  } catch {
    toast.error('No se pudieron cargar los shares')
  } finally {
    loadingShares.value = false
  }
}

function alreadySharedWith(email: string): boolean {
  if (!email.trim()) return false
  return activeShares.value.some(
    s => s.recipientEmail?.toLowerCase() === email.trim().toLowerCase()
  )
}

async function addShare() {
  if (!newShare.value.email.trim() || isSharing.value) return
  if (alreadySharedWith(newShare.value.email)) return

  isSharing.value  = true
  shareError.value = null

  try {
    await documentService.share(Number(props.documentId), {
      recipientEmail: newShare.value.email.trim(),
      permission:     newShare.value.permission,
      expiresDays:    newShare.value.expiresDays ?? undefined,
    })
    toast.success(`Documento compartido con ${newShare.value.email}`)
    newShare.value = { email: '', permission: 'READ', expiresDays: null }
    await loadShares()
  } catch (err: any) {
    shareError.value = err.response?.data?.message ?? 'No se pudo compartir el documento'
    toast.error(shareError.value!)
  } finally {
    isSharing.value = false
  }
}

async function confirmRevoke(shareId: string) {
  revoking.value = shareId
  try {
    await documentService.revokeShare(shareId)
    allShares.value = allShares.value.filter(s => s.id !== shareId)
    toast.success('Acceso revocado')
  } catch (err: any) {
    toast.error(err.response?.data?.message ?? 'No se pudo revocar el acceso')
  } finally {
    revoking.value       = null
    pendingRevokeId.value = null
  }
}

async function createLink() {
  if (isCreatingLink.value) return
  if (newLink.value.type === 'password' && !newLink.value.password) return

  isCreatingLink.value = true
  try {
    await documentService.share(Number(props.documentId), {
      permission: 'READ',
      password:   newLink.value.type === 'password' ? newLink.value.password : undefined,
    })
    toast.success('Enlace generado correctamente')
    newLink.value = { type: 'public', password: '' }
    await loadShares()
  } catch (err: any) {
    toast.error(err.response?.data?.message ?? 'No se pudo generar el enlace')
  } finally {
    isCreatingLink.value = false
  }
}

function copyShareLink(shareId: string) {
  navigator.clipboard.writeText(generateLinkUrl(shareId))
  copiedId.value = shareId
  setTimeout(() => { copiedId.value = null }, 2000)
}

function generateLinkUrl(shareId: string): string {
  return `${window.location.origin}/share/${shareId}`
}

function formatExpiry(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 80px;
}
</style>
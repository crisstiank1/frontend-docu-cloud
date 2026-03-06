<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Información de tu cuenta
        </h1>
      </div>

      <div v-if="user" class="grid md:grid-cols-2 gap-6">

        <!-- ✅ TARJETA INFORMACIÓN PERSONAL -->
        <div class="p-6 rounded-lg border bg-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Información Personal</h2>
            <button
              v-if="!editingInfo"
              @click="startEditInfo"
              class="text-xs text-primary hover:underline"
            >
              Editar
            </button>
          </div>

          <!-- Modo vista -->
          <div v-if="!editingInfo" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Nombre</label>
              <p class="text-sm font-medium mt-1">{{ user.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Email</label>
              <p class="text-sm font-medium mt-1">{{ user.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Rol</label>
              <p class="text-sm font-medium mt-1 capitalize">
                <span :class="getRoleColor(getRole())" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getRoleLabel(getRole()) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Modo edición -->
          <form v-else @submit.prevent="saveInfo" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Nombre</label>
              <input
                v-model="editForm.name"
                type="text"
                class="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="tu@email.com"
                required
              />
              <p v-if="infoError" class="text-xs text-red-500 mt-1">{{ infoError }}</p>
            </div>
            <div class="flex gap-2 pt-1">
              <button
                type="submit"
                :disabled="savingInfo"
                class="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {{ savingInfo ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <button
                type="button"
                @click="cancelEditInfo"
                class="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>

          <!-- ✅ CAMBIAR CONTRASEÑA (debajo de info) -->
          <div class="mt-6 pt-6 border-t">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold">Seguridad</h3>
              <button
                v-if="!editingPassword"
                @click="editingPassword = true"
                class="text-xs text-primary hover:underline"
              >
                Cambiar contraseña
              </button>
            </div>

            <div v-if="!editingPassword">
              <p class="text-sm text-muted-foreground">••••••••</p>
            </div>

            <form v-else @submit.prevent="savePassword" class="space-y-3">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Contraseña actual</label>
                <input
                  v-model="passwordForm.current"
                  type="password"
                  class="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tu contraseña actual"
                  required
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Nueva contraseña</label>
                <input
                  v-model="passwordForm.newPass"
                  type="password"
                  class="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                  required
                />
                <!-- Indicador de fortaleza -->
                <div v-if="passwordForm.newPass" class="mt-1.5 flex gap-1">
                  <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                    :class="passwordStrength >= i ? strengthColor : 'bg-muted'" />
                </div>
                <p v-if="passwordForm.newPass" class="text-xs mt-1" :class="strengthTextColor">
                  {{ strengthLabel }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Confirmar contraseña</label>
                <input
                  v-model="passwordForm.confirm"
                  type="password"
                  class="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
                <p v-if="passwordSuccess" class="text-xs text-green-600 mt-1">{{ passwordSuccess }}</p>
              </div>
              <div class="flex gap-2 pt-1">
                <button
                  type="submit"
                  :disabled="savingPassword"
                  class="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {{ savingPassword ? 'Actualizando...' : 'Actualizar contraseña' }}
                </button>
                <button
                  type="button"
                  @click="cancelEditPassword"
                  class="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ACCIONES RÁPIDAS — sin cambios -->
        <div class="p-6 rounded-lg border bg-card">
          <h2 class="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div class="space-y-3">
            <router-link to="/dashboard" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Dashboard</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link to="/documents" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Mis Archivos</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link to="/compartidos" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Compartidos Conmigo</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link to="/clasificacion" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Clasificación Inteligente</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link v-if="getRole() === 'admin'" to="/usuarios" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Gestión de Usuarios</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link v-if="getRole() === 'admin'" to="/historial" class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <span class="text-sm font-medium">Historial y Auditoría</span>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Modo Testing — sin cambios -->
      <div v-if="getRole() === 'admin'" class="p-6 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <h2 class="text-lg font-semibold mb-2">🧪 Modo Testing - Cambiar Rol</h2>
        <p class="text-sm text-muted-foreground mb-6">Cambia instantáneamente entre roles para testing y demostración. Sin necesidad de logout/login.</p>
        <div class="space-y-2 mb-6">
          <button @click="switchRole('admin')" :class="['w-full text-left px-4 py-3 rounded-lg border transition-colors', getRole() === 'admin' ? 'bg-red-100 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-200 font-semibold' : 'bg-background border-muted-foreground/20 hover:bg-accent']">
            <span class="flex items-center justify-between"><span>👑 Admin</span><span v-if="getRole() === 'admin'" class="text-xs font-bold">✓ ACTUAL</span></span>
          </button>
          <button @click="switchRole('standard')" :class="['w-full text-left px-4 py-3 rounded-lg border transition-colors', getRole() === 'standard' ? 'bg-blue-100 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold' : 'bg-background border-muted-foreground/20 hover:bg-accent']">
            <span class="flex items-center justify-between"><span>👤 Standard</span><span v-if="getRole() === 'standard'" class="text-xs font-bold">✓ ACTUAL</span></span>
          </button>
          <button @click="switchRole('guest')" :class="['w-full text-left px-4 py-3 rounded-lg border transition-colors', getRole() === 'guest' ? 'bg-gray-100 dark:bg-gray-950/50 border-gray-500 text-gray-900 dark:text-gray-200 font-semibold' : 'bg-background border-muted-foreground/20 hover:bg-accent']">
            <span class="flex items-center justify-between"><span>👁️ Guest</span><span v-if="getRole() === 'guest'" class="text-xs font-bold">✓ ACTUAL</span></span>
          </button>
        </div>
        <div class="pt-6 border-t">
          <p class="text-xs font-semibold text-muted-foreground uppercase mb-3">Usuarios de Prueba (login normal)</p>
          <div class="space-y-2 text-xs text-muted-foreground">
            <div class="p-2 bg-background rounded">
              <p class="font-medium">👤 Standard User</p>
              <p><code class="bg-muted px-1 rounded">standard@test.local</code> / <code class="bg-muted px-1 rounded">123456</code></p>
            </div>
            <div class="p-2 bg-background rounded">
              <p class="font-medium">👁️ Guest User</p>
              <p><code class="bg-muted px-1 rounded">guest@test.local</code> / <code class="bg-muted px-1 rounded">123456</code></p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="user" class="flex gap-3">
        <router-link to="/dashboard" class="inline-flex items-center justify-center rounded-lg h-10 px-6 border border-input bg-background hover:bg-accent transition-colors">
          Volver a Dashboard
        </router-link>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-muted-foreground mb-4">No estás autenticado</p>
        <router-link to="/auth/login" class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary text-primary-foreground hover:shadow-lg transition-all">
          Iniciar sesión
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout, switchRole, updateProfile, changePassword } = useAuth()
const router = useRouter()

// ─── Estados de edición ───────────────────────────────────────────
const editingInfo     = ref(false)
const savingInfo      = ref(false)
const infoError       = ref('')

const editingPassword = ref(false)
const savingPassword  = ref(false)
const passwordError   = ref('')
const passwordSuccess = ref('')

// ─── Formularios reactivos ────────────────────────────────────────
const editForm     = reactive({ name: '', email: '' })
const passwordForm = reactive({ current: '', newPass: '', confirm: '' })

// ─── Lógica edición de info ───────────────────────────────────────
function startEditInfo() {
  editForm.name   = user.value?.name  ?? ''
  editForm.email  = user.value?.email ?? ''
  infoError.value = ''
  editingInfo.value = true
}

function cancelEditInfo() {
  editingInfo.value = false
  infoError.value   = ''
}

async function saveInfo() {
  if (!editForm.name.trim()) {
    infoError.value = 'El nombre no puede estar vacío.'
    return
  }
  savingInfo.value = true
  infoError.value  = ''
  try {
    await updateProfile({ name: editForm.name.trim(), email: editForm.email.trim() })
    editingInfo.value = false
  } catch (e: any) {
    infoError.value = e?.message ?? 'Este correo ya está registrado. Usa otro.'
  } finally {
    savingInfo.value = false
  }
}

// ─── Lógica cambio de contraseña ─────────────────────────────────
function cancelEditPassword() {
  editingPassword.value = false
  passwordForm.current  = ''
  passwordForm.newPass  = ''
  passwordForm.confirm  = ''
  passwordError.value   = ''
  passwordSuccess.value = ''
}

const passwordStrength = computed(() => {
  const p = passwordForm.newPass
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return colors[passwordStrength.value - 1] ?? 'bg-red-500'
})

const strengthTextColor = computed(() => {
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600']
  return colors[passwordStrength.value - 1] ?? 'text-red-500'
})

const strengthLabel = computed(() => {
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Segura']
  return labels[passwordStrength.value - 1] ?? 'Muy débil'
})

async function savePassword() {
  passwordError.value   = ''
  passwordSuccess.value = ''

  if (passwordStrength.value < 2) {
    passwordError.value = 'La contraseña es muy débil. Agrega mayúsculas y números.'
    return
  }
  if (passwordForm.newPass !== passwordForm.confirm) {
    passwordError.value = 'Las contraseñas no coinciden.'
    return
  }

  savingPassword.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.newPass)
    passwordSuccess.value = '¡Contraseña actualizada! Inicia sesión nuevamente.'
    setTimeout(() => {
      logout()
      router.replace('/auth/login')
    }, 2000)
  } catch (e: any) {
    passwordError.value = e?.message ?? 'La contraseña actual es incorrecta.'
  } finally {
    savingPassword.value = false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

// ✅ Soporta tanto role (string) como roles (array) del backend
function getRole(): string {
  if (!user.value) return ''
  // Si el backend devuelve roles como array → toma el primero en minúscula
  if (Array.isArray(user.value.roles) && user.value.roles.length > 0) {
    return user.value.roles[0].toLowerCase().replace('role_', '')
  }
  // Fallback: campo role directo
  return (user.value as any).role ?? ''
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    standard: 'Estándar',
    guest: 'Invitado'
  }
  return labels[role] || role
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin:    'bg-red-500/10 text-red-700',
    standard: 'bg-blue-500/10 text-blue-700',
    guest:    'bg-gray-500/10 text-gray-700'
  }
  return colors[role] || 'bg-gray-500/10 text-gray-700'
}
</script>

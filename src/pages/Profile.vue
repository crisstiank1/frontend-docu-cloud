<template>
  <section class="p-6 md:p-8">
    <div class="max-w-4xl mx-auto space-y-6">

      <div v-if="user">

        <!-- Grilla principal -->
        <div class="grid md:grid-cols-2 gap-6">

          <!-- INFORMACIÓN PERSONAL -->
          <div class="border rounded-xl bg-card overflow-hidden">
            <div class="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
              <h2 class="font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h2>
              <button v-if="!editingInfo" @click="startEditInfo" class="text-xs text-primary hover:underline font-medium">
                Editar
              </button>
            </div>

            <div class="p-6">
              <!-- Modo vista -->
              <div v-if="!editingInfo" class="space-y-4">
                <div>
                  <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</label>
                  <p class="text-sm font-medium mt-1">{{ user.name }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                  <p class="text-sm font-medium mt-1">{{ user.email }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rol</label>
                  <div class="mt-1">
                    <span class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full" :class="getRoleColor(getRole())">
                      {{ getRoleLabel(getRole()) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Modo edición -->
              <form v-else @submit.prevent="saveInfo" class="space-y-4">
                <div>
                  <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Nombre</label>
                  <input v-model="editForm.name" type="text" placeholder="Tu nombre completo" required
                    class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div>
                  <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
                  <input v-model="editForm.email" type="email" placeholder="tu@email.com" required
                    class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  <p v-if="infoError" class="text-xs text-destructive mt-1.5">{{ infoError }}</p>
                </div>
                <div class="flex gap-2 pt-1">
                  <button type="submit" :disabled="savingInfo"
                    class="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                    {{ savingInfo ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                  <button type="button" @click="cancelEditInfo"
                    class="h-10 px-4 rounded-lg border hover:bg-muted transition-colors text-sm">
                    Cancelar
                  </button>
                </div>
              </form>

              <!-- SEGURIDAD -->
              <div class="mt-6 pt-6 border-t">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Seguridad
                  </h3>
                  <button v-if="!editingPassword" @click="editingPassword = true" 
                    class="text-xs text-primary hover:underline font-medium">
                    {{ user?.hasPassword ? 'Cambiar contraseña' : 'Crear contraseña' }}
                  </button>
                </div>

                <div v-if="!editingPassword">
                  <p class="text-sm text-muted-foreground tracking-widest">••••••••</p>
                </div>

                <form v-else @submit.prevent="savePassword" class="space-y-3">
                <!-- Solo mostrar contraseña actual si ya tiene contraseña -->
                <div v-if="user?.hasPassword">
                  <label class="text-xs font-medium text-muted-foreground mb-1.5 block">Contraseña actual</label>
                  <input v-model="passwordForm.current" type="password" placeholder="Tu contraseña actual"
                    :required="user?.hasPassword"
                    class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  <!-- ✅ Link olvidaste contraseña -->
                  <div class="flex justify-end mt-1.5">
                    <router-link
                      to="/auth/forgot-password"
                      class="text-xs text-primary hover:underline font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </router-link>
                  </div>
                </div>

                <div>
                  <label class="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {{ user?.hasPassword ? 'Nueva contraseña' : 'Crea tu contraseña' }}
                  </label>
                  <input v-model="passwordForm.newPass" type="password"
                    placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número" required
                    class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  <div v-if="passwordForm.newPass" class="mt-2 flex gap-1">
                    <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                      :class="passwordStrength >= i ? strengthColor : 'bg-muted'" />
                  </div>
                  <p v-if="passwordForm.newPass" class="text-xs mt-1" :class="strengthTextColor">{{ strengthLabel }}</p>
                </div>

                <div>
                  <label class="text-xs font-medium text-muted-foreground mb-1.5 block">Confirmar contraseña</label>
                  <input v-model="passwordForm.confirm" type="password" placeholder="Repite la nueva contraseña" required
                    class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  <p v-if="passwordError" class="text-xs text-destructive mt-1.5">{{ passwordError }}</p>
                  <p v-if="passwordSuccess" class="text-xs text-green-600 dark:text-green-400 mt-1.5">{{ passwordSuccess }}</p>
                </div>

                <div class="flex gap-2 pt-1">
                  <button type="submit" :disabled="savingPassword"
                    class="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                    {{ savingPassword ? 'Actualizando...' : user?.hasPassword ? 'Actualizar contraseña' : 'Crear contraseña' }}
                  </button>
                  <button type="button" @click="cancelEditPassword"
                    class="h-10 px-4 rounded-lg border hover:bg-muted transition-colors text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>

          <!-- ACCIONES RÁPIDAS -->
          <div class="border rounded-xl bg-card overflow-hidden">
            <div class="px-6 py-4 border-b bg-muted/30">
              <h2 class="font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acciones Rápidas
              </h2>
            </div>
            <div class="p-4 space-y-2">
              <router-link
                v-for="link in quickLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">{{ link.icon }}</span>
                  <span class="text-sm font-medium">{{ link.label }}</span>
                </div>
                <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
          </div>

        </div>
      </div>

      <!-- Sin autenticar -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="text-7xl mb-4">🔒</div>
        <h3 class="text-xl font-semibold mb-2">No estás autenticado</h3>
        <router-link to="/auth/login"
          class="mt-4 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg transition-all inline-flex items-center">
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

const { user, logout, updateProfile, changePassword } = useAuth()
const router = useRouter()

const editingInfo     = ref(false)
const savingInfo      = ref(false)
const infoError       = ref('')
const editingPassword = ref(false)
const savingPassword  = ref(false)
const passwordError   = ref('')
const passwordSuccess = ref('')
const editForm        = reactive({ name: '', email: '' })
const passwordForm    = reactive({ current: '', newPass: '', confirm: '' })

const quickLinks = computed(() => {
  const base = [
    { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
    { to: '/documents',     icon: '📁', label: 'Mis Archivos' },
    { to: '/compartidos',   icon: '🤝', label: 'Compartidos Conmigo' },
    { to: '/clasificacion', icon: '🏷️', label: 'Clasificación Inteligente' },
  ]
  if (getRole() === 'admin') {
    base.push(
      { to: '/usuarios',  icon: '👥', label: 'Gestión de Usuarios' },
      { to: '/historial', icon: '📋', label: 'Historial y Auditoría' }
    )
  }
  return base
})

function startEditInfo() {
  editForm.name     = user.value?.name  ?? ''
  editForm.email    = user.value?.email ?? ''
  infoError.value   = ''
  editingInfo.value = true
}

function cancelEditInfo() {
  editingInfo.value = false
  infoError.value   = ''
}

async function saveInfo() {
  if (!editForm.name.trim()) { infoError.value = 'El nombre no puede estar vacío.'; return }
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
  if (p.length >= 8)          score++
  if (/[A-Z]/.test(p))        score++
  if (/[0-9]/.test(p))        score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor     = computed(() => ['bg-red-500','bg-orange-400','bg-yellow-400','bg-green-500'][passwordStrength.value - 1] ?? 'bg-red-500')
const strengthTextColor = computed(() => ['text-red-500','text-orange-500','text-yellow-600','text-green-600'][passwordStrength.value - 1] ?? 'text-red-500')
const strengthLabel     = computed(() => ['Muy débil','Débil','Aceptable','Segura'][passwordStrength.value - 1] ?? 'Muy débil')

async function savePassword() {
  passwordError.value = passwordSuccess.value = ''
  
  if (passwordForm.newPass.length < 8) { 
    passwordError.value = 'La contraseña debe tener mínimo 8 caracteres.'; return 
  }
  if (!/[A-Z]/.test(passwordForm.newPass)) { 
    passwordError.value = 'La contraseña debe tener al menos una mayúscula.'; return 
  }
  if (!/\d/.test(passwordForm.newPass)) { 
    passwordError.value = 'La contraseña debe tener al menos un número.'; return 
  }
  if (passwordForm.newPass !== passwordForm.confirm) { 
    passwordError.value = 'Las contraseñas no coinciden.'; return 
  }
  if (user.value?.hasPassword && !passwordForm.current) {
    passwordError.value = 'Ingresa tu contraseña actual.'; return
  }

  savingPassword.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.newPass)
    passwordSuccess.value = '¡Contraseña actualizada! Redirigiendo...'
    setTimeout(() => { logout(); router.replace('/auth/login') }, 2000)
  } catch (e: any) {
    passwordError.value = e?.message ?? 'La contraseña actual es incorrecta.'
  } finally {
    savingPassword.value = false
  }
}

function getRole(): string {
  if (!user.value) return ''
  if (Array.isArray(user.value.roles) && user.value.roles.length > 0)
    return user.value.roles[0].toLowerCase().replace('role_', '')
  return (user.value as any).role ?? ''
}

function getRoleLabel(role: string): string {
  return ({ admin: 'Administrador', standard: 'Estándar', user: 'Estándar', guest: 'Invitado' })[role] || role
}

function getRoleColor(role: string): string {
  return ({
    admin:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    user:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    guest:    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  })[role] || 'bg-muted text-muted-foreground'
}
</script>

<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto grid gap-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Gestión de Usuarios</h1>
          <p class="text-muted-foreground mt-1">Administra roles, permisos y estado de usuarios</p>
        </div>
        <button
          @click="showCreateForm = true"
          class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="search"
            v-model="searchTerm"
            placeholder="Buscar por nombre o email..."
            class="w-full h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select v-model="roleFilter" class="h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="standard">Estándar</option>
          <option value="guest">Invitado</option>
        </select>
        <select v-model="statusFilter" class="h-10 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="border rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Usuario</th>
              <th class="text-left px-6 py-3 font-semibold">Email</th>
              <th class="text-left px-6 py-3 font-semibold">Rol</th>
              <th class="text-left px-6 py-3 font-semibold">Estado</th>
              <th class="text-left px-6 py-3 font-semibold">Fecha de Registro</th>
              <th class="text-right px-6 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in filteredUsers"
              :key="u.email"
              class="border-b hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 font-medium">{{ u.name }}</td>
              <td class="px-6 py-4 text-muted-foreground">{{ u.email }}</td>
              <td class="px-6 py-4">
                <select
                  :value="u.role"
                  @change="changeRole(u.email, ($event.target as HTMLSelectElement).value as UserRole)"
                  class="px-2 py-1 text-xs border rounded bg-background"
                >
                  <option value="admin">Administrador</option>
                  <option value="standard">Estándar</option>
                  <option value="guest">Invitado</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="u.blocked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-700'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ u.blocked ? 'Bloqueado' : 'Activo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-muted-foreground">{{ formatDate(u.createdAt || '') }}</td>
              <td class="px-6 py-4 text-right space-x-3">
                <button
                  @click="toggleBlockUser(u.email, u.blocked)"
                  class="text-primary hover:underline text-xs"
                >
                  {{ u.blocked ? 'Desbloquear' : 'Bloquear' }}
                </button>
                <!-- ✅ Confirmación inline sin confirm() -->
                <template v-if="deleteConfirmEmail === u.email">
                  <button @click="confirmDeleteUser(u.email)" class="text-xs text-white bg-destructive px-2 py-0.5 rounded font-semibold">✓ Sí</button>
                  <button @click="deleteConfirmEmail = null" class="text-xs border px-2 py-0.5 rounded hover:bg-muted">✗ No</button>
                </template>
                <button
                  v-else-if="u.email !== 'admin@docucloud.local'"
                  @click="deleteConfirmEmail = u.email"
                  class="text-destructive hover:underline text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="filteredUsers.length === 0" class="text-center py-12 text-muted-foreground">
        <p>No hay usuarios que coincidan con los filtros</p>
      </div>

      <!-- Stats -->
      <div class="p-4 rounded-lg bg-muted/50 border">
        <p class="text-sm text-muted-foreground">
          Total de usuarios: <span class="font-semibold">{{ allUsers.length }}</span>
        </p>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showCreateForm"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showCreateForm = false"
    >
      <div class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Crear Nuevo Usuario</h2>
          <button @click="showCreateForm = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="text-sm font-semibold mb-1 block">Nombre</label>
            <input
              v-model="newUser.name"
              type="text"
              placeholder="Nombre completo"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-1 block">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              placeholder="usuario@ejemplo.com"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-1 block">Contraseña</label>
            <input
              v-model="newUser.password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-1 block">Rol</label>
            <select
              v-model="newUser.role"
              class="w-full h-10 px-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="standard">Estándar</option>
              <option value="admin">Administrador</option>
              <option value="guest">Invitado</option>
            </select>
          </div>
        </div>

        <p v-if="createError" class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
          {{ createError }}
        </p>

        <div class="flex gap-2">
          <button
            @click="showCreateForm = false"
            class="flex-1 h-10 rounded-lg border hover:bg-accent transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="createUser"
            :disabled="!newUser.name || !newUser.email || !newUser.password"
            class="flex-1 h-10 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 font-medium"
          >
            Crear
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth, type UserRole } from '../../composables/useAuth'
import { useAuditLog } from '../../composables/useAuditLog'

const { getAllUsers, updateUser, deleteUser: deleteUserAuth, register } = useAuth()
const { addLog } = useAuditLog()

const allUsers = computed(() => getAllUsers())
const searchTerm = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showCreateForm = ref(false)
const createError = ref('')
const deleteConfirmEmail = ref<string | null>(null) // ✅ para confirmación inline
const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'standard' as UserRole
})

const filteredUsers = computed(() => {
  let users = [...allUsers.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    users = users.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    )
  }
  if (roleFilter.value) {
    users = users.filter(u => u.role === roleFilter.value)
  }
  if (statusFilter.value === 'active') {
    users = users.filter(u => !u.blocked)
  } else if (statusFilter.value === 'blocked') {
    users = users.filter(u => u.blocked)
  }

  return users
})

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ✅ Tipado con UserRole en lugar de any
function changeRole(email: string, newRole: UserRole) {
  updateUser(email, { role: newRole })
  addLog({
    action: 'user_role_changed',
    userId: 'system',
    userName: 'Sistema',
    userEmail: 'system@docucloud.local',
    details: { targetUser: email, newRole }
  })
}

function toggleBlockUser(email: string, isBlocked: boolean | undefined) {
  updateUser(email, { blocked: !isBlocked })
}

// ✅ Sin confirm() — primer click activa confirmación inline
function deleteUser(email: string) {
  deleteConfirmEmail.value = email
}

function confirmDeleteUser(email: string) {
  if (deleteUserAuth(email)) {
    addLog({
      action: 'user_deleted',
      userId: 'system',
      userName: 'Sistema',
      userEmail: 'system@docucloud.local',
      details: { deletedUser: email }
    })
  }
  deleteConfirmEmail.value = null
}

async function createUser() {
  createError.value = ''

  if (!newUser.value.name.trim()) {
    createError.value = 'El nombre es requerido'
    return
  }
  if (!newUser.value.email.trim()) {
    createError.value = 'El email es requerido'
    return
  }
  if (newUser.value.password.length < 6) {
    createError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  const res = await register({
    name: newUser.value.name,
    email: newUser.value.email,
    password: newUser.value.password
  })

  if (!res.ok) {
    createError.value = res.error
    return
  }

  if (newUser.value.role !== 'standard') {
    updateUser(newUser.value.email, { role: newUser.value.role })
  }

  addLog({
    action: 'user_created',
    userId: 'system',
    userName: 'Sistema',
    userEmail: 'system@docucloud.local',
    details: { newUser: newUser.value.email, role: newUser.value.role }
  })

  showCreateForm.value = false
  newUser.value = { name: '', email: '', password: '', role: 'standard' }
}
</script>

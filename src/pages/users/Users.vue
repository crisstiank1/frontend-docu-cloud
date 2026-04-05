<template>
  <section class="h-screen flex flex-col bg-background overflow-hidden">
    <!-- ===== HEADER ===== -->
    <header
      class="h-16 border-b bg-card/50 backdrop-blur-sm flex-shrink-0 sticky top-0 z-40"
    >
      <div class="h-full max-w-full px-4 flex items-center gap-4">
        <!-- Búsqueda -->
        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              :value="searchTerm"
              @input="onSearchInput(($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Buscar por nombre o email..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <svg
              class="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Filtros dropdown -->
          <div class="relative">
            <button
              @click.stop="showFilters = !showFilters"
              class="h-10 px-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-2 text-sm"
              :class="
                roleFilter || statusFilter ? 'border-primary text-primary' : ''
              "
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
              <span
                v-if="roleFilter || statusFilter"
                class="w-2 h-2 rounded-full bg-primary"
              />
            </button>

            <div
              v-if="showFilters"
              @click.stop
              class="absolute right-0 top-12 w-72 bg-card border rounded-lg shadow-xl p-4 z-50"
            >
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium mb-1 block">Rol</label>
                  <select
                    v-model="roleFilter"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background"
                  >
                    <option value="">Todos los roles</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="USER">Estándar</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium mb-1 block">Estado</label>
                  <select
                    v-model="statusFilter"
                    class="w-full h-9 px-3 border rounded-lg text-sm bg-background"
                  >
                    <option value="">Todos</option>
                    <option value="active">Activos</option>
                    <option value="blocked">Bloqueados</option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button
                    @click="
                      roleFilter = '';
                      statusFilter = '';
                      showFilters = false;
                    "
                    class="flex-1 h-8 text-xs border rounded-lg hover:bg-accent"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="showFilters = false"
                    class="flex-1 h-8 text-xs bg-primary text-primary-foreground rounded-lg"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón nuevo usuario -->
          <button
            @click="showCreateForm = true"
            class="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span class="hidden sm:inline">Nuevo Usuario</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== CONTENIDO ===== -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- ===== STATS CARDS ===== -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
          >
            <p class="text-xs font-semibold text-muted-foreground mb-1">
              Total Usuarios
            </p>
            <!-- ✅ totalItems del backend -->
            <p class="text-2xl font-bold text-primary">{{ totalItems }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              registrados en el sistema
            </p>
          </div>
          <div
            class="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20"
          >
            <p class="text-xs font-semibold text-muted-foreground mb-1">
              Activos
            </p>
            <!-- ✅ u.enabled en lugar de !u.blocked -->
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ activeCount }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              usuarios con acceso
            </p>
          </div>
          <div
            class="p-4 rounded-xl bg-gradient-to-br from-destructive/10 to-red-400/10 border border-destructive/20"
          >
            <p class="text-xs font-semibold text-muted-foreground mb-1">
              Bloqueados
            </p>
            <!-- ✅ !u.enabled en lugar de u.blocked -->
            <p class="text-2xl font-bold text-destructive">
              {{ blockedCount }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              sin acceso al sistema
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-16">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          />
        </div>

        <!-- ===== TABLA ===== -->
        <div
          v-else-if="filteredUsers.length > 0"
          class="border rounded-xl overflow-hidden bg-card"
        >
          <table class="w-full text-sm">
            <thead class="bg-muted/50 border-b sticky top-0">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Usuario</th>
                <th
                  class="text-left px-4 py-3 font-semibold hidden md:table-cell"
                >
                  Email
                </th>
                <th
                  class="text-left px-4 py-3 font-semibold hidden sm:table-cell w-40"
                >
                  Rol
                </th>
                <th class="text-left px-4 py-3 font-semibold w-28">Estado</th>
                <th
                  class="text-left px-4 py-3 font-semibold hidden xl:table-cell w-36"
                >
                  Registro
                </th>
                <th class="text-right px-4 py-3 font-semibold w-44">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="u in filteredUsers"
                :key="u.id"
                class="hover:bg-accent/30 transition-colors group"
              >
                <!-- Avatar + nombre -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="showUserPhoto(u)"
                      :src="u.photoUrl!"
                      :alt="u.name || u.email"
                      class="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      referrerpolicy="no-referrer"
                      @error="markPhotoError(u.id)"
                    />

                    <div
                      v-else
                      class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-sm font-bold text-primary uppercase">
                        {{ getInitial(u.name, u.email) }}
                      </span>
                    </div>

                    <div class="min-w-0">
                      <p class="font-medium truncate">
                        {{ u.name ?? "(Sin nombre)" }}
                      </p>
                      <p class="text-xs text-muted-foreground truncate md:hidden">
                        {{ u.email }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td
                  class="px-4 py-3 text-muted-foreground hidden md:table-cell text-sm"
                >
                  {{ u.email }}
                </td>

                <!-- Rol (selector) — ✅ u.roles[0] en lugar de u.role -->
                <td class="px-4 py-3 hidden sm:table-cell">
                  <select
                    :value="u.roles[0]"
                    @change="
                      changeRole(
                        u.id,
                        ($event.target as HTMLSelectElement).value as
                          | 'USER'
                          | 'ADMIN',
                      )
                    "
                    class="h-8 px-2 text-xs border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    :class="
                      u.roles[0] === 'ADMIN'
                        ? 'text-purple-700 border-purple-300 dark:text-purple-400 dark:border-purple-700'
                        : 'text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-700'
                    "
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="USER">Estándar</option>
                  </select>
                </td>

                <!-- Estado — ✅ u.enabled en lugar de u.blocked -->
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    :class="
                      !u.enabled
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    "
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="!u.enabled ? 'bg-destructive' : 'bg-green-500'"
                    />
                    {{ u.enabled ? "Activo" : "Bloqueado" }}
                  </span>
                </td>

                <!-- Fecha registro -->
                <td
                  class="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs"
                >
                  {{ formatDate(u.createdAt) }}
                </td>

                <!-- Acciones — ✅ usa u.id, agrega botón Límites -->
                <td class="px-4 py-3 text-right" @click.stop>
                  <div class="flex justify-end gap-1 items-center">
                    <!-- Límites -->
                    <button
                      @click="openLimits(u)"
                      class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                      title="Editar límites"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </button>

                    <!-- Toggle estado — ✅ toggleStatus(u.id) -->
                    <button
                      @click="toggleStatus(u.id)"
                      class="p-2 rounded transition-colors"
                      :class="
                        !u.enabled
                          ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600'
                          : 'hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600'
                      "
                      :title="u.enabled ? 'Bloquear' : 'Desbloquear'"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          v-if="!u.enabled"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </button>

                    <!-- Confirmación inline — ✅ usa u.id en lugar de u.email -->
                    <template v-if="deleteConfirmId === u.id">
                      <button
                        @click="confirmDelete(u.id)"
                        class="px-2 py-1 text-xs bg-destructive text-white rounded font-semibold"
                      >
                        ✓ Sí
                      </button>
                      <button
                        @click="deleteConfirmId = null"
                        class="px-2 py-1 text-xs border rounded hover:bg-muted"
                      >
                        ✗ No
                      </button>
                    </template>
                    <button
                      v-else
                      @click="deleteConfirmId = u.id"
                      class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                      title="Eliminar usuario"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ===== ESTADO VACÍO ===== -->
        <div
          v-else-if="!isLoading"
          class="flex flex-col items-center justify-center py-20"
        >
          <div class="text-7xl mb-4">👥</div>
          <h3 class="text-xl font-semibold mb-2">Sin resultados</h3>
          <p class="text-sm text-muted-foreground text-center max-w-sm">
            No hay usuarios que coincidan con los filtros aplicados
          </p>
          <button
            @click="
              roleFilter = '';
              statusFilter = '';
            "
            class="mt-6 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        <!-- ===== PAGINACIÓN ===== -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 pb-2">
          <button
            v-for="p in totalPages"
            :key="p"
            @click="goToPage(p - 1)"
            class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
            :class="
              currentPage === p - 1
                ? 'bg-primary text-primary-foreground shadow'
                : 'border hover:bg-accent text-muted-foreground'
            "
          >
            {{ p }}
          </button>
        </div>
      </main>

    <!-- ===== MODAL: CREAR USUARIO ===== -->
    <Teleport to="body">
      <div
        v-if="showCreateForm"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="showCreateForm = false"
      >
        <div
          class="bg-background rounded-2xl w-full max-w-md p-6 border shadow-2xl"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">Nuevo Usuario</h2>
            <button
              @click="showCreateForm = false"
              class="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold mb-1.5 block"
                >Nombre completo</label
              >
              <input
                v-model="newUser.name"
                type="text"
                placeholder="Ej: Juan Pérez"
                class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label class="text-sm font-semibold mb-1.5 block">Email</label>
              <input
                v-model="newUser.email"
                type="email"
                placeholder="usuario@ejemplo.com"
                class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label class="text-sm font-semibold mb-1.5 block"
                >Contraseña</label
              >
              <input
                v-model="newUser.password"
                type="password"
                placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                class="w-full h-11 px-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <!-- Nota: el rol ADMIN se asigna desde la tabla después de crear -->
            <p
              class="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
            >
              ℹ️ El usuario se crea con rol <strong>Estándar</strong>. Puedes
              cambiarlo a Administrador desde la tabla.
            </p>
          </div>

          <p
            v-if="createError"
            class="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4"
          >
            {{ createError }}
          </p>

          <div class="flex gap-3 mt-6">
            <button
              @click="
                showCreateForm = false;
                createError = '';
              "
              class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="createUserHandler"
              :disabled="
                !newUser.name ||
                !newUser.email ||
                !newUser.password ||
                isCreating
              "
              class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ isCreating ? "Creando..." : "Crear Usuario" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== MODAL: LÍMITES ===== -->
    <Teleport to="body">
      <div
        v-if="limitsTarget"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="limitsTarget = null"
      >
        <div
          class="bg-background rounded-2xl w-full max-w-sm p-6 border shadow-2xl"
        >
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-lg font-bold">Límites de uso</h2>
              <p class="text-xs text-muted-foreground">
                {{ limitsTarget.name ?? limitsTarget.email }}
              </p>
            </div>
            <button
              @click="limitsTarget = null"
              class="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <label class="block">
              <span
                class="text-xs font-semibold text-muted-foreground uppercase"
                >📁 Carpetas máx.</span
              >
              <input
                v-model.number="limitsForm.maxFolders"
                type="number"
                min="0"
                class="mt-1 w-full h-10 px-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label class="block">
              <span
                class="text-xs font-semibold text-muted-foreground uppercase"
                >🏷️ Etiquetas máx.</span
              >
              <input
                v-model.number="limitsForm.maxTags"
                type="number"
                min="0"
                class="mt-1 w-full h-10 px-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label class="block">
              <span
                class="text-xs font-semibold text-muted-foreground uppercase"
                >⭐ Favoritos máx.</span
              >
              <input
                v-model.number="limitsForm.maxFavorites"
                type="number"
                min="0"
                class="mt-1 w-full h-10 px-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="limitsTarget = null"
              class="flex-1 h-11 rounded-lg border hover:bg-muted transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="confirmLimits"
              class="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import { API } from "@/config/api";
import type { UserResponse, UserLimits } from "@/services/userService";

const {
  users,
  totalPages,
  totalItems,
  currentPage,
  isLoading,
  fetchUsers,
  changeRole,
  toggleStatus,
  removeUser,
  saveLimits,
  goToPage,
  setSearch,
} = useAdminUsers();

// ── Búsqueda y filtros ────────────────────────────────────────────────────────
const searchTerm = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const showFilters = ref(false);

// Debounce — envía búsqueda al backend 400ms después del último keystroke
let searchTimeout: ReturnType<typeof setTimeout>;
function onSearchInput(val: string) {
  searchTerm.value = val;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => setSearch(val), 400);
}

// Filtros locales (rol y estado) sobre la página actual del backend
const filteredUsers = computed(() => {
  let list = [...users.value];
  if (roleFilter.value)
    list = list.filter((u: UserResponse) => u.roles[0] === roleFilter.value);
  if (statusFilter.value === "active")
    list = list.filter((u: UserResponse) => u.enabled);
  if (statusFilter.value === "blocked")
    list = list.filter((u: UserResponse) => !u.enabled);
  return list;
});

// Stats sobre la página actual
const activeCount = computed(
  () => users.value.filter((u: UserResponse) => u.enabled).length,
);
const blockedCount = computed(
  () => users.value.filter((u: UserResponse) => !u.enabled).length,
);

// ── Eliminar ──────────────────────────────────────────────────────────────────
const deleteConfirmId = ref<number | null>(null); // ✅ id, no email

async function confirmDelete(id: number) {
  await removeUser(id);
  deleteConfirmId.value = null; // cierra la confirmación
}

// ── Límites ───────────────────────────────────────────────────────────────────
const limitsTarget = ref<UserResponse | null>(null);
const limitsForm = ref<UserLimits>({
  maxFolders: 0,
  maxTags: 0,
  maxFavorites: 0,
});

function openLimits(user: UserResponse) {
  limitsTarget.value = user;
  limitsForm.value = {
    maxFolders: user.maxFolders,
    maxTags: user.maxTags,
    maxFavorites: user.maxFavorites,
  };
}

async function confirmLimits() {
  if (!limitsTarget.value) return;
  await saveLimits(limitsTarget.value.id, limitsForm.value);
  limitsTarget.value = null;
}


const brokenPhotos = ref<Record<number, boolean>>({});

function showUserPhoto(u: UserResponse) {
  return !!u.photoUrl && !brokenPhotos.value[u.id];
}

function markPhotoError(userId: number) {
  brokenPhotos.value[userId] = true;
}

function getInitial(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email && email.trim()) || "?";
  return base.charAt(0).toUpperCase();
}


// ── Crear usuario (via POST /api/auth/register) ───────────────────────────────
const showCreateForm = ref(false);
const createError = ref("");
const isCreating = ref(false);
const newUser = ref({ name: "", email: "", password: "" });

async function createUserHandler() {
  createError.value = "";
  if (!newUser.value.name.trim()) {
    createError.value = "El nombre es requerido";
    return;
  }
  if (!newUser.value.email.trim()) {
    createError.value = "El email es requerido";
    return;
  }
  if (newUser.value.password.length < 8 || !/[A-Z]/.test(newUser.value.password) || !/\d/.test(newUser.value.password)) {
  createError.value = "Mínimo 8 caracteres, 1 mayúscula y 1 número";
  return;
  }
  
  isCreating.value = true;
  try {
    await API.auth.register({
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
    });
    showCreateForm.value = false;
    newUser.value = { name: "", email: "", password: "" };
    await fetchUsers();
  } catch (e: any) {
    createError.value = e.response?.data?.message ?? "Error al crear usuario";
  } finally {
    isCreating.value = false;
  }
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function formatDate(date: string): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

onMounted(() => fetchUsers());
</script>

<template>
  <section class="py-10 px-6 md:px-8">
    <div class="max-w-7xl mx-auto">

      <WelcomeSection
        :user-name="user?.name || 'Usuario'""
      />

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total de Archivos"
          :value="myDocuments.length"
          unit="archivos"
          :trend="getDocumentsTrend()"
          :change="3"
        />
        <StatsCard
          label="Archivos Compartidos"
          :value="sharedWithMe.length"
          unit="archivos"
          :trend="getSharedTrend()"
          :change="1"
        />
        <StatsCard
          v-if="user?.role === 'admin'"
          label="Usuarios Activos"
          :value="totalUsers"
          unit="usuarios"
          trend="up"
          :change="2"
        />
        <StatsCard
          v-else
          label="Carpetas"
          :value="totalFolders"
          unit="carpetas"
          trend="stable"
        />
        <StatsCard
          label="Espacio Utilizado"
          :value="`${(getTotalDocumentSize() / (1024 * 1024)).toFixed(1)}`"
          unit="MB"
          :trend="getStorageTrend()"
        />
      </div>

      <!-- Dashboard Cards -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Mis Archivos"
          description="Ver y gestionar tus archivos"
          :count="myDocuments.length"
          countLabel="archivos"
          to="/documents"
          icon-color="#6366f1"
          icon-bg-color="#6366f130"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #6366f1; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Clasificación"
          description="Organiza tus categorías"
          count="—"
          countLabel="categorías"
          to="/clasificacion"
          icon-color="#10b981"
          icon-bg-color="#10b98130"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #10b981; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          title="Compartidos"
          description="Archivos compartidos contigo"
          :count="sharedWithMe.length"
          countLabel="archivos"
          to="/compartidos"
          icon-color="#ec4899"
          icon-bg-color="#ec489930"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #ec4899; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 12H9m0 0l3-3m-3 3l-3-3m3 3l3 3" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.role === 'admin'"
          title="Usuarios"
          description="Gestiona los usuarios del sistema"
          :count="totalUsers"
          countLabel="usuarios"
          to="/usuarios"
          icon-color="#f59e0b"
          icon-bg-color="#f59e0b30"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #f59e0b; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </DashboardCard>

        <DashboardCard
          v-if="user?.role === 'admin'"
          title="Historial"
          description="Auditoría y registro de acciones"
          :count="logs.length"
          countLabel="registros"
          to="/historial"
          icon-color="#8b5cf6"
          icon-bg-color="#8b5cf630"
        >
          <template #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #8b5cf6; stroke-width: 1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </DashboardCard>
      </div>

      <!-- Bottom Grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <RecentActivityWidget
            :activities="recentLogs"
            :can-view-history="user?.role === 'admin'"
          />
        </div>

        <div class="space-y-6">
          <!-- Tips -->
          <div class="p-6 rounded-lg border bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consejos y Ayuda
            </h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Organiza tus archivos con categorías</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Comparte archivos de forma segura</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Usa búsqueda avanzada para encontrar rápido</span>
              </li>
              <li class="flex gap-2">
                <span class="text-primary font-bold">•</span>
                <span>Revisa el historial de cambios regularmente</span>
              </li>
            </ul>
          </div>

          <!-- Acciones Rápidas -->
          <div class="p-6 rounded-lg border bg-card">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h3>
            <div class="space-y-2">
              <router-link to="/documents" class="block px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors duration-200">
                + Subir Archivo
              </router-link>
              <router-link to="/clasificacion" class="block px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors duration-200">
                + Nueva Categoría
              </router-link>
              <router-link v-if="user?.role === 'admin'" to="/usuarios" class="block px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium transition-colors duration-200">
                + Agregar Usuario
              </router-link>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useDocuments } from '../composables/useDocuments'
import { useAuditLog } from '../composables/useAuditLog'
import WelcomeSection from '../components/WelcomeSection.vue'
import DashboardCard from '../components/DashboardCard.vue'
import StatsCard from '../components/StatsCard.vue'
import RecentActivityWidget from '../components/RecentActivityWidget.vue'

const { user, getAllUsers } = useAuth()
const { getMyDocuments, getSharedWithMe, folders } = useDocuments()
const { logs } = useAuditLog()

const myDocuments = computed(() => getMyDocuments())
const sharedWithMe = computed(() => getSharedWithMe())
const totalUsers = computed(() => getAllUsers().length)

// ✅ logs ya es Ref, en script se accede con .value
const recentLogs = computed(() => logs.value.slice(0, 10))

// ✅ folderId en lugar de folder
const totalFolders = computed(() =>
  Object.values(folders.value).filter(f => f.ownerId === user.value?.id).length
)

function getTotalDocumentSize(): number {
  return myDocuments.value.reduce((sum, doc) => sum + (doc.size || 0), 0)
}

function getDocumentsTrend(): 'up' | 'stable' {
  return myDocuments.value.length > 3 ? 'up' : 'stable'
}

function getSharedTrend(): 'up' | 'stable' {
  return sharedWithMe.value.length > 1 ? 'up' : 'stable'
}

function getStorageTrend(): 'up' | 'stable' {
  const size = getTotalDocumentSize() / (1024 * 1024)
  return size > 100 ? 'up' : 'stable'
}
</script>

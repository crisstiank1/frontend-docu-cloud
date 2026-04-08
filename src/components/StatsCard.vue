<template>
  <div
    class="relative p-4 rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
    :style="{
      background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 60%, ${accentColor}08 100%)`,
      borderColor: `${accentColor}30`,
    }"
  >
    <!-- Borde superior de color -->
    <div
      class="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all duration-300 group-hover:h-1"
      :style="{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }"
    />

    <!-- Header: label + ícono -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <!-- CORRECCIÓN: line-clamp-2 + pr-2 para que el label no colisione con el ícono -->
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide line-clamp-2 leading-tight">
        {{ label }}
      </span>

      <!-- Ícono con color de acento -->
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
        :style="{ backgroundColor: `${accentColor}15` }"
      >
        <slot name="icon">
          <svg
            class="w-4 h-4"
            :style="{ color: accentColor }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path v-if="trend === 'up'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8L7 17" />
            <path v-else-if="trend === 'down'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H7m0 0V9m0 8l10-10" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
          </svg>
        </slot>
      </div>
    </div>

    <!-- Valor principal -->
    <!-- CORRECCIÓN: text-xl sm:text-2xl para que no se desborde en cards estrechas -->
    <div class="flex items-baseline gap-1.5 flex-wrap">
      <span class="text-xl sm:text-2xl font-bold tracking-tight" :style="{ color: `hsl(var(--foreground))` }">
        {{ formattedValue }}
      </span>
      <span v-if="unit" class="text-xs text-muted-foreground font-medium">{{ unit }}</span>
    </div>

    <!-- Subtítulo opcional -->
    <p v-if="subtitle" class="text-xs text-muted-foreground mt-1 truncate">{{ subtitle }}</p>

    <!-- Cambio porcentual -->
    <!-- CORRECCIÓN: flex-wrap para que no se corte en cards angostas -->
    <p
      v-if="changeAmount !== undefined"
      class="text-xs mt-2 font-medium flex items-center gap-1 flex-wrap"
      :style="{ color: trendColor }"
    >
      <span>{{ changeAmount > 0 ? '↑' : changeAmount < 0 ? '↓' : '→' }}</span>
      <span>{{ changeText }}</span>
    </p>

    <!-- Barra de progreso -->
    <template v-if="progress !== undefined">
      <div class="mt-3 space-y-1">
        <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{
              width: `${progress}%`,
              backgroundColor: progress > 80 ? '#ef4444' : progress > 50 ? '#f59e0b' : accentColor,
            }"
          />
        </div>
        <p class="text-xs text-muted-foreground text-right">
          {{ progress }}%{{ progressMax ? ` de ${progressMax}` : '' }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  accentColor?: string
  subtitle?: string
  changeAmount?: number
  changePeriod?: string
  progress?: number
  progressMax?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'stable',
  changePeriod: 'semana pasada',
  accentColor: '#6366f1',
})

const formattedValue = computed(() => {
  const v = Number(props.value)
  if (isNaN(v)) return props.value
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return props.value
})

const trendColor = computed(() => {
  if (props.trend === 'up') return '#10b981'
  if (props.trend === 'down') return '#ef4444'
  return '#6b7280'
})

const changeText = computed(() => {
  if (props.changeAmount === undefined) return ''
  const sign = props.changeAmount > 0 ? '+' : ''
  return `${sign}${props.changeAmount}% desde la ${props.changePeriod}`
})
</script>
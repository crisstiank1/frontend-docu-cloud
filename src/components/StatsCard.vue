<template>
  <div class="p-4 rounded-lg border bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium text-muted-foreground">{{ label }}</span>
      <div class="w-8 h-8 rounded flex items-center justify-center" :style="{ backgroundColor: trendColor + '20' }">
        <svg v-if="trend === 'up'" class="w-4 h-4" :style="{ color: trendColor }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8L7 17" />
        </svg>
        <svg v-else-if="trend === 'down'" class="w-4 h-4" :style="{ color: trendColor }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H7m0 0V9m0 8l10-10" />
        </svg>
        <svg v-else class="w-4 h-4" :style="{ color: trendColor }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
        </svg>
      </div>
    </div>
    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-bold">{{ value }}</span>
      <span v-if="unit" class="text-xs text-muted-foreground">{{ unit }}</span>
    </div>
    <p v-if="change" class="text-xs mt-3" :style="{ color: trendColor }">{{ changeText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  change?: number
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'stable'
})

const trendColor = computed(() => {
  if (props.trend === 'up') return '#10b981'
  if (props.trend === 'down') return '#ef4444'
  return '#6b7280'
})

const changeText = computed(() => {
  if (!props.change) return ''
  const sign = props.change > 0 ? '+' : ''
  return `${sign}${props.change}% desde la semana pasada`
})
</script>

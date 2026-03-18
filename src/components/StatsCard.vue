<template>
  <div
    class="p-4 rounded-lg border bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow duration-300"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium text-muted-foreground">{{ label }}</span>

      <!-- Indicador de tendencia -->
      <div
        class="w-8 h-8 rounded flex items-center justify-center"
        :style="{ backgroundColor: trendColor + '20' }"
      >
        <!-- Tendencia: subiendo -->
        <svg
          v-if="trend === 'up'"
          class="w-4 h-4"
          :style="{ color: trendColor }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7h8m0 0v8m0-8L7 17"
          />
        </svg>

        <!-- Tendencia: bajando -->
        <svg
          v-else-if="trend === 'down'"
          class="w-4 h-4"
          :style="{ color: trendColor }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 17H7m0 0V9m0 8l10-10"
          />
        </svg>

        <!--
          CORRECCIÓN #6: el ícono 'stable' era un checkmark (M9 12l2 2 4-4),
          que semánticamente significa "éxito" o "completado", no "sin cambio".
          Ahora es una línea horizontal (—), que es el estándar visual para estabilidad.
        -->
        <svg
          v-else
          class="w-4 h-4"
          :style="{ color: trendColor }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14"
          />
        </svg>
      </div>
    </div>

    <!-- Valor principal -->
    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-bold">{{ formattedValue }}</span>
      <span v-if="unit" class="text-xs text-muted-foreground">{{ unit }}</span>
    </div>

    <!--
      CORRECCIÓN #7: changePeriod es configurable via prop (por defecto 'semana pasada').
      Si el dato es mensual o diario, el padre puede pasarlo correctamente.
      changeAmount ahora tiene tipo claro: si no se pasa, no se muestra el texto.
    -->
    <p
      v-if="changeAmount !== undefined"
      class="text-xs mt-3"
      :style="{ color: trendColor }"
    >
      {{ changeText }}
    </p>

    <!-- Barra de progreso -->
    <template v-if="progress !== undefined">
      <div class="mt-3 space-y-1">
        <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="
              progress > 80
                ? 'bg-destructive'
                : progress > 50
                  ? 'bg-amber-500'
                  : 'bg-primary'
            "
            :style="{ width: `${progress}%` }"
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
  /**
   * CORRECCIÓN #3 y #7:
   * - Renombrado de `change` a `changeAmount` para mayor claridad semántica.
   * - Representa un porcentaje REAL de cambio (ej: 12.5 = +12.5%).
   *   Si el backend no expone este dato, simplemente no se pasa y el texto no aparece.
   * - El período se controla con `changePeriod`.
   */
  changeAmount?: number
  /**
   * Período de comparación para changeAmount.
   * Valores sugeridos: 'semana pasada', 'mes pasado', 'ayer'.
   */
  changePeriod?: string
  progress?: number
  progressMax?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'stable',
  changePeriod: 'semana pasada',
})

// Formatea números grandes (ej: 1200 → "1.2k")
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
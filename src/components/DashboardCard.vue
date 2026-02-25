<template>
  <router-link :to="to" class="group p-6 rounded-lg border bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden relative">
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div class="relative z-10">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" :style="{ backgroundColor: iconBgColor }">
        <slot name="icon" />
      </div>

      <h3 class="text-lg font-semibold group-hover:text-primary transition-colors duration-300">{{ title }}</h3>
      <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>

      <div class="flex items-baseline gap-2 mt-4">
        <span class="text-2xl font-bold text-primary">{{ count }}</span>
        <span class="text-xs text-muted-foreground">{{ countLabel }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  count: number | string
  countLabel?: string
  iconColor?: string
  iconBgColor?: string
  to: string
}

const props = withDefaults(defineProps<Props>(), {
  countLabel: 'total',
  iconColor: '#6366f1',
  iconBgColor: '#6366f130'
})
</script>

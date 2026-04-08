<template>
  <div class="mb-6 sm:mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent truncate">
      Bienvenido, {{ userName }}!
    </h1>
    <p class="text-sm sm:text-base text-muted-foreground">
      Gestiona tus archivos de forma inteligente
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName: string
}>()
</script>
<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
       Bienvenido, {{ userName }}!
    </h1>
    <p class="text-muted-foreground">
      Gestiona tus archivos de forma inteligente 
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName: string
}>()
</script>

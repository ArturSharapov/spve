<script setup lang="ts">
defineProps<{
  description?: string
}>()

const title = `SPVE Playground`
</script>

<template>
  <main class="spve-app">
    <h1>Amazing {{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </main>
</template>

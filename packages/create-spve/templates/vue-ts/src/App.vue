<script setup lang="ts">
defineProps<{
  description?: string
}>()

const title = __TITLE_JS__
</script>

<template>
  <main class="spve-app">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </main>
</template>

<script setup lang="ts">
import spveProps from 'spve/vue'

defineProps(spveProps)

const title = __TITLE_JS__
</script>

<template>
  <main class="spve-app">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </main>
</template>

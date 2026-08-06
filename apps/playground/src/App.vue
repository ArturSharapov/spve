<script setup lang="ts">
import spveProps from 'spve/vue'
import { onMounted } from 'vue'

const props = defineProps(spveProps)
onMounted(() => {
  console.log(props)
})

const title = `SPVE Playground`
</script>

<template>
  <main class="spve-app">
    <h1>Amazing {{ title }}</h1>
    <p>{{ description == undefined ? 'undefined' : description }}</p>
    <input type="number" v-model="numfield" />
  </main>
</template>

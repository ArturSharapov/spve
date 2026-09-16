<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="comparison-party">{{ label }}</span>
  <span class="comparison-card-top-line" aria-hidden="true" />
  <svg
    class="comparison-card-outline"
    width="176"
    height="36"
    viewBox="0 0 176 36"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      class="comparison-card-fill"
      d="M0 36C8 36 12 30.5 16 20C20 8 23 0 26 0H169A7 7 0 0 1 176 7V36Z"
    />
    <path
      d="M.5 35.5C8.5 35.5 12.5 30.5 16.5 20C20.5 8 23.5.5 26.5.5H169A6.5 6.5 0 0 1 175.5 7V35.5"
    />
  </svg>
</template>

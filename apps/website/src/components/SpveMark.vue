<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    showWordmark?: boolean
  }>(),
  {
    size: 36,
    showWordmark: true,
  },
)
</script>

<template>
  <span class="inline-flex items-center gap-2.5" aria-label="SPVE">
    <img
      :src="'/assets/spve-logo.png'"
      alt=""
      :width="size"
      :height="size"
      class="shrink-0 object-contain"
      aria-hidden="true"
    />
    <span
      v-if="showWordmark"
      class="font-display text-[1.05rem] font-extrabold tracking-[-0.045em] text-white"
    >
      SPVE
    </span>
  </span>
</template>

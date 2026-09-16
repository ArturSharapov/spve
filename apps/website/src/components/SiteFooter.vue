<script setup lang="ts">
import SpveMark from './SpveMark.vue'
</script>

<template>
  <footer class="border-t border-white/8 bg-[#050c12] py-7">
    <div class="wide-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <SpveMark :size="34" />
      <p class="text-xs text-mist/55">SPVE is released under the MIT license.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  type: 'speed' | 'framework' | 'config' | 'sharepoint'
}>()

const gradientId = `feature-gradient-${useId().replaceAll(':', '')}`
</script>

<template>
  <svg
    class="feature-artwork overflow-visible"
    viewBox="0 0 180 110"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="34" y1="22" x2="145" y2="91">
        <stop stop-color="#06b6d4" />
        <stop offset="0.5" stop-color="#2195ed" />
        <stop offset="1" stop-color="#9b34ef" />
      </linearGradient>
    </defs>

    <g
      v-if="type === 'speed'"
      :stroke="`url(#${gradientId})`"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M42 81a49 49 0 0 1 96 0" stroke-width="7" stroke-dasharray="5 8" />
      <path d="M51 82h78" stroke-width="3" opacity=".5" />
      <path d="m90 78 27-24" stroke-width="4" />
      <circle cx="90" cy="78" r="6" stroke-width="3" />
      <path d="M90 28v8M58 42l6 7M122 42l-6 7" stroke-width="3" />
    </g>

    <g
      v-else-if="type === 'framework'"
      :stroke="`url(#${gradientId})`"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M72 57 85 70l28-31" stroke-width="7" />
      <path
        d="M90 17v10M90 85v10M50 56H40M140 56h-10M62 28l7 8M118 28l-7 8M62 84l7-8M118 84l-7-8"
        stroke-width="2.5"
        opacity=".72"
      />
      <circle cx="90" cy="56" r="43" stroke-width="1.5" stroke-dasharray="1 8" opacity=".38" />
    </g>

    <g
      v-else-if="type === 'config'"
      :stroke="`url(#${gradientId})`"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M46 27h88v58H46z" stroke-width="3" />
      <path d="M46 42h88" stroke-width="2" opacity=".55" />
      <circle cx="57" cy="34.5" r="2" fill="#06b6d4" stroke="none" />
      <circle cx="65" cy="34.5" r="2" fill="#2195ed" stroke="none" />
      <path d="m76 59-10 8 10 8M104 59l10 8-10 8M95 54 85 80" stroke-width="3.5" />
    </g>

    <g v-else :stroke="`url(#${gradientId})`" stroke-linecap="round" stroke-linejoin="round">
      <path d="M43 34h42v42H43zM95 34h42v42H95z" stroke-width="3" opacity=".55" />
      <path d="M68 55h44M102 45l10 10-10 10" stroke-width="5" />
      <path d="M35 27v15M35 27h15M145 83V68M145 83h-15" stroke-width="2.5" opacity=".75" />
    </g>
  </svg>
</template>

<script setup lang="ts">
const comparisons = [
  {
    name: 'SPVE',
    accent: 'spve',
    metrics: [
      { value: 'direct', label: 'server', width: '18%' },
      { value: 'module', label: 'update', width: '9%' },
      { value: 'preserved', label: 'state', width: '13%' },
    ],
  },
  {
    name: 'Traditional SPFx',
    accent: 'classic',
    metrics: [
      { value: 'full', label: 'startup', width: '76%' },
      { value: 'bundle', label: 'rebuild', width: '91%' },
      { value: 'page', label: 'refresh', width: '68%' },
    ],
  },
] as const
</script>

<template>
  <section id="workflow" class="relative min-h-[788px] py-20">
    <div class="wide-shell">
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="font-display text-4xl font-bold leading-[1.7] tracking-[-0.045em] sm:text-5xl">
          Lightning Fast
        </h2>
        <p class="mx-auto mt-2 max-w-3xl text-lg leading-[1.7] text-white/65 sm:text-2xl">
          Skip the long SPFx build cycle and keep every change inside the browser.
        </p>
      </div>

      <div class="mx-auto mt-24 max-w-[1080px] space-y-10">
        <div
          v-for="comparison in comparisons"
          :key="comparison.name"
          class="grid gap-4 sm:grid-cols-[170px_1fr] sm:items-center sm:gap-0"
        >
          <h3 class="px-0 font-display text-[17px] font-bold leading-[1.7] sm:px-0">
            {{ comparison.name }}
          </h3>
          <div>
            <div
              v-for="metric in comparison.metrics"
              :key="metric.label"
              class="grid h-[18px] grid-cols-[minmax(0,1fr)_100px] items-center"
            >
              <div class="speed-track h-1.5 overflow-hidden rounded-full">
                <div
                  class="h-full rounded-full"
                  :class="comparison.accent === 'spve' ? 'speed-bar-spve' : 'speed-bar-classic'"
                  :style="{ width: metric.width }"
                />
              </div>
              <p class="whitespace-nowrap font-mono text-xs leading-[1.7] text-white/60">
                <span>{{ metric.value }}</span>
                <span class="ml-2 text-white/35">{{ metric.label }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="mx-auto mt-13 max-w-3xl text-center text-xs leading-5 text-white/35">
        Architectural development-loop comparison. Actual timings depend on project size and
        machine.
      </p>

      <a
        href="#features"
        class="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-sp-blue/60 px-6 py-3 text-sm font-bold text-white transition hover:border-sp-cyan hover:bg-sp-cyan/[0.06]"
      >
        Explore all features
        <span aria-hidden="true">→</span>
      </a>
    </div>
  </section>
</template>

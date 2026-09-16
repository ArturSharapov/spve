<script setup lang="ts">
const capabilities = [
  {
    title: 'Typed App Properties',
    body: 'Generate strongly typed props directly from your SPVE configuration.',
    icon: '<>',
  },
  {
    title: 'Property Pane',
    body: 'Create standard SPFx property controls without duplicate definitions.',
    icon: '▤',
  },
  {
    title: 'Framework Adapters',
    body: 'Mount applications through first-class adapters for modern UI frameworks.',
    icon: '◇',
  },
  {
    title: 'SharePoint Context',
    body: 'Use native WebPartContext when your application needs platform access.',
    icon: 'SP',
  },
  {
    title: 'Authenticated Clients',
    body: 'Work with SharePoint and Microsoft APIs in standalone development.',
    icon: '↗',
  },
  {
    title: 'Hosted Workbench',
    body: 'Preview the real web part on the SharePoint site you already use.',
    icon: '▣',
  },
  {
    title: 'Shared Toolchain',
    body: 'Install the heavy SPFx dependencies once and safely reuse them.',
    icon: '∞',
  },
  {
    title: 'Dev Certificates',
    body: 'Reuse the trusted SPFx certificate for the entire development loop.',
    icon: '⌁',
  },
  {
    title: 'Production Packages',
    body: 'Build the application and emit a deployable SharePoint package.',
    icon: '▧',
  },
  {
    title: 'Generated Manifests',
    body: 'Keep SharePoint metadata synchronized with your project config.',
    icon: '{}',
  },
  {
    title: 'Fast Refresh',
    body: 'Preserve framework state while React and compatible adapters update.',
    icon: '↯',
  },
  {
    title: 'Disposable State',
    body: 'Regenerate hidden SPFx output whenever the source configuration changes.',
    icon: '⟳',
  },
] as const
</script>

<template>
  <section id="features" class="relative py-20">
    <div class="wide-shell">
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Fully Featured
        </h2>
        <p class="mx-auto mt-2 max-w-3xl text-lg leading-[1.7] text-white/65 sm:text-2xl">
          Built as a modern development layer for SPFx, with the infrastructure required for local
          work and production delivery.
        </p>
      </div>

      <div class="mt-20 grid gap-x-9 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="capability in capabilities" :key="capability.title">
          <div class="flex items-center gap-3">
            <span
              class="grid size-8 shrink-0 place-items-center font-mono text-sm font-bold text-white"
              aria-hidden="true"
            >
              {{ capability.icon }}
            </span>
            <h3 class="font-display text-lg font-bold tracking-[-0.025em]">
              {{ capability.title }}
            </h3>
          </div>
          <p class="mt-3 pl-11 text-sm leading-6 text-mist">{{ capability.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

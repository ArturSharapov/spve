<script setup lang="ts">
const frameworks = [
  { name: 'Vue', mark: 'V', color: '#42b883', body: 'Progressive and approachable.' },
  { name: 'React', mark: '⚛', color: '#61dafb', body: 'Components with Fast Refresh.' },
  { name: 'Svelte', mark: 'S', color: '#ff3e00', body: 'Compiler-first and concise.' },
  { name: 'Solid', mark: 'S', color: '#6ea8dd', body: 'Fine-grained reactivity.' },
  { name: 'Lit', mark: 'L', color: '#7c91ff', body: 'Standards-based web components.' },
  { name: 'Preact', mark: 'P', color: '#a478e8', body: 'Small and React-compatible.' },
  { name: 'Qwik', mark: 'Q', color: '#ac7ef4', body: 'Resumable client rendering.' },
  { name: 'Vanilla', mark: 'TS', color: '#f7df1e', body: 'The platform, fully typed.' },
] as const

const installLines = [
  { prefix: '$', text: 'npm init sp' },
  { prefix: '◇', text: 'Choose a framework  Vue' },
  { prefix: '◇', text: 'SharePoint site connected' },
  { prefix: '◆', text: 'Your web part is ready.' },
] as const
</script>

<template>
  <section id="frameworks" class="relative py-20">
    <div class="wide-shell">
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Framework Agnostic
        </h2>
        <p class="mx-auto mt-2 max-w-3xl text-lg leading-[1.7] text-white/65 sm:text-2xl">
          One SharePoint development experience for every modern frontend framework.
        </p>
      </div>

      <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="framework in frameworks"
          :key="framework.name"
          class="framework-card group rounded-xl border border-white/9 p-5 transition-colors duration-300 hover:border-white/18"
        >
          <div class="flex items-center gap-4">
            <span
              class="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 font-display text-sm font-extrabold"
              :style="{ color: framework.color }"
            >
              {{ framework.mark }}
            </span>
            <div>
              <h3 class="font-display text-lg font-bold">{{ framework.name }}</h3>
              <p class="mt-1 text-xs text-mist">{{ framework.body }}</p>
            </div>
          </div>
        </article>
      </div>

      <div
        id="quickstart"
        class="quickstart-panel relative mt-28 overflow-hidden rounded-3xl border border-white/10 bg-panel px-6 py-16 text-center sm:px-12 sm:py-22"
      >
        <div
          class="absolute inset-0 [background:radial-gradient(circle_at_50%_0%,rgba(33,149,237,.20),transparent_44%)]"
        />
        <div class="hero-grid absolute inset-0 opacity-25" />
        <div class="relative">
          <h2 class="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
            Get Started
          </h2>
          <p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-mist sm:text-lg">
            Create a project, choose your framework, and open a live SharePoint development loop.
          </p>

          <div
            class="mx-auto mt-9 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#061018] text-left shadow-2xl"
          >
            <div class="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span class="size-2 rounded-full bg-[#ff6b6b]" />
              <span class="size-2 rounded-full bg-[#ffd166]" />
              <span class="size-2 rounded-full bg-[#42d392]" />
              <span class="ml-2 font-mono text-[0.62rem] text-mist/55">terminal</span>
            </div>
            <div class="space-y-1 p-4 font-mono text-[0.7rem] leading-6 sm:p-5 sm:text-xs">
              <div
                v-for="(line, index) in installLines"
                :key="line.text"
                :class="index === 3 ? 'pt-2 text-white' : 'text-mist'"
              >
                <span
                  :class="
                    index === 0
                      ? 'text-sp-cyan'
                      : index === 3
                        ? 'text-[#42d392]'
                        : 'text-vite-bright'
                  "
                >
                  {{ line.prefix }}
                </span>
                <span class="ml-3">{{ line.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SpveMark from './SpveMark.vue'
</script>

<template>
  <section id="top" class="relative min-h-[710px] pt-16">
    <div
      class="wide-shell flex min-h-[646px] flex-col items-center justify-center pb-10 pt-12 text-center sm:pt-14"
    >
      <div class="hero-mark relative">
        <div class="absolute inset-1 rounded-full bg-sp-blue/20 blur-3xl" />
        <SpveMark :size="176" :show-wordmark="false" class="relative" />
      </div>

      <h1
        class="display-gradient mt-3 font-display text-6xl font-extrabold leading-tight tracking-[-0.055em] sm:text-7xl"
      >
        SPVE
      </h1>

      <p
        class="mt-4 max-w-5xl font-display text-[clamp(2rem,4vw,3.125rem)] font-bold leading-[1.44] tracking-[-0.035em] text-white"
      >
        Modern SPFx development for the web
      </p>

      <p class="mt-2 max-w-3xl text-lg leading-8 text-mist sm:text-2xl sm:leading-[1.7]">
        Any framework. Instant HMR. One clean toolchain.
      </p>

      <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#workflow"
          class="inline-flex h-14 min-w-38 items-center justify-center rounded-full bg-gradient-to-r from-sp-cyan via-sp-blue to-vite px-7 text-base font-bold text-white shadow-[0_14px_44px_rgba(33,149,237,.28)] transition-shadow hover:shadow-[0_18px_54px_rgba(33,149,237,.42)]"
        >
          Get Started
        </a>
        <a
          href="#quickstart"
          class="inline-flex h-14 min-w-38 items-center justify-center gap-2 rounded-full border border-sp-blue/65 bg-black/10 px-7 text-base font-bold text-white transition hover:border-sp-cyan hover:bg-sp-cyan/8"
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 4.5h12v9H3v-9Z" stroke="currentColor" stroke-width="1.4" />
            <path
              d="m6 7 2 2-2 2m4 0h2"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Quick Start
        </a>
      </div>
    </div>
  </section>
</template>

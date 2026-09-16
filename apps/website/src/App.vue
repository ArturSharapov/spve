<script setup lang="ts">
import FeatureGrid from './components/FeatureGrid.vue'
import HeroSection from './components/HeroSection.vue'
import LandingFlow from './components/LandingFlow.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <div
    class="min-h-screen overflow-hidden bg-ink text-white selection:bg-cyan-300 selection:text-ink"
  >
    <SiteHeader />
    <main>
      <div class="landing-stage">
        <LandingFlow />
        <HeroSection />
        <FeatureGrid />
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

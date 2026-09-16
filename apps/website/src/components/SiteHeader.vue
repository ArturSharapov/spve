<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import SpveMark from './SpveMark.vue'

const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const isScrolled = ref(false)

const links = [
  { label: 'Guide', href: '#quickstart', description: 'Create your first SPVE project' },
  { label: 'Config', href: '#workflow', description: 'Typed configuration and generated output' },
  { label: 'Features', href: '#features', description: 'Everything included with SPVE' },
  {
    label: 'Adapters',
    href: '#frameworks',
    description: 'Framework adapters for Vue, React, Svelte, and more',
  },
] as const

const filteredLinks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return links
  return links.filter(
    (link) =>
      link.label.toLowerCase().includes(query) || link.description.toLowerCase().includes(query),
  )
})

async function openSearch() {
  searchOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

function closeSearch() {
  searchOpen.value = false
  searchQuery.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    void openSearch()
  }
  if (event.key === 'Escape') closeSearch()
}

function onScroll() {
  isScrolled.value = window.scrollY > 12
}

onMounted(() => {
  onScroll()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300"
    :class="
      isScrolled
        ? 'border-white/[0.09] bg-ink-soft/72 shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-xl'
        : 'border-transparent bg-ink/24'
    "
  >
    <div class="wide-shell flex h-16 items-center">
      <a href="#top" class="flex h-full shrink-0 items-center rounded-md" aria-label="SPVE home">
        <SpveMark :size="34" />
      </a>

      <button
        type="button"
        class="ml-auto flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-sm text-mist transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:h-9 sm:w-40 sm:justify-start sm:gap-2 sm:px-3"
        aria-label="Search (Meta+k)"
        @click="openSearch"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          class="shrink-0"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
          <path
            d="m10.5 10.5 3 3"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
        <span class="hidden sm:inline">Search</span>
        <kbd
          class="ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.62rem] text-mist/70 sm:inline-flex"
          >⌘ K</kbd
        >
      </button>
    </div>
  </header>

  <Teleport to="body">
    <div
      v-if="searchOpen"
      class="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-4 pt-[14vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search SPVE"
      @click.self="closeSearch"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-xl border border-white/14 bg-[#0c1822] shadow-2xl"
      >
        <div class="flex items-center gap-3 border-b border-white/10 px-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            class="text-mist"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.4" />
            <path
              d="m11.8 11.8 3.2 3.2"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            class="h-14 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-mist/55"
            placeholder="Search the SPVE site"
          />
          <button
            type="button"
            class="rounded border border-white/10 px-2 py-1 font-mono text-[0.62rem] text-mist"
            @click="closeSearch"
          >
            ESC
          </button>
        </div>
        <div class="p-2">
          <a
            v-for="link in filteredLinks"
            :key="link.href"
            :href="link.href"
            class="group flex items-center justify-between rounded-lg px-3 py-3 hover:bg-white/[0.055]"
            @click="closeSearch"
          >
            <span>
              <span class="block text-sm font-semibold text-white">{{ link.label }}</span>
              <span class="mt-0.5 block text-xs text-mist">{{ link.description }}</span>
            </span>
            <span class="text-mist transition-colors group-hover:text-sp-cyan">→</span>
          </a>
          <p v-if="filteredLinks.length === 0" class="px-3 py-8 text-center text-sm text-mist">
            No results found.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

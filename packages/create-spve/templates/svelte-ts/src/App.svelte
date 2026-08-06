<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { AppProps } from 'spve'

  let { properties }: { properties: Readable<AppProps> } = $props()
  const title = __TITLE_JS__
</script>

<main class="spve-app">
  <h1>{title}</h1>
  {#if $properties.description}
    <p>{$properties.description}</p>
  {/if}
</main>

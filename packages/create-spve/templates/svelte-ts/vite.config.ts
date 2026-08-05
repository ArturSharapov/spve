import { svelte } from '@sveltejs/vite-plugin-svelte'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [svelte()]),
    run: {
      tasks: {
        typecheck: {
          command: 'svelte-check --tsconfig ./tsconfig.json && tsc -b tsconfig.node.json',
          cache: false,
        },
      },
    },
  }),
)

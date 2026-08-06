import preact from '@preact/preset-vite'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [preact()]),
    run: {
      tasks: {
        typecheck: {
          command: 'tsc -b tsconfig.json tsconfig.node.json',
          cache: false,
        },
      },
    },
  }),
)

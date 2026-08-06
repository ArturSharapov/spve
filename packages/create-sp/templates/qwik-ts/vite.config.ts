import { qwikVite } from '@builder.io/qwik/optimizer'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [qwikVite({ csr: true })]),
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

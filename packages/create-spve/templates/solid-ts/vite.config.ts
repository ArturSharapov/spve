import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'
import solid from 'vite-plugin-solid'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [solid()]),
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

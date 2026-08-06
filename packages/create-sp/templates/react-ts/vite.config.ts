import react from '@vitejs/plugin-react'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [react()]),
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

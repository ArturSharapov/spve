import { spve } from 'spve/vite'
import { defineConfig, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
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

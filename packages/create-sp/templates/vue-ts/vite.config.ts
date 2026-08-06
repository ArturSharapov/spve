import vue from '@vitejs/plugin-vue'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [vue()]),
    run: {
      tasks: {
        typecheck: {
          command: 'vue-tsc -b tsconfig.json tsconfig.node.json',
          cache: false,
        },
      },
    },
  }),
)

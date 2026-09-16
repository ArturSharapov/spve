import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type PluginOption } from 'vite-core'

export default defineConfig({
  // The workspace aliases its internal `vite` package to Vite+, while this public site runs the
  // latest upstream Vite under `vite-core`. Normalize the structurally compatible plugin types at
  // this boundary so the website remains isolated from the workspace-level alias.
  plugins: [vue(), tailwindcss()] as unknown as PluginOption[],
})

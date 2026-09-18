import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    htmlWhitespaceSensitivity: 'ignore',
    semi: false,
    singleQuote: true,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: [
      'apps/playground/.spve/**',
      'packages/create-sp/templates/**',
      'packages/spve/template/**',
    ],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
})

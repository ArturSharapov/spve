import { defineConfig } from 'vite-plus'

export default defineConfig({
  create: {
    templates: [
      {
        name: 'spve',
        description: 'Create a framework-agnostic SharePoint application',
        template: 'create-spve',
      },
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: [
      'apps/playground/.spve/**',
      'packages/create-spve/templates/**',
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

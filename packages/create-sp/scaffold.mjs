import { cpSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const templatesRoot = fileURLToPath(new URL('./templates', import.meta.url))

export const DEFAULT_SPVE_SPECIFIER = 'npm:@spve/core@^0.0.7'

function frameworkDependencies(template) {
  if (template === 'vue-ts') {
    return {
      dependencies: { vue: '^3.5.41' },
      devDependencies: {
        '@vitejs/plugin-vue': '^6.0.8',
        '@vue/tsconfig': '^0.9.1',
        'vue-tsc': '^3.3.9',
      },
    }
  }
  if (template === 'react-ts') {
    return {
      dependencies: { react: '^19.2.8', 'react-dom': '^19.2.8' },
      devDependencies: {
        '@types/react': '^19.2.18',
        '@types/react-dom': '^19.2.4',
        '@vitejs/plugin-react': '^6.0.5',
      },
    }
  }
  if (template === 'preact-ts') {
    return {
      dependencies: { preact: '^10.29.7' },
      devDependencies: { '@preact/preset-vite': '^2.10.6' },
    }
  }
  if (template === 'lit-ts') return { dependencies: { lit: '^3.3.3' }, devDependencies: {} }
  if (template === 'svelte-ts') {
    return {
      dependencies: { svelte: '^5.56.8' },
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '^7.2.0',
        '@tsconfig/svelte': '^5.0.8',
        'svelte-check': '^4.7.3',
      },
    }
  }
  if (template === 'solid-ts') {
    return {
      dependencies: { 'solid-js': '^1.9.14' },
      devDependencies: { 'vite-plugin-solid': '^2.11.13' },
    }
  }
  if (template === 'qwik-ts') {
    return { dependencies: { '@builder.io/qwik': '^1.20.0' }, devDependencies: {} }
  }
  return { dependencies: {}, devDependencies: {} }
}

function sortKeys(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  )
}

export function createTemplatePackageJson(options) {
  const framework = frameworkDependencies(options.template)
  return {
    name: options.packageName,
    version: options.packageVersion ?? '0.0.1',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vp dev',
      build: 'vp build',
      check: 'vp check',
      postinstall: 'spve prepare',
    },
    dependencies: sortKeys({
      '@azure/msal-browser': '^2.38.2',
      '@pnp/sp': '^3.26.0',
      spve: options.spve ?? DEFAULT_SPVE_SPECIFIER,
      ...framework.dependencies,
    }),
    devDependencies: sortKeys({
      '@microsoft/sp-http': '1.22.0',
      '@microsoft/sp-webpart-base': '1.22.0',
      '@types/node': '^24.13.3',
      typescript: '~6.0.2',
      vite: 'npm:@voidzero-dev/vite-plus-core@0.2.8',
      'vite-plus': '^0.2.8',
      ...framework.devDependencies,
    }),
    overrides: { vite: 'npm:@voidzero-dev/vite-plus-core@0.2.8' },
    devEngines: {
      packageManager: { name: 'pnpm', version: '11.20.0', onFail: 'download' },
      runtime: { name: 'node', version: '24', onFail: 'download' },
    },
    engines: { node: '>=24 <25' },
  }
}

function renameScaffoldFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const source = path.join(directory, entry)
    const targetName = entry.startsWith('_') ? `.${entry.slice(1)}` : entry
    const target = path.join(directory, targetName)
    if (target !== source) renameSync(source, target)
    if (statSync(target).isDirectory()) renameScaffoldFiles(target)
  }
}

function replaceTokens(directory, tokens) {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    if (statSync(file).isDirectory()) {
      replaceTokens(file, tokens)
      continue
    }

    let contents = readFileSync(file, 'utf8')
    for (const [token, value] of Object.entries(tokens)) {
      contents = contents.replaceAll(`__${token}__`, value)
    }
    writeFileSync(file, contents)
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function quoteJavaScript(value) {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
  return `\`${escaped}\``
}

export function copyTemplateScaffold(directory, options) {
  cpSync(path.join(templatesRoot, 'base'), directory, { recursive: true })
  cpSync(path.join(templatesRoot, options.template), directory, { recursive: true })
  renameScaffoldFiles(directory)
  replaceTokens(directory, {
    PACKAGE_NAME: options.packageName,
    TITLE: options.title,
    TITLE_HTML: escapeHtml(options.title),
    TITLE_JS: quoteJavaScript(options.title),
    DESCRIPTION: options.description,
  })
}

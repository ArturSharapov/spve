import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'vite-plus/test'

const generator = fileURLToPath(new URL('../bin/index.mjs', import.meta.url))
const projectModule = new URL('../../spve/project.mjs', import.meta.url).href
const frameworks = {
  vanilla: 'src/main.ts',
  vue: 'src/App.vue',
  react: 'src/App.tsx',
  preact: 'src/App.tsx',
  lit: 'src/App.ts',
  svelte: 'src/App.svelte',
  solid: 'src/App.tsx',
  qwik: 'src/App.tsx',
}

test('generates every bundled framework starter', () => {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'create-sp-'))

  try {
    for (const [framework, entry] of Object.entries(frameworks)) {
      const target = path.join(temporaryRoot, framework)
      const withEntra = framework === 'vanilla'
      const result = spawnSync(
        process.execPath,
        [
          generator,
          target,
          '--no-interactive',
          '--template',
          `${framework}-ts`,
          '--title',
          `${framework} test`,
          '--slug',
          `${framework}-test`,
          '--description',
          `${framework}'s generator test`,
          '--site-url',
          'https://contoso.sharepoint.com/sites/example',
          ...(withEntra ? ['--tenant-id', 'tenant-id', '--client-id', 'client-id'] : []),
          '--no-install',
        ],
        { encoding: 'utf8' },
      )

      assert.equal(result.status, 0, result.stderr || result.stdout)
      assert.equal(
        JSON.parse(readFileSync(path.join(target, 'package.json'))).dependencies.spve,
        'npm:@spve/core@^0.0.4',
      )
      const packageJson = JSON.parse(readFileSync(path.join(target, 'package.json')))
      assert.equal(packageJson.scripts.postinstall, 'spve prepare')
      assert.equal(packageJson.devEngines.packageManager.name, 'pnpm')
      assert.equal(packageJson.devEngines.runtime.version, '24')
      assert.equal(packageJson.devEngines.runtime.onFail, 'download')
      assert.doesNotThrow(() => readFileSync(path.join(target, entry)))
      if (framework === 'vue') {
        assert.match(readFileSync(path.join(target, 'src/App.vue'), 'utf8'), /from 'spve\/vue'/)
      }
      const loadedConfig = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          `import { loadSpveConfig } from ${JSON.stringify(projectModule)}; console.log(JSON.stringify(await loadSpveConfig(process.cwd())))`,
        ],
        { cwd: target, encoding: 'utf8' },
      )
      assert.equal(loadedConfig.status, 0, loadedConfig.stderr || loadedConfig.stdout)
      const spveConfig = JSON.parse(loadedConfig.stdout)
      assert.equal(spveConfig.webpart.properties.description.type, 'string')
      assert.equal(spveConfig.description, `${framework}'s generator test`)
      const configSource = readFileSync(path.join(target, 'spve.config.ts'), 'utf8')
      assert.match(configSource, /from 'spve'/)
      assert.doesNotMatch(configSource, /from 'spve\//)
      assert.match(configSource, /description: ".+"/)
      assert.ok(configSource.indexOf('\n  ids:') < configSource.indexOf('\n  dev:'))
      assert.ok(configSource.indexOf('\n  dev:') < configSource.indexOf('\n  webpart:'))
      assert.equal(spveConfig.dev.siteUrl, 'https://contoso.sharepoint.com/sites/example')
      assert.equal(existsSync(path.join(target, '.env.example')), false)
      assert.equal(existsSync(path.join(target, '.env.local')), withEntra)
      if (withEntra) {
        assert.equal(
          readFileSync(path.join(target, '.env.local'), 'utf8'),
          'VITE_AAD_CLIENT_ID=client-id\nVITE_AAD_TENANT_ID=tenant-id\n',
        )
      }
      assert.equal(existsSync(path.join(target, 'spve.config.json')), false)
      assert.match(
        readFileSync(path.join(target, '.spve/types.d.ts'), 'utf8'),
        /interface SpveAppProps/,
      )
      assert.equal(existsSync(path.join(target, 'tsconfig.json')), true)
      assert.equal(existsSync(path.join(target, 'tsconfig.node.json')), true)
      assert.equal(existsSync(path.join(target, 'tsconfig.app.json')), false)
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
})

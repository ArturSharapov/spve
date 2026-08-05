import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'vite-plus/test'

const generator = fileURLToPath(new URL('../bin/index.mjs', import.meta.url))
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
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'create-spve-'))

  try {
    for (const [framework, entry] of Object.entries(frameworks)) {
      const target = path.join(temporaryRoot, framework)
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
          `${framework} generator test`,
          '--site-url',
          'https://contoso.sharepoint.com/sites/example',
          '--spve',
          'workspace:*',
          '--no-install',
        ],
        { encoding: 'utf8' },
      )

      assert.equal(result.status, 0, result.stderr || result.stdout)
      assert.equal(
        JSON.parse(readFileSync(path.join(target, 'package.json'))).dependencies.spve,
        'workspace:*',
      )
      assert.doesNotThrow(() => readFileSync(path.join(target, entry)))
      assert.doesNotThrow(() => readFileSync(path.join(target, 'spve.config.json')))
      assert.equal(existsSync(path.join(target, 'tsconfig.json')), true)
      assert.equal(existsSync(path.join(target, 'tsconfig.node.json')), true)
      assert.equal(existsSync(path.join(target, 'tsconfig.app.json')), false)
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
})

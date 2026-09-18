import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vite-plus/test'

const script = new URL('./prepare-npm-release.mjs', import.meta.url).href

test.each([
  { name: 'registry ahead', current: '0.0.7', published: ['0.0.9'], next: '0.0.10' },
  { name: 'manifest ahead', current: '0.0.12', published: ['0.0.9'], next: '0.0.13' },
  {
    name: 'all stable patches, not just latest',
    current: '0.0.7',
    published: ['0.0.20', '0.0.8', '0.0.50-beta.1', '0.1.0'],
    next: '0.0.21',
  },
  { name: 'bump selected manifest', current: '0.0.7', published: ['0.0.7'], requested: '0.0.8' },
  {
    name: 'reject stale version',
    current: '0.0.7',
    published: ['0.0.8'],
    requested: '0.0.8',
    error: true,
  },
  {
    name: 'reject minor bump',
    current: '0.0.7',
    published: ['0.0.7'],
    requested: '0.1.0',
    error: true,
  },
  {
    name: 'reject blank version',
    current: '0.0.7',
    published: ['0.0.7'],
    requested: '',
    error: true,
  },
  { name: 'reject non-patch manifest', current: '0.1.0', published: ['0.0.7'], error: true },
  { name: 'registry failure', current: '0.0.7', published: [], status: 503, error: true },
  {
    name: 'unknown package',
    current: '0.0.7',
    published: [],
    packageName: '../other',
    error: true,
  },
  {
    name: 'generator package',
    current: '0.0.8',
    published: ['0.0.8'],
    packageName: 'create-sp',
    directory: 'create-sp',
    requested: '0.0.9',
  },
  {
    name: 'migration package',
    current: '0.0.2',
    published: ['0.0.2'],
    packageName: 'migrate-sp',
    directory: 'migrate',
    requested: '0.0.3',
  },
])('$name', (scenario) => {
  const root = mkdtempSync(path.join(tmpdir(), 'spve-release-'))
  try {
    const packageName = scenario.packageName ?? '@spve/core'
    const directory = `packages/${scenario.directory ?? 'spve'}`
    mkdirSync(path.join(root, directory), { recursive: true })
    const manifestPath = path.join(root, directory, 'package.json')
    const original = {
      name: packageName,
      version: scenario.current,
      description: 'Preserved metadata',
    }
    writeFileSync(manifestPath, JSON.stringify(original))
    const output = path.join(root, 'output')
    const summary = path.join(root, 'summary')
    const env = {
      ...process.env,
      PACKAGE: packageName,
      GITHUB_OUTPUT: output,
      GITHUB_STEP_SUMMARY: summary,
    }
    delete env.VERSION
    if (Object.hasOwn(scenario, 'requested')) env.VERSION = scenario.requested
    const registry = {
      name: packageName,
      versions: Object.fromEntries(scenario.published.map((version) => [version, {}])),
    }
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
      globalThis.fetch = async (url) => {
        if (url !== ${JSON.stringify(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)}) throw new Error('Unexpected registry URL')
        return new Response(${JSON.stringify(JSON.stringify(registry))}, { status: ${scenario.status ?? 200} })
      }
      await import(${JSON.stringify(script)})
    `,
      ],
      { cwd: root, env, encoding: 'utf8' },
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    if (scenario.error) {
      expect(result.status).not.toBe(0)
      expect(manifest).toEqual(original)
    } else {
      expect(result.status, result.stderr).toBe(0)
      const version = scenario.requested ?? scenario.next
      expect(manifest).toEqual({ ...original, version: scenario.requested ?? scenario.current })
      expect(readFileSync(output, 'utf8')).toBe(`directory=${directory}\nversion=${version}\n`)
      expect(readFileSync(summary, 'utf8')).toBe(`## ${packageName}@${version}\n`)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'

const script = new URL('./plan-npm-publish.mjs', import.meta.url).href
const packages = [
  { name: '@spve/core', directory: 'packages/spve', version: '0.0.7' },
  { name: 'create-sp', directory: 'packages/create-sp', version: '0.0.8' },
  { name: 'migrate-sp', directory: 'packages/migrate', version: '0.0.2' },
]
let root
let registry

function commit() {
  execFileSync('git', ['add', 'packages', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'], { cwd: root })
  execFileSync(
    'git',
    [
      '-c',
      'commit.gpgsign=false',
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '-qm',
      'Package fixture',
    ],
    { cwd: root },
  )
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
}

function runPlan({ apply = false, expected, failedPackage } = {}) {
  const output = path.join(root, 'output')
  const summary = path.join(root, 'summary')
  writeFileSync(output, '')
  writeFileSync(summary, '')
  const env = { ...process.env, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary }
  delete env.EXPECTED_RELEASES
  if (expected) env.EXPECTED_RELEASES = JSON.stringify(expected)
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
    const registry = ${JSON.stringify(registry)}
    globalThis.fetch = async (url) => {
      const name = decodeURIComponent(new URL(url).pathname.slice(1))
      if (name === ${JSON.stringify(failedPackage ?? '')}) return new Response('', { status: 503 })
      if (!Object.hasOwn(registry, name)) throw new Error('Unexpected package')
      return Response.json(registry[name])
    }
    ${apply ? "process.argv.push('--apply')" : ''}
    await import(${JSON.stringify(script)})
  `,
    ],
    { cwd: root, env, encoding: 'utf8' },
  )
  const outputs = Object.fromEntries(
    readFileSync(output, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator), line.slice(separator + 1)]
      }),
  )
  return { ...result, outputs, summary: readFileSync(summary, 'utf8') }
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'spve-publish-'))
  execFileSync('git', ['init', '-q'], { cwd: root })
  for (const { name, directory, version } of packages) {
    mkdirSync(path.join(root, directory), { recursive: true })
    writeFileSync(
      path.join(root, directory, 'package.json'),
      `${JSON.stringify({ name, version, ...(name === 'migrate-sp' ? { dependencies: { 'create-sp': '^0.0.8' } } : {}) }, null, 2)}\n`,
    )
    writeFileSync(path.join(root, directory, 'index.mjs'), 'export const value = 1\n')
  }
  writeFileSync(
    path.join(root, 'packages/create-sp/scaffold.mjs'),
    "export const DEFAULT_SPVE_SPECIFIER = 'npm:@spve/core@^0.0.7'\n",
  )
  writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'catalog:\n  create-sp: ^0.0.8\n')
  writeFileSync(
    path.join(root, 'pnpm-lock.yaml'),
    'importers:\n  packages/migrate:\n    dependencies:\n      create-sp:\n        specifier: ^0.0.8\n        version: link:../create-sp\n',
  )
  const gitHead = commit()
  registry = Object.fromEntries(
    packages.map(({ name, version }) => [name, { name, versions: { [version]: { gitHead } } }]),
  )
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

test('no package changes produce no release or manifest mutation', () => {
  const result = runPlan({ apply: true })
  expect(result.status, result.stderr).toBe(0)
  expect(result.outputs.releases).toBe('[]')
  expect(result.summary).toContain('No packages changed')
  expect(execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' })).toBe('')
})

test('bumps changed packages and synchronizes their dependents and lockfile', () => {
  writeFileSync(path.join(root, 'packages/create-sp/index.mjs'), 'export const value = 2\n')
  const plan = runPlan()
  const releases = [
    { name: 'create-sp', directory: 'packages/create-sp', version: '0.0.9' },
    { name: 'migrate-sp', directory: 'packages/migrate', version: '0.0.3' },
  ]
  expect(plan.status, plan.stderr).toBe(0)
  expect(JSON.parse(plan.outputs.releases)).toEqual(releases)
  expect(plan.outputs.label).toBe('create-sp@0.0.9, migrate-sp@0.0.3')
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/create-sp/package.json'), 'utf8')).version,
  ).toBe('0.0.8')
  const applied = runPlan({ apply: true, expected: releases })
  expect(applied.status, applied.stderr).toBe(0)
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/create-sp/package.json'), 'utf8')).version,
  ).toBe('0.0.9')
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/spve/package.json'), 'utf8')).version,
  ).toBe('0.0.7')
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/migrate/package.json'), 'utf8')).dependencies[
      'create-sp'
    ],
  ).toBe('^0.0.9')
  expect(readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8')).toContain('specifier: ^0.0.9')
  expect(readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8')).toContain(
    'create-sp: ^0.0.9',
  )
  expect(JSON.parse(applied.outputs.files)).toContain('pnpm-lock.yaml')
})

test('ignores root changes and version-only package changes', () => {
  writeFileSync(path.join(root, 'README.md'), 'Changed documentation\n')
  writeFileSync(
    path.join(root, 'packages/spve/package.json'),
    JSON.stringify({ name: '@spve/core', version: '0.0.8' }),
  )
  const result = runPlan()
  expect(result.status, result.stderr).toBe(0)
  expect(result.outputs.releases).toBe('[]')
})

test('a core-only change propagates through generator defaults and migration dependencies', () => {
  writeFileSync(path.join(root, 'packages/spve/index.mjs'), 'export const value = 2\n')
  const result = runPlan({ apply: true })
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.outputs.releases).map(({ name }) => name)).toEqual([
    '@spve/core',
    'create-sp',
    'migrate-sp',
  ])
  expect(readFileSync(path.join(root, 'packages/create-sp/scaffold.mjs'), 'utf8')).toContain(
    'npm:@spve/core@^0.0.8',
  )
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/migrate/package.json'), 'utf8')).dependencies[
      'create-sp'
    ],
  ).toBe('^0.0.9')
  expect(readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8')).toContain('specifier: ^0.0.9')
  expect(JSON.parse(result.outputs.files)).toContain('packages/create-sp/scaffold.mjs')
})

test('a migration-only change does not release its unchanged dependencies', () => {
  writeFileSync(path.join(root, 'packages/migrate/index.mjs'), 'export const value = 2\n')
  const result = runPlan({ apply: true })
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.outputs.releases)).toEqual([
    { name: 'migrate-sp', directory: 'packages/migrate', version: '0.0.3' },
  ])
  expect(JSON.parse(result.outputs.files)).toEqual(['packages/migrate/package.json'])
})

test('detects package metadata edits and deleted files', () => {
  writeFileSync(
    path.join(root, 'packages/spve/package.json'),
    JSON.stringify({ name: '@spve/core', version: '0.0.7', description: 'New metadata' }),
  )
  rmSync(path.join(root, 'packages/migrate/index.mjs'))
  const result = runPlan()
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.outputs.releases).map(({ name }) => name)).toEqual([
    '@spve/core',
    'create-sp',
    'migrate-sp',
  ])
})

test('uses the highest published patch even when latest points to an older release', () => {
  const gitHead = registry['@spve/core'].versions['0.0.7'].gitHead
  registry['@spve/core'].versions['0.0.20'] = { gitHead }
  registry['@spve/core'].versions['0.0.50-beta.1'] = { gitHead }
  registry['@spve/core']['dist-tags'] = { latest: '0.0.7' }
  writeFileSync(path.join(root, 'packages/spve/index.mjs'), 'export const value = 2\n')
  const result = runPlan()
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.outputs.releases)[0].version).toBe('0.0.21')
})

test('resumes a partial publication without republishing successes or bumping pending versions twice', () => {
  for (const { directory } of packages)
    writeFileSync(path.join(root, directory, 'index.mjs'), 'export const value = 2\n')
  const first = runPlan({ apply: true })
  expect(first.status, first.stderr).toBe(0)
  const releases = JSON.parse(first.outputs.releases)
  expect(releases.map(({ name }) => name)).toEqual(['@spve/core', 'create-sp', 'migrate-sp'])
  expect(releases.map(({ version }) => version)).toEqual(['0.0.8', '0.0.9', '0.0.3'])
  const gitHead = commit()
  registry['@spve/core'].versions['0.0.8'] = { gitHead }
  const retry = runPlan({ apply: true })
  expect(retry.status, retry.stderr).toBe(0)
  expect(JSON.parse(retry.outputs.releases)).toEqual(releases.slice(1))
  expect(execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' })).toBe('')
  for (const { name, version } of releases) registry[name].versions[version] = { gitHead }
  const complete = runPlan()
  expect(complete.status, complete.stderr).toBe(0)
  expect(complete.outputs.releases).toBe('[]')
})

test('a registry failure prevents all manifest mutations', () => {
  writeFileSync(path.join(root, 'packages/spve/index.mjs'), 'export const value = 2\n')
  const result = runPlan({ apply: true, failedPackage: 'migrate-sp' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('npm registry returned 503')
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/spve/package.json'), 'utf8')).version,
  ).toBe('0.0.7')
})

test('rejects a stale expected plan before changing files', () => {
  writeFileSync(path.join(root, 'packages/spve/index.mjs'), 'export const value = 2\n')
  const result = runPlan({ apply: true, expected: [] })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Publish plan changed')
  expect(
    JSON.parse(readFileSync(path.join(root, 'packages/spve/package.json'), 'utf8')).version,
  ).toBe('0.0.7')
})

test('rejects versions outside 0.0.x', () => {
  writeFileSync(
    path.join(root, 'packages/spve/package.json'),
    JSON.stringify({ name: '@spve/core', version: '0.1.0' }),
  )
  const result = runPlan({ apply: true })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('must stay in 0.0.x')
})

test('missing publication provenance fails rather than publishing every package', () => {
  delete registry['@spve/core'].versions['0.0.7'].gitHead
  const result = runPlan()
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('missing published gitHead')
})

test('handles a package added after the recorded npm source commit', () => {
  const directory = path.join(root, 'packages/migrate')
  const manifest = readFileSync(path.join(directory, 'package.json'))
  const source = readFileSync(path.join(directory, 'index.mjs'))
  rmSync(directory, { recursive: true, force: true })
  registry['migrate-sp'].versions['0.0.2'].gitHead = commit()
  mkdirSync(directory)
  writeFileSync(path.join(directory, 'package.json'), manifest)
  writeFileSync(path.join(directory, 'index.mjs'), source)
  commit()
  const result = runPlan()
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.outputs.releases)).toEqual([
    { name: 'migrate-sp', directory: 'packages/migrate', version: '0.0.3' },
  ])
})

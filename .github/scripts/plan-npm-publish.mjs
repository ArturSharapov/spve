import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'

const packages = [
  { name: '@spve/core', directory: 'packages/spve' },
  { name: 'create-sp', directory: 'packages/create-sp' },
  { name: 'migrate-sp', directory: 'packages/migrate' },
]
const releases = []

for (const { name, directory } of packages) {
  const manifestPath = `${directory}/package.json`
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.name, name)
  assert.match(manifest.version, /^0\.0\.(0|[1-9]\d*)$/, `${name} must stay in 0.0.x`)

  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
    signal: AbortSignal.timeout(30_000),
  })
  assert.ok(response.ok, `${name}: npm registry returned ${response.status}`)
  const registry = await response.json()
  assert.equal(registry.name, name, 'Unexpected registry package')
  assert.ok(registry.versions && typeof registry.versions === 'object', 'Missing registry versions')
  const versions = Object.keys(registry.versions)
    .filter((version) => /^0\.0\.(0|[1-9]\d*)$/.test(version))
    .sort((left, right) => (BigInt(left.split('.')[2]) < BigInt(right.split('.')[2]) ? -1 : 1))
  assert.ok(versions.length, `${name}: no published 0.0.x baseline`)
  const latest = versions.at(-1)
  const published = registry.versions[latest]
  assert.match(published.gitHead ?? '', /^[a-f0-9]{40}$/, `${name}: missing published gitHead`)
  execFileSync('git', ['cat-file', '-e', `${published.gitHead}^{commit}`])
  const baselinePath = execFileSync(
    'git',
    ['ls-tree', '--name-only', published.gitHead, '--', manifestPath],
    { encoding: 'utf8' },
  ).trim()
  const baseline = baselinePath
    ? JSON.parse(
        execFileSync('git', ['show', `${published.gitHead}:${manifestPath}`], { encoding: 'utf8' }),
      )
    : {}
  baseline.version = manifest.version
  const diff = spawnSync('git', [
    'diff',
    '--quiet',
    published.gitHead,
    '--',
    directory,
    `:(exclude)${manifestPath}`,
  ])
  assert.ok(diff.status === 0 || diff.status === 1, `${name}: failed to compare published sources`)
  if (diff.status === 0 && isDeepStrictEqual(baseline, manifest)) continue

  const currentPatch = BigInt(manifest.version.split('.')[2])
  const publishedPatch = BigInt(latest.split('.')[2])
  const nextPatch = currentPatch > publishedPatch ? currentPatch : publishedPatch + 1n
  assert.ok(nextPatch <= BigInt(Number.MAX_SAFE_INTEGER), 'Patch version exceeds the semver limit')
  releases.push({ name, directory, version: `0.0.${nextPatch}` })
}

if (process.env.EXPECTED_RELEASES) {
  assert.deepEqual(releases, JSON.parse(process.env.EXPECTED_RELEASES), 'Publish plan changed')
}

if (process.argv.includes('--apply')) {
  for (const release of releases) {
    const manifestPath = `${release.directory}/package.json`
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest.version = release.version
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  }
}

const label = releases.map(({ name, version }) => `${name}@${version}`).join(', ')
appendFileSync(process.env.GITHUB_OUTPUT, `releases=${JSON.stringify(releases)}\nlabel=${label}\n`)
appendFileSync(
  process.env.GITHUB_STEP_SUMMARY,
  releases.length
    ? `## Packages to publish\n\n${releases.map(({ name, version }) => `- ${name}@${version}`).join('\n')}\n`
    : '## No packages changed since their last npm publication\n',
)

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
const changes = new Map()
const targetVersions = {}

for (const { name, directory } of packages) {
  const manifestPath = `${directory}/package.json`
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.name, name)
  assert.match(manifest.version, /^0\.0\.(0|[1-9]\d*)$/, `${name} must stay in 0.0.x`)
  let dependencyChanged = false
  if (name === 'create-sp') {
    const scaffoldPath = `${directory}/scaffold.mjs`
    const scaffold = readFileSync(scaffoldPath, 'utf8')
    const declaration = /export const DEFAULT_SPVE_SPECIFIER = 'npm:@spve\/core@\^0\.0\.\d+'/
    assert.match(scaffold, declaration, 'Missing generator core dependency')
    const updated = scaffold.replace(
      declaration,
      `export const DEFAULT_SPVE_SPECIFIER = 'npm:@spve/core@^${targetVersions['@spve/core']}'`,
    )
    if (updated !== scaffold) {
      changes.set(scaffoldPath, updated)
      dependencyChanged = true
    }
  }
  if (name === 'migrate-sp') {
    const dependency = `^${targetVersions['create-sp']}`
    dependencyChanged = manifest.dependencies['create-sp'] !== dependency
    manifest.dependencies['create-sp'] = dependency
  }

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
  if (diff.status === 0 && isDeepStrictEqual(baseline, manifest) && !dependencyChanged) {
    targetVersions[name] = latest
    continue
  }

  const currentPatch = BigInt(manifest.version.split('.')[2])
  const publishedPatch = BigInt(latest.split('.')[2])
  const nextPatch = currentPatch > publishedPatch ? currentPatch : publishedPatch + 1n
  assert.ok(nextPatch <= BigInt(Number.MAX_SAFE_INTEGER), 'Patch version exceeds the semver limit')
  const version = `0.0.${nextPatch}`
  releases.push({ name, directory, version })
  targetVersions[name] = version
  manifest.version = version
  const updated = `${JSON.stringify(manifest, null, 2)}\n`
  if (updated !== readFileSync(manifestPath, 'utf8')) changes.set(manifestPath, updated)
}

if (releases.length) {
  const workspacePath = 'pnpm-workspace.yaml'
  const workspace = readFileSync(workspacePath, 'utf8')
  assert.match(workspace, /^  create-sp: \^0\.0\.\d+$/m, 'Missing create-sp catalog entry')
  const updatedWorkspace = workspace.replace(
    /^  create-sp: \^0\.0\.\d+$/m,
    `  create-sp: ^${targetVersions['create-sp']}`,
  )
  if (updatedWorkspace !== workspace) changes.set(workspacePath, updatedWorkspace)
  const lockPath = 'pnpm-lock.yaml'
  const lock = readFileSync(lockPath, 'utf8')
  const importer = lock.match(/^  packages\/migrate:\n(?: {4}[^\n]*\n|\n)*/m)?.[0]
  assert.ok(importer, 'Missing migration lock importer')
  const dependency = /(      create-sp:\n        specifier: )[^\n]+(\n        version: )[^\n]+/
  assert.match(importer, dependency, 'Missing migration dependency lock entry')
  const updatedImporter = importer.replace(
    dependency,
    (_match, prefix, separator) =>
      `${prefix}^${targetVersions['create-sp']}${separator}link:../create-sp`,
  )
  const updatedLock = lock.replace(importer, updatedImporter)
  if (updatedLock !== lock) changes.set(lockPath, updatedLock)
}

if (process.env.EXPECTED_RELEASES) {
  assert.deepEqual(releases, JSON.parse(process.env.EXPECTED_RELEASES), 'Publish plan changed')
}

if (process.argv.includes('--apply')) {
  for (const [file, contents] of changes) writeFileSync(file, contents)
}

const label = releases.map(({ name, version }) => `${name}@${version}`).join(', ')
appendFileSync(
  process.env.GITHUB_OUTPUT,
  `releases=${JSON.stringify(releases)}\nlabel=${label}\nfiles=${JSON.stringify([...changes.keys()])}\n`,
)
appendFileSync(
  process.env.GITHUB_STEP_SUMMARY,
  releases.length
    ? `## Packages to publish\n\n${releases.map(({ name, version }) => `- ${name}@${version}`).join('\n')}\n`
    : '## No packages changed since their last npm publication\n',
)

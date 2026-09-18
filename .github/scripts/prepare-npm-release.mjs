import assert from 'node:assert/strict'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'

const directories = { '@spve/core': 'spve', 'create-sp': 'create-sp', 'migrate-sp': 'migrate' }
const packageName = process.env.PACKAGE
assert.ok(Object.hasOwn(directories, packageName), 'Unknown package')
const directory = `packages/${directories[packageName]}`
const manifestPath = `${directory}/package.json`
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
assert.equal(manifest.name, packageName)
assert.match(manifest.version, /^0\.0\.(0|[1-9]\d*)$/, 'Package version must stay in 0.0.x')

const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
  signal: AbortSignal.timeout(30_000),
})
assert.ok(response.ok, `npm registry returned ${response.status}`)
const published = await response.json()
assert.equal(published.name, packageName, 'Unexpected registry package')
assert.ok(published.versions && typeof published.versions === 'object', 'Missing registry versions')
let patch = BigInt(manifest.version.split('.')[2])
for (const version of Object.keys(published.versions)) {
  if (!/^0\.0\.(0|[1-9]\d*)$/.test(version)) continue
  const publishedPatch = BigInt(version.split('.')[2])
  if (publishedPatch > patch) patch = publishedPatch
}
patch += 1n
assert.ok(patch <= BigInt(Number.MAX_SAFE_INTEGER), 'Patch version exceeds the semver limit')
const version = `0.0.${patch}`

if (Object.hasOwn(process.env, 'VERSION')) {
  assert.equal(process.env.VERSION, version, 'Release version is stale or invalid')
  manifest.version = version
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

appendFileSync(process.env.GITHUB_OUTPUT, `directory=${directory}\nversion=${version}\n`)
appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## ${packageName}@${version}\n`)

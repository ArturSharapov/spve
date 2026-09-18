import assert from 'node:assert/strict'

assert.ok(
  process.env.ACTIONS_ID_TOKEN_REQUEST_URL && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
  'GitHub OIDC is unavailable',
)
const url = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL)
url.searchParams.set('audience', 'npm:registry.npmjs.org')
const identityResponse = await fetch(url, {
  headers: { Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
  signal: AbortSignal.timeout(30_000),
})
assert.ok(identityResponse.ok, `GitHub OIDC request failed: HTTP ${identityResponse.status}`)
const identity = await identityResponse.json()
assert.ok(typeof identity.value === 'string' && identity.value, 'GitHub OIDC response has no token')
for (const { name } of JSON.parse(process.env.RELEASES)) {
  const response = await fetch(
    `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${name.replace('/', '%2f')}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${identity.value}` },
      signal: AbortSignal.timeout(30_000),
    },
  )
  assert.ok(
    response.ok,
    `npm rejected trusted publishing for ${name}: HTTP ${response.status}. Publisher identity: ${process.env.GITHUB_REPOSITORY}, publish.yml, environment npm`,
  )
  const exchanged = await response.json()
  assert.ok(
    typeof exchanged.token === 'string' && exchanged.token,
    `npm returned no publishing token for ${name}`,
  )
  console.log(`Verified npm trusted publishing for ${name}`)
}

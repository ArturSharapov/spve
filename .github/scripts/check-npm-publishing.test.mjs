import { spawnSync } from 'node:child_process'
import { expect, test } from 'vite-plus/test'

const script = new URL('./check-npm-publishing.mjs', import.meta.url).href

test.each([
  { name: 'all packages authenticate', identityStatus: 200, exchangeStatus: 201, success: true },
  { name: 'GitHub refuses OIDC', identityStatus: 403, exchangeStatus: 201, success: false },
  {
    name: 'one npm publisher is not configured',
    identityStatus: 200,
    exchangeStatus: 404,
    success: false,
  },
  {
    name: 'npm returns no token',
    identityStatus: 200,
    exchangeStatus: 201,
    missingToken: true,
    success: false,
  },
])('$name', (scenario) => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
    const visited = []
    globalThis.fetch = async (input, options) => {
      const url = new URL(input)
      if (url.hostname === 'oidc.example') {
        if (url.searchParams.get('audience') !== 'npm:registry.npmjs.org') throw new Error('Wrong audience')
        if (options.headers.Authorization !== 'Bearer request-secret') throw new Error('Wrong request authorization')
        return Response.json({ value: 'identity-secret' }, { status: ${scenario.identityStatus} })
      }
      if (options.method !== 'POST' || options.headers.Authorization !== 'Bearer identity-secret') throw new Error('Wrong exchange authorization')
      visited.push(decodeURIComponent(url.pathname.split('/package/')[1]))
      const status = visited.length === 2 ? ${scenario.exchangeStatus} : 201
      return Response.json(${scenario.missingToken ? '{}' : "{ token: 'npm-secret' }"}, { status })
    }
    await import(${JSON.stringify(script)})
    if (JSON.stringify(visited) !== JSON.stringify(['@spve/core', 'create-sp', 'migrate-sp'])) throw new Error('Missing package preflight')
  `,
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        ACTIONS_ID_TOKEN_REQUEST_URL: 'https://oidc.example/token',
        ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'request-secret',
        GITHUB_REPOSITORY: 'ArturSharapov/spve',
        RELEASES: JSON.stringify(
          ['@spve/core', 'create-sp', 'migrate-sp'].map((name) => ({ name })),
        ),
      },
    },
  )
  expect(result.status === 0, result.stderr).toBe(scenario.success)
  for (const secret of ['request-secret', 'identity-secret', 'npm-secret']) {
    expect(result.stdout + result.stderr).not.toContain(secret)
  }
  if (scenario.exchangeStatus === 404)
    expect(result.stderr).toContain('npm rejected trusted publishing for create-sp: HTTP 404')
})

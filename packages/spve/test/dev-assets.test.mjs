import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, copyFileSync, rmSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createServer, resolveConfig } from 'vite-plus'
import { expect, test, vi } from 'vite-plus/test'
import { spve } from '../vite.mjs'

vi.mock('../spfx.mjs', async (importOriginal) => ({
  ...(await importOriginal()),
  ensureDevCertificate: vi.fn(async () => undefined),
}))

const require = createRequire(import.meta.url)

test.each([
  { mode: 'sp', origin: undefined, expected: 'https://localhost:18742/__spve/src/hero.png' },
  {
    mode: 'sp',
    origin: 'https://assets.example.test',
    expected: 'https://assets.example.test/__spve/src/hero.png',
  },
  { mode: 'sp', origin: '', expected: '/__spve/src/hero.png' },
  { mode: 'development', origin: undefined, expected: '/src/hero.png' },
  {
    mode: 'development',
    origin: 'https://assets.example.test',
    expected: 'https://assets.example.test/src/hero.png',
  },
])('serves dev assets in $mode with origin $origin', async ({ mode, origin, expected }) => {
  vi.stubEnv('VP_RESOLVING_CONFIG_METADATA', '')
  const root = mkdtempSync(path.join(tmpdir(), 'spve-assets-'))
  let vite
  let http
  try {
    mkdirSync(path.join(root, 'src'))
    mkdirSync(path.join(root, 'node_modules'))
    symlinkSync(
      path.dirname(require.resolve('vite-plus/package.json')),
      path.join(root, 'node_modules/vite-plus'),
    )
    writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')
    writeFileSync(path.join(root, 'src/main.js'), 'export default {}')
    copyFileSync(new URL('./fixtures/hero.png', import.meta.url), path.join(root, 'src/hero.png'))
    writeFileSync(path.join(root, 'src/style.css'), '.hero { background-image: url("./hero.png") }')
    writeFileSync(
      path.join(root, 'spve.config.ts'),
      `export default ${JSON.stringify({
        name: 'assets',
        title: 'Assets',
        version: '1.0.0',
        ids: { component: 'component', solution: 'solution', feature: 'feature' },
        dev: {
          siteUrl: 'https://example.sharepoint.com/sites/test',
          vitePort: 18741,
          spfxPort: 18742,
        },
        webpart: { alias: 'Assets', properties: {} },
      })}`,
    )
    const options = {
      ...spve(),
      root,
      mode,
      configFile: false,
      logLevel: 'silent',
      server: { middlewareMode: true, origin },
    }
    vite = await createServer(options)
    const asset = await vite.transformRequest('/src/hero.png?url')
    expect(asset.code.trim()).toBe(`export default ${JSON.stringify(expected)}`)
    const css = await vite.transformRequest('/src/style.css?direct')
    expect(css.code).toContain(expected)
    http = createHttpServer(vite.middlewares)
    await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve))
    const address = `http://127.0.0.1:${http.address().port}`
    const base = mode === 'sp' ? '/__spve/' : '/'
    for (const requestOrigin of [
      'https://example.sharepoint.com',
      'https://localhost:18741',
      'https://unrelated.example',
    ]) {
      const response = await fetch(`${address}${base}src/hero.png`, {
        headers: { Origin: requestOrigin },
      })
      expect(response.status).toBe(200)
      expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(4096)
      if (mode === 'sp') {
        expect(response.headers.get('access-control-allow-origin')).toBe(
          requestOrigin === 'https://unrelated.example' ? null : requestOrigin,
        )
        expect(response.headers.get('vary')).toContain('Origin')
      }
    }
    const production = await resolveConfig({ ...options, ...spve(), mode: 'sp' }, 'build')
    expect(production.server.origin).toBe(origin)
  } finally {
    if (http) {
      http.closeAllConnections()
      await new Promise((resolve) => http.close(resolve))
    }
    await vite?.close()
    vi.unstubAllEnvs()
    rmSync(root, { recursive: true, force: true })
  }
})

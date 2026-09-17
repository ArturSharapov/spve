import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { resolveConfig } from 'vite-plus'
import { expect, test, vi } from 'vite-plus/test'
import { spve } from '../vite.mjs'

const require = createRequire(import.meta.url)

test.each(['absent', 'present', 'broken'])(
  'resolves an optional React client: %s',
  async (react) => {
    vi.stubEnv('VP_RESOLVING_CONFIG_METADATA', '')
    const root = mkdtempSync(path.join(tmpdir(), 'spve-vite-'))
    try {
      mkdirSync(path.join(root, 'src'))
      mkdirSync(path.join(root, 'node_modules'))
      symlinkSync(
        path.dirname(require.resolve('vite-plus/package.json')),
        path.join(root, 'node_modules/vite-plus'),
      )
      writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')
      writeFileSync(path.join(root, 'src/main.ts'), 'export default {}')
      writeFileSync(
        path.join(root, 'spve.config.ts'),
        `export default ${JSON.stringify({
          name: 'test',
          title: 'Test',
          version: '1.0.0',
          ids: { component: 'component', solution: 'solution', feature: 'feature' },
          dev: { siteUrl: 'https://example.sharepoint.com', vitePort: 5173, spfxPort: 4321 },
          webpart: { alias: 'Test' },
        })}`,
      )
      if (react !== 'absent') {
        mkdirSync(path.join(root, 'node_modules/react-dom'))
        writeFileSync(
          path.join(root, 'node_modules/react-dom/package.json'),
          JSON.stringify({
            name: 'react-dom',
            exports:
              react === 'present' ? { './client': './client.cjs' } : { './other': './client.cjs' },
          }),
        )
        writeFileSync(
          path.join(root, 'node_modules/react-dom/client.cjs'),
          'exports.createRoot = () => {}',
        )
      }
      const defaults = spve()
      const options = {
        ...defaults,
        root,
        configFile: false,
        optimizeDeps: { ...defaults.optimizeDeps, include: ['consumer-dependency'] },
      }
      if (react === 'broken') {
        await expect(resolveConfig(options, 'serve')).rejects.toThrow(/client/)
      } else {
        const config = await resolveConfig(options, 'serve')
        expect(config.optimizeDeps.include).toContain('consumer-dependency')
        expect(config.optimizeDeps.include.includes('react-dom/client')).toBe(react === 'present')
      }
    } finally {
      vi.unstubAllEnvs()
      rmSync(root, { recursive: true, force: true })
    }
  },
)

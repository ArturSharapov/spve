import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { resolveConfig, build } from 'vite-plus'
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
          webpart: {
            alias: 'Test',
            properties: {
              views: {
                type: 'json',
                default: [],
                parser: { module: './parser.ts', export: 'parseViews' },
              },
            },
          },
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
      writeFileSync(
        path.join(root, 'parser.ts'),
        'export function parseViews(value: unknown): string[] { if (!Array.isArray(value) || value.some(v => typeof v !== "string")) throw new Error("Expected names"); return value }',
      )
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
        expect(config.optimizeDeps.exclude).toEqual(
          expect.arrayContaining(['sp', 'spve', '@spve/core']),
        )
        expect(config.optimizeDeps.include).toContain('consumer-dependency')
        await expect(
          resolveConfig({ ...options, optimizeDeps: { include: ['spve/vanilla'] } }, 'serve'),
        ).rejects.toThrow(/must share/)
        const nested = await resolveConfig(
          { ...options, optimizeDeps: { include: ['spve/react > some-cjs'] } },
          'serve',
        )
        expect(nested.optimizeDeps.include).toContain('spve/react > some-cjs')
        if (react === 'absent') {
          const result = await build({
            ...options,
            logLevel: 'silent',
            build: {
              write: false,
              minify: false,
              lib: { entry: 'virtual:spve-app', formats: ['es'] },
            },
          })
          const output = (Array.isArray(result) ? result[0] : result).output.find(
            (file) => file.type === 'chunk' && file.isEntry,
          )
          const module = await import(
            `data:text/javascript;base64,${Buffer.from(output.code).toString('base64')}`
          )
          expect(module.parseProperties({ views: ['valid'] })).toEqual({ views: ['valid'] })
          expect(module.parseProperties({})).toEqual({})
          expect(() => module.parseProperties({ views: [1] })).toThrow(
            /property views: Expected names/,
          )
        }
        expect(config.optimizeDeps.include.includes('react-dom/client')).toBe(react === 'present')
      }
    } finally {
      vi.unstubAllEnvs()
      rmSync(root, { recursive: true, force: true })
    }
  },
)

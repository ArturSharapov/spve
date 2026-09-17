import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test } from 'vite-plus/test'
const require = createRequire(import.meta.url)
const ts = require(require.resolve('typescript', { paths: [require.resolve('vite-plus')] }))
const source = readFileSync(
  new URL('../examples/saved-settings/host/WebPart.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const Version = { parse: (value) => value, compare: (a, b) => Number(a) - Number(b) }
const exports = {}
new Function('require', 'exports', compiled)(
  (id) => (id === 'spve/host' ? { __esModule: true, default: class {} } : { Version }),
  exports,
)

test('native migration handles old/current data and preserves saved values on failure', () => {
  const host = new exports.default()
  const old = { listId: 'news', title: 'Latest', custom: { retained: true } }
  expect(host.onAfterDeserialize(old, Version.parse('1.0'))).toEqual({
    listIds: ['news'],
    title: 'Latest',
    custom: { retained: true },
  })
  expect(old).toEqual({ listId: 'news', title: 'Latest', custom: { retained: true } })
  const current = { listIds: ['news', 'events'], title: 'Latest' }
  expect(host.onAfterDeserialize(current, Version.parse('2.0'))).toEqual(current)
  expect(() => host.onAfterDeserialize(old, Version.parse('3.0'))).toThrow(/newer/)
  expect(() => host.onAfterDeserialize({ listId: null }, Version.parse('1.0'))).toThrow(
    /listId.*version 1.0/,
  )
  expect(() => host.onAfterDeserialize({ listIds: [1] }, Version.parse('2.0'))).toThrow(
    /listIds.*version 2.0/,
  )
  expect(() => host.onAfterDeserialize(null, Version.parse('1.0'))).toThrow(/property object/)
})

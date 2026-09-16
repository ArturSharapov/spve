import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { test } from 'vite-plus/test'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const frameworks = ['vanilla', 'vue', 'react', 'preact', 'lit', 'svelte', 'solid', 'qwik']
const contextAccessors = ['vue', 'react', 'preact', 'svelte', 'solid', 'qwik']

test('keeps SPFx context types behind the optional context entry', () => {
  const rootDeclarations = readFileSync(path.join(packageRoot, 'index.d.ts'), 'utf8')
  assert.doesNotMatch(rootDeclarations, /WebPartContext|@microsoft\/sp-webpart-base/)

  for (const framework of frameworks) {
    const declarations = readFileSync(path.join(packageRoot, `${framework}.d.ts`), 'utf8')
    assert.doesNotMatch(declarations, /WebPartContext|@microsoft\/sp-webpart-base|spve\/context/)
  }

  const contextDeclarations = readFileSync(path.join(packageRoot, 'context.d.ts'), 'utf8')
  assert.match(contextDeclarations, /@microsoft\/sp-webpart-base/)
  assert.match(contextDeclarations, /withContext/)

  const packageJson = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))
  for (const framework of contextAccessors) {
    assert.ok(packageJson.exports[`./${framework}/context`])
    assert.equal(packageJson.exports[`./context/${framework}`], undefined)
  }
})

test('all framework adapters accept application plugins', () => {
  for (const framework of frameworks) {
    const runtime = readFileSync(path.join(packageRoot, `${framework}.mjs`), 'utf8')
    assert.match(runtime, /applyAppPlugins/)
    assert.match(runtime, /\.\.\.plugins/)
  }
})

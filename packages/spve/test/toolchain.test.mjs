import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'vite-plus/test'
import { managedNodeCommand } from '../toolchain.mjs'

test('uses the Vite+ runtime manager outside project-local binaries', () => {
  const home = mkdtempSync(path.join(tmpdir(), 'spve-vp-home-'))
  const previous = process.env.VP_HOME
  const executable = path.join(home, 'bin', process.platform === 'win32' ? 'vp.exe' : 'vp')

  try {
    mkdirSync(path.dirname(executable), { recursive: true })
    writeFileSync(executable, '')
    process.env.VP_HOME = home

    assert.deepEqual(managedNodeCommand('/toolchain/heft', ['start']), {
      command: executable,
      args: ['env', 'exec', '--node', '22', '/toolchain/heft', 'start'],
    })
  } finally {
    if (previous === undefined) delete process.env.VP_HOME
    else process.env.VP_HOME = previous
    rmSync(home, { recursive: true, force: true })
  }
})

test('host dependencies preserve toolchain pins and have stable ordering', async () => {
  const { toolchainDescriptor } = await import('../toolchain.mjs')
  assert.deepEqual(
    toolchainDescriptor({ zod: '3.24.0', nanoid: '5.0.0' }),
    toolchainDescriptor({ nanoid: '5.0.0', zod: '3.24.0' }),
  )
  assert.throws(() => toolchainDescriptor({ typescript: '6.0.0' }), /must retain/)
  assert.throws(
    () => toolchainDescriptor({ '@microsoft/sp-webpart-base': '1.21.0' }),
    /must retain/,
  )
  assert.equal(toolchainDescriptor().dependencies['@microsoft/sp-webpart-base'], '1.22.2')
})

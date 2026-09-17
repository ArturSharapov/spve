#!/usr/bin/env node

import { existsSync } from 'node:fs'
import path from 'node:path'
import { loadSpveConfig, prepareWebpart } from './project.mjs'
import { ensureToolchain, prepareToolchain } from './toolchain.mjs'

const command = process.argv[2]
if (command === 'prepare-toolchain') {
  const root = process.cwd()
  const config = existsSync(path.join(root, 'spve.config.ts'))
    ? await loadSpveConfig(root)
    : undefined
  await prepareToolchain(undefined, undefined, {
    showProgress: !process.argv.includes('--silent'),
    dependencies: config?.host?.dependencies,
  })
} else if (command === 'prepare') {
  const root = process.cwd()
  const config = await loadSpveConfig(root)
  const webpart = await prepareWebpart(root, config)
  if (process.env.SPVE_PREPARE_PROJECT_ONLY !== '1') await ensureToolchain(webpart)
} else {
  console.error('Usage: spve prepare')
  process.exit(1)
}

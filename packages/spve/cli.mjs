#!/usr/bin/env node

import { loadSpveConfig, prepareWebpart } from './project.mjs'
import { ensureToolchain, prepareToolchain } from './toolchain.mjs'

const command = process.argv[2]
if (command === 'prepare-toolchain') {
  await prepareToolchain(undefined, undefined, {
    showProgress: !process.argv.includes('--silent'),
  })
} else if (command === 'prepare') {
  const root = process.cwd()
  const config = await loadSpveConfig(root)
  const webpart = prepareWebpart(root, config)
  if (process.env.SPVE_PREPARE_PROJECT_ONLY !== '1') await ensureToolchain(webpart)
} else {
  console.error('Usage: spve prepare')
  process.exit(1)
}

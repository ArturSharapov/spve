#!/usr/bin/env node

import { loadSpveConfig, prepareWebpart } from './project.mjs'
import { ensureToolchain } from './toolchain.mjs'

const command = process.argv[2]
if (command !== 'prepare') {
  console.error('Usage: spve prepare')
  process.exit(1)
}

const root = process.cwd()
const config = await loadSpveConfig(root)
const webpart = prepareWebpart(root, config)
await ensureToolchain(webpart)

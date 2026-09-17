import { createHash, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import { spinner } from '@clack/prompts'
import pc from 'picocolors'

const templatePackage = fileURLToPath(new URL('./template/webpart/package.json', import.meta.url))
const ansiEscape = new RegExp(`${String.fromCodePoint(27)}\\[[0-?]*[ -/]*[@-~]`, 'g')
const nodeVersion = '22'

function vitePlusRuntimeManager() {
  const names = process.platform === 'win32' ? ['vp.exe', 'vp.cmd', 'vp'] : ['vp']
  const homes = [process.env.VP_HOME, path.join(os.homedir(), '.vite-plus')].filter(Boolean)

  for (const home of homes) {
    for (const name of names) {
      const candidate = path.join(home, 'bin', name)
      if (existsSync(candidate)) return candidate
    }
  }

  for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
    if (!directory || directory.includes(`${path.sep}node_modules${path.sep}.bin`)) continue
    for (const name of names) {
      const candidate = path.join(directory, name)
      if (existsSync(candidate)) return candidate
    }
  }

  throw new Error('SPVE: could not locate the Vite+ runtime manager; run `vp env setup` first')
}

function cacheRoot() {
  if (process.env.SPVE_CACHE_DIR) return path.resolve(process.env.SPVE_CACHE_DIR)
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA ?? os.homedir(), 'spve', 'Cache')
  }
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library/Caches/spve')
  return path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), '.cache'), 'spve')
}

export function toolchainDescriptor(dependencies = {}) {
  const packageJson = JSON.parse(readFileSync(templatePackage, 'utf8'))
  for (const [name, version] of Object.entries(dependencies).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (
      !/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(name) ||
      typeof version !== 'string' ||
      !version.trim()
    )
      throw new Error(`SPVE: invalid host dependency ${name}`)
    const pinned = packageJson.dependencies[name] ?? packageJson.devDependencies[name]
    if (pinned && pinned !== version)
      throw new Error(`SPVE: host dependency ${name} must retain ${pinned}`)
    if (!pinned) packageJson.dependencies[name] = version
  }
  packageJson.name = 'spve-sharepoint-toolchain'
  packageJson.version = '0.0.1'
  return packageJson
}

function toolchainKey(packageJson) {
  return createHash('sha256')
    .update(JSON.stringify(packageJson))
    .update(`\0node-${nodeVersion}\0${process.platform}\0${process.arch}`)
    .digest('hex')
    .slice(0, 20)
}

function isProcessActive(pid) {
  if (!Number.isInteger(pid) || pid < 1) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function acquireLock(lock, isReady, signal) {
  while (true) {
    signal?.throwIfAborted()
    try {
      mkdirSync(lock)
      writeFileSync(
        path.join(lock, 'owner.json'),
        `${JSON.stringify({ pid: process.pid, startedAt: Date.now() })}\n`,
      )
      return true
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
      if (isReady()) return false

      let owner
      try {
        owner = JSON.parse(readFileSync(path.join(lock, 'owner.json'), 'utf8'))
      } catch {}
      if (!owner || !isProcessActive(owner.pid)) {
        rmSync(lock, { recursive: true, force: true })
        continue
      }
      await sleep(250)
    }
  }
}

function runQuietly(command, args, cwd, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      signal,
      shell: process.platform === 'win32',
    })
    let output = ''
    const collect = (chunk) => {
      output = `${output}${chunk}`.slice(-20_000)
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolve()
      else {
        const details = output.replace(ansiEscape, '').trim()
        reject(
          new Error(
            `${path.basename(command)} exited with code ${code}${details ? `\n${details}` : ''}`,
          ),
        )
      }
    })
  })
}

function makeReadOnly(directory) {
  if (process.platform === 'win32') return
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) makeReadOnly(file)
    const mode = statSync(file).mode & 0o777
    chmodSync(file, mode & ~0o222)
  }
  const mode = statSync(directory).mode & 0o777
  chmodSync(directory, mode & ~0o222)
}

function makeWritable(directory) {
  if (process.platform === 'win32' || !existsSync(directory)) return
  const mode = statSync(directory).mode & 0o777
  chmodSync(directory, mode | 0o700)
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) makeWritable(file)
    else chmodSync(file, (statSync(file).mode & 0o777) | 0o600)
  }
}

function removeGeneratedDirectory(directory) {
  makeWritable(directory)
  rmSync(directory, { recursive: true, force: true })
}

function recordToolchain(webpart, key) {
  const stateFile = path.resolve(webpart, '../state.json')
  let state = {}
  try {
    state = JSON.parse(readFileSync(stateFile, 'utf8'))
  } catch {}
  if (state.toolchain === key) return
  const temporary = `${stateFile}.tmp-${process.pid}-${randomUUID()}`
  try {
    writeFileSync(temporary, `${JSON.stringify({ ...state, toolchain: key }, null, 2)}\n`)
    renameSync(temporary, stateFile)
  } finally {
    rmSync(temporary, { force: true })
  }
}

function ensureLink(webpart, toolchain, key) {
  const target = path.join(toolchain, 'node_modules')
  const link = path.join(webpart, 'node_modules')

  const pointsToTarget = () => {
    try {
      const current = lstatSync(link)
      return (
        current.isSymbolicLink() &&
        realpathSync(path.resolve(path.dirname(link), readlinkSync(link))) === realpathSync(target)
      )
    } catch {
      return false
    }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    if (pointsToTarget()) {
      recordToolchain(webpart, key)
      return
    }
    try {
      rmSync(link, { recursive: true, force: true })
      symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir')
      recordToolchain(webpart, key)
      return
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
      if (pointsToTarget()) {
        recordToolchain(webpart, key)
        return
      }
    }
  }
  throw new Error('SPVE: could not link the shared SharePoint toolchain')
}

export async function prepareToolchain(
  signal,
  logger,
  { showProgress = true, dependencies = {} } = {},
) {
  const packageJson = toolchainDescriptor(dependencies)
  const key = toolchainKey(packageJson)
  const root = path.join(cacheRoot(), 'toolchains')
  const toolchain = path.join(root, key)
  const ready = path.join(toolchain, '.ready')
  const heft = path.join(toolchain, 'node_modules/.bin/heft')
  const isReady = () => existsSync(ready) && existsSync(heft)
  mkdirSync(root, { recursive: true })

  if (!isReady()) {
    const lock = `${toolchain}.lock`
    const ownsLock = await acquireLock(lock, isReady, signal)
    if (ownsLock) {
      const temporary = `${toolchain}.tmp-${process.pid}-${randomUUID()}`
      const progress = showProgress ? spinner() : undefined
      const startedAt = Date.now()
      progress?.start('Installing SharePoint toolchain')
      try {
        rmSync(temporary, { recursive: true, force: true })
        mkdirSync(temporary, { recursive: true })
        writeFileSync(
          path.join(temporary, 'package.json'),
          `${JSON.stringify(packageJson, null, 2)}\n`,
        )
        await runQuietly(
          vitePlusRuntimeManager(),
          [
            'env',
            'exec',
            '--node',
            nodeVersion,
            'npm',
            'install',
            '--include=dev',
            '--no-audit',
            '--no-fund',
            '--loglevel=error',
          ],
          temporary,
          signal,
        )
        writeFileSync(path.join(temporary, '.ready'), `${key}\n`)
        removeGeneratedDirectory(toolchain)
        renameSync(temporary, toolchain)
        makeReadOnly(toolchain)
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
        progress?.stop(`SharePoint toolchain installed ${pc.dim(`in ${elapsed}s`)}`)
      } catch (error) {
        progress?.error('SharePoint toolchain installation failed')
        removeGeneratedDirectory(temporary)
        if (logger) logger.error(error.message, { timestamp: true, environment: pc.dim('(setup)') })
        throw error
      } finally {
        rmSync(lock, { recursive: true, force: true })
      }
    }
  }

  return { key, toolchain }
}

export async function ensureToolchain(webpart, signal, logger) {
  const config = JSON.parse(readFileSync(path.join(webpart, 'config/spve.json'), 'utf8'))
  const { key, toolchain } = await prepareToolchain(signal, logger, {
    dependencies: config.hostDependencies,
  })
  ensureLink(webpart, toolchain, key)
  return { heft: path.join(webpart, 'node_modules/.bin/heft'), key, toolchain }
}

export function managedNodeCommand(command, args = []) {
  return {
    command: vitePlusRuntimeManager(),
    args: ['env', 'exec', '--node', nodeVersion, command, ...args],
  }
}

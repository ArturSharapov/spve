import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import pc from 'picocolors'
import { prepareWebpart } from './project.mjs'
import { ensureToolchain, managedNodeCommand } from './toolchain.mjs'

const ansiEscape = new RegExp(`${String.fromCodePoint(27)}\\[[0-?]*[ -/]*[@-~]`, 'g')

export { prepareWebpart }

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function run(command, args, cwd, signal, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      signal,
      env,
      shell: process.platform === 'win32',
    })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${path.basename(command)} exited with code ${code}`))
    })
  })
}

function pipeLines(stream, onLine) {
  let pending = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    pending += chunk
    let newline
    while ((newline = pending.indexOf('\n')) !== -1) {
      onLine(pending.slice(0, newline).replace(/\r$/, ''))
      pending = pending.slice(newline + 1)
    }
  })
  stream.once('end', () => {
    if (pending) onLine(pending.replace(/\r$/, ''))
  })
}

function createHeftReporter(logger) {
  let compiled = false
  let lastBuildAt = 0
  let skipDeprecationHint = false
  const reportedErrors = new Set()
  const write = (type, message) => {
    if (logger?.[type]) {
      logger[type](message, { timestamp: true, environment: pc.dim('(spfx)') })
    } else {
      console[type === 'info' ? 'log' : type](`[heft] (spfx) ${message}`)
    }
  }

  return (rawLine) => {
    const line = rawLine.replace(ansiEscape, '')
    const text = line.trim()

    if (skipDeprecationHint && text.startsWith('(Use `node --trace-deprecation')) {
      skipDeprecationHint = false
      return
    }
    skipDeprecationHint = false
    if (/\[DEP0060\].*util\._extend/.test(text)) {
      skipDeprecationHint = true
      return
    }

    const initialPage = text.match(
      /^\[build:configure-webpack-serve\] Launching initial page: (.+)$/,
    )
    if (initialPage) {
      const url = initialPage[1].replace(/:(\d+)\//, (_, port) => `:${pc.bold(port)}/`)
      logger.info(`  ${pc.green('➜')}  ${pc.bold('SharePoint')}: ${pc.cyan(url)}\n`)
      return
    }

    const successfulBuild = text.match(/^webpack \S+ compiled successfully in (.+)$/)
    if (successfulBuild) {
      const now = Date.now()
      const duplicateRebuild = compiled && now - lastBuildAt < 250
      lastBuildAt = now
      if (duplicateRebuild) {
        reportedErrors.clear()
        return
      }
      write(
        'info',
        pc.green(`${compiled ? 'rebuilt' : 'ready'} `) + pc.dim(`in ${successfulBuild[1]}`),
      )
      compiled = true
      reportedErrors.clear()
      return
    }

    const typescriptError = text.match(/^\[build:typescript\](?: Error:)? (.+\(TS\d+\).+)$/)
    if (typescriptError) {
      if (!reportedErrors.has(typescriptError[1])) {
        reportedErrors.add(typescriptError[1])
        write('error', pc.dim('typescript ') + pc.red('error ') + typescriptError[1])
      }
      return
    }

    const noise = [
      /^$/,
      /^The "heft start" alias was expanded/,
      /^Starting incremental build/,
      /^---- build (started|finished|cancelled)/,
      /^-+ (Finished|Aborted|Failed)/,
      /^New run requested by /,
      /^Cancelling incremental build/,
      /^Immediate rerun requested\. Executing\.$/,
      /^Waiting for changes\./,
      /^Encountered \d+ errors?$/,
      /^\[build:clean\] /,
      /^\[build:set-browserslist-ignore-old-data-env-var\] /,
      /^\[build:sass\] (Generating|Generated)/,
      /^\[build:copy-javascript\] /,
      /^\[build:typescript\] (Using TypeScript|Starting compilation|File change detected|Found \d+ errors?\. Watching|Copied|Encountered \d+|All requested file copy operations)/,
      /^\[build:lint\] Linting isn't currently supported in watch mode/,
      /^\[build:webpack\] (Using Webpack|Starting webpack-dev-server|Started Webpack Dev Server|Running incremental Webpack compilation|Webpack has not detected changes)/,
      /^\[build:configure-webpack-serve\]$/,
      /^\[build:configure-webpack-serve\]\s+(Request:|[═?]|To load your scripts|query string:)/,
      /^Webpack patch plugin applying /,
      /^<i> \[webpack-dev-server\] (\[HPM\] Proxy created|Project is running at:|Loopback:)/,
      /^<i> \[webpack-dev-server\] \[HPM\] (Upgrading to WebSocket|Client disconnected)/,
      /^Entrypoint .+ \[big\] /,
      /^resolve ['"]/,
      /^using description file:/,
      /^Field 'browser' doesn't contain a valid alias configuration$/,
      /^(?:no extension|as directory)$/,
      /^\.[a-z0-9]+$/,
      /^\S+ doesn't exist$/,
      /^webpack \S+ compiled with \d+ errors? in /,
      /^---- build encountered an error /,
      /^\[build:webpack\] (?:Error: )?.*Module not found:/,
    ]
    if (noise.some((pattern) => pattern.test(text))) return

    const taskLine = text.match(/^\[build:([^\]]+)\]\s*(.*)$/)
    const webpackLine = text.match(/^<i> \[webpack-dev-server\]\s*(.*)$/)
    const message = taskLine?.[2] ?? webpackLine?.[1] ?? text
    const subsystem = taskLine ? `${taskLine[1]} ` : webpackLine ? 'webpack ' : ''
    const formatted = pc.dim(subsystem) + message
    if (/\b(error|failed|failure)\b/i.test(text)) write('error', formatted)
    else if (/\b(warn(?:ing)?)\b/i.test(text)) write('warn', formatted)
    else write('info', formatted)
  }
}

export async function ensureHeft(webpart, signal, logger) {
  return (await ensureToolchain(webpart, signal, logger)).heft
}

function runHeft(heft, args, cwd, signal, env) {
  const managed = managedNodeCommand(heft, args)
  return run(managed.command, managed.args, cwd, signal, env)
}

export async function ensureDevCertificate(webpart, signal, logger) {
  const certificate = path.join(os.homedir(), '.rushstack/rushstack-serve.pem')
  const key = path.join(os.homedir(), '.rushstack/rushstack-serve.key')
  const heft = await ensureHeft(webpart, signal, logger)
  if (!existsSync(certificate) || !existsSync(key)) {
    await runHeft(heft, ['trust-dev-cert'], webpart, signal)
  }
  return {
    cert: readFileSync(certificate),
    key: readFileSync(key),
  }
}

export async function packageWebpart(webpart, signal, logger) {
  const heft = await ensureHeft(webpart, signal, logger)
  rmSync(path.join(webpart, 'dist'), { recursive: true, force: true })
  rmSync(path.join(webpart, 'release'), { recursive: true, force: true })
  const env = { ...process.env, SPVE_PRODUCTION: '1' }
  await runHeft(heft, ['test', '--clean', '--production'], webpart, signal, env)
  await runHeft(heft, ['package-solution', '--production'], webpart, signal, env)
}

export async function startWebpart(webpart, signal, logger) {
  const heft = await ensureHeft(webpart, signal, logger)
  signal?.throwIfAborted()
  const config = readJson(path.join(webpart, 'config/spve.json'))
  const serve = readJson(path.join(webpart, 'config/serve.json'))
  const tenantDomain = new URL(serve.initialPage).hostname
  const managed = managedNodeCommand(heft, ['start', '--clean'])
  const child = spawn(managed.command, managed.args, {
    cwd: webpart,
    env: {
      ...process.env,
      SPVE_VITE_PORT: String(config.vitePort),
      SPFX_SERVE_TENANT_DOMAIN: tenantDomain,
    },
    // Heft is a managed background server. Giving it the terminal's stdin makes
    // Ctrl+C compete with Vite+'s runner and can leave the runner waiting for Enter.
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
  })
  const report = createHeftReporter(logger)
  pipeLines(child.stdout, report)
  pipeLines(child.stderr, report)
  child.unref()
  return child
}

export function stopWebpart(child, signal = 'SIGTERM') {
  if (!child?.pid) return false

  try {
    if (process.platform === 'win32') {
      if (child.exitCode !== null || child.signalCode !== null) return false
      return child.kill(signal)
    }
    process.kill(-child.pid, signal)
    return true
  } catch (error) {
    // The process group may finish between the state check and process.kill().
    if (error?.code === 'ESRCH') return false
    throw error
  }
}

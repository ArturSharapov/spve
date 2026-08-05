import { spawn } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import pc from 'picocolors'

const template = fileURLToPath(new URL('./template/webpart', import.meta.url))
const ansiEscape = new RegExp(`${String.fromCodePoint(27)}\\[[0-?]*[ -/]*[@-~]`, 'g')

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function kebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export function prepareWebpart(root, config, siteUrl) {
  const webpart = path.join(root, '.spve/webpart')
  mkdirSync(webpart, { recursive: true })
  cpSync(template, webpart, { recursive: true, force: true })

  const name = kebabCase(config.name)
  const pascal = name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  const manifestFile = path.join(webpart, 'src/webparts/spve/SpveWebPart.manifest.json')
  const manifest = readJson(manifestFile)
  manifest.id = config.ids.component
  manifest.alias = `${pascal}WebPart`
  manifest.preconfiguredEntries[0].title.default = config.title
  manifest.preconfiguredEntries[0].description.default = config.description ?? ''
  manifest.preconfiguredEntries[0].properties.description = config.description ?? ''
  writeJson(manifestFile, manifest)

  const buildFile = path.join(webpart, 'config/config.json')
  const build = readJson(buildFile)
  build.bundles = {
    [`${name}-web-part`]: {
      components: [
        {
          entrypoint: './lib/webparts/spve/SpveWebPart.js',
          manifest: './src/webparts/spve/SpveWebPart.manifest.json',
        },
      ],
    },
  }
  writeJson(buildFile, build)

  const packageFile = path.join(webpart, 'config/package-solution.json')
  const solution = readJson(packageFile)
  const version = config.version.split('-')[0].split('.')
  const spfxVersion = [...version, ...Array(4 - version.length).fill('0')].join('.')
  solution.solution.name = `${name}-client-side-solution`
  solution.solution.id = config.ids.solution
  solution.solution.version = spfxVersion
  solution.solution.metadata.shortDescription.default = config.description ?? ''
  solution.solution.metadata.longDescription.default = config.description ?? ''
  solution.solution.features[0].id = config.ids.feature
  solution.solution.features[0].title = `${config.title} feature`
  solution.solution.features[0].description = `Activates the ${config.title} solution.`
  solution.paths.zippedPackage = `solution/${name}.sppkg`
  writeJson(packageFile, solution)

  const serveFile = path.join(webpart, 'config/serve.json')
  const serve = readJson(serveFile)
  serve.port = config.dev.spfxPort
  if (siteUrl) {
    serve.initialPage = `${siteUrl.replace(/\/$/, '')}/_layouts/15/workbench.aspx`
  }
  writeJson(serveFile, serve)

  const packageJsonFile = path.join(webpart, 'package.json')
  const packageJson = readJson(packageJsonFile)
  packageJson.name = `${name}-webpart`
  packageJson.version = config.version
  writeJson(packageJsonFile, packageJson)

  return webpart
}

function run(command, args, cwd, signal, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', signal, env })
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
      /^Waiting for changes\./,
      /^Encountered \d+ errors?$/,
      /^\[build:clean\] /,
      /^\[build:set-browserslist-ignore-old-data-env-var\] /,
      /^\[build:sass\] (Generating|Generated)/,
      /^\[build:copy-javascript\] /,
      /^\[build:typescript\] (Using TypeScript|Starting compilation|File change detected|Found \d+ errors?\. Watching|Copied|Encountered \d+)/,
      /^\[build:lint\] Linting isn't currently supported in watch mode/,
      /^\[build:webpack\] (Using Webpack|Starting webpack-dev-server|Started Webpack Dev Server|Running incremental Webpack compilation|Webpack has not detected changes)/,
      /^\[build:configure-webpack-serve\]$/,
      /^\[build:configure-webpack-serve\]\s+(Request:|[═?]|To load your scripts|query string:)/,
      /^Webpack patch plugin applying /,
      /^<i> \[webpack-dev-server\] (\[HPM\] Proxy created|Project is running at:|Loopback:)/,
      /^<i> \[webpack-dev-server\] \[HPM\] (Upgrading to WebSocket|Client disconnected)/,
      /^Entrypoint .+ \[big\] /,
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

export async function ensureHeft(webpart, signal) {
  const heft = path.join(webpart, 'node_modules/.bin/heft')
  if (!existsSync(heft)) {
    console.log('Installing the hidden SharePoint workspace dependencies...')
    await run('npm', ['install', '--include=dev'], webpart, signal)
  }
  return heft
}

export async function ensureDevCertificate(webpart, signal) {
  const certificate = path.join(os.homedir(), '.rushstack/rushstack-serve.pem')
  const key = path.join(os.homedir(), '.rushstack/rushstack-serve.key')
  if (!existsSync(certificate) || !existsSync(key)) {
    const heft = await ensureHeft(webpart, signal)
    await run(heft, ['trust-dev-cert'], webpart, signal)
  }
  return {
    cert: readFileSync(certificate),
    key: readFileSync(key),
  }
}

export async function packageWebpart(webpart, signal) {
  const heft = await ensureHeft(webpart, signal)
  rmSync(path.join(webpart, 'dist'), { recursive: true, force: true })
  rmSync(path.join(webpart, 'release'), { recursive: true, force: true })
  const env = { ...process.env, SPVE_PRODUCTION: '1' }
  await run(heft, ['test', '--clean', '--production'], webpart, signal, env)
  await run(heft, ['package-solution', '--production'], webpart, signal, env)
}

export async function startWebpart(webpart, signal, logger) {
  const heft = await ensureHeft(webpart, signal)
  signal?.throwIfAborted()
  const config = readJson(path.resolve(webpart, '../..', 'spve.config.json'))
  const serve = readJson(path.join(webpart, 'config/serve.json'))
  const tenantDomain = new URL(serve.initialPage).hostname
  const child = spawn(heft, ['start', '--clean'], {
    cwd: webpart,
    env: {
      ...process.env,
      SPVE_VITE_PORT: String(config.dev.vitePort),
      SPFX_SERVE_TENANT_DOMAIN: tenantDomain,
    },
    // Heft is a managed background server. Giving it the terminal's stdin makes
    // Ctrl+C compete with Vite+'s runner and can leave the runner waiting for Enter.
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
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

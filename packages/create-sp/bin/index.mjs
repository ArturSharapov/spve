#!/usr/bin/env node

import * as prompts from '@clack/prompts'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'
import os from 'node:os'
import path from 'node:path'
import {
  copyTemplateScaffold,
  createTemplatePackageJson,
  DEFAULT_SPVE_SPECIFIER,
} from '../scaffold.mjs'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
let activeSharePointPreparation
let vitePlusExecutable
const frameworkChoices = [
  { value: 'vanilla', label: 'Vanilla', hint: 'TypeScript', color: [247, 223, 30] },
  { value: 'vue', label: 'Vue', hint: 'TypeScript', color: [66, 184, 131] },
  { value: 'react', label: 'React', hint: 'TypeScript', color: [97, 218, 251] },
  { value: 'preact', label: 'Preact', hint: 'TypeScript', color: [103, 58, 183] },
  { value: 'lit', label: 'Lit', hint: 'TypeScript', color: [50, 79, 255] },
  { value: 'svelte', label: 'Svelte', hint: 'TypeScript', color: [255, 62, 0] },
  { value: 'solid', label: 'Solid', hint: 'TypeScript', color: [68, 107, 158] },
  { value: 'qwik', label: 'Qwik', hint: 'TypeScript · CSR', color: [172, 126, 244] },
]

function parseArgs(argv) {
  const values = { interactive: true }
  const positional = []

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') values.help = true
    else if (argument === '--no-interactive') values.interactive = false
    else if (argument === '--install') values.install = true
    else if (argument === '--no-install') values.install = false
    else if (argument === '--template' || argument === '-t') values.template = argv[++index]
    else if (argument.startsWith('--template=')) values.template = argument.slice(11)
    else if (argument === '--title') values.title = argv[++index]
    else if (argument.startsWith('--title=')) values.title = argument.slice(8)
    else if (argument === '--slug') values.slug = argv[++index]
    else if (argument.startsWith('--slug=')) values.slug = argument.slice(7)
    else if (argument === '--description') values.description = argv[++index]
    else if (argument.startsWith('--description=')) values.description = argument.slice(14)
    else if (argument === '--version') values.version = argv[++index]
    else if (argument.startsWith('--version=')) values.version = argument.slice(10)
    else if (argument === '--vite-port') values.vitePort = argv[++index]
    else if (argument.startsWith('--vite-port=')) values.vitePort = argument.slice(12)
    else if (argument === '--spfx-port') values.spfxPort = argv[++index]
    else if (argument.startsWith('--spfx-port=')) values.spfxPort = argument.slice(12)
    else if (argument === '--site-url') values.siteUrl = argv[++index]
    else if (argument.startsWith('--site-url=')) values.siteUrl = argument.slice(11)
    else if (argument === '--tenant-id') values.tenantId = argv[++index]
    else if (argument.startsWith('--tenant-id=')) values.tenantId = argument.slice(12)
    else if (argument === '--client-id') values.clientId = argv[++index]
    else if (argument.startsWith('--client-id=')) values.clientId = argument.slice(12)
    else if (argument === '--spve') values.spve = argv[++index]
    else if (argument.startsWith('--spve=')) values.spve = argument.slice(7)
    else if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`)
    else positional.push(argument)
  }

  values.target = positional[0]
  return values
}

function printHelp() {
  console.log(`Usage: create-sp [directory] [options]

Options:
  -t, --template <name>       vanilla, vue, react, preact, lit, svelte, solid, or qwik
      --title <title>         Project and SharePoint web-part title
      --slug <slug>           Project and web-part technical name
      --description <text>    SharePoint web-part description
      --version <version>     Solution version (default: 0.0.1)
      --vite-port <port>      Vite development port (default: 17641)
      --spfx-port <port>      Heft development port (default: 17642)
      --site-url <url>        SharePoint site URL for local development
      --tenant-id <id>        Microsoft Entra tenant ID
      --client-id <id>        Microsoft Entra application client ID
      --spve <specifier>      Override the spve package specifier for local testing
      --install               Install dependencies after creating the project
      --no-install            Skip dependency installation
      --no-interactive        Require all necessary values as arguments
  -h, --help                  Show this help

Examples:
  npm cr sp
  npm cr sp -- my-app --template vue-ts --title "My web part"`)
}

function isValidPackageName(value) {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value)
}

function isValidVersion(value) {
  return /^\d+\.\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?$/.test(value)
}

function parsePort(value, label) {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${label} must be an integer between 1 and 65535`)
  }
  return port
}

function validateUrl(value) {
  if (!value) return
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return 'Use an https:// SharePoint site URL'
  } catch {
    return 'Enter a valid URL'
  }
}

function withValidationSpacing(validate) {
  return (value) => {
    const error = validate(value)
    if (!error) return
    const message = error instanceof Error ? error.message : error
    return `\n${message}`
  }
}

function normalizeTarget(value) {
  return value.trim().replace(/[\\/]+$/, '') || '.'
}

function packageNameFromTarget(target) {
  if (target === '.') return path.basename(process.cwd())
  return path
    .basename(target)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
}

function titleFromPackageName(packageName) {
  return packageName
    .replace(/^@[^/]+\//, '')
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function isEmptyDirectory(directory) {
  return !existsSync(directory) || readdirSync(directory).length === 0
}

function cancel(message) {
  activeSharePointPreparation?.abort()
  prompts.cancel(message)
  process.exit(1)
}

function assertNotCancelled(value) {
  if (prompts.isCancel(value)) cancel('Project creation cancelled')
  return value
}

const BACK = Symbol('back')

function savePromptAnchor() {
  if (process.stdout.isTTY) process.stdout.write('\x1b[s')
}

function restorePromptAnchor() {
  if (process.stdout.isTTY) process.stdout.write('\x1b[u\x1b[J')
}

function colorText(text, [red, green, blue], bold = false) {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text
  return `${bold ? '\x1b[1m' : ''}\x1b[38;2;${red};${green};${blue}m${text}\x1b[0m`
}

function frameworkLabel(value) {
  const framework = frameworkChoices.find((choice) => choice.value === value)
  if (!framework) return value
  if (!process.stdout.isTTY || process.env.NO_COLOR) return framework.label
  const [red, green, blue] = framework.color
  // Clack dims inactive options. SGR 22 restores normal intensity so every
  // framework keeps its brand color while the selection marker shows focus.
  return `\x1b[22m\x1b[38;2;${red};${green};${blue}m${framework.label}\x1b[0m`
}

function gradientText(text, start, end, bold = true) {
  const last = Math.max(text.length - 1, 1)
  return [...text]
    .map((letter, index) => {
      const amount = index / last
      const color = start.map((channel, channelIndex) =>
        Math.round(channel + (end[channelIndex] - channel) * amount),
      )
      return colorText(letter, color, bold)
    })
    .join('')
}

function clearNpmCreatePrelude() {
  if (!process.stdout.isTTY || process.env.npm_command !== 'init') return
  process.stdout.write('\x1b[3A\x1b[J')
}

function findVitePlus() {
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
}

function vitePlusInstaller() {
  if (process.platform === 'win32') {
    return {
      command: 'irm https://vite.plus/ps1 | iex',
      executable: 'powershell.exe',
      args: [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        'irm https://vite.plus/ps1 | iex',
      ],
    }
  }

  return {
    command: 'curl -fsSL https://vite.plus | bash',
    executable: 'bash',
    args: ['-c', 'curl -fsSL https://vite.plus | bash'],
  }
}

function installVitePlus(installer) {
  return new Promise((resolve, reject) => {
    const child = spawn(installer.executable, installer.args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    const collect = (chunk) => {
      output = `${output}${chunk}`.slice(-16_000)
    }

    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('error', reject)
    child.once('close', (code) => {
      if (code === 0) resolve()
      else {
        const details = output.trim()
        reject(
          new Error(`Vite+ installer exited with code ${code}${details ? `\n${details}` : ''}`),
        )
      }
    })
  })
}

async function ensureVitePlus() {
  vitePlusExecutable = findVitePlus()
  if (vitePlusExecutable) return

  prompts.note(
    [
      styleText(
        'dim',
        'Vite+ manages your runtime, package manager, and frontend toolchain in one place.',
      ),
      styleText('dim', 'It replaces nvm and provides a unified first-class developer experience.'),
      styleText(
        'dim',
        'Built by trusted industry-leading engineers, same team behind Vite, Vitest, Rolldown, and Oxc.',
      ),
      `${styleText('dim', 'Learn more:')} ${styleText(['cyan', 'underline'], 'https://viteplus.dev')}`,
    ].join('\n'),
    `${gradientText('VITE+', [96, 165, 250], [168, 85, 247])} ${styleText('yellow', 'required')}`,
  )

  const installer = vitePlusInstaller()
  const install = assertNotCancelled(
    await prompts.confirm({
      message: 'Install Vite+ now?',
      initialValue: true,
    }),
  )
  if (!install) cancel(`Vite+ is required. Install it with:\n${installer.command}`)

  process.stdout.write(`${styleText('gray', prompts.S_BAR)}\n`)
  const progress = paddedSpinner()
  progress.start('Installing Vite+')
  try {
    await installVitePlus(installer)
    vitePlusExecutable = findVitePlus()
    if (!vitePlusExecutable)
      throw new Error('Vite+ installed, but the `vp` executable was not found')
    progress.stop('Vite+ installed')
  } catch (error) {
    progress.error('Vite+ installation failed')
    throw error
  }
}

function paddedSpinner({ delayedHint, hintDelay = 8_000 } = {}) {
  if (!process.stdout.isTTY) return prompts.spinner()

  const frames = ['◒', '◐', '◓', '◑']
  const hintLines = delayedHint?.split('\n') ?? []
  const bottomPadding = 2
  let frame = 0
  let timer
  let hintTimer
  let visibleHintLines = 0
  let message = ''
  let running = false
  const restoreCursor = () => process.stdout.write('\x1b[?25h')
  const render = () => {
    process.stdout.write(
      `\r\x1b[2K${styleText('magenta', frames[frame % frames.length])}  ${message}`,
    )
    frame++
  }
  const formatHint = (line) =>
    `${styleText('gray', prompts.S_BAR)}  ${line
      .split(/(\*[^*]+\*)/)
      .map((part) =>
        part.startsWith('*') && part.endsWith('*')
          ? styleText(['dim', 'italic'], part.slice(1, -1))
          : styleText('dim', part),
      )
      .join('')}`
  const writeHintGuide = () => {
    process.stdout.write(`\x1b[1B\r\x1b[2K${styleText('gray', prompts.S_BAR)}\x1b[1A\r`)
  }
  const writeHintLine = (index, clear = false) => {
    const offset = index + 2
    const trailingRows = clear ? 0 : bottomPadding
    process.stdout.write(
      `${clear ? `\x1b[${offset}B` : '\n'.repeat(offset)}\r\x1b[2K${clear ? '' : formatHint(hintLines[index])}${'\n'.repeat(trailingRows)}\x1b[${offset + trailingRows}A\r`,
    )
  }
  const replaceHintLine = (index, line) => {
    const offset = index + 2
    process.stdout.write(`\x1b[${offset}B\r\x1b[2K${formatHint(line)}\x1b[${offset}A\r`)
  }
  const showHint = () => {
    for (const [index] of hintLines.entries()) {
      if (index === 0) writeHintGuide()
      writeHintLine(index)
      visibleHintLines = index + 1
    }
  }
  const finish = (symbol, text, preserveHints = false) => {
    if (!running) return
    running = false
    clearInterval(timer)
    clearTimeout(hintTimer)
    process.removeListener('exit', restoreCursor)
    process.stdout.write('\r\x1b[2K')
    if (preserveHints) {
      process.stdout.write(`${symbol}  ${text}`)
      if (visibleHintLines > 0) {
        replaceHintLine(0, hintLines[0].replace(/^Taking/, 'Took'))
      }
      const nextLine = visibleHintLines > 0 ? visibleHintLines + 2 : 1
      process.stdout.write(`\x1b[${nextLine}B\r\x1b[?25h`)
      return
    }
    for (let index = 0; index < visibleHintLines; index++) writeHintLine(index, true)
    const layoutRows = visibleHintLines ? visibleHintLines + bottomPadding + 1 : bottomPadding
    process.stdout.write(`\x1b[1B\x1b[${layoutRows}M\x1b[1A\r`)
    process.stdout.write('\x1b[?25h')
    if (text) process.stdout.write(`${symbol}  ${text}\n`)
  }

  return {
    start(text) {
      message = text.replace(/\.+$/, '')
      running = true
      process.stdout.write(`\r${'\n'.repeat(bottomPadding)}\x1b[${bottomPadding}A\r\x1b[?25l`)
      process.once('exit', restoreCursor)
      render()
      timer = setInterval(render, 80)
      if (delayedHint) hintTimer = setTimeout(showHint, hintDelay)
    },
    stop(text) {
      finish(styleText('green', '◇'), text)
    },
    complete(text) {
      finish(styleText('green', '◇'), text, true)
    },
    error(text) {
      finish(styleText('red', '▲'), text)
    },
    clear() {
      finish('', '')
    },
  }
}

function startSharePointPreparation() {
  const controller = new AbortController()
  const localCli = path.resolve(packageRoot, '../spve/cli.mjs')
  const npmArgs = [
    'exec',
    '--yes',
    '--package=@spve/core@0.0.7',
    '--',
    'spve',
    'prepare-toolchain',
    '--silent',
  ]
  let command
  let args

  if (existsSync(localCli)) {
    command = process.execPath
    args = [localCli, 'prepare-toolchain', '--silent']
  } else if (process.env.npm_execpath) {
    const npmExecPath = process.env.npm_execpath
    const isJavaScriptCli = /\.[cm]?js$/i.test(npmExecPath)
    command = isJavaScriptCli ? process.execPath : npmExecPath
    args = isJavaScriptCli ? [npmExecPath, ...npmArgs] : npmArgs
  } else {
    command = 'npm'
    args = npmArgs
  }

  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    signal: controller.signal,
    shell: process.platform === 'win32' && command === 'npm',
  })
  let output = ''
  let settled = false
  const collect = (chunk) => {
    output = `${output}${chunk}`.slice(-20_000)
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const promise = new Promise((resolve) => {
    child.once('error', (error) => {
      settled = true
      resolve({ error })
    })
    child.once('close', (code) => {
      if (settled) return
      settled = true
      if (code === 0) resolve({})
      else {
        const details = output.trim()
        resolve({
          error: new Error(
            `SharePoint preparation exited with code ${code}${details ? `\n${details}` : ''}`,
          ),
        })
      }
    })
  })

  const preparation = {
    abort: () => controller.abort(),
    get settled() {
      return settled
    },
    promise,
  }
  activeSharePointPreparation = preparation
  return preparation
}

async function finishSharePointPreparation(preparation, project) {
  if (!preparation) return

  let progress
  if (!preparation.settled) {
    progress = paddedSpinner({
      delayedHint:
        "Taking a while? Don't worry.\nSharePoint dependency installation is always slow.\nGood news, we do it only *once* for all your projects.",
    })
    progress.start('Preparing SharePoint toolchain')
  }

  const result = await preparation.promise
  if (!result.error && project) {
    try {
      await prepareInstalledProject(project)
    } catch (error) {
      result.error = error
    }
  }
  if (result.error) progress?.clear()
  else progress?.complete('SharePoint toolchain prepared')
  activeSharePointPreparation = undefined
  if (result.error) {
    prompts.log.warn('SharePoint toolchain preparation deferred until `vp dev -m sp`')
  }
}

function renderHeader() {
  const title = [
    gradientText('⚡︎SharePoint ', [6, 182, 212], [33, 149, 237]),
    gradientText('Vite ', [142, 33, 237], [183, 33, 237]),
    colorText('E', [207, 145, 39], true),
    gradientText('xperience', [163, 139, 96], [170, 170, 170]),
  ].join('')
  const tagline = [styleText('dim', 'Modern SPFx development. Any framework. Instant HMR.')].join(
    '',
  )
  process.stdout.write(
    [
      `╭─ ${title} ${styleText('dim', '─'.repeat(24))}${styleText('dim', '╮')}`,
      `│  ${tagline}  ${styleText('dim', '│')}`,
      `╰${gradientText('─'.repeat(56), [190, 190, 190], [120, 120, 120], false)}${styleText('dim', '╯')}`,
      // `   ${arrow} ${styleText('dim', 'back · ')}${escape} ${styleText('dim', 'cancel')}`,
      '',
    ].join('\n'),
  )
}

function renderCompletedPrompt(message, value, colored = false) {
  const bar = styleText('gray', '│')
  const complete = styleText('green', '◇')
  process.stdout.write(
    [
      bar,
      `${complete}  ${message}`,
      `${bar}  ${colored ? value : styleText('dim', String(value))}`,
      '',
    ].join('\n'),
  )
}

function renderWizardHistory(step, title, slug, draft) {
  renderCompletedPrompt('Project name', title)
  renderCompletedPrompt('Project slug', slug)

  if (step >= 1) {
    renderCompletedPrompt('Select a framework', frameworkLabel(draft.framework), true)
  }
  if (step >= 2) renderCompletedPrompt('Web-part description', draft.description)
  if (step >= 3) renderCompletedPrompt('SharePoint site URL', draft.siteUrl)
  if (step > 3) {
    renderCompletedPrompt('Customize development ports?', draft.customizePorts ? 'Yes' : 'No')
  }
  if (draft.customizePorts && step > 4) renderCompletedPrompt('Vite port', draft.vitePort)
  if (draft.customizePorts && step > 5) renderCompletedPrompt('Heft/SPFx port', draft.spfxPort)
  if (step > 6) {
    renderCompletedPrompt(
      'Configure Microsoft Entra for standalone development?',
      draft.configureEntra ? 'Yes' : 'No',
    )
  }
  if (draft.configureEntra && step > 7) {
    renderCompletedPrompt('Microsoft Entra tenant ID', draft.tenantId)
  }
  if (draft.configureEntra && step > 8) {
    renderCompletedPrompt('Microsoft Entra client ID', draft.clientId)
  }
}

async function backable(factory) {
  const controller = new AbortController()
  let back = false
  const onKeypress = (_character, key) => {
    if (key?.name !== 'up') return
    back = true
    controller.abort()
  }

  process.stdin.on('keypress', onKeypress)
  try {
    const value = await factory(controller.signal)
    if (back) {
      restorePromptAnchor()
      return BACK
    }
    return assertNotCancelled(value)
  } finally {
    process.stdin.off('keypress', onKeypress)
  }
}

async function selectWithPrevious(options) {
  const controller = new AbortController()
  let back = false
  let index = Math.max(
    0,
    options.options.findIndex((option) => option.value === options.initialValue),
  )
  const onKeypress = (_character, key) => {
    if (key?.name === 'down') index = (index + 1) % options.options.length
    else if (key?.name === 'up') {
      if (index === 0) {
        back = true
        controller.abort()
      } else index--
    }
  }

  process.stdin.on('keypress', onKeypress)
  try {
    const value = await prompts.select({ ...options, signal: controller.signal })
    if (back) {
      restorePromptAnchor()
      return BACK
    }
    return assertNotCancelled(value)
  } finally {
    process.stdin.off('keypress', onKeypress)
  }
}

function technicalName(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function webpartAlias(name) {
  return `${name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')}WebPart`
}

async function resolveOptions(args) {
  let target = args.target ? normalizeTarget(args.target) : undefined
  let title = args.title
  let slug = args.slug

  if (args.interactive) {
    if (!args.resumeAtSlug) savePromptAnchor()
    let promptName = !args.resumeAtSlug
    while (true) {
      if (promptName) {
        title = assertNotCancelled(
          await prompts.text({
            message: 'Project name',
            initialValue: title,
            placeholder: 'My App',
            defaultValue: 'My App',
            validate: withValidationSpacing((value) =>
              !value || value.trim() ? undefined : 'Enter a project name',
            ),
          }),
        )
      }

      const inferredSlug = technicalName(title)
      const value = await backable((signal) =>
        prompts.text({
          message: 'Project slug',
          initialValue: slug,
          placeholder: inferredSlug,
          defaultValue: inferredSlug,
          validate: withValidationSpacing((value) => {
            const candidate = value || inferredSlug
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)) {
              return 'Use lowercase letters, numbers, and hyphens'
            }

            const candidateTarget = candidate
            if (!isEmptyDirectory(path.resolve(candidateTarget))) {
              return `Target directory is not empty: ${candidateTarget}`
            }
          }),
          signal,
        }),
      )
      if (value === BACK) {
        slug = undefined
        promptName = true
        continue
      }

      slug = value
      break
    }
    target = slug
  } else {
    if (!target) throw new Error('A project directory is required in non-interactive mode')
    title ||= titleFromPackageName(packageNameFromTarget(target))
    slug ||= technicalName(title)
  }

  if (!isEmptyDirectory(path.resolve(target))) {
    throw new Error(`Target directory is not empty: ${target}`)
  }

  const packageName = slug
  if (!isValidPackageName(packageName)) throw new Error(`Invalid package name: ${packageName}`)
  const name = slug
  if (!name) throw new Error(`Invalid project name: ${title}`)

  if (!args.interactive) {
    const framework = args.template?.replace(/-ts$/, '')
    if (!framework) throw new Error('A --template is required in non-interactive mode')
    if (!frameworkChoices.some((choice) => choice.value === framework)) {
      throw new Error(`Unknown template: ${framework}`)
    }
    const version = args.version ?? '0.0.1'
    if (!isValidVersion(version)) throw new Error(`Invalid solution version: ${version}`)
    const vitePort = parsePort(args.vitePort ?? 17641, 'Vite port')
    const spfxPort = parsePort(args.spfxPort ?? 17642, 'SPFx port')
    if (vitePort === spfxPort) throw new Error('Vite and SPFx ports must be different')
    if (!args.siteUrl) throw new Error('A --site-url is required in non-interactive mode')
    const urlError = validateUrl(args.siteUrl)
    if (urlError) throw new Error(urlError)
    if ((args.tenantId === undefined) !== (args.clientId === undefined)) {
      throw new Error('Use --tenant-id and --client-id together')
    }

    return {
      target,
      packageName,
      framework,
      template: `${framework}-ts`,
      name,
      title,
      description: args.description ?? `${title} SharePoint web part`,
      version,
      vitePort,
      spfxPort,
      siteUrl: args.siteUrl,
      tenantId: args.tenantId,
      clientId: args.clientId,
      spve: args.spve ?? DEFAULT_SPVE_SPECIFIER,
      install: args.install ?? false,
    }
  }

  const draft = {
    framework: args.template?.replace(/-ts$/, ''),
    description: args.description ?? '',
    siteUrl: args.siteUrl ?? '',
    customizePorts: args.vitePort !== undefined || args.spfxPort !== undefined,
    vitePort: String(args.vitePort ?? 17641),
    spfxPort: String(args.spfxPort ?? 17642),
    configureEntra: args.tenantId !== undefined || args.clientId !== undefined,
    tenantId: args.tenantId ?? '',
    clientId: args.clientId ?? '',
    install: args.install ?? true,
  }

  let step = draft.framework ? 1 : 0
  if (args.resumeAtSlug) step = 0
  let redraw = false
  while (step <= 9) {
    if (redraw) {
      renderWizardHistory(step, title, slug, draft)
      redraw = false
    }

    if (step === 0) {
      const value = await selectWithPrevious({
        message: 'Select a framework',
        options: frameworkChoices.map((choice) => ({
          ...choice,
          label: frameworkLabel(choice.value),
        })),
        initialValue: draft.framework,
      })
      if (value === BACK) {
        renderCompletedPrompt('Project name', title)
        return resolveOptions({
          ...args,
          title,
          slug,
          template: draft.framework,
          description: draft.description,
          siteUrl: draft.siteUrl,
          vitePort: draft.customizePorts ? draft.vitePort : undefined,
          spfxPort: draft.customizePorts ? draft.spfxPort : undefined,
          tenantId: draft.configureEntra ? draft.tenantId : undefined,
          clientId: draft.configureEntra ? draft.clientId : undefined,
          install: draft.install,
          resumeAtSlug: true,
        })
      }
      draft.framework = value
      step = 1
    } else if (step === 1) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'Web-part description',
          initialValue: draft.description || undefined,
          placeholder: `${title} SharePoint web part`,
          defaultValue: `${title} SharePoint web part`,
          signal,
        }),
      )
      if (value === BACK) {
        step = 0
        redraw = true
      } else {
        draft.description = value
        step = 2
      }
    } else if (step === 2) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'SharePoint site URL',
          initialValue: draft.siteUrl,
          placeholder: 'https://contoso.sharepoint.com/sites/example',
          validate: withValidationSpacing((value) =>
            value ? validateUrl(value) : 'Enter a SharePoint site URL',
          ),
          signal,
        }),
      )
      if (value === BACK) {
        step = 1
        redraw = true
      } else {
        draft.siteUrl = value
        step = 3
      }
    } else if (step === 3) {
      const value = await backable((signal) =>
        prompts.confirm({
          message: 'Customize development ports?',
          initialValue: draft.customizePorts,
          signal,
        }),
      )
      if (value === BACK) {
        step = 2
        redraw = true
      } else {
        draft.customizePorts = value
        step = value ? 4 : 6
      }
    } else if (step === 4) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'Vite port',
          initialValue: draft.vitePort,
          validate: withValidationSpacing((value) => {
            try {
              parsePort(value, 'Vite port')
            } catch (error) {
              return error.message
            }
          }),
          signal,
        }),
      )
      if (value === BACK) {
        step = 3
        redraw = true
      } else {
        draft.vitePort = value
        step = 5
      }
    } else if (step === 5) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'Heft/SPFx port',
          initialValue: draft.spfxPort,
          validate: withValidationSpacing((value) => {
            try {
              const port = parsePort(value, 'SPFx port')
              if (port === parsePort(draft.vitePort, 'Vite port'))
                return 'Use a different port than Vite'
            } catch (error) {
              return error.message
            }
          }),
          signal,
        }),
      )
      if (value === BACK) {
        step = 4
        redraw = true
      } else {
        draft.spfxPort = value
        step = 6
      }
    } else if (step === 6) {
      const value = await backable((signal) =>
        prompts.confirm({
          message: 'Configure Microsoft Entra for standalone development?',
          initialValue: draft.configureEntra,
          signal,
        }),
      )
      if (value === BACK) {
        step = draft.customizePorts ? 5 : 3
        redraw = true
      } else {
        draft.configureEntra = value
        step = value ? 7 : 9
      }
    } else if (step === 7) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'Microsoft Entra tenant ID',
          initialValue: draft.tenantId,
          placeholder: 'Directory (tenant) ID',
          validate: withValidationSpacing((value) =>
            value.trim() ? undefined : 'Enter the tenant ID',
          ),
          signal,
        }),
      )
      if (value === BACK) {
        step = 6
        redraw = true
      } else {
        draft.tenantId = value
        step = 8
      }
    } else if (step === 8) {
      const value = await backable((signal) =>
        prompts.text({
          message: 'Microsoft Entra client ID',
          initialValue: draft.clientId,
          placeholder: 'Application (client) ID',
          validate: withValidationSpacing((value) =>
            value.trim() ? undefined : 'Enter the client ID',
          ),
          signal,
        }),
      )
      if (value === BACK) {
        step = 7
        redraw = true
      } else {
        draft.clientId = value
        step = 9
      }
    } else if (step === 9) {
      const value = await backable((signal) =>
        prompts.confirm({
          message: 'Install dependencies?',
          initialValue: draft.install,
          signal,
        }),
      )
      if (value === BACK) {
        step = draft.configureEntra ? 8 : 6
        redraw = true
      } else {
        draft.install = value
        step = 10
      }
    }
  }

  const vitePort = draft.customizePorts ? parsePort(draft.vitePort, 'Vite port') : 17641
  const spfxPort = draft.customizePorts ? parsePort(draft.spfxPort, 'SPFx port') : 17642
  const version = args.version ?? '0.0.1'
  if (!isValidVersion(version)) throw new Error(`Invalid solution version: ${version}`)
  const framework = draft.framework

  return {
    target,
    packageName,
    framework,
    template: `${framework}-ts`,
    name,
    title,
    description: draft.description,
    version,
    vitePort,
    spfxPort,
    siteUrl: draft.siteUrl,
    tenantId: draft.configureEntra ? draft.tenantId : undefined,
    clientId: draft.configureEntra ? draft.clientId : undefined,
    spve: args.spve ?? DEFAULT_SPVE_SPECIFIER,
    install: draft.install,
  }
}

function quoteTypeScript(value) {
  const singles = value.split("'").length - 1
  const doubles = value.split('"').length - 1
  const quote = singles > doubles ? '"' : "'"
  return `${quote}${value
    .replaceAll('\\', '\\\\')
    .replaceAll(quote, `\\${quote}`)
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')}${quote}`
}

function writePackageJson(directory, options) {
  const packageJson = createTemplatePackageJson(options)
  writeFileSync(path.join(directory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
}

function writeSpveConfig(directory, options) {
  const component = randomUUID()
  const solution = randomUUID()
  const feature = randomUUID()
  const contents = `import type { SpveConfig } from 'spve'

export default {
  name: ${quoteTypeScript(options.name)},
  title: ${quoteTypeScript(options.title)},
  description: ${quoteTypeScript(options.description)},
  version: ${quoteTypeScript(options.version)},
  ids: {
    component: '${component}',
    solution: '${solution}',
    feature: '${feature}',
  },
  dev: {
    siteUrl: ${quoteTypeScript(options.siteUrl)},
    vitePort: ${options.vitePort},
    spfxPort: ${options.spfxPort},
  },
  webpart: {
    alias: ${quoteTypeScript(webpartAlias(options.name))},
    icon: 'Page',
    group: 'Advanced',
    supportedHosts: ['SharePointWebPart'],
    properties: {
      description: {
        type: 'string',
        label: 'Description',
        default: ${quoteTypeScript(options.description)},
        control: {
          type: 'text',
          multiline: true,
        },
      },
    },
  },
  solution: {
    skipFeatureDeployment: true,
    permissions: [],
  },
} satisfies SpveConfig
`
  writeFileSync(path.join(directory, 'spve.config.ts'), contents)

  const generatedTypes = `export {}\n\ndeclare global {\n  interface SpveAppProps {\n    "description"?: string\n  }\n}\n`
  mkdirSync(path.join(directory, '.spve'), { recursive: true })
  writeFileSync(path.join(directory, '.spve/types.d.ts'), generatedTypes)
}

function writeEnvironment(directory, options) {
  if (options.clientId === undefined && options.tenantId === undefined) return

  const environment = [
    `VITE_AAD_CLIENT_ID=${options.clientId ?? ''}`,
    `VITE_AAD_TENANT_ID=${options.tenantId ?? ''}`,
    '',
  ].join('\n')
  writeFileSync(path.join(directory, '.env.local'), environment)
}

function createProject(options) {
  const directory = path.resolve(options.target)
  mkdirSync(directory, { recursive: true })
  copyTemplateScaffold(directory, options)
  writePackageJson(directory, options)
  writeSpveConfig(directory, options)
  writeEnvironment(directory, options)
}

function installDependencies(directory, prepareInBackground) {
  return new Promise((resolve, reject) => {
    const child = spawn(vitePlusExecutable ?? 'vp', ['install'], {
      cwd: path.resolve(directory),
      env: prepareInBackground ? { ...process.env, SPVE_PREPARE_PROJECT_ONLY: '1' } : process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    })
    let output = ''
    const collect = (chunk) => {
      output = `${output}${chunk}`.slice(-16_000)
    }

    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('error', reject)
    child.once('close', (code) => {
      if (code === 0) resolve()
      else {
        const details = output.trim()
        reject(
          new Error(`vp install failed with exit code ${code}${details ? `\n${details}` : ''}`),
        )
      }
    })
  })
}

function prepareInstalledProject(directory) {
  const executable = path.resolve(
    directory,
    'node_modules/.bin',
    process.platform === 'win32' ? 'spve.cmd' : 'spve',
  )
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['prepare'], {
      cwd: path.resolve(directory),
      stdio: 'ignore',
      shell: process.platform === 'win32',
    })
    child.once('error', reject)
    child.once('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`spve prepare exited with code ${code}`))
    })
  })
}

function renderProjectCreated(options) {
  prompts.note(
    [
      `Web part    ${colorText(options.title, [230, 230, 230], true)}`,
      `Framework   ${frameworkLabel(options.framework)}`,
      `SharePoint  ${colorText(options.siteUrl, [45, 212, 191])}`,
      `Ports       ${colorText(String(options.vitePort), [249, 115, 22], true)} ${styleText('dim', '/')} ${colorText(String(options.spfxPort), [239, 68, 68], true)}`,
    ].join('\n'),
    'Project created',
  )
}

function renderNextSteps(options) {
  const commands = []
  if (options.target !== '.') {
    commands.push(`${styleText(['bold', 'cyan'], 'cd')} ${styleText('white', options.target)}`)
  }
  if (!options.install) {
    commands.push(`${colorText('vp', [168, 85, 247], true)} ${styleText('white', 'i')}`)
  }
  commands.push(`${colorText('vp', [168, 85, 247], true)} ${styleText('white', 'dev')}`)

  const message = [
    styleText(['bold', 'cyan'], 'Next steps'),
    '',
    ...commands.map((command) => `  ${command}`),
  ].join('\n')
  process.stdout.write(
    `${styleText('gray', prompts.S_BAR)}\n${styleText('gray', prompts.S_BAR_END)}  ${message}\n`,
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  let sharePointPreparation
  if (args.interactive) {
    clearNpmCreatePrelude()
    renderHeader()
    await ensureVitePlus()
    sharePointPreparation = startSharePointPreparation()
  }
  const options = await resolveOptions(args)
  if (!isEmptyDirectory(path.resolve(options.target))) {
    throw new Error(`Target directory is not empty: ${options.target}`)
  }
  if (args.interactive) {
    try {
      createProject(options)
      renderProjectCreated(options)
    } catch (error) {
      prompts.log.error('Project creation failed')
      throw error
    }
  } else {
    createProject(options)
  }

  if (options.install) {
    if (args.interactive) {
      const spinner = paddedSpinner()
      spinner.start('Installing dependencies')
      try {
        await installDependencies(options.target, Boolean(sharePointPreparation))
        spinner.stop('Dependencies installed')
      } catch (error) {
        spinner.error('Dependency installation failed')
        throw error
      }
    } else {
      await installDependencies(options.target, Boolean(sharePointPreparation))
    }
  }

  await finishSharePointPreparation(
    sharePointPreparation,
    options.install ? options.target : undefined,
  )

  if (args.interactive) {
    renderNextSteps(options)
  } else {
    console.log(`Created ${options.packageName} in ${options.target}`)
  }
}

main().catch((error) => {
  activeSharePointPreparation?.abort()
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n\x1b[31m${message}\x1b[0m`)
  process.exitCode = 1
})

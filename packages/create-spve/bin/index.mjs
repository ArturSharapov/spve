#!/usr/bin/env node

import * as prompts from '@clack/prompts'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'
import path from 'node:path'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const templatesRoot = path.join(packageRoot, 'templates')
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
  console.log(`Usage: create-spve [directory] [options]

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
  vp create spve
  vp create spve -- my-app --template vue-ts --title "My web part"`)
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
      spve: args.spve ?? '^0.0.1',
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
    spve: args.spve ?? '^0.0.1',
    install: draft.install,
  }
}

function renameScaffoldFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const source = path.join(directory, entry)
    const targetName = entry.startsWith('_') ? `.${entry.slice(1)}` : entry
    const target = path.join(directory, targetName)
    if (target !== source) renameSync(source, target)
    if (statSync(target).isDirectory()) renameScaffoldFiles(target)
  }
}

function replaceTokens(directory, tokens) {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    if (statSync(file).isDirectory()) {
      replaceTokens(file, tokens)
      continue
    }

    let contents = readFileSync(file, 'utf8')
    for (const [token, value] of Object.entries(tokens)) {
      contents = contents.replaceAll(`__${token}__`, value)
    }
    writeFileSync(file, contents)
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function quoteJavaScript(value) {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
  return `\`${escaped}\``
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

function frameworkDependencies(template) {
  if (template === 'vue-ts') {
    return {
      dependencies: { vue: '^3.5.41' },
      devDependencies: {
        '@vitejs/plugin-vue': '^6.0.8',
        '@vue/tsconfig': '^0.9.1',
        'vue-tsc': '^3.3.9',
      },
    }
  }

  if (template === 'react-ts') {
    return {
      dependencies: {
        react: '^19.2.8',
        'react-dom': '^19.2.8',
      },
      devDependencies: {
        '@types/react': '^19.2.18',
        '@types/react-dom': '^19.2.4',
        '@vitejs/plugin-react': '^6.0.5',
      },
    }
  }

  if (template === 'preact-ts') {
    return {
      dependencies: { preact: '^10.29.7' },
      devDependencies: { '@preact/preset-vite': '^2.10.6' },
    }
  }

  if (template === 'lit-ts') {
    return {
      dependencies: { lit: '^3.3.3' },
      devDependencies: {},
    }
  }

  if (template === 'svelte-ts') {
    return {
      dependencies: { svelte: '^5.56.8' },
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '^7.2.0',
        '@tsconfig/svelte': '^5.0.8',
        'svelte-check': '^4.7.3',
      },
    }
  }

  if (template === 'solid-ts') {
    return {
      dependencies: { 'solid-js': '^1.9.14' },
      devDependencies: { 'vite-plugin-solid': '^2.11.13' },
    }
  }

  if (template === 'qwik-ts') {
    return {
      dependencies: { '@builder.io/qwik': '^1.20.0' },
      devDependencies: {},
    }
  }

  return { dependencies: {}, devDependencies: {} }
}

function sortKeys(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  )
}

function writePackageJson(directory, options) {
  const framework = frameworkDependencies(options.template)
  const packageJson = {
    name: options.packageName,
    version: '0.0.1',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vp dev',
      build: 'vp build',
      check: 'vp check',
      postinstall: 'spve prepare',
    },
    dependencies: sortKeys({
      '@azure/msal-browser': '^2.38.2',
      '@pnp/sp': '^3.26.0',
      spve: options.spve,
      ...framework.dependencies,
    }),
    devDependencies: sortKeys({
      '@types/node': '^24.13.3',
      typescript: '~6.0.2',
      vite: 'npm:@voidzero-dev/vite-plus-core@0.2.8',
      'vite-plus': '^0.2.8',
      ...framework.devDependencies,
    }),
    overrides: {
      vite: 'npm:@voidzero-dev/vite-plus-core@0.2.8',
    },
    devEngines: {
      packageManager: {
        name: 'pnpm',
        version: '11.20.0',
        onFail: 'download',
      },
      runtime: {
        name: 'node',
        version: '24',
        onFail: 'download',
      },
    },
    engines: {
      node: '>=24 <25',
    },
  }
  writeFileSync(path.join(directory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
}

function writeSpveConfig(directory, options) {
  const component = randomUUID()
  const solution = randomUUID()
  const feature = randomUUID()
  const contents = `import type { SpveConfig } from 'spve/config'

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

  const generatedTypes = `import 'spve/client'\n\ndeclare module 'spve/client' {\n  interface AppProps {\n    "description"?: string\n  }\n}\n`
  mkdirSync(path.join(directory, '.spve'), { recursive: true })
  writeFileSync(path.join(directory, '.spve/client.d.ts'), generatedTypes)
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
  cpSync(path.join(templatesRoot, 'base'), directory, { recursive: true })
  cpSync(path.join(templatesRoot, options.template), directory, { recursive: true })
  renameScaffoldFiles(directory)
  replaceTokens(directory, {
    PACKAGE_NAME: options.packageName,
    TITLE: options.title,
    TITLE_HTML: escapeHtml(options.title),
    TITLE_JS: quoteJavaScript(options.title),
    DESCRIPTION: options.description,
  })
  writePackageJson(directory, options)
  writeSpveConfig(directory, options)
  writeEnvironment(directory, options)
}

function installDependencies(directory) {
  return new Promise((resolve, reject) => {
    const child = spawn('vp', ['install'], {
      cwd: path.resolve(directory),
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

  prompts.outro(
    [
      styleText(['bold', 'cyan'], 'Next steps'),
      '',
      ...commands.map((command) => `  ${command}`),
    ].join('\n'),
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  if (args.interactive) {
    renderHeader()
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
      const spinner = prompts.spinner()
      spinner.start('Installing dependencies')
      try {
        await installDependencies(options.target)
        spinner.stop('Dependencies installed')
      } catch (error) {
        spinner.error('Dependency installation failed')
        throw error
      }
    } else {
      await installDependencies(options.target)
    }
  }

  if (args.interactive) {
    renderNextSteps(options)
  } else {
    console.log(`Created ${options.packageName} in ${options.target}`)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n\x1b[31m${message}\x1b[0m`)
  process.exitCode = 1
})

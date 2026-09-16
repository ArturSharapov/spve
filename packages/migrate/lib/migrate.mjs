import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { builtinModules } from 'node:module'
import {
  copyTemplateScaffold,
  createTemplatePackageJson,
  DEFAULT_SPVE_SPECIFIER,
} from 'create-sp/scaffold'
import ts from 'typescript'

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']
const STATIC_ASSET_EXTENSIONS = new Set([
  '.avif',
  '.bmp',
  '.csv',
  '.css',
  '.eot',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.json',
  '.mp3',
  '.mp4',
  '.ogg',
  '.otf',
  '.pdf',
  '.png',
  '.sass',
  '.scss',
  '.svg',
  '.txt',
  '.ttf',
  '.wav',
  '.webm',
  '.webp',
  '.webmanifest',
  '.wasm',
  '.woff',
  '.woff2',
  '.xml',
])
const SPVE_CONTEXT_EXPORTS = new Set([
  'HttpClient',
  'HttpClientResponse',
  'IHttpClientOptions',
  'ISPHttpClientOptions',
  'SPHttpClient',
  'SPHttpClientResponse',
])
const TOOLING_DEPENDENCIES = new Set([
  '@microsoft/eslint-config-spfx',
  '@microsoft/eslint-plugin-spfx',
  '@microsoft/gulp-core-build-serve',
  '@microsoft/sp-build-web',
  '@microsoft/sp-module-interfaces',
  '@microsoft/spfx-heft-plugins',
  '@microsoft/spfx-web-build-rig',
  '@rushstack/eslint-config',
  '@rushstack/heft',
  '@types/heft-jest',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-plugin-react-hooks',
  'gulp',
  'typescript',
])

export function parseArgs(argv) {
  const options = {}
  const positional = []

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--site-url') options.siteUrl = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('--site-url=')) options.siteUrl = argument.slice(11)
    else if (argument === '--vite-port') options.vitePort = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('--vite-port=')) options.vitePort = argument.slice(12)
    else if (argument === '--spfx-port') options.spfxPort = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('--spfx-port=')) options.spfxPort = argument.slice(12)
    else if (argument === '--spve') options.spve = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('--spve=')) options.spve = argument.slice(7)
    else if (argument === '--webpart') options.webpart = requiredValue(argv, ++index, argument)
    else if (argument.startsWith('--webpart=')) options.webpart = argument.slice(10)
    else if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`)
    else positional.push(argument)
  }

  options.source = positional[0]
  options.target = positional[1]
  if (positional.length > 2) throw new Error('Expected a source and optional target directory')
  return options
}

function requiredValue(argv, index, option) {
  const value = argv[index]
  if (!value || value.startsWith('-')) throw new Error(`${option} requires a value`)
  return value
}

export function printHelp() {
  console.log(`Usage: migrate-sp <legacy-project> [target-directory] [options]

Creates a new SPVE React project and leaves the legacy project untouched. If the target is
omitted, migrate-sp creates <legacy-project>-spve next to the source project.

Options:
      --site-url <url>      Override the site URL inferred from config/serve.json
      --vite-port <port>    Vite development port (default: 17641)
      --spfx-port <port>    SPFx development port (inferred, or 17642)
      --spve <specifier>    Override the spve package specifier
      --webpart <name>      Select a web part by alias, directory, entry name, or manifest path
  -h, --help                Show this help

Example:
  migrate-sp ./legacy-hr ./hr-spve --site-url https://contoso.sharepoint.com/sites/hr`)
}

export function migrateProject(input) {
  if (!input.source) throw new Error('A legacy project directory is required')

  const source = path.resolve(input.source)
  const target = path.resolve(input.target ?? `${source}-spve`)
  const targetDisplay =
    input.target && !path.isAbsolute(input.target)
      ? input.target.replace(/[\\/]+$/, '') || '.'
      : target
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    throw new Error(`Legacy project directory does not exist: ${source}`)
  }
  if (source === target) throw new Error('Source and target must be different directories')
  if (!isEmptyDirectory(target)) throw new Error(`Target directory is not empty: ${target}`)

  const legacyPackage = readJson(path.join(source, 'package.json'), 'legacy package.json')
  const legacyLock = readOptionalJson(path.join(source, 'package-lock.json'))
  const legacyConfig = readOptionalJson(path.join(source, 'config/config.json'))
  const solution = readJson(
    path.join(source, 'config/package-solution.json'),
    'config/package-solution.json',
  )
  const manifests = findFiles(path.join(source, 'src'), (file) =>
    /WebPart\.manifest\.json$/i.test(file),
  )
  if (manifests.length === 0) throw new Error('No client-side web-part manifest was found in src')
  const manifestFile = selectManifest(source, manifests, input.webpart)
  const manifest = readJson(manifestFile, path.relative(source, manifestFile))
  const webpartDirectory = path.dirname(manifestFile)
  const entryFile = findLegacyEntry(webpartDirectory, manifestFile)
  const entrySource = readFileSync(entryFile, 'utf8')
  const renderBody = extractMethodBody(entrySource, 'render')
  if (!renderBody)
    throw new Error(`Could not find a render() method in ${path.relative(source, entryFile)}`)

  const serve = readOptionalJson(path.join(source, 'config/serve.json'))
  const metadata = deriveMetadata({ legacyPackage, manifest, solution, serve, input })
  const requiresSharePointContext = /\bthis\.context\b/.test(entrySource)
  const diagnostics = []
  inspectLegacyProject(source, entryFile, entrySource, legacyConfig, diagnostics)

  mkdirSync(target, { recursive: true })
  try {
    copyTemplateScaffold(target, {
      template: 'react-ts',
      packageName: metadata.packageName,
      title: metadata.title,
      description: metadata.description,
    })
    const copiedSources = copyFlattenedSources(source, target, webpartDirectory, entryFile)
    copyResourceDirectories(source, target)
    const appFile = path.join(target, 'src/App.tsx')
    writeFileSync(
      appFile,
      createReactApp(
        entrySource,
        renderBody,
        requiresSharePointContext,
        diagnostics,
        path.relative(source, entryFile),
      ),
    )
    copiedSources.set(appFile, entryFile)
    if (requiresSharePointContext) writeContextMain(target)
    rebaseFlattenedImports(
      copiedSources,
      source,
      path.join(source, 'src'),
      webpartDirectory,
      path.join(target, 'src'),
      diagnostics,
    )
    migrateLocalizedResources({
      source,
      target,
      legacyConfig,
      legacySource: path.join(source, 'src'),
      webpartDirectory,
      diagnostics,
    })
    modernizeCopiedSources(path.join(target, 'src'))
    configureMigratedTypeScript(target)
    validateMigratedSources(path.join(target, 'src'), diagnostics)
    writeScaffold(target, source, metadata, legacyPackage, legacyLock, diagnostics)
    writeMigrationReport(target, diagnostics)
  } catch (error) {
    rmSync(target, { recursive: true, force: true })
    throw error
  }

  return {
    source,
    target,
    title: metadata.title,
    requiresSharePointContext,
    diagnostics,
    targetDisplay,
  }
}

function selectManifest(source, manifests, selector) {
  if (manifests.length === 1 && !selector) return manifests[0]
  const choices = manifests.map((file) => {
    const manifest = readJson(file, path.relative(source, file))
    return {
      file,
      labels: [
        manifest.alias,
        path.basename(path.dirname(file)),
        path.basename(file).replace(/\.manifest\.json$/i, ''),
        toPosix(path.relative(source, file)),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    }
  })
  if (!selector) {
    throw new Error(
      `The project contains multiple web parts (${choices.map((choice) => choice.labels[0]).join(', ')}). ` +
        'Use --webpart to select one and migrate each web part to a separate target.',
    )
  }
  const normalized = selector.toLowerCase()
  const matches = choices.filter((choice) => choice.labels.includes(normalized))
  if (matches.length !== 1) {
    throw new Error(
      `--webpart ${JSON.stringify(selector)} matched ${matches.length} web parts. Available values: ${choices
        .map((choice) => choice.labels[0])
        .join(', ')}`,
    )
  }
  return matches[0].file
}

function addDiagnostic(diagnostics, code, message, file, severity = 'warning') {
  const item = { code, severity, message }
  if (file) item.file = toPosix(file)
  diagnostics.push(item)
}

function inspectLegacyProject(source, entryFile, entrySource, config, diagnostics) {
  if (/\bgetPropertyPaneConfiguration\s*\(/.test(entrySource)) {
    addDiagnostic(
      diagnostics,
      'SPFX_PROPERTY_PANE',
      'Custom property-pane UI is not represented by SPVE configuration. Property defaults were migrated, but the property-pane implementation requires review.',
      path.relative(source, entryFile),
    )
  }
  if (/\bonThemeChanged\s*\(/.test(entrySource)) {
    addDiagnostic(
      diagnostics,
      'SPFX_THEME_LIFECYCLE',
      'The SPFx onThemeChanged lifecycle method has no automatic behavior-preserving SPVE conversion.',
    )
  }
  if (config?.externals && Object.keys(config.externals).length > 0) {
    addDiagnostic(
      diagnostics,
      'SPFX_EXTERNALS',
      `config/config.json declares webpack externals (${Object.keys(config.externals).join(', ')}); Vite resolution must be reviewed.`,
      'config/config.json',
    )
  }
}

function isEmptyDirectory(directory) {
  return !existsSync(directory) || readdirSync(directory).length === 0
}

function readJson(file, label) {
  if (!existsSync(file)) throw new Error(`Missing ${label}`)
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid ${label}: ${error.message}`)
  }
}

function readOptionalJson(file) {
  return existsSync(file) ? readJson(file, path.basename(file)) : undefined
}

function findFiles(directory, predicate) {
  if (!existsSync(directory)) return []
  const found = []
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    const stats = statSync(file)
    if (stats.isDirectory()) found.push(...findFiles(file, predicate))
    else if (predicate(file)) found.push(file)
  }
  return found
}

function findLegacyEntry(directory, manifestFile) {
  const base = path.basename(manifestFile).replace(/\.manifest\.json$/i, '')
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) {
    const candidate = path.join(directory, `${base}${extension}`)
    if (existsSync(candidate)) return candidate
  }
  throw new Error(`Could not find the web-part entry for ${path.basename(manifestFile)}`)
}

function findMatchingBrace(source, opening) {
  let depth = 0
  let quote
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = opening; index < source.length; index++) {
    const character = source[index]
    const next = source[index + 1]
    if (lineComment) {
      if (character === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false
        index++
      }
      continue
    }
    if (quote) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = undefined
      continue
    }
    if (character === '/' && next === '/') {
      lineComment = true
      index++
    } else if (character === '/' && next === '*') {
      blockComment = true
      index++
    } else if (character === "'" || character === '"' || character === '`') quote = character
    else if (character === '{') depth++
    else if (character === '}' && --depth === 0) return index
  }
  return -1
}

function extractMethodBody(source, method) {
  const sourceFile = ts.createSourceFile(
    'webpart.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement)) continue
    const member = statement.members.find(
      (candidate) =>
        ts.isMethodDeclaration(candidate) && candidate.name?.getText(sourceFile) === method,
    )
    if (member?.body) return source.slice(member.body.getStart(sourceFile) + 1, member.body.end - 1)
  }
  const pattern = new RegExp(
    `(?:public|protected|private)?\\s*(?:async\\s+)?${method}\\s*\\([^)]*\\)\\s*(?::[^\\{]+)?\\{`,
    'm',
  )
  const match = pattern.exec(source)
  if (!match) return undefined
  const opening = source.indexOf('{', match.index + match[0].lastIndexOf('{'))
  const closing = findMatchingBrace(source, opening)
  if (closing < 0) throw new Error(`Unterminated ${method}() method`)
  return source.slice(opening + 1, closing)
}

function importsFrom(source) {
  const sourceFile = ts.createSourceFile(
    'source.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  return sourceFile.statements
    .filter(ts.isImportDeclaration)
    .map((statement) => statement.getText(sourceFile).trim())
}

function importModule(statement) {
  return (
    statement.match(/\bfrom\s+['"]([^'"]+)['"]/)?.[1] ??
    statement.match(/^import\s+['"]([^'"]+)['"]/)?.[1]
  )
}

function createReactApp(source, renderBody, requiresContext, diagnostics, entryFile) {
  const entryImports = importsFrom(source)
  const initBody = extractMethodBody(source, 'onInit')
  const renderUsesContext = /\bthis\.context\b/.test(renderBody)
  const renderUsesProps = /\bthis\.properties\b/.test(renderBody)
  const adaptedRender = adaptReactDomRender(
    renderBody
      .replace(/\bthis\.context\b/g, 'context')
      .replace(/\bthis\.properties\b/g, 'props')
      .trim(),
  )
  if (!/\breturn\b/.test(adaptedRender)) {
    throw new Error(
      'The render() method does not use the supported ReactDOM.render(element, this.domElement) pattern',
    )
  }
  const adaptedInit = initBody
    ?.replace(/\bawait\s+super\.onInit\(\);?/g, '')
    .replace(/\bsuper\.onInit\(\);?/g, '')
    .replace(/\bthis\.context\b/g, 'context')
    .replace(/\bthis\.properties\b/g, 'props')
    .trim()
  const unsupportedThis = [adaptedRender, adaptedInit]
    .filter(Boolean)
    .flatMap((body) => [...body.matchAll(/\bthis\.([A-Za-z_$][\w$]*)/g)].map((match) => match[1]))
  if (unsupportedThis.length > 0) {
    throw new Error(
      `The web-part entry uses instance members that cannot be moved safely (${[...new Set(unsupportedThis)].join(', ')}) in ${entryFile}. ` +
        'Move that behavior into application modules before migrating.',
    )
  }
  if (/\bawait\b/.test(adaptedInit ?? '')) {
    addDiagnostic(
      diagnostics,
      'ASYNC_WEBPART_INITIALIZATION',
      'The migrated onInit() contains asynchronous work. SPVE invokes framework initialization before render but does not await it; verify that rendering does not depend on its completion.',
      entryFile,
    )
  }
  const supportStatements = extractEntrySupportStatements(source)
  const usedEntrySource = `${supportStatements}\n${adaptedRender}\n${adaptedInit ?? ''}`
  const imports = entryImports
    .map((statement) => pruneEntryImport(statement, usedEntrySource))
    .filter(Boolean)
  const hasReactImport = imports.some((statement) => importModule(statement) === 'react')

  const contextImports = requiresContext
    ? "import type { ContextServices, WebPartContext } from 'spve/context'\n"
    : ''
  const initializeUsesContext = /\bcontext\b/.test(adaptedInit ?? '')
  const initializeUsesProps = /\bprops\b/.test(adaptedInit ?? '')
  const elementParameters = [
    renderUsesContext ? 'context: WebPartContext' : undefined,
    renderUsesProps ? 'props: AppProps' : undefined,
  ]
    .filter(Boolean)
    .join(', ')
  const elementArguments = [
    renderUsesContext ? 'services.context' : undefined,
    renderUsesProps ? 'props' : undefined,
  ]
    .filter(Boolean)
    .join(', ')
  const initializeParameters = [
    initializeUsesContext ? 'context: WebPartContext' : undefined,
    initializeUsesProps ? 'props: AppProps' : undefined,
  ]
    .filter(Boolean)
    .join(', ')
  const initializeArguments = [
    initializeUsesContext ? 'services.context' : undefined,
    initializeUsesProps ? 'props' : undefined,
  ]
    .filter(Boolean)
    .join(', ')
  const initializeBindings = [
    initializeUsesProps ? 'props' : undefined,
    initializeUsesContext ? 'services' : undefined,
  ]
    .filter(Boolean)
    .join(', ')
  const renderBindings = [
    renderUsesProps ? 'props' : undefined,
    renderUsesContext ? 'services' : undefined,
  ]
    .filter(Boolean)
    .join(', ')

  return `${hasReactImport ? '' : "import * as React from 'react'\n"}${contextImports}${imports.join('\n')}
import type { AppProps } from 'spve'
import type { ReactAppDefinition } from 'spve/react'
${supportStatements ? `\n${supportStatements}\n` : ''}

function createLegacyElement(${elementParameters}): React.ReactElement {
${indent(adaptedRender, 2)}
}
${
  adaptedInit
    ? `
async function initializeLegacy(${initializeParameters}): Promise<void> {
${indent(adaptedInit, 2)}
}
`
    : ''
}
export const App: ReactAppDefinition<AppProps${requiresContext ? ', ContextServices' : ''}> = {
${
  adaptedInit
    ? `  initialize({ ${initializeBindings} }) {
    void initializeLegacy(${initializeArguments})
  },
`
    : ''
}  render({ ${renderBindings} }) {
    return createLegacyElement(${elementArguments})
  },
}
`
}

function pruneEntryImport(statement, usedSource) {
  const sourceFile = ts.createSourceFile(
    'import.tsx',
    statement,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const declaration = sourceFile.statements.find(ts.isImportDeclaration)
  if (!declaration) return statement
  const module = declaration.moduleSpecifier.text
  const clause = declaration.importClause
  if (!clause) return statement
  if (module === 'react-dom' || module === 'react-dom/client') return undefined
  const isUsed = (name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(usedSource)
  const parts = []
  if (clause.name && isUsed(clause.name.text)) parts.push(clause.name.text)
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    if (isUsed(clause.namedBindings.name.text)) {
      parts.push(`* as ${clause.namedBindings.name.text}`)
    }
  } else if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    const kept = clause.namedBindings.elements.filter((specifier) => isUsed(specifier.name.text))
    if (kept.length > 0)
      parts.push(`{ ${kept.map((item) => item.getText(sourceFile)).join(', ')} }`)
  }
  if (parts.length === 0) return undefined
  return `import ${clause.isTypeOnly ? 'type ' : ''}${parts.join(', ')} from ${declaration.moduleSpecifier.getText(sourceFile)};`
}

function adaptReactDomRender(body) {
  const prefix = 'function __legacyRender() {\n'
  const wrapped = `${prefix}${body}\n}`
  const sourceFile = ts.createSourceFile(
    'render.tsx',
    wrapped,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  let replacement
  const visit = (node) => {
    if (
      !replacement &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'render' &&
      ts.isIdentifier(node.expression.expression) &&
      ['ReactDom', 'ReactDOM'].includes(node.expression.expression.text) &&
      node.arguments.length >= 2 &&
      ts.isPropertyAccessExpression(node.arguments[1]) &&
      node.arguments[1].expression.kind === ts.SyntaxKind.ThisKeyword &&
      node.arguments[1].name.text === 'domElement'
    ) {
      const target = ts.isExpressionStatement(node.parent) ? node.parent : node
      replacement = {
        start: target.getStart(sourceFile) - prefix.length,
        end: target.end - prefix.length,
        text: `return ${node.arguments[0].getText(sourceFile)};`,
      }
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (!replacement) return body
  return `${body.slice(0, replacement.start)}${replacement.text}${body.slice(replacement.end)}`.trim()
}

function extractEntrySupportStatements(source) {
  const sourceFile = ts.createSourceFile(
    'entry.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  return sourceFile.statements
    .filter((statement) => {
      if (ts.isImportDeclaration(statement)) return false
      if (ts.isClassDeclaration(statement)) {
        return !statement.members.some(
          (member) =>
            ts.isMethodDeclaration(member) && member.name?.getText(sourceFile) === 'render',
        )
      }
      return true
    })
    .map((statement) => statement.getText(sourceFile))
    .join('\n\n')
}

function indent(value, spaces) {
  const prefix = ' '.repeat(spaces)
  return value
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function deriveMetadata({ legacyPackage, manifest, solution, serve, input }) {
  const entry = manifest.preconfiguredEntries?.[0] ?? {}
  const solutionConfig = solution.solution ?? {}
  const feature = solutionConfig.features?.[0] ?? {}
  const inferredSiteUrl = inferSiteUrl(serve?.initialPage)
  const siteUrl = input.siteUrl ?? inferredSiteUrl
  if (!siteUrl) {
    throw new Error('Could not infer a SharePoint site URL; pass --site-url')
  }
  const vitePort = parsePort(input.vitePort ?? 17641, 'Vite port')
  const spfxPort = parsePort(input.spfxPort ?? serve?.port ?? 17642, 'SPFx port')
  if (vitePort === spfxPort) throw new Error('Vite and SPFx ports must be different')

  return {
    packageName: normalizePackageName(legacyPackage.name ?? solutionConfig.name ?? 'spve-app'),
    packageVersion: legacyPackage.version ?? '0.0.1',
    name: technicalName(manifest.alias ?? legacyPackage.name ?? 'spve-app'),
    title: localized(entry.title) ?? solutionConfig.name ?? legacyPackage.name ?? 'SPVE app',
    description: localized(entry.description) ?? solutionConfig.name ?? '',
    version: solutionConfig.version ?? '1.0.0.0',
    ids: {
      component: manifest.id,
      solution: solutionConfig.id,
      feature: feature.id ?? solutionConfig.id,
    },
    dev: { siteUrl, vitePort, spfxPort },
    webpart: {
      alias: manifest.alias,
      icon: entry.officeFabricIconFontName,
      group: localized(entry.group),
      groupId: entry.groupId,
      supportedHosts: manifest.supportedHosts,
      supportsFullBleed: manifest.supportsFullBleed,
      supportsThemeVariants: manifest.supportsThemeVariants,
      requiresCustomScript: manifest.requiresCustomScript,
      properties: convertProperties(entry.properties ?? {}),
    },
    solution: {
      includeClientSideAssets: solutionConfig.includeClientSideAssets,
      skipFeatureDeployment: solutionConfig.skipFeatureDeployment,
      permissions: solutionConfig.webApiPermissionRequests ?? [],
    },
    spve: input.spve ?? DEFAULT_SPVE_SPECIFIER,
  }
}

function localized(value) {
  if (typeof value === 'string') return value
  return value?.default ?? Object.values(value ?? {})[0]
}

function inferSiteUrl(initialPage) {
  if (!initialPage) return undefined
  try {
    const url = new URL(initialPage)
    url.pathname = url.pathname.replace(/\/_layouts(?:\/.*)?$/i, '') || '/'
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return undefined
  }
}

function parsePort(value, label) {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${label} must be an integer between 1 and 65535`)
  }
  return port
}

function normalizePackageName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9@/._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function technicalName(value) {
  return String(value)
    .replace(/Webpart$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function convertProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).map(([name, value]) => {
      const type =
        typeof value === 'string'
          ? 'string'
          : typeof value === 'number'
            ? 'number'
            : typeof value === 'boolean'
              ? 'boolean'
              : 'json'
      return [name, { type, default: value }]
    }),
  )
}

function writeScaffold(target, source, metadata, legacyPackage, legacyLock, diagnostics) {
  const packageJson = createPackageJson(
    metadata,
    legacyPackage,
    legacyLock,
    path.join(target, 'src'),
    diagnostics,
  )
  writeFileSync(path.join(target, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
  writeAllowedBuilds(target, source, legacyLock, packageJson, diagnostics)
  writeFileSync(path.join(target, 'spve.config.ts'), createSpveConfig(metadata))
  mkdirSync(path.join(target, '.spve'), { recursive: true })
  writeFileSync(
    path.join(target, '.spve/types.d.ts'),
    createPropertyTypes(metadata.webpart.properties),
  )
  writeFileSync(path.join(target, 'README.md'), createReadme(metadata))
}

function writeAllowedBuilds(target, source, legacyLock, packageJson, diagnostics) {
  const file = path.join(target, 'pnpm-workspace.yaml')
  const existing = existsSync(file)
    ? [...readFileSync(file, 'utf8').matchAll(/^\s{2}['"]?([^'"\s:]+)['"]?\s*:\s*true\s*$/gm)].map(
        (match) => match[1],
      )
    : []
  const roots = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ])
  const fromLock = detectReachableBuildPackages(legacyLock, roots)
  const fromInstalled = detectInstalledBuildPackages(source, roots)
  const detected = [...new Set([...fromLock, ...fromInstalled])].sort((left, right) =>
    left.localeCompare(right),
  )
  const allowed = [...new Set([...existing, ...detected])].sort((left, right) =>
    left.localeCompare(right),
  )
  writeFileSync(
    file,
    `allowBuilds:\n${allowed.map((name) => `  ${JSON.stringify(name)}: true`).join('\n')}\n`,
  )
  if (detected.length > 0) {
    addDiagnostic(
      diagnostics,
      'DEPENDENCY_BUILD_SCRIPTS',
      `Allowed install scripts for lockfile-confirmed migrated dependencies: ${detected.join(', ')}.`,
      'pnpm-workspace.yaml',
      'info',
    )
  } else if (
    !legacyLock?.packages &&
    !legacyLock?.dependencies &&
    !existsSync(path.join(source, 'node_modules'))
  ) {
    addDiagnostic(
      diagnostics,
      'DEPENDENCY_BUILD_DETECTION_UNAVAILABLE',
      'No modern package-lock.json or installed node_modules tree was available, so dependency install scripts could not be detected before pnpm installation.',
      'pnpm-workspace.yaml',
    )
  }
}

function detectReachableBuildPackages(legacyLock, roots) {
  const packages = legacyLock?.packages
  if (!packages || typeof packages !== 'object') {
    return detectLegacyLockBuildPackages(legacyLock?.dependencies, roots)
  }
  const visited = new Set()
  const builds = new Set()
  const queue = [...roots]
    .map((name) => resolveLockedDependency(packages, '', name))
    .filter(Boolean)
  while (queue.length > 0) {
    const key = queue.shift()
    if (visited.has(key)) continue
    visited.add(key)
    const entry = packages[key]
    if (!entry) continue
    const name = packageNameFromLockPath(key)
    if (entry.hasInstallScript && name) builds.add(name)
    const dependencies = {
      ...entry.dependencies,
      ...entry.optionalDependencies,
    }
    for (const dependency of Object.keys(dependencies)) {
      const resolved = resolveLockedDependency(packages, key, dependency)
      if (resolved && !visited.has(resolved)) queue.push(resolved)
    }
  }
  return [...builds].sort((left, right) => left.localeCompare(right))
}

function detectLegacyLockBuildPackages(dependencies, roots) {
  if (!dependencies || typeof dependencies !== 'object') return []
  const builds = new Set()
  const visited = new Set()
  const visit = (name, entry) => {
    if (!entry || visited.has(entry)) return
    visited.add(entry)
    if (entry.hasInstallScript) builds.add(name)
    const names = new Set([
      ...Object.keys(entry.requires ?? {}),
      ...Object.keys(entry.dependencies ?? {}),
    ])
    for (const dependency of names) {
      visit(dependency, entry.dependencies?.[dependency] ?? dependencies[dependency])
    }
  }
  for (const name of roots) visit(name, dependencies[name])
  return [...builds].sort((left, right) => left.localeCompare(right))
}

function detectInstalledBuildPackages(source, roots) {
  const nodeModules = path.join(source, 'node_modules')
  if (!existsSync(nodeModules)) return []
  const builds = new Set()
  const visited = new Set()
  const queue = [...roots]
    .map((name) => resolveInstalledPackage(source, source, name))
    .filter(Boolean)
  while (queue.length > 0) {
    const packageFile = queue.shift()
    if (visited.has(packageFile)) continue
    visited.add(packageFile)
    const manifest = readOptionalJson(packageFile)
    if (!manifest) continue
    if (['preinstall', 'install', 'postinstall'].some((name) => manifest.scripts?.[name])) {
      builds.add(manifest.name)
    }
    const dependencies = { ...manifest.dependencies, ...manifest.optionalDependencies }
    const packageDirectory = path.dirname(packageFile)
    for (const name of Object.keys(dependencies)) {
      const resolved = resolveInstalledPackage(source, packageDirectory, name)
      if (resolved && !visited.has(resolved)) queue.push(resolved)
    }
  }
  return [...builds].filter(Boolean).sort((left, right) => left.localeCompare(right))
}

function resolveInstalledPackage(projectRoot, importer, name) {
  let directory = importer
  while (isInside(projectRoot, directory)) {
    const candidate = path.join(directory, 'node_modules', name, 'package.json')
    if (existsSync(candidate)) return candidate
    if (directory === projectRoot) break
    directory = path.dirname(directory)
  }
}

function resolveLockedDependency(packages, importer, name) {
  let directory = importer
  while (true) {
    const candidate = directory ? `${directory}/node_modules/${name}` : `node_modules/${name}`
    if (packages[candidate]) return candidate
    const nested = directory.lastIndexOf('/node_modules/')
    if (nested >= 0) directory = directory.slice(0, nested)
    else if (directory) directory = ''
    else return undefined
  }
}

function packageNameFromLockPath(key) {
  const marker = key.lastIndexOf('node_modules/')
  if (marker < 0) return undefined
  const value = key.slice(marker + 'node_modules/'.length)
  return value.startsWith('@') ? value.split('/').slice(0, 2).join('/') : value.split('/')[0]
}

function createPackageJson(metadata, legacyPackage, legacyLock, sourceDirectory, diagnostics) {
  const templatePackage = createTemplatePackageJson({
    packageName: metadata.packageName,
    packageVersion: metadata.packageVersion,
    spve: metadata.spve,
    template: 'react-ts',
  })
  const dependencies = {
    ...templatePackage.dependencies,
    ...legacyPackage.dependencies,
  }
  const importedPackages = findImportedPackages(sourceDirectory)
  for (const name of Object.keys(dependencies)) {
    if (name.startsWith('@microsoft/sp-') && !importedPackages.has(name)) {
      delete dependencies[name]
    }
  }
  delete dependencies['node-sass']
  dependencies.react = templatePackage.dependencies.react
  dependencies['react-dom'] = templatePackage.dependencies['react-dom']
  dependencies['@azure/msal-browser'] = templatePackage.dependencies['@azure/msal-browser']
  dependencies.spve = templatePackage.dependencies.spve

  const devDependencies = Object.fromEntries(
    Object.entries(legacyPackage.devDependencies ?? {}).filter(
      ([name]) =>
        !TOOLING_DEPENDENCIES.has(name) &&
        (!name.startsWith('@microsoft/sp-') || importedPackages.has(name)),
    ),
  )
  addImportedDependencies(dependencies, devDependencies, legacyLock, importedPackages, diagnostics)
  inspectReactPeerCompatibility(dependencies, legacyLock, diagnostics)
  Object.assign(devDependencies, templatePackage.devDependencies)
  devDependencies['sass-embedded'] = '^1.93.2'

  return {
    ...templatePackage,
    dependencies: sortObject(dependencies),
    devDependencies: sortObject(devDependencies),
  }
}

function findImportedPackages(sourceDirectory) {
  const imported = new Set()
  for (const file of findFiles(sourceDirectory, (candidate) => /\.[cm]?[jt]sx?$/.test(candidate))) {
    const contents = readFileSync(file, 'utf8')
    for (const module of moduleSpecifiers(contents, file))
      imported.add(packageNameFromModule(module))
  }
  return imported
}

function addImportedDependencies(dependencies, devDependencies, legacyLock, imported, diagnostics) {
  for (const name of imported) {
    if (!name || name.startsWith('.') || name.startsWith('/') || name.startsWith('#')) continue
    if (builtinModules.includes(name) || dependencies[name] || devDependencies[name]) continue
    const version =
      legacyLock?.packages?.[`node_modules/${name}`]?.version ??
      legacyLock?.dependencies?.[name]?.version
    if (version) dependencies[name] = version
    else {
      addDiagnostic(
        diagnostics,
        'DEPENDENCY_VERSION_UNKNOWN',
        `Source code imports ${name}, but it is absent from package.json and no version was found in package-lock.json. Add a compatible version before installing.`,
      )
    }
  }
}

function inspectReactPeerCompatibility(dependencies, legacyLock, diagnostics) {
  for (const name of Object.keys(dependencies)) {
    if (name === 'react' || name === 'react-dom' || name === 'spve') continue
    const peerDependencies = legacyLock?.packages?.[`node_modules/${name}`]?.peerDependencies
    for (const peer of ['react', 'react-dom']) {
      const range = peerDependencies?.[peer]
      if (typeof range !== 'string' || !excludesReact19(range)) continue
      addDiagnostic(
        diagnostics,
        'REACT_19_PEER_RANGE',
        `${name} declares ${peer} peer range ${JSON.stringify(range)}, which excludes the React 19 template. The dependency was preserved; verify or upgrade it explicitly.`,
      )
    }
  }
}

function excludesReact19(range) {
  return range.split('||').every((part) => {
    const arm = part.trim()
    if (!arm || arm === '*' || /(?:^|[^\d])19(?:\.|\s|$)/.test(arm)) return false
    if (/(?:^|\s)>=?\s*(\d+)/.test(arm)) {
      const lower = Number(arm.match(/(?:^|\s)>=?\s*(\d+)/)?.[1])
      const upper = Number(arm.match(/<\s*=?\s*(\d+)/)?.[1] ?? Number.POSITIVE_INFINITY)
      return lower > 19 || upper <= 19
    }
    const interval = arm.match(/(\d+)(?:\.\d+)*\s*-\s*(\d+)/)
    if (interval) return Number(interval[1]) > 19 || Number(interval[2]) < 19
    const declaredMajor = Number(arm.match(/(?:\^|~)?\s*(\d+)/)?.[1])
    return Number.isFinite(declaredMajor) && declaredMajor !== 19
  })
}

function moduleSpecifiers(contents, file = 'source.tsx') {
  const sourceFile = ts.createSourceFile(
    file,
    contents,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const modules = []
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      modules.push(node.moduleSpecifier.text)
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      modules.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return modules
}

function packageNameFromModule(module) {
  return module.startsWith('@') ? module.split('/').slice(0, 2).join('/') : module.split('/')[0]
}

function sortObject(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  )
}

function createSpveConfig(metadata) {
  return `import type { SpveConfig } from 'spve'

export default ${JSON.stringify(
    {
      name: metadata.name,
      title: metadata.title,
      description: metadata.description,
      version: metadata.version,
      ids: metadata.ids,
      dev: metadata.dev,
      webpart: compact(metadata.webpart),
      solution: compact(metadata.solution),
    },
    null,
    2,
  )} satisfies SpveConfig
`
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function createPropertyTypes(properties) {
  const fields = Object.entries(properties).map(([name, property]) => {
    const type = property.type === 'json' ? 'unknown' : property.type
    return `    ${JSON.stringify(name)}?: ${type}`
  })
  return `export {}

declare global {
  interface SpveAppProps {
${fields.join('\n')}
  }
}
`
}

function createReadme(metadata) {
  return `# ${metadata.title}

Migrated from a legacy SPFx React project with \`migrate-sp\`.

\`\`\`sh
vp i
vp dev -m sp
\`\`\`

This starts development against the native SharePoint host. Use \`vp dev\` for standalone Vite
development with SPVE's compatibility context. Production SharePoint packages use
\`vp build -m sp\`.
`
}

function writeContextMain(target) {
  writeFileSync(
    path.join(target, 'src/main.ts'),
    `import { defineReactApp } from 'spve/react'
import { withContext } from 'spve/context'
import { App } from './App'
import './style.css'

export default defineReactApp(App, withContext())
`,
  )
}

function copyFlattenedSources(source, target, webpartDirectory, entryFile) {
  const legacySource = path.join(source, 'src')
  const targetSource = path.join(target, 'src')
  const copiedSources = new Map()

  const copyEntry = (from, to) => {
    cpSync(from, to, {
      recursive: true,
      filter(file) {
        if (!isCopyableSource(file, source, entryFile)) return false
        if (statSync(file).isFile()) {
          copiedSources.set(path.join(to, path.relative(from, file)), file)
        }
        return true
      },
    })
  }

  for (const entry of readdirSync(webpartDirectory)) {
    const from = path.join(webpartDirectory, entry)
    if (!isCopyableSource(from, source, entryFile)) continue
    copyEntry(from, path.join(targetSource, entry))
  }

  for (const entry of readdirSync(legacySource)) {
    if (entry === 'webparts' || /^main\.[cm]?[jt]sx?$/i.test(entry)) continue
    const from = path.join(legacySource, entry)
    if (
      /^index\.[cm]?[jt]sx?$/i.test(entry) &&
      statSync(from).isFile() &&
      /file is required to be in the root of the \/src directory/i.test(readFileSync(from, 'utf8'))
    ) {
      continue
    }
    copyEntry(from, path.join(targetSource, entry))
  }

  return copiedSources
}

function rebaseFlattenedImports(
  copiedSources,
  projectRoot,
  legacySource,
  webpartDirectory,
  targetSource,
  diagnostics,
) {
  const vendored = new Map()
  const mapLegacyPath = (file) => {
    if (isInside(webpartDirectory, file)) {
      return path.join(targetSource, path.relative(webpartDirectory, file))
    }
    if (isInside(legacySource, file)) {
      return path.join(targetSource, path.relative(legacySource, file))
    }
    const resolved = resolveLocalModule(file)
    if (!resolved || !isInside(projectRoot, resolved)) return undefined
    if (!STATIC_ASSET_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
      addDiagnostic(
        diagnostics,
        'EXTERNAL_SOURCE_IMPORT',
        `Executable source outside src/ was not moved automatically: ${path.relative(projectRoot, resolved)}.`,
        path.relative(projectRoot, resolved),
      )
      return undefined
    }
    if (vendored.has(resolved)) return vendored.get(resolved)
    const destination = path.join(
      targetSource,
      '_migrated',
      'assets',
      path.relative(projectRoot, resolved),
    )
    mkdirSync(path.dirname(destination), { recursive: true })
    cpSync(resolved, destination)
    vendored.set(resolved, destination)
    copiedSources.set(destination, resolved)
    return destination
  }

  for (const [targetFile, sourceFile] of copiedSources) {
    if (!/\.[cm]?[jt]sx?$/.test(targetFile)) continue
    let contents = readFileSync(targetFile, 'utf8')
    contents = contents.replace(
      /(\b(?:from|import|require)\s*(?:\(\s*)?)(['"])(\.\.?\/[^'"]+)\2/g,
      (statement, prefix, quote, module) => {
        const suffixIndex = module.search(/[?#]/)
        const pathname = suffixIndex < 0 ? module : module.slice(0, suffixIndex)
        const suffix = suffixIndex < 0 ? '' : module.slice(suffixIndex)
        const mapped = mapLegacyPath(path.resolve(path.dirname(sourceFile), pathname))
        if (!mapped) return statement
        let relative = toPosix(path.relative(path.dirname(targetFile), mapped))
        if (!relative.startsWith('.')) relative = `./${relative}`
        return `${prefix}${quote}${relative}${suffix}${quote}`
      },
    )
    writeFileSync(targetFile, contents)
  }
}

function isInside(directory, file) {
  const relative = path.relative(directory, file)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function isCopyableSource(file, source, entryFile) {
  const relative = path.relative(source, file)
  if (file === entryFile) return false
  if (/WebPart\.manifest(?: copy)?\.json$/i.test(file)) return false
  return !/(?:^|\/)(?:lib|dist|temp|node_modules|\.git)(?:\/|$)/.test(toPosix(relative))
}

function copyResourceDirectories(source, target) {
  for (const name of ['assets', 'public']) {
    const resource = path.join(source, name)
    if (existsSync(resource) && statSync(resource).isDirectory()) {
      cpSync(resource, path.join(target, name), { recursive: true })
    }
  }
}

function migrateLocalizedResources({
  source,
  target,
  legacyConfig,
  legacySource,
  webpartDirectory,
  diagnostics,
}) {
  const resources = legacyConfig?.localizedResources ?? {}
  const targetSource = path.join(target, 'src')
  for (const [alias, configuredPath] of Object.entries(resources)) {
    if (typeof configuredPath !== 'string') continue
    const legacyPath = configuredPath
      .replace(/^\.\//, '')
      .replace(/^lib\//, 'src/')
      .replace(/\{locale\}/gi, 'en-us')
    const resourceFile = resolveLocalModule(path.join(source, legacyPath))
    if (!resourceFile) {
      addDiagnostic(
        diagnostics,
        'LOCALIZATION_RESOURCE_NOT_FOUND',
        `Could not locate the default locale module for ${alias}: ${configuredPath}.`,
        'config/config.json',
      )
      continue
    }
    const targetFile = isInside(webpartDirectory, resourceFile)
      ? path.join(targetSource, path.relative(webpartDirectory, resourceFile))
      : isInside(legacySource, resourceFile)
        ? path.join(targetSource, path.relative(legacySource, resourceFile))
        : undefined
    if (!targetFile || !existsSync(targetFile)) {
      addDiagnostic(
        diagnostics,
        'LOCALIZATION_RESOURCE_OUTSIDE_SOURCE',
        `The localization module for ${alias} is outside the migrated source tree.`,
        path.relative(source, resourceFile),
      )
      continue
    }
    if (!convertAmdLocaleToEsm(targetFile)) {
      addDiagnostic(
        diagnostics,
        'LOCALIZATION_FORMAT',
        `The ${alias} locale module is not the standard SPFx AMD resource shape and was left unchanged.`,
        path.relative(target, targetFile),
      )
      continue
    }

    for (const importer of findFiles(targetSource, (candidate) =>
      /\.[cm]?[jt]sx?$/.test(candidate),
    )) {
      let contents = readFileSync(importer, 'utf8')
      const modulePath = relativeModulePath(importer, targetFile)
      const quotedAlias = escapeRegExp(alias)
      const namespacePattern = new RegExp(
        `import\\s+\\*\\s+as\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['"]${quotedAlias}['"]\\s*;?`,
        'g',
      )
      const importEqualsPattern = new RegExp(
        `import\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*require\\(\\s*['"]${quotedAlias}['"]\\s*\\)\\s*;?`,
        'g',
      )
      const defaultPattern = new RegExp(
        `(import\\s+[A-Za-z_$][\\w$]*\\s+from\\s+)['"]${quotedAlias}['"]`,
        'g',
      )
      contents = contents
        .replace(
          namespacePattern,
          (_statement, binding) => `import ${binding} from '${modulePath}';`,
        )
        .replace(
          importEqualsPattern,
          (_statement, binding) => `import ${binding} from '${modulePath}';`,
        )
        .replace(defaultPattern, `$1'${modulePath}'`)
      if (new RegExp(`['"]${quotedAlias}['"]`).test(contents)) {
        addDiagnostic(
          diagnostics,
          'LOCALIZATION_IMPORT_SHAPE',
          `An import of ${alias} does not use a standard namespace, default, or import-equals form and was not rewritten.`,
          path.relative(target, importer),
        )
      }
      writeFileSync(importer, contents)
    }
  }
}

function convertAmdLocaleToEsm(file) {
  const contents = readFileSync(file, 'utf8')
  if (/\bexport\s+default\b/.test(contents)) return true
  const match = contents.match(
    /^\s*define\s*\(\s*\[\s*\]\s*,\s*function\s*\(\s*\)\s*\{\s*return\s+([\s\S]*?)\s*;\s*\}\s*\)\s*;?\s*$/,
  )
  if (!match) return false
  writeFileSync(file, `const strings = ${match[1].trim()}\n\nexport default strings\n`)
  return true
}

function modernizeCopiedSources(directory) {
  for (const file of findFiles(directory, (candidate) => /\.[cm]?[jt]sx?$/.test(candidate))) {
    let contents = readFileSync(file, 'utf8')
    contents = contents.replace(
      /import\s+(type\s+)?\{([^}]+)\}\s*from\s*['"]@microsoft\/sp-webpart-base['"]\s*;?/g,
      (statement, importType, bindings) =>
        migrateNamedBindings({
          statement,
          importType,
          bindings,
          selected: new Set(['WebPartContext']),
          selectedModule: 'spve/context',
          originalModule: '@microsoft/sp-webpart-base',
          forceSelectedTypes: new Set(['WebPartContext']),
        }),
    )
    contents = contents.replace(
      /import\s+(type\s+)?\{([^}]+)\}\s*from\s*['"]@microsoft\/sp-http['"]\s*;?/g,
      (statement, importType, bindings) =>
        migrateNamedBindings({
          statement,
          importType,
          bindings,
          selected: SPVE_CONTEXT_EXPORTS,
          selectedModule: 'spve/context',
          originalModule: '@microsoft/sp-http',
          forceSelectedTypes: new Set([
            'HttpClientResponse',
            'IHttpClientOptions',
            'ISPHttpClientOptions',
            'SPHttpClientResponse',
          ]),
        }),
    )
    contents = transformStaticAssetRequires(contents, file)
    writeFileSync(file, contents)
  }
  for (const file of findFiles(directory, (candidate) => /\.s[ac]ss$/i.test(candidate))) {
    const contents = readFileSync(file, 'utf8').replace(/(["'])~(?=[@a-z])/g, '$1')
    writeFileSync(file, contents)
  }
  markProjectTypeImports(directory)
}

function migrateNamedBindings({
  statement,
  importType,
  bindings,
  selected,
  selectedModule,
  originalModule,
  forceSelectedTypes,
}) {
  const parsed = bindings
    .split(',')
    .map((binding) => binding.trim())
    .filter(Boolean)
    .map((text) => ({
      text: text.replace(/^type\s+/, ''),
      typeOnly: Boolean(importType) || text.startsWith('type '),
      imported: text.replace(/^type\s+/, '').split(/\s+as\s+/)[0],
    }))
  const moved = parsed.filter((binding) => selected.has(binding.imported))
  if (moved.length === 0) return statement
  const kept = parsed.filter((binding) => !selected.has(binding.imported))
  const format = (binding, forcedTypes) =>
    binding.typeOnly || forcedTypes.has(binding.imported) ? `type ${binding.text}` : binding.text
  return [
    moved.length
      ? `import { ${moved.map((binding) => format(binding, forceSelectedTypes)).join(', ')} } from '${selectedModule}';`
      : '',
    kept.length
      ? `import { ${kept.map((binding) => format(binding, new Set())).join(', ')} } from '${originalModule}';`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function transformStaticAssetRequires(contents, importer) {
  const generated = []
  let index = 0
  const transformed = contents.replace(
    /\brequire\(\s*(['"])(\.\.?\/[^'"]+)\1\s*\)(?:\.default)?/g,
    (statement, _quote, module) => {
      const suffixIndex = module.search(/[?#]/)
      const pathname = suffixIndex < 0 ? module : module.slice(0, suffixIndex)
      const resolved = resolveLocalModule(path.resolve(path.dirname(importer), pathname))
      if (!resolved || !STATIC_ASSET_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
        return statement
      }
      if (/\.(?:css|s[ac]ss)$/i.test(resolved) && !/\.module\.(?:css|s[ac]ss)$/i.test(resolved)) {
        generated.push(`import '${module}';`)
        return 'undefined'
      }
      const binding = `__migratedAsset${index++}`
      generated.push(`import ${binding} from '${module}';`)
      return binding
    },
  )
  return generated.length > 0 ? `${generated.join('\n')}\n${transformed}` : transformed
}

function markProjectTypeImports(directory) {
  const files = findFiles(directory, (candidate) => /\.[cm]?tsx?$/.test(candidate))
  if (files.length === 0) return
  const program = ts.createProgram(files, {
    allowJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
  })
  const checker = program.getTypeChecker()
  for (const file of files) {
    const sourceFile = program.getSourceFile(file)
    if (!sourceFile) continue
    const insertions = []
    const consider = (specifier) => {
      if (specifier.isTypeOnly) return
      let symbol = checker.getSymbolAtLocation(specifier.propertyName ?? specifier.name)
      if (!symbol) return
      if (symbol.flags & ts.SymbolFlags.Alias) {
        try {
          symbol = checker.getAliasedSymbol(symbol)
        } catch {
          return
        }
      }
      if ((symbol.flags & ts.SymbolFlags.Value) === 0) {
        insertions.push(specifier.getStart(sourceFile))
      }
    }
    for (const statement of sourceFile.statements) {
      if (
        ts.isImportDeclaration(statement) &&
        statement.importClause &&
        !statement.importClause.isTypeOnly &&
        statement.importClause.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        statement.importClause.namedBindings.elements.forEach(consider)
      } else if (
        ts.isExportDeclaration(statement) &&
        !statement.isTypeOnly &&
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause)
      ) {
        statement.exportClause.elements.forEach(consider)
      }
    }
    if (insertions.length === 0) continue
    let contents = readFileSync(file, 'utf8')
    for (const position of insertions.sort((left, right) => right - left)) {
      contents = `${contents.slice(0, position)}type ${contents.slice(position)}`
    }
    writeFileSync(file, contents)
  }
}

function resolveLocalModule(module) {
  for (const candidate of [
    module,
    ...SOURCE_EXTENSIONS.map((extension) => `${module}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(module, `index${extension}`)),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
}

function relativeModulePath(importer, dependency) {
  let relative = toPosix(path.relative(path.dirname(importer), dependency))
  if (!relative.startsWith('.')) relative = `./${relative}`
  return relative
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function configureMigratedTypeScript(target) {
  const file = path.join(target, 'tsconfig.json')
  const config = readJson(file, 'generated tsconfig.json')
  Object.assign(config.compilerOptions, {
    allowJs: true,
    checkJs: false,
    erasableSyntaxOnly: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
    resolveJsonModule: true,
  })
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`)
}

function validateMigratedSources(directory, diagnostics) {
  const seen = new Set()
  const reportOnce = (code, message, file, severity) => {
    const key = `${code}:${file}:${message}`
    if (seen.has(key)) return
    seen.add(key)
    addDiagnostic(diagnostics, code, message, path.relative(directory, file), severity)
  }
  for (const file of findFiles(directory, (candidate) => /\.[cm]?[jt]sx?$/.test(candidate))) {
    const contents = readFileSync(file, 'utf8')
    const sourceFile = ts.createSourceFile(
      file,
      contents,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    for (const diagnostic of sourceFile.parseDiagnostics) {
      reportOnce(
        'TYPESCRIPT_PARSE_ERROR',
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        file,
        'error',
      )
    }
    for (const module of moduleSpecifiers(contents, file)) {
      if (module.startsWith('.')) {
        const clean = module.split(/[?#]/)[0]
        if (!resolveLocalModule(path.resolve(path.dirname(file), clean))) {
          reportOnce(
            'UNRESOLVED_RELATIVE_IMPORT',
            `Cannot resolve relative module ${module}.`,
            file,
            'error',
          )
        }
        continue
      }
      const packageName = packageNameFromModule(module)
      if (packageName.startsWith('@microsoft/sp-')) {
        reportOnce(
          'REMAINING_SPFX_RUNTIME_IMPORT',
          `${module} is still imported. It has no universally safe SPVE replacement and requires review.`,
          file,
        )
      }
      const builtin = module.replace(/^node:/, '').split('/')[0]
      if (builtinModules.includes(builtin)) {
        reportOnce(
          'NODE_BUILTIN_IMPORT',
          `${module} is a Node.js built-in and is not available in browsers without an application-specific replacement.`,
          file,
        )
      }
    }
    if (/\brequire\s*\(/.test(contents)) {
      reportOnce(
        'COMMONJS_REQUIRE',
        'A CommonJS require() call remains. Package interop or dynamic loading semantics cannot be converted safely without application knowledge.',
        file,
      )
    }
  }
}

function writeMigrationReport(target, diagnostics) {
  const grouped = diagnostics.length
    ? diagnostics
        .map(
          (item) =>
            `- **${item.severity.toUpperCase()} ${item.code}**${item.file ? ` — \`${item.file}\`` : ''}\n  ${item.message}`,
        )
        .join('\n')
    : '- No review items were detected by the static migration checks.'
  writeFileSync(
    path.join(target, 'MIGRATION.md'),
    `# Migration report

This project was mechanically migrated from SPFx to SPVE. The migrator only applies transformations
that are structurally recognizable and intended to preserve behavior across projects.

## Applied general transformations

- Generated the current \`create-sp\` React scaffold and declarative \`src/main.ts\`.
- Flattened the selected web part into a conventional \`src/\` application tree and rebased paths.
- Adapted the standard \`ReactDOM.render(element, this.domElement)\` host boundary.
- Mapped standard SharePoint context and HTTP types to \`spve/context\`.
- Converted compiler-proven type-only imports and exports for \`verbatimModuleSyntax\`.
- Converted standard SPFx localization aliases and AMD locale resources to ESM when present.
- Vendored statically referenced project assets outside \`src/\` without importing ancillary folders at runtime.
- Reconciled dependencies with the current React/SPVE/Vite+ template and removed unused SPFx build tooling.
- Enabled migration-compatible TypeScript settings for legacy JavaScript, JSON modules, and erasable syntax.

## Review items

${grouped}
`,
  )
}

function toPosix(value) {
  return value.split(path.sep).join('/')
}

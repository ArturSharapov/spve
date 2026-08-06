import { createHash, randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const template = fileURLToPath(new URL('./template/webpart', import.meta.url))
const stateVersion = 1

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function kebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function propertyControl(property) {
  if (property.control) return property.control.type
  if (property.type === 'string') return 'text'
  if (property.type === 'number') return 'slider'
  if (property.type === 'boolean') return 'toggle'
  return 'none'
}

function optionValue(option) {
  return option?.value
}

function isJsonValue(value, ancestors = new Set()) {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'object' || ancestors.has(value)) return false
  if (!Array.isArray(value)) {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
  }
  ancestors.add(value)
  const valid = Array.isArray(value)
    ? value.every((entry) => isJsonValue(entry, ancestors))
    : Object.values(value).every((entry) => isJsonValue(entry, ancestors))
  ancestors.delete(value)
  return valid
}

function validateOptions(name, property, control) {
  const settings = property.control
  if (!Array.isArray(settings.options) || settings.options.length === 0) {
    throw new Error(`SPVE: ${control} property ${JSON.stringify(name)} needs at least one option`)
  }
  const values = settings.options.map(optionValue)
  if (values.length === 0) {
    throw new Error(`SPVE: ${control} property ${JSON.stringify(name)} needs a value option`)
  }
  if (
    values.some(
      (value) =>
        typeof value !== property.type || (property.type === 'number' && !Number.isFinite(value)),
    )
  ) {
    throw new Error(
      `SPVE: every value option for property ${JSON.stringify(name)} must be a ${property.type}`,
    )
  }
  if (new Set(values).size !== values.length) {
    throw new Error(`SPVE: option values for property ${JSON.stringify(name)} must be unique`)
  }
  if (property.default !== undefined && !values.includes(property.default)) {
    throw new Error(`SPVE: default value for property ${JSON.stringify(name)} must be an option`)
  }
  if (control === 'dropdown') {
    for (const option of settings.options) {
      if (!option || typeof option !== 'object' || optionValue(option) === undefined) {
        throw new Error(`SPVE: dropdown property ${JSON.stringify(name)} has an invalid option`)
      }
    }
    if (
      settings.calloutMaxHeight !== undefined &&
      (!Number.isFinite(settings.calloutMaxHeight) || settings.calloutMaxHeight <= 0)
    ) {
      throw new Error(
        `SPVE: calloutMaxHeight for property ${JSON.stringify(name)} must be positive`,
      )
    }
  }
  if (control === 'choiceGroup') {
    for (const option of settings.options) {
      if (!option || typeof option !== 'object' || optionValue(option) === undefined) {
        throw new Error(
          `SPVE: choiceGroup options for property ${JSON.stringify(name)} must declare value and label`,
        )
      }
      if (!option.label) {
        throw new Error(
          `SPVE: choiceGroup option for property ${JSON.stringify(name)} needs a label`,
        )
      }
      if (
        option.imageSize &&
        (!Number.isFinite(option.imageSize.width) ||
          option.imageSize.width <= 0 ||
          !Number.isFinite(option.imageSize.height) ||
          option.imageSize.height <= 0)
      ) {
        throw new Error(
          `SPVE: choiceGroup imageSize for property ${JSON.stringify(name)} must be positive`,
        )
      }
    }
  }
}

function propertyType(name, property) {
  const controls = {
    string: new Set(['text', 'dropdown', 'choiceGroup']),
    number: new Set(['slider', 'dropdown', 'choiceGroup']),
    boolean: new Set(['toggle', 'checkbox']),
    json: new Set(['none']),
  }
  if (!Object.hasOwn(controls, property.type)) {
    throw new Error(`SPVE: property ${JSON.stringify(name)} has unsupported type ${property.type}`)
  }

  const control = propertyControl(property)
  if (!controls[property.type].has(control)) {
    throw new Error(
      `SPVE: control ${JSON.stringify(control)} is not valid for ${property.type} property ${JSON.stringify(name)}`,
    )
  }
  if (property.default !== undefined) {
    const valid =
      property.type === 'json'
        ? isJsonValue(property.default)
        : typeof property.default === property.type &&
          (property.type !== 'number' || Number.isFinite(property.default))
    if (!valid) {
      throw new Error(
        `SPVE: default value for property ${JSON.stringify(name)} must be ${property.type === 'json' ? 'JSON-compatible' : `a ${property.type}`}`,
      )
    }
  }
  if (property.required && property.default === undefined) {
    throw new Error(`SPVE: required property ${JSON.stringify(name)} must declare a default value`)
  }

  if (control === 'dropdown' || control === 'choiceGroup') validateOptions(name, property, control)
  if (control === 'slider') {
    const settings = property.control ?? {}
    const min = settings.min ?? 0
    const max = settings.max ?? 100
    const step = settings.step ?? 1
    if (![min, max, step].every(Number.isFinite) || min >= max || step <= 0) {
      throw new Error(
        `SPVE: slider property ${JSON.stringify(name)} requires finite min < max and step > 0`,
      )
    }
    if (property.default !== undefined && (property.default < min || property.default > max)) {
      throw new Error(
        `SPVE: default value for property ${JSON.stringify(name)} is outside its range`,
      )
    }
  }
  if (control === 'text') {
    const settings = property.control ?? {}
    if (
      settings.maxLength !== undefined &&
      (!Number.isInteger(settings.maxLength) || settings.maxLength < 0)
    ) {
      throw new Error(`SPVE: maxLength for property ${JSON.stringify(name)} must be non-negative`)
    }
    if (
      settings.rows !== undefined &&
      (!settings.multiline || !Number.isInteger(settings.rows) || settings.rows < 1)
    ) {
      throw new Error(
        `SPVE: rows for property ${JSON.stringify(name)} requires multiline and a positive integer`,
      )
    }
  }
  return property.type
}

function jsonTsType(value) {
  if (value === undefined) return 'unknown'
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    const entries = [...new Set(value.map(jsonTsType))]
    return entries.length ? `(${entries.join(' | ')})[]` : 'unknown[]'
  }
  if (typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([key, entry]) => `${JSON.stringify(key)}: ${jsonTsType(entry)}`)
      .join('; ')} }`
  }
  return typeof value
}

function propertyTsType(name, property) {
  propertyType(name, property)
  const control = propertyControl(property)
  if (control === 'dropdown' || control === 'choiceGroup') {
    return property.control.options
      .map(optionValue)
      .filter((value) => value !== undefined)
      .map(JSON.stringify)
      .join(' | ')
  }
  if (property.type === 'json') return jsonTsType(property.default)
  return property.type
}

export function normalizeConfig(config) {
  if (!config.dev?.siteUrl) {
    throw new Error('SPVE: dev.siteUrl is required in spve.config.ts')
  }
  try {
    const siteUrl = new URL(config.dev.siteUrl)
    if (siteUrl.protocol !== 'https:') throw new Error()
  } catch {
    throw new Error('SPVE: dev.siteUrl must be a valid https:// SharePoint site URL')
  }

  const configuredProperties = config.webpart?.properties
  const properties = configuredProperties ?? {
    description: {
      type: 'string',
      label: 'Description',
      default: config.description ?? '',
      control: {
        type: 'text',
        multiline: true,
      },
    },
  }

  for (const [name, property] of Object.entries(properties)) {
    if (!property || typeof property !== 'object') {
      throw new Error(`SPVE: property ${JSON.stringify(name)} must be an object`)
    }
    propertyType(name, property)
  }

  return {
    ...config,
    webpart: {
      icon: 'Page',
      group: 'Advanced',
      groupId: '5c03119e-3074-46fd-976b-c60198311f70',
      supportedHosts: ['SharePointWebPart'],
      supportsThemeVariants: true,
      requiresCustomScript: false,
      ...config.webpart,
      properties,
    },
    solution: {
      includeClientSideAssets: true,
      skipFeatureDeployment: true,
      permissions: [],
      ...config.solution,
    },
  }
}

function readTemplate(directory = template, prefix = '', files = new Map()) {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    const relative = path.posix.join(prefix, entry)
    if (statSync(file).isDirectory()) readTemplate(file, relative, files)
    else files.set(relative, readFileSync(file, 'utf8'))
  }
  return files
}

function propertyPaneSource(properties) {
  const imports = new Set(['type IPropertyPaneConfiguration'])
  const fields = []

  for (const [name, property] of Object.entries(properties)) {
    const label = property.label ?? name
    const control = propertyControl(property)
    const settings = property.control ?? {}
    if (control === 'none') continue

    if (control === 'toggle') {
      imports.add('PropertyPaneToggle')
      fields.push(
        `PropertyPaneToggle(${JSON.stringify(name)}, ${JSON.stringify({
          label,
          onText: settings.onText,
          offText: settings.offText,
          onAriaLabel: settings.onAriaLabel,
          offAriaLabel: settings.offAriaLabel,
          ariaLabel: settings.ariaLabel,
          disabled: settings.disabled,
          inlineLabel: settings.inlineLabel,
        })})`,
      )
    } else if (control === 'checkbox') {
      imports.add('PropertyPaneCheckbox')
      fields.push(
        `PropertyPaneCheckbox(${JSON.stringify(name)}, ${JSON.stringify({
          text: label,
          ariaLabel: settings.ariaLabel,
          disabled: settings.disabled,
        })})`,
      )
    } else if (control === 'slider') {
      imports.add('PropertyPaneSlider')
      fields.push(
        `PropertyPaneSlider(${JSON.stringify(name)}, ${JSON.stringify({
          label,
          min: settings.min ?? 0,
          max: settings.max ?? 100,
          step: settings.step ?? 1,
          showValue: settings.showValue,
          ariaLabel: settings.ariaLabel,
          disabled: settings.disabled,
        })})`,
      )
    } else if (control === 'dropdown') {
      imports.add('PropertyPaneDropdown')
      const options = settings.options.flatMap((option, index) => {
        const entries = []
        if (option.header) {
          entries.push({ key: `__spve_header_${index}`, text: option.header, type: 2 })
        }
        if (option.dividerBefore) {
          entries.push({ key: `__spve_divider_before_${index}`, text: '', type: 1 })
        }
        entries.push({ key: option.value, text: option.label ?? String(option.value) })
        if (option.dividerAfter) {
          entries.push({ key: `__spve_divider_after_${index}`, text: '', type: 1 })
        }
        return entries
      })
      fields.push(
        `PropertyPaneDropdown(${JSON.stringify(name)}, ${JSON.stringify({
          label,
          options,
          disabled: settings.disabled,
          ariaDescription: settings.ariaDescription,
          ariaLabel: settings.ariaLabel,
          ariaPositionInSet: settings.ariaPositionInSet,
          ariaSetSize: settings.ariaSetSize,
          calloutProps:
            settings.calloutMaxHeight === undefined
              ? undefined
              : { calloutMaxHeight: settings.calloutMaxHeight },
        })})`,
      )
    } else if (control === 'choiceGroup') {
      imports.add('PropertyPaneChoiceGroup')
      const options = settings.options.map((option) => ({
        key: option.value,
        text: option.label,
        iconProps: option.icon ? { officeFabricIconFontName: option.icon } : undefined,
        imageSrc: option.imageSrc,
        selectedImageSrc: option.selectedImageSrc,
        imageAlt: option.imageAlt,
        imageSize: option.imageSize,
        disabled: option.disabled,
        ariaLabel: option.ariaLabel,
      }))
      fields.push(
        `PropertyPaneChoiceGroup(${JSON.stringify(name)}, ${JSON.stringify({ label, options })})`,
      )
    } else {
      imports.add('PropertyPaneTextField')
      fields.push(
        `PropertyPaneTextField(${JSON.stringify(name)}, ${JSON.stringify({
          label,
          description: settings.description,
          multiline: settings.multiline,
          readOnly: settings.readOnly,
          resizable: settings.resizable,
          underlined: settings.underlined,
          placeholder: settings.placeholder,
          disabled: settings.disabled,
          rows: settings.rows,
          maxLength: settings.maxLength,
          errorMessage: settings.errorMessage,
          deferredValidationTime: settings.deferredValidationTime,
          validateOnFocusIn: settings.validateOnFocusIn,
          validateOnFocusOut: settings.validateOnFocusOut,
          ariaLabel: settings.ariaLabel,
          logName: settings.logName,
        })})`,
      )
    }
  }

  return {
    imports: `import { ${[...imports].join(', ')} } from '@microsoft/sp-property-pane'`,
    fields: fields.map((field) => `                ${field},`).join('\n'),
    type: Object.entries(properties)
      .map(
        ([name, property]) =>
          `  ${JSON.stringify(name)}${property.required ? '' : '?'}: ${propertyTsType(name, property)}`,
      )
      .join('\n'),
  }
}

function generatedClientTypes(properties) {
  const members = Object.entries(properties)
    .map(
      ([name, property]) =>
        `    ${JSON.stringify(name)}${property.required ? '' : '?'}: ${propertyTsType(name, property)}`,
    )
    .join('\n')
  return `export {}\n\ndeclare global {\n  interface SpveAppProps {\n${members}\n  }\n}\n`
}

function generatedFiles(config) {
  const normalized = normalizeConfig(config)
  const files = readTemplate()
  const name = kebabCase(normalized.name)
  const pascal = name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  const pane = propertyPaneSource(normalized.webpart.properties)

  const sourceName = 'src/webparts/spve/SpveWebPart.ts'
  files.set(
    sourceName,
    files
      .get(sourceName)
      .replace('/* __SPVE_PROPERTY_PANE_IMPORTS__ */', pane.imports)
      .replace('/* __SPVE_PROPERTIES_TYPE__ */', pane.type)
      .replace('/* __SPVE_PROPERTY_FIELDS__ */', pane.fields),
  )

  const manifestName = 'src/webparts/spve/SpveWebPart.manifest.json'
  const manifest = JSON.parse(files.get(manifestName))
  const entry = manifest.preconfiguredEntries[0]
  manifest.id = normalized.ids.component
  manifest.alias = `${pascal}WebPart`
  manifest.requiresCustomScript = normalized.webpart.requiresCustomScript
  manifest.supportedHosts = normalized.webpart.supportedHosts
  manifest.supportsThemeVariants = normalized.webpart.supportsThemeVariants
  entry.groupId = normalized.webpart.groupId
  entry.group.default = normalized.webpart.group
  entry.title.default = normalized.title
  entry.description.default = normalized.description ?? ''
  entry.officeFabricIconFontName = normalized.webpart.icon
  entry.properties = Object.fromEntries(
    Object.entries(normalized.webpart.properties).map(([propertyName, property]) => [
      propertyName,
      property.default,
    ]),
  )
  files.set(manifestName, json(manifest))

  const buildName = 'config/config.json'
  const build = JSON.parse(files.get(buildName))
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
  files.set(buildName, json(build))

  const packageName = 'config/package-solution.json'
  const solution = JSON.parse(files.get(packageName))
  const version = normalized.version.split('-')[0].split('.')
  const spfxVersion = [...version, ...Array(4 - version.length).fill('0')].join('.')
  solution.solution.name = `${name}-client-side-solution`
  solution.solution.id = normalized.ids.solution
  solution.solution.version = spfxVersion
  solution.solution.includeClientSideAssets = normalized.solution.includeClientSideAssets
  solution.solution.skipFeatureDeployment = normalized.solution.skipFeatureDeployment
  solution.solution.metadata.shortDescription.default = normalized.description ?? ''
  solution.solution.metadata.longDescription.default = normalized.description ?? ''
  solution.solution.features[0].id = normalized.ids.feature
  solution.solution.features[0].title = `${normalized.title} feature`
  solution.solution.features[0].description = `Activates the ${normalized.title} solution.`
  if (normalized.solution.permissions.length) {
    solution.solution.webApiPermissionRequests = normalized.solution.permissions
  } else {
    delete solution.solution.webApiPermissionRequests
  }
  solution.paths.zippedPackage = `solution/${name}.sppkg`
  files.set(packageName, json(solution))

  const serveName = 'config/serve.json'
  const serve = JSON.parse(files.get(serveName))
  serve.port = normalized.dev.spfxPort
  serve.initialPage = `${normalized.dev.siteUrl.replace(/\/$/, '')}/_layouts/15/workbench.aspx`
  files.set(serveName, json(serve))

  files.set(
    'config/spve.json',
    json({
      vitePort: normalized.dev.vitePort,
      spfxPort: normalized.dev.spfxPort,
    }),
  )

  const packageJsonName = 'package.json'
  const packageJson = JSON.parse(files.get(packageJsonName))
  packageJson.name = `${name}-webpart`
  packageJson.version = normalized.version
  files.set(packageJsonName, json(packageJson))

  return {
    files: new Map([
      ...[...files].map(([relative, contents]) => [`webpart/${relative}`, contents]),
      ['types.d.ts', generatedClientTypes(normalized.webpart.properties)],
    ]),
    normalized,
  }
}

function fingerprint(files) {
  const hash = createHash('sha256')
  for (const [name, contents] of [...files].sort(([left], [right]) => left.localeCompare(right))) {
    hash.update(name)
    hash.update('\0')
    hash.update(contents)
    hash.update('\0')
  }
  return hash.digest('hex')
}

function writeIfChanged(file, contents) {
  if (existsSync(file) && readFileSync(file, 'utf8') === contents) return false
  mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.tmp-${process.pid}-${randomUUID()}`
  try {
    writeFileSync(temporary, contents)
    renameSync(temporary, file)
  } finally {
    rmSync(temporary, { force: true })
  }
  return true
}

export function prepareWebpart(root, config) {
  const generatedRoot = path.join(root, '.spve')
  const stateFile = path.join(generatedRoot, 'state.json')
  const generated = generatedFiles(config)
  const scaffold = fingerprint(generated.files)
  let previous = {}
  try {
    previous = readJson(stateFile)
  } catch {}

  const complete = [...generated.files].every(([relative, contents]) => {
    const file = path.join(generatedRoot, relative)
    return existsSync(file) && readFileSync(file, 'utf8') === contents
  })
  if (previous.version === stateVersion && previous.scaffold === scaffold && complete) {
    return path.join(generatedRoot, 'webpart')
  }

  const currentFiles = new Set(generated.files.keys())
  for (const relative of previous.files ?? []) {
    if (!currentFiles.has(relative)) rmSync(path.join(generatedRoot, relative), { force: true })
  }
  for (const [relative, contents] of generated.files) {
    writeIfChanged(path.join(generatedRoot, relative), contents)
  }
  writeIfChanged(
    stateFile,
    json({
      version: stateVersion,
      scaffold,
      toolchain: previous.toolchain,
      files: [...generated.files.keys()].sort((left, right) => left.localeCompare(right)),
    }),
  )
  return path.join(generatedRoot, 'webpart')
}

export async function loadSpveConfig(root) {
  const file = path.join(root, 'spve.config.ts')
  let modified
  try {
    modified = statSync(file).mtimeMs
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`SPVE: missing ${file}`)
    throw error
  }

  const url = pathToFileURL(file)
  url.searchParams.set('modified', String(modified))
  const loaded = await import(url.href)
  if (!loaded.default || typeof loaded.default !== 'object') {
    throw new Error('SPVE: spve.config.ts must export a default configuration object')
  }
  return loaded.default
}

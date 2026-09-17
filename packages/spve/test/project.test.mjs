import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, test } from 'vite-plus/test'
import { normalizeConfig, prepareWebpart } from '../project.mjs'

function projectConfig() {
  return {
    name: 'typed-app',
    title: 'Typed app',
    description: 'Typed test web part',
    version: '0.0.1',
    ids: {
      component: '39908337-094d-40b3-bc37-609b0e147506',
      solution: 'c5e8c86b-015b-4840-afeb-49934392ff74',
      feature: '4dc044a7-f530-489c-aaf4-67eedf70b1ae',
    },
    webpart: {
      alias: 'TypedLegacyWebpart',
      supportsFullBleed: true,
      properties: {
        description: {
          type: 'string',
          label: 'Description',
          control: {
            type: 'text',
            multiline: true,
            rows: 4,
            placeholder: 'Describe this web part',
            maxLength: 200,
          },
        },
        count: {
          type: 'number',
          label: 'Count',
          default: 3,
          required: true,
          control: {
            type: 'slider',
            min: 0,
            max: 10,
            showValue: true,
          },
        },
        enabled: {
          type: 'boolean',
          label: 'Enabled',
          default: true,
          control: {
            type: 'toggle',
            onText: 'On',
            offText: 'Off',
          },
        },
        color: {
          type: 'string',
          label: 'Color',
          default: 'blue',
          control: {
            type: 'choiceGroup',
            options: [
              { value: 'blue', label: 'Blue', icon: 'Color' },
              { value: 'red', label: 'Red', disabled: true },
            ],
          },
        },
        category: {
          type: 'string',
          label: 'Category',
          default: 'news',
          control: {
            type: 'dropdown',
            options: [
              { value: 'news', label: 'News', header: 'Content' },
              { value: 'events', dividerBefore: true },
            ],
            calloutMaxHeight: 320,
          },
        },
        columns: {
          type: 'number',
          label: 'Columns',
          default: 2,
          control: {
            type: 'dropdown',
            options: [{ value: 1 }, { value: 2, label: 'Two' }, { value: 3 }],
          },
        },
        archived: {
          type: 'boolean',
          label: 'Archived',
          default: false,
          control: { type: 'checkbox' },
        },
        settings: {
          type: 'json',
          default: { layout: 'cards', tags: ['featured'], paging: { enabled: true, size: 10 } },
          required: true,
        },
      },
    },
    solution: {
      permissions: [{ resource: 'Microsoft Graph', scope: 'User.Read' }],
    },
    dev: {
      siteUrl: 'https://contoso.sharepoint.com/sites/example',
      vitePort: 17641,
      spfxPort: 17642,
    },
  }
}

test('generates typed properties and only rewrites changed generated files', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'spve-project-'))
  const config = projectConfig()

  try {
    prepareWebpart(root, config)

    const client = path.join(root, '.spve/types.d.ts')
    const source = path.join(root, '.spve/webpart/src/webparts/spve/SpveWebPart.ts')
    const manifestFile = path.join(
      root,
      '.spve/webpart/src/webparts/spve/SpveWebPart.manifest.json',
    )
    const solutionFile = path.join(root, '.spve/webpart/config/package-solution.json')
    const unchangedFile = path.join(root, '.spve/webpart/config/rig.json')
    const stateFile = path.join(root, '.spve/state.json')

    const declarations = readFileSync(client, 'utf8')
    assert.match(declarations, /"description"\?: string/)
    assert.match(declarations, /"count": number/)
    assert.match(declarations, /"enabled"\?: boolean/)
    assert.match(declarations, /"color"\?: "blue" \| "red"/)
    assert.match(declarations, /"category"\?: "news" \| "events"/)
    assert.match(declarations, /"columns"\?: 1 \| 2 \| 3/)
    assert.match(declarations, /"archived"\?: boolean/)
    assert.match(
      declarations,
      /"settings": \{ "layout": string; "tags": \(string\)\[\]; "paging": \{ "enabled": boolean; "size": number \} \}/,
    )

    const webpart = readFileSync(source, 'utf8')
    assert.match(webpart, /PropertyPaneTextField\("description"/)
    assert.match(webpart, /PropertyPaneSlider\("count"/)
    assert.match(webpart, /PropertyPaneToggle\("enabled"/)
    assert.match(webpart, /PropertyPaneChoiceGroup\("color"/)
    assert.match(webpart, /PropertyPaneDropdown\("category"/)
    assert.match(webpart, /PropertyPaneDropdown\("columns"/)
    assert.match(webpart, /PropertyPaneCheckbox\("archived"/)
    assert.doesNotMatch(webpart, /PropertyPane\w+\("settings"/)
    assert.match(webpart, /"rows":4/)
    assert.match(webpart, /"calloutMaxHeight":320/)

    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
    assert.equal(manifest.alias, 'TypedLegacyWebpart')
    assert.equal(manifest.supportsFullBleed, true)
    assert.deepEqual(manifest.preconfiguredEntries[0].properties, {
      count: 3,
      enabled: true,
      color: 'blue',
      category: 'news',
      columns: 2,
      archived: false,
      settings: { layout: 'cards', tags: ['featured'], paging: { enabled: true, size: 10 } },
    })
    const solution = JSON.parse(readFileSync(solutionFile, 'utf8'))
    assert.deepEqual(solution.solution.webApiPermissionRequests, [
      { resource: 'Microsoft Graph', scope: 'User.Read' },
    ])

    const old = new Date(1_600_000_000_000)
    utimesSync(client, old, old)
    utimesSync(unchangedFile, old, old)
    utimesSync(stateFile, old, old)
    prepareWebpart(root, config)
    assert.equal(statSync(client).mtimeMs, old.getTime())
    assert.equal(statSync(unchangedFile).mtimeMs, old.getTime())
    assert.equal(statSync(stateFile).mtimeMs, old.getTime())

    const generatedSource = readFileSync(source, 'utf8')
    writeFileSync(source, '// manually changed\n')
    prepareWebpart(root, config)
    assert.equal(readFileSync(source, 'utf8'), generatedSource)
    assert.equal(statSync(unchangedFile).mtimeMs, old.getTime())

    config.webpart.properties.subtitle = { type: 'string', label: 'Subtitle' }
    prepareWebpart(root, config)
    assert.notEqual(statSync(client).mtimeMs, old.getTime())
    assert.equal(statSync(unchangedFile).mtimeMs, old.getTime())
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('property validation', () => {
  test('rejects incompatible defaults and invalid control-specific settings', () => {
    const config = projectConfig()
    config.webpart.properties.count.default = 'three'
    expect(() => normalizeConfig(config)).toThrow(/default value.*count.*number/)

    config.webpart.properties.count.default = 11
    expect(() => normalizeConfig(config)).toThrow(/outside its range/)

    config.webpart.properties.count.default = 3
    config.webpart.properties.category.default = 'missing'
    expect(() => normalizeConfig(config)).toThrow(/must be an option/)
  })
})

test('generates custom editor fields without changing the saved property shape', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'spve-editor-'))
  const config = projectConfig()
  config.webpart.properties.settings.control = { type: 'custom', editor: 'settings' }
  try {
    prepareWebpart(root, config)
    const host = readFileSync(
      path.join(root, '.spve/webpart/src/webparts/spve/SpveWebPart.ts'),
      'utf8',
    )
    expect(host).toContain('this.editorField("settings", "settings", false)')
    const manifest = JSON.parse(
      readFileSync(
        path.join(root, '.spve/webpart/src/webparts/spve/SpveWebPart.manifest.json'),
        'utf8',
      ),
    )
    expect(manifest.preconfiguredEntries[0].properties.settings).toEqual(
      config.webpart.properties.settings.default,
    )
    config.webpart.properties.settings.control.editor = ''
    expect(() => normalizeConfig(config)).toThrow(/needs an editor name/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('orders native pane fields and rejects omitted or duplicate fields', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'spve-pane-'))
  const config = projectConfig()
  config.webpart.properties = { title: { type: 'string' }, enabled: { type: 'boolean' } }
  config.webpart.pane = {
    reactive: false,
    pages: [
      { description: 'Settings', groups: [{ name: 'Display', fields: ['enabled', 'title'] }] },
    ],
  }
  try {
    prepareWebpart(root, config)
    const host = readFileSync(
      path.join(root, '.spve/webpart/src/webparts/spve/SpveWebPart.ts'),
      'utf8',
    )
    expect(host.indexOf('PropertyPaneToggle("enabled"')).toBeLessThan(
      host.indexOf('PropertyPaneTextField("title"'),
    )
    expect(host).toMatch(/disableReactivePropertyChanges\(\): boolean\s*\{\s*return true/)
    config.webpart.pane.pages[0].groups[0].fields = ['title']
    expect(() => normalizeConfig(config)).toThrow(/omits fields: enabled/)
    config.webpart.pane.pages[0].groups[0].fields = ['title', 'title']
    expect(() => normalizeConfig(config)).toThrow(/repeated/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

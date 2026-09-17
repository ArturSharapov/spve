import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test, vi } from 'vite-plus/test'

const require = createRequire(import.meta.url)
const ts = require(require.resolve('typescript', { paths: [require.resolve('vite-plus')] }))
const source = readFileSync(
  new URL('../template/webpart/src/webparts/spve/SpveWebPart.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(
  source.replace('/* __SPVE_PROPERTY_NAMES__ */ []', '["views", "library"]'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  },
).outputText
const exports = {}
new Function('require', 'exports', compiled)((id) => {
  if (id === '@microsoft/sp-webpart-base') return { BaseClientSideWebPart: class {} }
  if (id === '@microsoft/sp-property-pane') return { PropertyPaneFieldType: { Custom: 1 } }
  return {}
}, exports)
const Host = exports.default

test('custom editors retain their mount and dispose independently', () => {
  const host = new Host()
  host.properties = { views: [{ name: 'first' }] }
  host.context = {}
  const instances = []
  const mount = vi.fn(() => {
    const instance = { setProps: vi.fn(), unmount: vi.fn() }
    instances.push(instance)
    return instance
  })
  host.module = { editors: { views: { mount } } }
  const field = host.editorField('views', 'views', false)
  const first = {},
    second = {}
  const change = vi.fn()
  field.properties.onRender(first, undefined, change)
  field.properties.onRender(second, undefined, change)
  field.properties.onRender(first, undefined, change)
  expect(mount).toHaveBeenCalledTimes(2)
  expect(instances[0].setProps).toHaveBeenCalledTimes(1)
  const props = mount.mock.calls[0][0].props
  props.properties.views[0].name = 'draft'
  expect(host.properties.views[0].name).toBe('first')
  props.onChange([], false)
  expect(change).toHaveBeenCalledWith('views', [], false)
  field.properties.onDispose(first)
  field.properties.onDispose(first)
  expect(instances[0].unmount).toHaveBeenCalledTimes(1)
  expect(instances[1].unmount).not.toHaveBeenCalled()
  host.onDispose()
  expect(instances[1].unmount).toHaveBeenCalledTimes(1)
})

test('Apply mode keeps committed values during unrelated renders', async () => {
  vi.useFakeTimers()
  try {
    const host = new Host()
    Object.defineProperty(host, 'disableReactivePropertyChanges', { value: true })
    host.properties = { views: [{ name: 'saved' }], undeclared: 'host only' }
    host.app = { setProps: vi.fn(), unmount: vi.fn() }
    host.onPropertyPaneConfigurationStart()
    host.properties.views[0].name = 'draft'
    host.render()
    await vi.runAllTimersAsync()
    expect(host.app.setProps).toHaveBeenLastCalledWith({ views: [{ name: 'saved' }] })
    host.onAfterPropertyPaneChangesApplied()
    host.render()
    await vi.runAllTimersAsync()
    expect(host.app.setProps).toHaveBeenLastCalledWith({ views: [{ name: 'draft' }] })
    host.properties = { views: [{ name: 'restored by SPFx' }] }
    host.onPropertyPaneConfigurationComplete()
    host.render()
    await vi.runAllTimersAsync()
    expect(host.app.setProps).toHaveBeenLastCalledWith({ views: [{ name: 'restored by SPFx' }] })
  } finally {
    vi.useRealTimers()
  }
})

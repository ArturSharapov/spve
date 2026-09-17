import { expect, test, vi } from 'vite-plus/test'
const pending = vi.hoisted(() => ({ render: vi.fn() }))
vi.mock('@builder.io/qwik/qwikloader.js', () => ({}))
vi.mock('@builder.io/qwik', () => ({
  createContextId: (name) => name,
  noSerialize: (value) => value,
  render: pending.render,
  useContext: vi.fn(),
  jsx: (component, props) => ({ component, props }),
}))
import { defineQwikApp } from '../qwik.mjs'

test('queued Qwik updates preserve matching services and stop after disposal', async () => {
  const dispatchEvent = vi.fn()
  vi.stubGlobal('window', { dispatchEvent })
  try {
    let finish
    pending.render.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const mount = defineQwikApp({}).mount({ element: {}, props: {}, services: { sp: {} } })
    const eventName = pending.render.mock.calls.at(-1)[1].props.eventName
    expect(eventName).toMatch(/^spve[a-z0-9]+$/)
    mount.update({ value: 1 }, { sp: {}, host: { displayMode: 'read' } })
    mount.update({ value: 2 }, { sp: {}, host: { displayMode: 'edit' } })
    const cleanup = vi.fn()
    finish({ cleanup })
    await Promise.resolve()
    expect(
      dispatchEvent.mock.calls.map(([event]) => [
        event.detail.value,
        event.services.host.displayMode,
      ]),
    ).toEqual([
      [1, 'read'],
      [2, 'edit'],
    ])
    mount.setProps({ value: 3 })
    mount.unmount()
    mount.unmount()
    await Promise.resolve()
    expect(dispatchEvent).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(1)
  } finally {
    vi.unstubAllGlobals()
  }
})

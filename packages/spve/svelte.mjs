import { getContext, mount, unmount } from 'svelte'
import { writable } from 'svelte/store'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const spContextKey = Symbol('spve-context')

export function getSpveContext() {
  return getContext(spContextKey)
}

export function defineSvelteApp(component, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const properties = writable({ ...props })
      const instance = mount(component, {
        target: element,
        props: { properties },
        context: new Map([[spContextKey, services.context]]),
      })

      return {
        setProps: (next) => properties.set({ ...next }),
        unmount: () => void unmount(instance),
      }
    },
  }, plugins)
}

import { getContext, mount, unmount } from 'svelte'
import { get, writable } from 'svelte/store'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const spContextKey = Symbol('spve-context')

export function getSpveContext() {
  return get(getServices()).context
}

export function getServices() {
  return getContext(spContextKey)
}

export function defineSvelteApp(component, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const currentServices = writable(services)
        const properties = writable({ ...props })
        const instance = mount(component, {
          target: element,
          props: { properties },
          context: new Map([[spContextKey, currentServices]]),
        })

        return {
          update(next, nextServices) {
            currentServices.set(nextServices)
            properties.set({ ...next })
          },
          setProps: (next) => properties.set({ ...next }),
          unmount: () => void unmount(instance),
        }
      },
    },
    plugins,
  )
}

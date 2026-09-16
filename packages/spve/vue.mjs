import { createApp, h, inject, reactive } from 'vue'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const spContextKey = Symbol('spve-context')

export function useSpveContext() {
  return inject(spContextKey)
}

export function defineVueApp(component, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const state = reactive({ ...props })
      const app = createApp({ render: () => h(component, state) })
      app.provide(spContextKey, services.context)
      app.mount(element)

      return {
        setProps(next) {
          for (const key of Object.keys(state)) {
            if (!(key in next)) delete state[key]
          }
          Object.assign(state, next)
        },
        unmount: () => app.unmount(),
      }
    },
  }, plugins)
}

export default {}

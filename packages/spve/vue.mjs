import { createApp, h, inject, reactive, shallowReactive } from 'vue'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const spContextKey = Symbol('spve-context')

export function useSpveContext() {
  return useServices()?.context
}

export function useServices() {
  return inject(spContextKey)
}

export function defineVueApp(component, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const state = reactive({ ...props })
        const app = createApp({ render: () => h(component, state) })
        const currentServices = shallowReactive({ ...services })
        app.provide(spContextKey, currentServices)
        app.mount(element)

        return {
          update(next, nextServices) {
            for (const key of Object.keys(currentServices))
              if (!(key in nextServices)) delete currentServices[key]
            Object.assign(currentServices, nextServices)
            this.setProps(next)
          },
          setProps(next) {
            for (const key of Object.keys(state)) {
              if (!(key in next)) delete state[key]
            }
            Object.assign(state, next)
          },
          unmount: () => app.unmount(),
        }
      },
    },
    plugins,
  )
}

export default {}

import { applyAppPlugins, initializeSP } from './runtime.mjs'

export function defineVanillaApp(render, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const update = (next) => element.replaceChildren(render(next, services.context))

      update(props)
      return {
        setProps: update,
        unmount: () => element.replaceChildren(),
      }
    },
  }, plugins)
}

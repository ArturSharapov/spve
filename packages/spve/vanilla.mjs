import { applyAppPlugins, initializeSP } from './runtime.mjs'

export function defineVanillaApp(render, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const update = (next) => element.replaceChildren(render(next, services.context, services))

        update(props)
        return {
          update(next, nextServices) {
            services = nextServices
            update(next)
          },
          setProps: update,
          unmount: () => element.replaceChildren(),
        }
      },
    },
    plugins,
  )
}

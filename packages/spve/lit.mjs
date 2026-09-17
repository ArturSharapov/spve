import { nothing, render } from 'lit'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

export function defineLitApp(app, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const update = (next) => render(app(next, services.context, services), element)

        update(props)
        return {
          update(next, nextServices) {
            services = nextServices
            update(next)
          },
          setProps: update,
          unmount: () => render(nothing, element),
        }
      },
    },
    plugins,
  )
}

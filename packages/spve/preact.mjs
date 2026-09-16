import { createContext, h, render } from 'preact'
import { useContext } from 'preact/hooks'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const SpContext = createContext(undefined)

export function useSpveContext() {
  return useContext(SpContext)
}

export function definePreactApp(component, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const update = (next) =>
        render(
          h(
            SpContext.Provider,
            { value: services.context },
            h(component, next),
          ),
          element,
        )

      update(props)
      return {
        setProps: update,
        unmount: () => render(null, element),
      }
    },
  }, plugins)
}

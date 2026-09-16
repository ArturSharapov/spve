import { createComponent, createContext, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { render } from 'solid-js/web'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const SpContext = createContext()

export function useSpveContext() {
  return useContext(SpContext)
}

export function defineSolidApp(component, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const [state, setState] = createStore({ ...props })
      const dispose = render(
        () =>
          createComponent(SpContext.Provider, {
            value: services.context,
            get children() {
              return createComponent(component, state)
            },
          }),
        element,
      )

      return {
        setProps: (next) => setState(reconcile({ ...next })),
        unmount: dispose,
      }
    },
  }, plugins)
}

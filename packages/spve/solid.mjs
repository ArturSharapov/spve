import { batch, createComponent, createContext, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { render } from 'solid-js/web'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const SpContext = createContext()

export function useSpveContext() {
  return useServices()?.context
}

export function useServices() {
  return useContext(SpContext)
}

export function defineSolidApp(component, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const [currentServices, setServices] = createStore({ ...services })
        const [state, setState] = createStore({ ...props })
        const dispose = render(
          () =>
            createComponent(SpContext.Provider, {
              value: currentServices,
              get children() {
                return createComponent(component, state)
              },
            }),
          element,
        )

        return {
          update(next, nextServices) {
            batch(() => {
              setServices(reconcile({ ...nextServices }))
              setState(reconcile({ ...next }))
            })
          },
          setProps: (next) => setState(reconcile({ ...next })),
          unmount: dispose,
        }
      },
    },
    plugins,
  )
}

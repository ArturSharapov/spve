import 'virtual:spve-react-preamble'
import { createContext, createElement, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const SpContext = createContext(undefined)

export function useSpveContext() {
  return useContext(SpContext)
}

export function defineReactApp(definition, ...plugins) {
  const render =
    typeof definition === 'function'
      ? ({ props }) => createElement(definition, props)
      : definition.render
  const initialize = typeof definition === 'function' ? undefined : definition.initialize

  return applyAppPlugins({
    mount(initialContext) {
      initializeSP(initialContext.services.sp)
      initialize?.(initialContext)

      const root = createRoot(initialContext.element)
      let context = initialContext
      const update = () =>
        root.render(
          createElement(SpContext.Provider, { value: context.services.context }, render(context)),
        )

      update()

      return {
        setProps(props) {
          context = { ...context, props }
          update()
        },
        unmount: () => root.unmount(),
      }
    },
  }, plugins)
}

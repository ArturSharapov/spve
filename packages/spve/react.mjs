import 'virtual:spve-react-preamble'
import { createContext, createElement, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

const SpContext = createContext(undefined)

export function useSpveContext() {
  return useServices()?.context
}

export function useServices() {
  return useContext(SpContext)
}

export function defineReactApp(definition, ...plugins) {
  const isComponent = typeof definition === 'function' || Boolean(definition?.$$typeof)
  const render = isComponent ? ({ props }) => createElement(definition, props) : definition.render
  const initialize = isComponent ? undefined : definition.initialize

  return applyAppPlugins(
    {
      mount(initialContext) {
        initializeSP(initialContext.services.sp)
        initialize?.(initialContext)

        const root = createRoot(initialContext.element)
        let context = initialContext
        const update = () =>
          root.render(
            createElement(SpContext.Provider, { value: context.services }, render(context)),
          )

        update()

        return {
          update(props, services) {
            context = { ...context, props, services }
            update()
          },
          setProps(props) {
            context = { ...context, props }
            update()
          },
          unmount: () => root.unmount(),
        }
      },
    },
    plugins,
  )
}

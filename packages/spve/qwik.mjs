import '@builder.io/qwik/qwikloader.js'
import { createContextId, noSerialize, render, useContext } from '@builder.io/qwik'
import { jsx } from '@builder.io/qwik/jsx-runtime'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

export const SpContext = createContextId('spve.context')

export function useSpveContext() {
  return useContext(SpContext)
}

export function defineQwikApp(component, ...plugins) {
  return applyAppPlugins({
    mount({ element, props, services }) {
      initializeSP(services.sp)
      const eventName = `spve:${crypto.randomUUID()}`
      const rendered = render(
        element,
        jsx(component, {
          eventName,
          initialProps: { ...props },
          spContext: services.context ? noSerialize(services.context) : undefined,
        }),
      )

      return {
        setProps(next) {
          void rendered.then(() => {
            window.dispatchEvent(new CustomEvent(eventName, { detail: { ...next } }))
          })
        },
        unmount() {
          void rendered.then((result) => result.cleanup())
        },
      }
    },
  }, plugins)
}

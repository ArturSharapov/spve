import '@builder.io/qwik/qwikloader.js'
import { createContextId, noSerialize, render, useContext } from '@builder.io/qwik'
import { jsx } from '@builder.io/qwik/jsx-runtime'
import { applyAppPlugins, initializeSP } from './runtime.mjs'

export const ServicesContext = createContextId('spve.services')
export function useServices() {
  return useContext(ServicesContext)
}

export const SpContext = createContextId('spve.context')

export function useSpveContext() {
  return useContext(SpContext)
}

export function defineQwikApp(component, ...plugins) {
  return applyAppPlugins(
    {
      mount({ element, props, services }) {
        initializeSP(services.sp)
        const eventName = `spve${crypto.randomUUID().replaceAll('-', '')}`
        let disposed = false
        const rendered = render(
          element,
          jsx(component, {
            eventName,
            initialProps: { ...props },
            initialServices: {
              ...services,
              sp: noSerialize(services.sp),
              context: services.context ? noSerialize(services.context) : undefined,
            },
            spContext: services.context ? noSerialize(services.context) : undefined,
          }),
        )

        return {
          update(next, nextServices) {
            services = nextServices
            this.setProps(next)
          },
          setProps(next) {
            const nextServices = services
            void rendered.then(() => {
              if (!disposed)
                window.dispatchEvent(
                  Object.assign(new CustomEvent(eventName, { detail: { ...next } }), {
                    services: {
                      ...nextServices,
                      sp: noSerialize(nextServices.sp),
                      context: nextServices.context ? noSerialize(nextServices.context) : undefined,
                    },
                  }),
                )
            })
          },
          unmount() {
            if (disposed) return
            disposed = true
            void rendered.then((result) => result.cleanup())
          },
        }
      },
    },
    plugins,
  )
}

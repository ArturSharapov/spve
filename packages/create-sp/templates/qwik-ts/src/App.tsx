import { $, component$, useContextProvider, useOnWindow, useStore } from '@builder.io/qwik'
import type { AppProps } from 'spve'
import { SpContext, ServicesContext, type QwikAppBridgeProps } from 'spve/qwik'

const title = __TITLE_JS__

export const App = component$(
  ({ eventName, initialProps, initialServices, spContext }: QwikAppBridgeProps<AppProps>) => {
    useContextProvider(SpContext, spContext)
    const services = useStore({ ...initialServices }, { deep: false })
    useContextProvider(ServicesContext, services)
    const props = useStore({ ...initialProps })

    useOnWindow(
      eventName,
      $((event: Event) => {
        const next = (event as CustomEvent<AppProps>).detail
        for (const key of Object.keys(props)) {
          if (!(key in next)) delete props[key]
        }
        Object.assign(props, next)
        const updated = (event as CustomEvent<AppProps> & { services?: typeof initialServices })
          .services
        if (updated) {
          for (const key of Object.keys(services))
            if (!(key in updated)) Reflect.deleteProperty(services, key)
          Object.assign(services, updated)
        }
      }),
    )

    return (
      <main class="spve-app">
        <h1>{title}</h1>
        {props.description && <p>{props.description}</p>}
      </main>
    )
  },
)

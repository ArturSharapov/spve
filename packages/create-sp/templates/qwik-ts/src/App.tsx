import { $, component$, useContextProvider, useOnWindow, useStore } from '@builder.io/qwik'
import type { AppProps } from 'spve'
import { SpContext, type QwikAppBridgeProps } from 'spve/qwik'

const title = __TITLE_JS__

export const App = component$(({ eventName, initialProps, spContext }: QwikAppBridgeProps<AppProps>) => {
  useContextProvider(SpContext, spContext)
  const props = useStore({ ...initialProps })

  useOnWindow(
    eventName,
    $((event: Event) => {
      const next = (event as CustomEvent<AppProps>).detail
      for (const key of Object.keys(props)) {
        if (!(key in next)) delete props[key]
      }
      Object.assign(props, next)
    }),
  )

  return (
    <main class="spve-app">
      <h1>{title}</h1>
      {props.description && <p>{props.description}</p>}
    </main>
  )
})

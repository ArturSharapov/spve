import { $, component$, useOnWindow, useStore } from '@builder.io/qwik'

export interface AppProps extends Record<string, unknown> {
  description?: string
}

interface BridgeProps {
  eventName: string
  initialProps: AppProps
}

const title = __TITLE_JS__

export const App = component$(({ eventName, initialProps }: BridgeProps) => {
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

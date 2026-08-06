import type { AppProps } from 'spve/client'

const title = __TITLE_JS__

export function App(props: AppProps) {
  return (
    <main class="spve-app">
      <h1>{title}</h1>
      {props.description && <p>{props.description}</p>}
    </main>
  )
}

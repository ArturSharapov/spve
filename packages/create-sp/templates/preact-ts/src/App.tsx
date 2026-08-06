import type { AppProps } from 'spve'

const title = __TITLE_JS__

export function App({ description }: AppProps) {
  return (
    <main class="spve-app">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </main>
  )
}

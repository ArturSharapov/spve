import type { AppProps } from 'spve/client'

const title = __TITLE_JS__

export function App({ description }: AppProps) {
  return (
    <main className="spve-app">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </main>
  )
}

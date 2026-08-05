export interface AppProps extends Record<string, unknown> {
  description?: string
}

const title = __TITLE_JS__

export function App(props: AppProps): HTMLElement {
  const app = document.createElement('main')
  app.className = 'spve-app'

  const heading = document.createElement('h1')
  heading.textContent = title
  app.append(heading)

  if (props.description) {
    const description = document.createElement('p')
    description.textContent = props.description
    app.append(description)
  }

  return app
}

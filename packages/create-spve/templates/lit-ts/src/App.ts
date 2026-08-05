import { html, type TemplateResult } from 'lit'

export interface AppProps extends Record<string, unknown> {
  description?: string
}

const title = __TITLE_JS__

export function App({ description }: AppProps): TemplateResult {
  return html`
    <main class="spve-app">
      <h1>${title}</h1>
      ${description ? html`<p>${description}</p>` : null}
    </main>
  `
}

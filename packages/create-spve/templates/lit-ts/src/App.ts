import { html, type TemplateResult } from 'lit'
import type { AppProps } from 'spve/client'

const title = __TITLE_JS__

export function App({ description }: AppProps): TemplateResult {
  return html`
    <main class="spve-app">
      <h1>${title}</h1>
      ${description ? html`<p>${description}</p>` : null}
    </main>
  `
}

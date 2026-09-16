import spve from '../../../config/spve.json'
import type { WebPartContext } from '@microsoft/sp-webpart-base'
import type { SPFI } from '@pnp/sp'
import type { SpveApp } from 'spve'

const developmentServerUrl = `https://localhost:${spve.spfxPort}/__spve`
type Props = Record<string, unknown>
type Services = { sp: SPFI; context: WebPartContext }
type App = SpveApp<Props, Services>

export async function loadModule(): Promise<App> {
  await import(/* webpackIgnore: true */ `${developmentServerUrl}/@vite/client`)
  const module = await import(/* webpackIgnore: true */ `${developmentServerUrl}/__spve-sharepoint`)
  return module.default as App
}

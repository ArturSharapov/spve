import spve from '../../../config/spve.json'
import type { SPFI } from '@pnp/sp'
import type { SpveApp } from 'spve'

const developmentServerUrl = `https://localhost:${spve.spfxPort}/__spve`
type Props = Record<string, unknown>
type Services = { sp: SPFI }
type App = SpveApp<Props, Services>

export async function loadModule(): Promise<App> {
  await import(/* webpackIgnore: true */ `${developmentServerUrl}/@vite/client`)
  const module = await import(/* webpackIgnore: true */ `${developmentServerUrl}/__spve-sharepoint`)
  return module.default as App
}

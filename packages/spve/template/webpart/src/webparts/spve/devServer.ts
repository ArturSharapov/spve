import spve from '../../../config/spve.json'
import type { WebPartContext } from '@microsoft/sp-webpart-base'
import type { SPFI } from '@pnp/sp'
import type { SpveApp, SpveEditorProps } from 'spve'

const developmentServerUrl = `https://localhost:${spve.spfxPort}/__spve`
type Props = Record<string, unknown>
type Services = { sp: SPFI; context: WebPartContext }
type App = SpveApp<Props, Services>

export async function loadModule(): Promise<{
  default: App
  editors?: Record<string, SpveApp<SpveEditorProps<unknown, Props>, Services>>
}> {
  await import(/* webpackIgnore: true */ `${developmentServerUrl}/@vite/client`)
  const module = await import(/* webpackIgnore: true */ `${developmentServerUrl}/__spve-sharepoint`)
  return module
}

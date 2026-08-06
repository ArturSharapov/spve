import spve from '../../../config/spve.json'
import type { SPFI } from '@pnp/sp'
import type { SpveModule } from 'spve'

const developmentServerUrl = `https://localhost:${spve.spfxPort}/__spve`
type Props = Record<string, unknown>
type Services = { sp: SPFI }
type Module = SpveModule<Props, Services>

export async function loadModule(): Promise<Module> {
  await import(/* webpackIgnore: true */ `${developmentServerUrl}/@vite/client`)
  const module = await import(/* webpackIgnore: true */ `${developmentServerUrl}/__spve-sharepoint`)
  return module.default as Module
}

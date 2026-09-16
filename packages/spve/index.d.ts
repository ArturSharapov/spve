import './sp.js'
import type { SPFI } from '@pnp/sp/presets/all.js'

export * from './config.js'

declare global {
  interface SpveAppProps {}

  interface ImportMetaEnv {
    readonly VITE_AAD_CLIENT_ID?: string
    readonly VITE_AAD_TENANT_ID?: string
  }
}

export interface AppProps extends SpveAppProps {}

export interface Services {
  sp: SPFI
}

export interface SpveContext<Props extends object, Services extends object> {
  element: HTMLElement
  props: Readonly<Props>
  services: Readonly<Services>
}

export interface SpveInstance<Props extends object> {
  setProps(props: Readonly<Props>): void
  unmount(): void
}

export interface SpveApp<
  Props extends object = AppProps,
  ModuleServices extends object = Services,
> {
  mount(context: SpveContext<Props, ModuleServices>): SpveInstance<Props>
}

export interface SpvePlugin {
  <Props extends object, ModuleServices extends object>(
    app: SpveApp<Props, ModuleServices>,
  ): SpveApp<Props, ModuleServices>
}

export function initializeSP(sharepoint: SPFI): void

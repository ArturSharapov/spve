import type { SPFI } from '@pnp/sp'

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

export interface SpveModule<
  Props extends object = AppProps,
  ModuleServices extends object = Services,
> {
  mount(context: SpveContext<Props, ModuleServices>): SpveInstance<Props>
}

export function initializeSP(sharepoint: SPFI): void

declare module 'sp' {
  export const sp: SPFI
}

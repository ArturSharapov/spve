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

export interface SpveHostState {
  displayMode: 'read' | 'edit'
  locale: string
  direction: 'ltr' | 'rtl'
  theme?: {
    isInverted?: boolean
    palette?: Readonly<Record<string, string | undefined>>
    semanticColors?: Readonly<Record<string, string | undefined>>
  }
}

export interface Services {
  sp: SPFI
  host?: Readonly<SpveHostState>
}

export interface SpveContext<Props extends object, Services extends object> {
  element: HTMLElement
  props: Readonly<Props>
  services: Readonly<Services>
}

export interface SpveInstance<Props extends object, ModuleServices extends object = Services> {
  update?(props: Readonly<Props>, services: Readonly<ModuleServices>): void
  setProps(props: Readonly<Props>): void
  unmount(): void
}

export interface SpveApp<
  Props extends object = AppProps,
  ModuleServices extends object = Services,
> {
  mount(context: SpveContext<Props, ModuleServices>): SpveInstance<Props, ModuleServices>
}

export interface SpvePlugin {
  <Props extends object, ModuleServices extends object>(
    app: SpveApp<Props, ModuleServices>,
  ): SpveApp<Props, ModuleServices>
}

export function initializeSP(sharepoint: SPFI): void

export interface SpveEditorProps<Value, Props extends object = AppProps> {
  value: Value
  onChange(value: Value, valid?: boolean): void
  disabled: boolean
  properties: Readonly<Props>
}

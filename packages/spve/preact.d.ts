import type { ComponentType } from 'preact'
import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export function definePreactApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(component: ComponentType<Props>, ...plugins: readonly SpvePlugin[]): SpveApp<Props, ModuleServices>

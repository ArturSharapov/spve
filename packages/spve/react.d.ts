import type { ComponentType, ReactNode } from 'react'
import type { AppProps, Services, SpveApp, SpveContext, SpvePlugin } from 'spve'

export interface ReactAppDefinition<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
> {
  initialize?(context: SpveContext<Props, ModuleServices>): void
  render(context: SpveContext<Props, ModuleServices>): ReactNode
}

export function defineReactApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(
  component: ComponentType<Props>,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

export function defineReactApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(
  definition: ReactAppDefinition<Props, ModuleServices>,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

export function useServices(): Readonly<Services>

import type { Component, ContextId } from '@builder.io/qwik'
import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export interface QwikAppBridgeProps<Props extends object = AppProps> {
  eventName: string
  initialProps: Props
  initialServices: Services
  spContext?: unknown
}

export const ServicesContext: ContextId<Services>

export const SpContext: ContextId<unknown>

export function defineQwikApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(
  component: Component<QwikAppBridgeProps<Props>>,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

export function useServices(): Readonly<Services>

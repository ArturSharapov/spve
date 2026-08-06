import type { AppProps as DefaultAppProps, Services as DefaultServices } from 'spve/client'

export type SpveProps = Record<string, unknown>
export type SpveServices = Record<string, unknown>

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
  Props extends object = DefaultAppProps,
  Services extends object = DefaultServices,
> {
  mount(context: SpveContext<Props, Services>): SpveInstance<Props>
}

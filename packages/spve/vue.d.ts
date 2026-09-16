import 'spve'
import type { Component } from 'vue'
import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

type VueProp<T, TRequired extends boolean> = {
  type: { (): T }
  required: TRequired
}

declare const properties: {
  readonly [K in keyof SpveAppProps]-?: {} extends Pick<SpveAppProps, K>
    ? VueProp<Exclude<SpveAppProps[K], undefined>, false>
    : VueProp<SpveAppProps[K], true>
}

export function defineVueApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(component: Component<Props>, ...plugins: readonly SpvePlugin[]): SpveApp<Props, ModuleServices>

export default properties

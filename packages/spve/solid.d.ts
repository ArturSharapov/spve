import type { Component } from 'solid-js'
import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export function defineSolidApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(component: Component<Props>, ...plugins: readonly SpvePlugin[]): SpveApp<Props, ModuleServices>

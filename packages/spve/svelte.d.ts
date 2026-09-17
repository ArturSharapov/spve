import type { Component } from 'svelte'
import type { Readable } from 'svelte/store'
import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export function defineSvelteApp<
  Props extends object = AppProps,
  ModuleServices extends Services = Services,
>(
  component: Component<{ properties: Readable<Props> }>,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

export function getServices(): Readable<Readonly<Services>>

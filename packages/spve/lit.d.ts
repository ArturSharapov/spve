import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export function defineLitApp<
  Props extends object = AppProps,
  Context = unknown,
  ModuleServices extends Services = Services,
>(
  app: (props: Readonly<Props>, context: Context, services: Readonly<ModuleServices>) => unknown,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

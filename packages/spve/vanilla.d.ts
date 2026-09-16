import type { AppProps, Services, SpveApp, SpvePlugin } from 'spve'

export function defineVanillaApp<
  Props extends object = AppProps,
  Context = unknown,
  ModuleServices extends Services = Services,
>(
  render: (props: Readonly<Props>, context: Context) => Node,
  ...plugins: readonly SpvePlugin[]
): SpveApp<Props, ModuleServices>

import type { AppProps } from 'spve/client'

type VueProp<T, TRequired extends boolean> = {
  type: { (): T }
  required: TRequired
}

declare const properties: {
  readonly [K in keyof AppProps]-?: {} extends Pick<AppProps, K>
    ? VueProp<Exclude<AppProps[K], undefined>, false>
    : VueProp<AppProps[K], true>
}

export default properties

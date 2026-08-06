import 'spve'

type VueProp<T, TRequired extends boolean> = {
  type: { (): T }
  required: TRequired
}

declare const properties: {
  readonly [K in keyof SpveAppProps]-?: {} extends Pick<SpveAppProps, K>
    ? VueProp<Exclude<SpveAppProps[K], undefined>, false>
    : VueProp<SpveAppProps[K], true>
}

export default properties

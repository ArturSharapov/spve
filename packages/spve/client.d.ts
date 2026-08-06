import type { SPFI } from '@pnp/sp'

export interface AppProps {}

export interface Services {
  sp: SPFI
}

interface ImportMetaEnv {
  readonly VITE_AAD_CLIENT_ID: string
  readonly VITE_AAD_TENANT_ID: string
}

declare module 'sp' {
  export const sp: SPFI
}

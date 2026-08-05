interface ImportMetaEnv {
  readonly VITE_AAD_CLIENT_ID: string
  readonly VITE_AAD_TENANT_ID: string
  readonly VITE_SP_SITE_URL: string
}

declare module 'sp' {
  import type { SPFI } from '@pnp/sp'
  export const sp: SPFI
}

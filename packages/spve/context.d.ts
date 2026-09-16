import type { WebPartContext } from '@microsoft/sp-webpart-base'
import type { Services, SpvePlugin } from 'spve'

export type { WebPartContext } from '@microsoft/sp-webpart-base'
export type {
  HttpClientResponse,
  IHttpClientOptions,
  ISPHttpClientOptions,
  SPHttpClientResponse,
} from '@microsoft/sp-http'

export type HttpClient = import('@microsoft/sp-http').HttpClient
export const HttpClient: typeof import('@microsoft/sp-http').HttpClient
export type SPHttpClient = import('@microsoft/sp-http').SPHttpClient
export const SPHttpClient: typeof import('@microsoft/sp-http').SPHttpClient

type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T

export interface ContextServices extends Services {
  context: WebPartContext
}

export interface StandaloneContextOptions {
  manifest?: DeepPartial<WebPartContext['manifest']>
  pageContext?: DeepPartial<WebPartContext['pageContext']>
}

export interface WithContextOptions {
  standalone?: StandaloneContextOptions
}

export function withContext(options?: WithContextOptions): SpvePlugin

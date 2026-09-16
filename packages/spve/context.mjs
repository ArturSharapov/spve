import { getStandaloneRuntime } from './runtime-metadata.mjs'

const emptyGuid = '00000000-0000-0000-0000-000000000000'
const httpConfigurationV1 = Object.freeze({ name: 'v1' })

export class HttpClient {
  static configurations = Object.freeze({ v1: httpConfigurationV1 })
}

export class SPHttpClient {
  static configurations = Object.freeze({ v1: httpConfigurationV1 })
}

function merge(base, overrides) {
  if (!overrides) return base
  const result = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    result[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? merge(base[key] ?? {}, value)
        : value
  }
  return result
}

function createAuthenticatedClient(runtime, resource) {
  const fetchWithToken = async (url, options = {}) => {
    if (!runtime?.acquireToken) {
      throw new Error('SPVE: authenticated HTTP clients require standalone MSAL configuration')
    }
    const target = new URL(typeof url === 'string' ? url : url.url, runtime.siteUrl)
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${await runtime.acquireToken(resource ?? target.origin)}`)
    headers.set('Accept', headers.get('Accept') ?? 'application/json;odata.metadata=minimal')
    const response = await fetch(target, { ...options, headers })
    Object.defineProperties(response, {
      correlationId: {
        configurable: true,
        value: response.headers.get('SPRequestGuid') ?? undefined,
      },
      statusMessage: { configurable: true, value: response.statusText },
    })
    return response
  }

  return {
    fetch: (url, _configuration, options) => fetchWithToken(url, options),
    get: (url, _configuration, options) =>
      fetchWithToken(url, { ...options, method: 'GET' }),
    post: (url, _configuration, options) =>
      fetchWithToken(url, { ...options, method: 'POST' }),
  }
}

function createHttpClient() {
  const request = (url, options) => fetch(url, options)
  return {
    fetch: (url, _configuration, options) => request(url, options),
    get: (url, _configuration, options) => request(url, { ...options, method: 'GET' }),
    post: (url, _configuration, options) => request(url, { ...options, method: 'POST' }),
  }
}

function createServiceScope() {
  const services = new Map()
  const scope = {
    consume: (key) => services.get(key),
    createAndProvide: (key, type) => {
      const service = new type(scope)
      services.set(key, service)
      return service
    },
    createDefaultAndProvide: (key) => scope.createAndProvide(key, key.defaultCreator),
    finish: () => {},
    provide: (key, service) => void services.set(key, service),
    startNewChild: () => createServiceScope(),
    whenFinished: (callback) => callback(),
  }
  return scope
}

function createDynamicDataProvider() {
  const listeners = new Set()
  return {
    getAvailableSources: () => [],
    getPropertyDefinitions: () => [],
    registerAvailableSourcesChanged: (callback) => void listeners.add(callback),
    registerPropertyChanged: () => {},
    removePropertyChanged: () => {},
    tryGetPropertyValue: () => undefined,
    tryGetSource: () => undefined,
    unregisterAvailableSourcesChanged: (callback) => void listeners.delete(callback),
  }
}

function createStatusRenderer(element) {
  let status
  const clear = () => status?.remove()
  return {
    clearError: clear,
    clearLoadingIndicator: clear,
    displayLoadingIndicator(_domElement, message) {
      clear()
      status = document.createElement('div')
      status.dataset.spveStatus = 'loading'
      status.textContent = message
      element.append(status)
    },
    renderError(_domElement, error) {
      clear()
      status = document.createElement('div')
      status.dataset.spveStatus = 'error'
      status.textContent = error instanceof Error ? error.message : String(error)
      element.append(status)
    },
  }
}

function createGraphClient(runtime) {
  const request = (path) => {
    let version = 'v1.0'
    let headers = {}

    const execute = async (method, body) => {
      const response = await createAuthenticatedClient(runtime, 'https://graph.microsoft.com').fetch(
        `https://graph.microsoft.com/${version}/${path.replace(/^\//, '')}`,
        undefined,
        {
          method,
          headers: {
            ...headers,
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        },
      )
      if (!response.ok) throw new Error(`Microsoft Graph request failed with ${response.status}`)
      if (response.status === 204) return undefined
      return response.json()
    }

    return {
      version(next) {
        version = next
        return this
      },
      header(name, value) {
        headers = { ...headers, [name]: value }
        return this
      },
      headers(next) {
        headers = { ...headers, ...next }
        return this
      },
      get: () => execute('GET'),
      post: (body) => execute('POST', body),
      patch: (body) => execute('PATCH', body),
      put: (body) => execute('PUT', body),
      delete: () => execute('DELETE'),
    }
  }

  return { api: request }
}

function createPageContext(runtime, overrides) {
  const site = new URL(runtime?.siteUrl ?? window.location.origin)
  const serverRelativeUrl = site.pathname.replace(/\/$/, '') || '/'
  const account = runtime?.account
  const locale = navigator.language || 'en-US'
  const pageContext = {
    cultureInfo: {
      currentCultureName: locale,
      currentUICultureName: locale,
      isRightToLeft: false,
    },
    site: {
      absoluteUrl: site.href.replace(/\/$/, ''),
      id: emptyGuid,
      serverRelativeUrl,
    },
    user: {
      displayName: account?.name ?? account?.username ?? 'Standalone user',
      email: account?.username ?? '',
      isAnonymousGuestUser: false,
      isExternalGuestUser: false,
      loginName: account?.username ?? '',
      preferUserTimeZone: false,
    },
    web: {
      absoluteUrl: site.href.replace(/\/$/, ''),
      id: emptyGuid,
      isAppWeb: false,
      language: 1033,
      logoUrl: '',
      permissions: {
        hasAllPermissions: () => true,
        hasAnyPermissions: () => true,
        hasPermission: () => true,
        value: { High: 0x7fffffff, Low: 0xffffffff },
      },
      serverRelativeUrl,
      templateName: '',
      title: site.pathname.split('/').filter(Boolean).at(-1) ?? site.hostname,
    },
  }
  pageContext.legacyPageContext = {
    currentCultureName: locale,
    currentUICultureName: locale,
    isAppWeb: false,
    userDisplayName: pageContext.user.displayName,
    userEmail: pageContext.user.email,
    userLoginName: pageContext.user.loginName,
    webAbsoluteUrl: pageContext.web.absoluteUrl,
    webServerRelativeUrl: pageContext.web.serverRelativeUrl,
    webTitle: pageContext.web.title,
  }
  return merge(pageContext, overrides)
}

function createStandaloneContext(sharepoint, element, options) {
  const runtime = getStandaloneRuntime(sharepoint)
  const spHttpClient = createAuthenticatedClient(runtime)
  const instanceId = crypto.randomUUID()
  let propertyPaneOpen = false
  const context = {
    aadHttpClientFactory: {
      getClient: async (resourceEndpoint) => createAuthenticatedClient(runtime, resourceEndpoint),
    },
    aadTokenProviderFactory: {
      getTokenProvider: async () => ({
        getToken: (resourceEndpoint) => runtime.acquireToken(resourceEndpoint),
      }),
    },
    domElement: element,
    dynamicDataProvider: createDynamicDataProvider(),
    formFactor: 0,
    httpClient: createHttpClient(),
    instanceId,
    isServedFromLocalhost: true,
    manifest: merge(
      {
        alias: 'SpveStandaloneWebPart',
        componentType: 'WebPart',
        id: emptyGuid,
        manifestVersion: 2,
        version: '0.0.0',
      },
      options?.manifest,
    ),
    msGraphClientFactory: {
      getClient: async () => createGraphClient(runtime),
      getClientWithMiddleware: async () => createGraphClient(runtime),
    },
    pageContext: createPageContext(runtime, options?.pageContext),
    propertyPane: {
      close: () => void (propertyPaneOpen = false),
      isPropertyPaneOpen: () => propertyPaneOpen,
      open: () => void (propertyPaneOpen = true),
      refresh: () => {},
    },
    sdks: undefined,
    serviceScope: createServiceScope(),
    spHttpClient,
    statusRenderer: createStatusRenderer(element),
    teams: undefined,
    webPartTag: `WebPart.SpveStandalone.${instanceId}`,
  }

  return new Proxy(context, {
    get(target, property, receiver) {
      if (property in target || typeof property === 'symbol') return Reflect.get(target, property, receiver)
      throw new Error(`SPVE: WebPartContext.${String(property)} is not implemented in standalone mode`)
    },
  })
}

export function withContext(options) {
  return (app) => ({
    mount(context) {
      const services = context.services.context
        ? context.services
        : {
            ...context.services,
            context: createStandaloneContext(
              context.services.sp,
              context.element,
              options?.standalone,
            ),
          }
      return app.mount({ ...context, services })
    },
  })
}

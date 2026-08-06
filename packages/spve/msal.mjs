import { PublicClientApplication } from '@azure/msal-browser'
import { SPBrowser, spfi } from '@pnp/sp'
import '@pnp/sp/presets/all'

export async function createMsalSP(siteUrl) {
  const { VITE_AAD_CLIENT_ID: clientId, VITE_AAD_TENANT_ID: tenantId } = import.meta.env

  if (!clientId || !tenantId) {
    throw new Error('Set VITE_AAD_CLIENT_ID and VITE_AAD_TENANT_ID in .env.local')
  }

  const msal = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
    },
    cache: { cacheLocation: 'sessionStorage' },
  })
  await msal.handleRedirectPromise()

  const scope = `${new URL(siteUrl).origin}/.default`
  const account = msal.getAllAccounts()[0]
  if (!account) {
    await msal.loginRedirect({ scopes: [scope], prompt: 'select_account' })
    throw new Error('Redirecting to Microsoft sign-in')
  }

  const auth = () => (instance) => {
    instance.on?.auth?.(async (url, init) => {
      let result
      try {
        result = await msal.acquireTokenSilent({ scopes: [scope], account })
      } catch {
        await msal.acquireTokenRedirect({ scopes: [scope], account })
        throw new Error('Redirecting to Microsoft sign-in')
      }
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Bearer ${result.accessToken}`)
      return [url, { ...init, headers }]
    })
    return instance
  }

  return spfi().using(SPBrowser({ baseUrl: siteUrl }), auth())
}

# spve

Vite plugin and runtime for framework-agnostic SharePoint Framework web parts.

```ts
import vue from '@vitejs/plugin-vue'
import { spve } from 'spve/vite'
import { defineConfig, lazyPlugins, mergeConfig } from 'vite-plus'

export default defineConfig(
  mergeConfig(spve(), {
    plugins: lazyPlugins(() => [vue()]),
  }),
)
```

Application code accesses the shared PnPjs client without depending on its host:

```ts
import { sp } from 'sp'
```

The plugin owns standalone MSAL bootstrapping, the shared runtime, and a generated hidden SPFx
workspace. Normal `vp dev` and `vp build` use Vite. `vp dev -m sp` also starts Heft, while
`vp build -m sp` creates the SharePoint `.sppkg`.

The first SP-mode command installs the pinned SPFx workspace dependencies. Development mode reuses
the trusted SPFx certificate for both Vite and Heft. SPVE internally proxies Vite modules through
the Heft origin so browsers only need to authorize one localhost origin.

SP development uses SharePoint's hosted workbench. Set its site in `.env.local`:

```dotenv
VITE_SP_SITE_URL=https://contoso.sharepoint.com/sites/example
```

Standalone MSAL development also reads `VITE_AAD_TENANT_ID` and `VITE_AAD_CLIENT_ID`.

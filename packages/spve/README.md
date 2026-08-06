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

`vp install` prepares the hidden workspace. SPVE installs its pinned SPFx dependencies once with
npm and Node 22 in a versioned user cache, then links that read-only toolchain into each project's
`.spve/webpart`. Concurrent projects share it safely. Generated source and build output remain local
to the project. Vite application commands use the project's Vite+-managed Node 24 runtime.

The whole `.spve` directory is disposable generated state and must not be edited. SPVE fingerprints
its generated files and only updates a file when the relevant configuration or SPVE template has
changed. A missing or manually changed generated file is repaired on the next preparation.

Development mode reuses the trusted SPFx certificate for both Vite and Heft. SPVE internally
proxies Vite modules through the Heft origin so browsers only need to authorize one localhost
origin.

## Typed web-part properties

Declare properties in the typed `spve.config.ts`:

```ts
import type { SpveConfig } from 'spve/config'

export default {
  name: 'my-app',
  title: 'My App',
  version: '0.1.0',
  ids: {
    component: '00000000-0000-0000-0000-000000000001',
    solution: '00000000-0000-0000-0000-000000000002',
    feature: '00000000-0000-0000-0000-000000000003',
  },
  dev: {
    siteUrl: 'https://contoso.sharepoint.com/sites/example',
    vitePort: 17641,
    spfxPort: 17642,
  },
  webpart: {
    properties: {
      description: {
        type: 'string',
        label: 'Description',
        control: {
          type: 'text',
          multiline: true,
        },
      },
      layout: {
        type: 'string',
        label: 'Layout',
        default: 'cards',
        required: true,
        control: {
          type: 'dropdown',
          options: [
            { value: 'cards', label: 'Cards' },
            { value: 'list', label: 'List' },
          ],
        },
      },
      pageSize: {
        type: 'number',
        label: 'Page size',
        default: 10,
        control: {
          type: 'slider',
          min: 1,
          max: 100,
          step: 1,
        },
      },
      showImages: {
        type: 'boolean',
        label: 'Show images',
        default: true,
      },
    },
  },
} satisfies SpveConfig
```

SPVE generates `.spve/client.d.ts`, the SPFx manifest defaults, and the matching property-pane
controls. Application code imports `AppProps` from `spve/client`; option values become literal
unions, required properties are non-optional, and `Services` already contains the typed shared
`SPFI` instance:

```ts
import type { AppProps, Services } from 'spve/client'
```

No application-owned `AppProps` or `Services` declaration is needed. Supported property types are
`string`, `number`, `boolean`, and JSON-compatible object/array values. A required property must
provide a default.

SPVE supports every stable, built-in SPFx control that directly edits one of those primitive
values:

- `string`: `text` (default), `dropdown`, or `choiceGroup`
- `number`: `slider` (default), `dropdown`, or `choiceGroup`
- `boolean`: `toggle` (default) or `checkbox`
- `json`: `none`; it is strongly typed from its default but has no built-in editor

Each control exposes its relevant SPFx options. Text fields include multiline, resizing, rows,
length, placeholder, validation timing, accessibility, disabled/read-only, and engagement-log
settings. Sliders include range, step, displayed value, accessibility, and disabled state. Toggles
and checkboxes include their corresponding labels, state text, accessibility, layout, and disabled
settings. Dropdowns support string or numeric values, headers, dividers, callout height, and
accessibility. Choice groups support string or numeric values, icons, images, image sizing,
accessibility, and disabled options.

SPVE deliberately does not model buttons, links, labels, separators, dynamic-data fields, or custom
fields as application properties: those are actions, presentation, dynamic-data integrations, or
code-backed controls rather than serializable property values.

SP development uses SharePoint's hosted workbench. Set its site in `spve.config.ts`:

```ts
dev: {
  siteUrl: 'https://contoso.sharepoint.com/sites/example',
  vitePort: 17641,
  spfxPort: 17642,
}
```

Standalone MSAL development reads the optional `VITE_AAD_TENANT_ID` and
`VITE_AAD_CLIENT_ID` values from `.env.local`.

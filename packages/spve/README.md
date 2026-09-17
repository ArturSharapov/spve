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

React applications use the framework adapter so the application entry does not need to manage the
React root or SharePoint lifecycle directly:

```ts
import { defineReactApp } from 'spve/react'
import { App } from './App'

export default defineReactApp(App)
```

The adapter also installs the React Fast Refresh preamble required when SharePoint, rather than
Vite's transformed `index.html`, hosts the application during development.

Context support is optional. Add it as an application plugin only when the app uses SPFx context:

```ts
import { defineReactApp } from 'spve/react'
import { withContext } from 'spve/context'
import { App } from './App'

export default defineReactApp(App, withContext())
```

React components then access their own mounted context without passing it through props:

```ts
import { useSpContext } from 'spve/react/context'

const context = useSpContext() // WebPartContext
```

Inside SharePoint this is the native `WebPartContext`. In standalone development SPVE supplies a
compatible context backed by the same MSAL session as `sp`, including authenticated
`spHttpClient`, AAD HTTP clients, Microsoft Graph clients, and common page-context values. Mock
page and manifest values can be overridden through `withContext({ standalone: ... })`.

Preact, Vue, Solid, and Qwik expose `useSpContext()` from `spve/<framework>/context`. Svelte
exposes `getSpContext()` from `spve/svelte/context`. Vanilla and Lit render functions receive the
context as their second argument when `withContext()` is installed.

The root `spve` declarations and ordinary framework adapters do not reference `WebPartContext`.
Consequently TypeScript only resolves the SPFx context type graph when application source imports
`spve/context` or one of its framework accessors. The standalone context implementation is also a
separate runtime entry and is absent from application bundles that do not use `withContext()`.

Every bundled starter uses the same declarative adapter pattern:

- `spve/vanilla`: `defineVanillaApp`
- `spve/vue`: `defineVueApp`
- `spve/react`: `defineReactApp`
- `spve/preact`: `definePreactApp`
- `spve/lit`: `defineLitApp`
- `spve/svelte`: `defineSvelteApp`
- `spve/solid`: `defineSolidApp`
- `spve/qwik`: `defineQwikApp`

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
import type { SpveConfig } from 'spve'

export default {
  name: 'my-app',
  title: 'My App',
  version: '0.0.1',
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
    alias: 'MyAppWebPart',
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

SPVE generates `.spve/types.d.ts`, the SPFx manifest defaults, and the matching property-pane
controls. Application code imports `AppProps` from `spve`; option values become literal
unions, required properties are non-optional, and `Services` already contains the typed shared
`SPFI` instance:

```ts
import type { AppProps, Services } from 'spve'
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

## Custom property editors

Export an `editors` object from your application entry. Each editor is an ordinary
application made with a framework adapter. Select it in a property declaration:

```ts
views: {
  type: 'json',
  default: [],
  control: { type: 'custom', editor: 'views' },
}
```

For example, a React editor receives `SpveEditorProps<View[]>` as its props:

```tsx
export const editors = {
  views: defineReactApp<SpveEditorProps<View[]>>(ViewsEditor),
}
```

The props contain `value`, `onChange(value, valid?)`, `disabled`, and a snapshot of
current properties. Emit replacement values instead of mutating the supplied
objects. Services use the same mount context as the main application. SPVE loads
the editor before opening the pane, keeps its mount across field refreshes, and
disposes it when the pane closes. React editors use the application's React
renderer, independently of SPFx's property-pane renderer.

### Dependent controls and Apply mode

Set `webpart.pane.reactive` to `false` to use SharePoint's Apply button. The main
application receives committed snapshots; editors receive current draft
properties. An editor can call `onChange(value, false)` while input is invalid or
an asynchronous check is pending. Keep unparsable text in the editor's own state.

For a library/column picker, read `properties.libraryId` and fetch its columns
when that value changes. Ignore results from an earlier selection or a disposed
editor. Keep a previously selected column visible but invalid if the new library
does not contain it. Emit a replacement value after the user selects a valid
column. Fetching and cancellation belong to that editor, not pane configuration.

To arrange ordinary fields, declare their names in order:

```ts
pane: {
  reactive: false,
  pages: [{
    description: 'Content',
    groups: [{ name: 'Source', fields: ['libraryId', 'columnId'] }],
  }],
}
```

A declared layout must include each visible field exactly once. Without a layout,
SPVE keeps its existing single page and group.

### Typed JSON properties

A JSON property can name a synchronous parser from a project source module:

```ts
views: {
  type: 'json',
  default: [],
  parser: { module: './src/views.ts', export: 'parseViews' },
  control: { type: 'custom', editor: 'views' },
}
```

```ts
export function parseViews(value: unknown): { name: string }[] {
  if (
    !Array.isArray(value) ||
    value.some((view) => !view || typeof view !== 'object' || typeof view.name !== 'string')
  )
    throw new Error('Each view needs a name')
  return value
}
```

The generated application type uses the parser's return type. SPVE validates
defaults during preparation and includes the parser in the application bundle for
host-loaded values and editor changes. Parser inputs are copied; failures identify
the property and preserve saved data. Missing optional properties remain absent.
Properties without parsers retain default-based inference.

Parser modules must work without browser initialization or network requests.
Return JSON-compatible values synchronously. Normalization must be idempotent
because the same value can pass validation at preparation, loading, and editing.
Imported parser sources are watched in development and rebuild default validation
when changed. No validation library is required.

## Native host extensions

Use a host subclass when a native SPFx lifecycle hook is needed. Ordinary
applications and property editors do not need one.

```ts
// spve.config.ts
host: { entry: './host/WebPart.ts' },
```

```ts
// host/WebPart.ts
import Base from 'spve/host'

export default class WebPart extends Base {
  protected async onInit(): Promise<void> {
    await super.onInit()
    // Subscribe to the native service needed by this web part here.
  }

  protected onDispose(): void {
    // Unsubscribe from that service here.
    super.onDispose()
  }
}
```

Keep the host entry and its relative imports in their own directory, outside the
application's `src`. SPVE copies that directory into its generated host, watches
the original sources, and removes stale generated copies. Imports outside that
directory are not supported. Compile this code with the generated SPFx project;
its compiler and dependencies are separate from the application.

Declare extra native dependencies in `host.dependencies`. SPVE includes them in
the shared toolchain descriptor and rejects changes to pinned packages. The same
descriptor is used during preparation, development, and packaging. Its cache hash
does not lock transitive dependency versions. Follow the native lifecycle's
`super` requirements and retain SPVE initialization and disposal.

## Live host information

SPVE passes `services.host` with the current `displayMode`, UI `locale`, text
`direction`, and theme colors. These are host services, not saved properties.
React, Preact, Vue, Solid, and Qwik expose `useServices()` from their adapter entry.
Read reactive values where the framework tracks them. Svelte exposes
`getServices()`, a readable store. Vanilla and Lit render callbacks receive
services as their third argument. React definition objects also receive them in
`render(context)`.

Built-in instances accept `update(props, services)` without replacing their
framework root. `setProps` remains supported. Older custom instances without
`update` receive props only. SPFx may itself recreate a web part during a mode
change; that destroys the previous instance's local state.

Existing Qwik applications must update their bridge to provide `ServicesContext`
from a shallow `useStore` initialized with `initialServices`, and copy
`event.services` into it alongside the existing property update. The starter
includes this bridge. Keep a DOM element in the bridge component so Qwik can
attach its window listener. Pending updates are ignored after disposal.

Standalone development defaults to read mode, `en-US`, and left-to-right text.
Override these through `dev.host`. Pane labels, descriptions, groups, and manifest
title/description can use `{ default: 'Settings', pl: 'Ustawienia' }`. Pane labels
select the exact UI culture, then its language, then `default`. Existing strings
and `{locale}` resource files continue to work.

### Upgrading saved settings

A product that changes a saved property format can override SPFx's `dataVersion`
and synchronous `onAfterDeserialize` in its host subclass. The executable example
in `examples/saved-settings/host/WebPart.ts` upgrades a version 1.0 `listId` string
to a version 2.0 `listIds` array. Use it with
`host: { entry: './host/WebPart.ts' }` after placing it in your project.
Declare the current `listIds` property as `{ type: 'json', default: [], required: true }`.
A migration must also return any other required properties declared by its project.

For `{ listId: 'news', title: 'Latest' }`, it returns
`{ listIds: ['news'], title: 'Latest' }`. It deliberately removes the old `listId`
field and preserves other fields. Current data is validated without migration;
unsupported newer versions and malformed values produce property/version errors.
The input object is not modified.

Migration code is compiled into the native host so it runs before the application
loads. Return synchronously, without network calls. Configured property parsers
then validate values before the application receives them. SPVE adds no migration
registry, and hosts without an override retain data version 1.0.

## Product packaging

Optional `solution.developer` fields describe the publisher. `solution.metadata`
accepts short and long descriptions, up to five screenshot paths, a video URL,
and up to three native SharePoint categories. Strings or locale maps work for
descriptions. Missing descriptions are omitted instead of emitted as invalid
empty localized strings.

Set `solution.iconPath` to a path inside the project's `sharepoint/` directory.
Local screenshot paths use that directory too; external HTTP(S) screenshot URLs
remain URLs. Feature assets use the native `sharepoint/assets/` directory:

```ts
solution: {
  iconPath: 'images/icon.png',
  developer: { name: 'Example team', websiteUrl: 'https://example.com' },
  metadata: { shortDescription: 'Choose and display saved views' },
  skipFeatureDeployment: false,
  assets: {
    elementManifests: ['elements.xml'],
    elementFiles: ['schema.xml'],
  },
},
```

SPVE validates the files, copies them without changing their bytes, watches them
in development, and removes stale generated copies. Feature assets provision
lists when the app is installed and activated on a site. Tenant-wide availability
through `skipFeatureDeployment` does not provision lists on each site. Runtime
provisioning must be an explicit application/admin action.

Use `webpart.preconfiguredEntries` for several initial configurations of the same
component. Each entry needs a title and can override declared property defaults:

```ts
preconfiguredEntries: [
  { title: 'Compact', properties: { columns: 1 } },
  { title: 'Wide', properties: { columns: 3 } },
],
```

SPVE validates each preset with the property's existing rules and optional parser.
Identifiers and bundle paths remain generated. Domain isolation is not exposed;
Microsoft retired isolated web parts on April 2, 2026.

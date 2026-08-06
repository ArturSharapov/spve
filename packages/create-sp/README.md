# create-sp

Create a framework-agnostic SPVE SharePoint application with Vite+.

```sh
npm cr sp
```

For a non-interactive Vue project:

```sh
npm cr sp -- my-app --no-interactive --template vue-ts \
  --title "My web part" --description "My SharePoint application" \
  --site-url https://contoso.sharepoint.com/sites/example
```

The wizard includes SPVE-integrated TypeScript versions of every template bundled with Create Vite:
Vanilla, Vue, React, Preact, Lit, Svelte, Solid, and Qwik.

For local development before `@spve/core` is published:

```sh
node bin/index.mjs \
  --spve file:/absolute/path/to/spve
```

The interactive wizard asks for the project/web-part name, framework, description, and required
SharePoint site. Microsoft Entra configuration is optional. The technical name is inferred from the
project name and offered as the editable project slug. Dependency installation is offered at the end
and defaults to Yes; non-interactive creation can opt in with `--install`.

Generated projects pin their application runtime to Node 24 through Vite+ and run the hidden
SPFx/Heft toolchain with Node 22. `vp install` also prepares a shared, read-only SPFx dependency
cache and generates the typed `.spve` workspace; developers do not edit `.spve`.

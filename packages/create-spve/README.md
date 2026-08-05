# create-spve

Create a framework-agnostic SPVE SharePoint application with Vite+.

```sh
vp create spve
```

For a non-interactive Vue project:

```sh
vp create spve --no-interactive -- my-app --template vue-ts \
  --title "My web part" --description "My SharePoint application" \
  --site-url https://contoso.sharepoint.com/sites/example
```

The wizard includes SPVE-integrated TypeScript versions of every template bundled with Create Vite:
Vanilla, Vue, React, Preact, Lit, Svelte, Solid, and Qwik.

For local development before `spve` is published:

```sh
node bin/index.mjs \
  --spve file:/absolute/path/to/spve
```

The interactive wizard asks for the project/web-part name, framework, description, and required
SharePoint site. Microsoft Entra configuration is optional. The technical name is inferred from the
project name and offered as the editable project slug. Dependency installation is offered at the end
and defaults to Yes; non-interactive creation can opt in with `--install`.

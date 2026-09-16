# migrate-sp

Migrate a legacy React SPFx project into a modern SPVE React application while leaving the
source project untouched.

```sh
pnpm dlx migrate-sp ./legacy-project ./modern-project
cd ./modern-project
vp i
vp dev -m sp
```

The migrator starts from the current `create-sp` React template, preserves the application source,
project-owned assets, runtime dependencies, web-part identity, solution identity, permissions,
hosts, properties, version, and development site URL, then replaces the legacy SPFx/Heft host.

Legacy `src/webparts/<web-part>/` contents are flattened into a conventional React `src/`
directory. The generated `src/main.ts` stays declarative, while migrated host behavior lives in
`src/App.tsx`.

The first release migrates one React class-based SPFx web part per target and supports the standard
`ReactDOM.render(element, this.domElement)` host pattern. For solutions containing multiple web
parts, run the migrator once per web part with `--webpart <alias>` and use a separate target for
each. Context-dependent applications use `withContext()` and can run with SPVE's standalone
compatibility context or the native SharePoint context through `vp dev -m sp`.

## General transformations

`migrate-sp` performs only project-independent transformations whose source shape and replacement
are known:

- copies the current React template and keeps `src/main.ts` declarative;
- flattens `src/webparts/<web-part>/` and mechanically rebases relative imports;
- preserves shared `src/` modules plus standard root `assets/` and `public/` directories;
- vendors individually referenced static files outside `src/` into `src/_migrated/assets/`;
- converts literal static-asset `require()` calls to ESM imports;
- converts standard SPFx localization aliases and AMD `en-us` resources to local ESM modules;
- maps `WebPartContext` and the SPVE-supported `@microsoft/sp-http` API to `spve/context` while
  leaving unsupported bindings unchanged for review;
- uses the TypeScript compiler to mark imports and re-exports as type-only when their symbols have
  no runtime value;
- removes obsolete SPFx/Heft build dependencies, retains application dependencies, recovers
  undeclared imported versions from `package-lock.json` when possible, and applies current
  React/SPVE/Vite+ template versions;
- traces retained dependencies through `package-lock.json` and adds packages marked with install
  scripts to `pnpm-workspace.yaml#allowBuilds`, without allowing unrelated legacy build tooling;
- enables compatibility settings for legacy JavaScript, JSON imports, TypeScript enums and other
  erasable syntax while retaining modern ESM and `verbatimModuleSyntax`;
- produces `MIGRATION.md` with unresolved imports and constructs that need application knowledge.

It deliberately does not substitute third-party UI components, redesign application state or
i18n, invent browser shims, rewrite arbitrary executable files outside `src/`, or guess replacements
for unsupported SPFx APIs. Those cases are reported instead of silently changing behavior.

Run `migrate-sp --help` for all options.

# SPVE

Framework-agnostic SharePoint development powered by Vite+.

## Workspace

- `packages/spve` — published as `spve`; the Vite plugin, runtime, and hidden SPFx workspace template.
- `packages/create-spve` — published as `create-spve`; the `vp create spve` wizard and framework starters.
- `apps/playground` — private Vue consumer linked to the local `spve` package with `workspace:*`.

## Development

Install the workspace and run the complete release check:

```bash
vp install
vp run ready
```

Run the playground:

```bash
vp dev apps/playground
```

Inside this monorepo, the generator is registered as a local Vite+ template:

```bash
vp create spve
```

The two packages are versioned and published independently. Always publish `spve` before
`create-spve`, because newly generated projects depend on the runtime package.

Preview both npm artifacts without publishing:

```bash
vp run -r release:dry
```

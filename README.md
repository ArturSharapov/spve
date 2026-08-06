# SPVE

Framework-agnostic SharePoint development powered by Vite+.

## Workspace

- `packages/spve` — published as `@spve/core` and installed under the `spve` alias; the Vite plugin, runtime, and hidden SPFx workspace template.
- `packages/create-sp` — published as `create-sp`; the `npm cr sp` wizard and framework starters.
- `apps/playground` — private Vue consumer linked to `@spve/core` under the local `spve` alias.

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

Create a new SPVE project:

```bash
npm cr sp
```

The two packages are versioned and published independently. Always publish `@spve/core` before
`create-sp`, because newly generated projects depend on the runtime package.

Preview both npm artifacts without publishing:

```bash
vp run -r release:dry
```
